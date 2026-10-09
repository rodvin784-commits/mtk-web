/* Shell bersama: sidebar tutup/buka (collapse desktop · overlay mobile), search filter (dashboard),
   profil dari MTKStore di topbar, penanda materi dibuka (body[data-kb]),
   tema terang/gelap (tersimpan), toast, tombol kembali ke atas,
   counter animasi, dan animasi masuk kartu */
(function(){
  var store=window.MTKStore;

  /* 1) Sidebar: tutup & buka — collapse di desktop, overlay di mobile */
  var appEl=document.querySelector('.app');
  var sideMQ=window.matchMedia('(max-width:820px)');
  var SIDE_KEY='mathlab_side';
  function setSide(open){
    if(!appEl) return;
    if(sideMQ.matches){
      appEl.classList.toggle('side-open',open);
      appEl.classList.remove('side-hidden');
    }else{
      appEl.classList.toggle('side-hidden',!open);
      appEl.classList.remove('side-open');
      try{ localStorage.setItem(SIDE_KEY,open?'':'1'); }catch(e){}
    }
  }
  function syncSide(){
    if(!appEl) return;
    if(sideMQ.matches){
      appEl.classList.remove('side-hidden');
    }else{
      appEl.classList.remove('side-open');
      try{ if(localStorage.getItem(SIDE_KEY)==='1') appEl.classList.add('side-hidden'); }catch(e){}
    }
  }
  (function initSide(){
    if(!appEl) return;
    /* tombol buka: mengambang di tepi kiri layar */
    var openBtn=document.createElement('button');
    openBtn.type='button'; openBtn.className='side-open-btn';
    openBtn.setAttribute('aria-label','Buka menu'); openBtn.textContent='☰';
    openBtn.addEventListener('click',function(){ setSide(true); });
    appEl.appendChild(openBtn);
    /* backdrop: klik untuk menutup overlay mobile */
    var backdrop=document.createElement('div');
    backdrop.className='backdrop';
    backdrop.addEventListener('click',function(){ setSide(false); });
    appEl.appendChild(backdrop);
    /* tombol tutup di dalam sidebar */
    document.querySelectorAll('.sidebar').forEach(function(as){
      if(as.querySelector('.side-close')) return;
      var x=document.createElement('button');
      x.type='button'; x.className='side-close';
      x.setAttribute('aria-label','Tutup menu'); x.textContent='✕';
      x.addEventListener('click',function(){ setSide(false); });
      as.insertBefore(x,as.firstChild);
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape') setSide(false);
    });
    if(sideMQ.addEventListener) sideMQ.addEventListener('change',syncSide);
    else if(sideMQ.addListener) sideMQ.addListener(syncSide);
    syncSide();
  })();

  /* 2) Search filter (hanya ada di dashboard) */
  var input=document.querySelector('[data-search]');
  if(input){
    input.addEventListener('input',function(e){
      var grid=document.getElementById('kbGrid');
      if(!grid) return;
      var k=e.target.value.toLowerCase();
      grid.querySelectorAll('.kb-card').forEach(function(c){
        c.style.display=(c.getAttribute('data-name')||'').includes(k)?'':'none';
      });
    });
  }

  /* 3) Profil di topbar (semua halaman) */
  function refreshProfile(){
    if(!store) return;
    var p=store.profile();
    var user=document.querySelector('.top-user');
    if(!user) return;
    var av=user.querySelector('.avatar');
    if(av) av.textContent=store.initials(p.nama);
    var b=user.querySelector('b');
    if(b) b.textContent=p.nama;
    var sm=user.querySelector('small');
    if(sm) sm.textContent='Siswa • Kelas '+p.kelas;
  }

  /* 4) Catat materi yang dibuka (halaman KB) */
  if(store && document.body){
    var kb=document.body.getAttribute('data-kb');
    if(kb) store.markMateri(kb);
  }

  /* 5) Tema terang/gelap — tersimpan di localStorage */
  var THEME_KEY='mathlab_theme';
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme',t);
    var b=document.getElementById('themeBtn');
    if(b){
      b.textContent=(t==='dark')?'☀️':'🌙';
      b.setAttribute('aria-pressed',(t==='dark')?'true':'false');
    }
    window.dispatchEvent(new Event('themechange'));
  }
  function initTheme(){
    var t='light';
    try{
      t=localStorage.getItem(THEME_KEY);
      if(t!=='dark'&&t!=='light'){
        t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';
      }
    }catch(e){}
    applyTheme(t);
  }
  document.querySelectorAll('.topbar').forEach(function(bar){
    if(!bar||bar.querySelector('#themeBtn')) return;
    var b=document.createElement('button');
    b.type='button'; b.id='themeBtn'; b.className='btn ghost icon-btn';
    b.setAttribute('aria-label','Ganti tema terang / gelap');
    b.addEventListener('click',function(){
      var t=(document.documentElement.getAttribute('data-theme')==='dark')?'light':'dark';
      try{ localStorage.setItem(THEME_KEY,t); }catch(e){}
      applyTheme(t);
    });
    bar.insertBefore(b,bar.querySelector('.top-user'));
  });
  initTheme();

  /* 6) Toast notification */
  function toast(msg,type){
    var wrap=document.getElementById('toastWrap');
    if(!wrap){ wrap=document.createElement('div'); wrap.id='toastWrap'; document.body.appendChild(wrap); }
    var t=document.createElement('div');
    t.className='toast'+(type?' '+type:'');
    t.textContent=msg;
    wrap.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){
      t.classList.remove('show');
      setTimeout(function(){ t.remove(); },320);
    },2600);
  }

  /* 7) Tombol kembali ke atas */
  var toTop=document.createElement('button');
  toTop.type='button'; toTop.className='to-top';
  toTop.setAttribute('aria-label','Kembali ke atas'); toTop.textContent='↑';
  toTop.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  document.body.appendChild(toTop);
  var onScroll=function(){ toTop.classList.toggle('show',window.scrollY>320); };
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  /* 8) Counter animasi */
  function countUp(el,val,suffix){
    if(!el) return;
    suffix=suffix||'';
    var target=Number(val)||0, dur=750, t0=null;
    function step(ts){
      if(!t0) t0=ts;
      var p=Math.min(1,(ts-t0)/dur);
      var e=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*e)+suffix;
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* 9) Animasi masuk kartu */
  var content=document.querySelector('.content');
  if(content) content.classList.add('anim-in');

  refreshProfile();
  window.MTKShell={refreshProfile:refreshProfile,toast:toast,countUp:countUp,applyTheme:applyTheme};
})();
