/* =========================================================
   MTKStore — "database" lokal berbasis localStorage
   Satu kunci JSON (mathlab_db_v1) berisi: profil, skor kuis,
   dan aktivitas membuka materi. Termasuk migrasi dari kunci
   lama mtk_kb3_mudah … mtk_kb4_sulit.
   ========================================================= */
var MTKStore=(function(){
  var KEY='mathlab_db_v1';
  var LEVELS=['mudah','sedang','sulit'];
  var QUIZ_KBS=['kb3','kb4'];               // KB yang punya kuis
  var ALL_KBS=['kb1','kb2','kb3','kb4'];
  var KB_NAMES={
    kb1:'KB1 Fungsi Linear',
    kb2:'KB2 Fungsi Kuadrat',
    kb3:'KB3 Komposisi &amp; Invers',
    kb4:'KB4 Program Linear'
  };
  var broken=false;   // true jika localStorage tidak tersedia/blokir
  var db;

  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function defaults(){
    return { ver:1, profile:{nama:'Siswa Kelas X', kelas:'X'}, quiz:{}, materi:{} };
  }
  function blankLevel(){ return {best:null, attempts:0, last:null, history:[]}; }
  function nowISO(){ return new Date().toISOString(); }

  function normLevel(l){
    l=(l&&typeof l==='object')?l:{};
    return {
      best:(typeof l.best==='number'&&isFinite(l.best))?Math.min(100,Math.max(0,Math.floor(l.best))):null,
      attempts:(typeof l.attempts==='number'&&l.attempts>0)?Math.floor(l.attempts):0,
      last:(typeof l.last==='string')?l.last:null,
      history:Array.isArray(l.history)?l.history.slice(0,10):[]
    };
  }
  function ensureLevel(kb,lv){
    if(!db.quiz[kb]) db.quiz[kb]={};
    if(!db.quiz[kb][lv]) db.quiz[kb][lv]=blankLevel();
    db.quiz[kb][lv]=normLevel(db.quiz[kb][lv]);
    return db.quiz[kb][lv];
  }

  function migrateLegacy(){
    // Ambil skor terbaik dari skema lama mtk_<kb>_<level>, lalu hapus kunci lamanya.
    var moved=false, seed=defaults();
    try{
      QUIZ_KBS.forEach(function(kb){
        LEVELS.forEach(function(lv){
          var raw=localStorage.getItem('mtk_'+kb+'_'+lv);
          if(raw!=null){
            var n=Number(raw);
            if(!isNaN(n)){ ensureLevelOn(seed,kb,lv).best=n; moved=true; }
            localStorage.removeItem('mtk_'+kb+'_'+lv);
          }
        });
      });
    }catch(e){ /* abaikan: migrasi bersifat best-effort */ }
    return moved?seed:null;
  }
  function ensureLevelOn(doc,kb,lv){
    if(!doc.quiz[kb]) doc.quiz[kb]={};
    if(!doc.quiz[kb][lv]) doc.quiz[kb][lv]=blankLevel();
    doc.quiz[kb][lv]=normLevel(doc.quiz[kb][lv]);
    return doc.quiz[kb][lv];
  }

  function load(){
    try{
      var raw=localStorage.getItem(KEY);
      if(raw){
        var d=JSON.parse(raw);
        var base=defaults();
        if(d && typeof d==='object'){
          base.profile=Object.assign(base.profile, (d.profile&&typeof d.profile==='object')?d.profile:{});
          base.profile.nama=String(base.profile.nama||'Siswa Kelas X').trim()||'Siswa Kelas X';
          base.profile.kelas=String(base.profile.kelas||'X').trim()||'X';
          if(d.quiz&&typeof d.quiz==='object') base.quiz=d.quiz;
          if(d.materi&&typeof d.materi==='object') base.materi=d.materi;
          QUIZ_KBS.forEach(function(kb){ LEVELS.forEach(function(lv){ if(base.quiz[kb]) base.quiz[kb][lv]=normLevel(base.quiz[kb][lv]); }); });
          base.ver=1;
          return base;
        }
      }
      var migrated=migrateLegacy();
      if(migrated){
        try{ localStorage.setItem(KEY, JSON.stringify(migrated)); }catch(e){}
        return migrated;
      }
      return defaults();
    }catch(e){ broken=true; return defaults(); }
  }
  db=load();

  function save(){
    if(broken) return false;
    try{ localStorage.setItem(KEY, JSON.stringify(db)); return true; }
    catch(e){ broken=true; return false; }
  }

  function initials(nama){
    var w=String(nama||'').trim().split(/\s+/).filter(Boolean).slice(0,2);
    var s=w.map(function(x){return x.charAt(0).toUpperCase();}).join('');
    return s||'S';
  }

  return {
    KEY:KEY, LEVELS:LEVELS, QUIZ_KBS:QUIZ_KBS, ALL_KBS:ALL_KBS, KB_NAMES:KB_NAMES,

    storageOK:function(){
      if(broken) return false;
      try{ localStorage.setItem('__mlt','1'); localStorage.removeItem('__mlt'); return true; }
      catch(e){ broken=true; return false; }
    },

    /* --- Profil --- */
    profile:function(){ return clone(db.profile); },
    setProfile:function(p){
      p=p||{};
      var nama=String(p.nama==null?db.profile.nama:p.nama).trim();
      var kelas=String(p.kelas==null?db.profile.kelas:p.kelas).trim();
      db.profile={nama:nama||'Siswa Kelas X', kelas:kelas||'X'};
      return save();
    },
    initials:initials,

    /* --- Skor kuis --- */
    best:function(kb,lv){ var q=db.quiz[kb]; return (q&&q[lv]&&typeof q[lv].best==='number')?q[lv].best:null; },
    attempts:function(kb,lv){ var q=db.quiz[kb]; return (q&&q[lv])?q[lv].attempts:0; },
    levelRecord:function(kb,lv){ var q=db.quiz[kb]; return clone((q&&q[lv])?normLevel(q[lv]):blankLevel()); },
    recordQuiz:function(kb,lv,pct){
      var q=ensureLevel(kb,lv);
      var prev=q.best;
      var improved=(prev==null||pct>prev);
      if(improved) q.best=pct;
      q.attempts+=1;
      q.last=nowISO();
      q.history.unshift({pct:pct, at:q.last});
      q.history=q.history.slice(0,10);
      var saved=save();
      return {prev:prev, best:q.best, improved:improved, attempts:q.attempts, saved:saved};
    },

    /* --- Aktivitas materi --- */
    materi:function(kb){ var m=db.materi[kb]; return {visited:(m&&m.visited)||null, opens:(m&&m.opens)||0}; },
    markMateri:function(kb){
      if(ALL_KBS.indexOf(kb)<0) return false;
      var m=db.materi[kb]||{visited:null,opens:0};
      m.opens=(m.opens||0)+1;
      if(!m.visited) m.visited=nowISO();
      db.materi[kb]=m;
      return save();
    },
    materiOpenedCount:function(){
      return ALL_KBS.filter(function(kb){ return db.materi[kb]&&db.materi[kb].visited; }).length;
    },

    /* --- Ringkasan untuk dashboard --- */
    summary:function(){
      var quizLevelsDone=0, totalBest=0, slots=0, sumBest=0, perKB={};
      QUIZ_KBS.forEach(function(kb){
        var done=0,sum=0;
        LEVELS.forEach(function(lv){
          var b=db.quiz[kb]&&db.quiz[kb][lv]?db.quiz[kb][lv].best:null;
          slots++; if(b!=null){ quizLevelsDone++; done++; totalBest+=b; sum+=b; sumBest+=b; }
        });
        perKB[kb]={avg:done?Math.round(sum/done):0, done:done, visited:!!(db.materi[kb]&&db.materi[kb].visited)};
      });
      ALL_KBS.forEach(function(kb){
        perKB[kb]=perKB[kb]||{};
        perKB[kb].visited=!!(db.materi[kb]&&db.materi[kb].visited);
        perKB[kb].opens=(db.materi[kb]&&db.materi[kb].opens)||0;
      });
      return {
        quizLevelsDone:quizLevelsDone,
        totalLevels:QUIZ_KBS.length*LEVELS.length,
        totalBest:totalBest,
        progress:slots?Math.round(sumBest/slots):0,
        materiOpened:this.materiOpenedCount(),
        materiTotal:ALL_KBS.length,
        perKB:perKB
      };
    },

    /* --- Reset & backup --- */
    resetScores:function(){ db.quiz={}; db.materi={}; return save(); },
    exportJSON:function(){ return JSON.stringify(db,null,2); },
    importJSON:function(str){
      try{
        var d=JSON.parse(str);
        if(!d||typeof d!=='object'||!d.profile) return false;
        var base=defaults();
        base.profile=Object.assign(base.profile,{nama:String(d.profile.nama||'Siswa Kelas X').trim()||'Siswa Kelas X', kelas:String(d.profile.kelas||'X').trim()||'X'});
        if(d.quiz&&typeof d.quiz==='object') base.quiz=d.quiz;
        if(d.materi&&typeof d.materi==='object') base.materi=d.materi;
        QUIZ_KBS.forEach(function(kb){ LEVELS.forEach(function(lv){ if(base.quiz[kb]) base.quiz[kb][lv]=normLevel(base.quiz[kb][lv]); }); });
        db=base;
        return save();
      }catch(e){ return false; }
    }
  };
})();

/* Ekspos: browser pakai window.MTKStore; Node (unit test) pakai module.exports */
if(typeof window!=='undefined'){ window.MTKStore=MTKStore; }
if(typeof module!=='undefined'&&module.exports){ module.exports=MTKStore; }
