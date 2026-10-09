/* Grader + penguncian bertingkat — persistensi via MTKStore (localStorage) */
(function(){
  function norm(s){
    return String(s||'').toLowerCase().replace(/[\s*×·]/g,'').replace(/,/g,'.');
  }
  function checkAnswer(item, userVal){
    if(item.choices){
      return Number(userVal)===Number(item.answer);
    }else{
      return norm(userVal)===norm(item.answer);
    }
  }

  function bind(rootId, kb){
    var root=document.getElementById(rootId);
    if(!root) return;
    var store=window.MTKStore;
    var bank=window.MTKQuestions[kb];
    if(!bank){ root.innerHTML='<div class="alert error">Bank soal '+kb+' belum ada.</div>'; return; }
    var levels=store?store.LEVELS:['mudah','sedang','sulit'];
    var state={level:'mudah', answers:{}, checked:false};
    var tabsEl=root.querySelector('[data-quiz-tabs]');
    var bodyEl=root.querySelector('[data-quiz-body]');
    var footEl=root.querySelector('[data-quiz-foot]');

    if(!store || !store.storageOK()){
      var w=document.createElement('div');
      w.className='alert warn';
      w.textContent='localStorage diblokir (mode privat?). Koreksi tetap jalan, tapi skor terbaik tidak tersimpan.';
      root.prepend(w);
    }

    function bestOf(level){ return store?store.best(kb,level):null; }

    function unlocked(level){
      if(level==='mudah') return true;
      var prev = (level==='sedang') ? 'mudah' : 'sedang';
      var best = bestOf(prev)||0;
      var tmp  = state['_tmp_'+prev]||0;
      return Math.max(best,tmp)>=60;
    }

    function renderTabs(){
      tabsEl.innerHTML='';
      levels.forEach(function(lv){
        var b=document.createElement('button');
        b.className='tab'+(state.level===lv?' active':'')+(!unlocked(lv)?' locked':'');
        var best=bestOf(lv);
        var att=store?store.attempts(kb,lv):0;
        b.textContent=lv.charAt(0).toUpperCase()+lv.slice(1)
          +(best!=null?' • '+best+'%':'')
          +(att>1?' ('+att+'×)':'')
          +(!unlocked(lv)?' [Terkunci]':'');
        b.addEventListener('click',function(){
          if(!unlocked(lv)){ if(window.MTKShell&&window.MTKShell.toast) window.MTKShell.toast('Buka kunci: nilai minimal 60% pada tingkat sebelumnya.','warn'); else alert('Buka kunci: nilai minimal 60% pada tingkat sebelumnya.'); return; }
          state.level=lv; state.checked=false; render();
        });
        tabsEl.appendChild(b);
      });
    }

    function render(){
      renderTabs();
      bodyEl.innerHTML='';
      var arr=bank[state.level];
      /* Header progres: Soal 1-5 + bar jawaban terisi */
      var prog=document.createElement('div');
      prog.className='quiz-progress';
      prog.innerHTML='<span id="qp-'+kb+'-txt">Level '+state.level+' • '+arr.length+' soal</span><div class="bar"><i id="qp-'+kb+'-bar" style="width:0%"></i></div>';
      bodyEl.appendChild(prog);
      function updateProg(){
        var filled=0;
        arr.forEach(function(it,i){
          var v=state.answers[state.level+'_'+i];
          if(v!==undefined&&String(v).trim()!=='') filled++;
        });
        var bar=prog.querySelector('.bar i'), txt=prog.querySelector('span');
        if(bar) bar.style.width=Math.round(filled/arr.length*100)+'%';
        if(txt) txt.textContent='Level '+state.level+' • terjawab '+filled+'/'+arr.length+' soal';
      }
      arr.forEach(function(it,i){
        var div=document.createElement('div');
        div.className='quiz-q';
        var h=document.createElement('p');
        h.innerHTML='<b>'+(i+1)+'.</b> '+it.q;
        div.appendChild(h);
        var key=state.level+'_'+i;
        if(it.choices){
          it.choices.forEach(function(c,ci){
            var lab=document.createElement('label');
            var r=document.createElement('input');
            r.type='radio'; r.name=kb+'_'+key; r.value=ci;
            if(String(state.answers[key])===String(ci)) r.checked=true;
            r.addEventListener('change',function(){ state.answers[key]=ci; state.checked=false; updateProg(); });
            lab.appendChild(r); lab.appendChild(document.createTextNode(' '+c));
            div.appendChild(lab);
          });
        }else{
          var inp=document.createElement('input');
          inp.type='text'; inp.placeholder='Ketik jawaban, mis. 4x+8';
          inp.value=state.answers[key]||'';
          inp.addEventListener('input',function(){ state.answers[key]=inp.value; state.checked=false; updateProg(); });
          div.appendChild(inp);
        }
        var fb=document.createElement('div');
        fb.setAttribute('data-fb',key);
        div.appendChild(fb);
        bodyEl.appendChild(div);
      });
      footEl.innerHTML='';
      var btn=document.createElement('button');
      btn.className='btn'; btn.textContent='Periksa Jawaban';
      btn.addEventListener('click',grade);
      var rst=document.createElement('button');
      rst.className='btn ghost'; rst.textContent='Ulangi';
      rst.style.marginLeft='8px';
      rst.addEventListener('click',function(){
        Object.keys(state.answers).forEach(function(k){ if(k.indexOf(state.level+'_')===0) delete state.answers[k]; });
        state.checked=false; render();
      });
      footEl.appendChild(btn); footEl.appendChild(rst);
      var info=document.createElement('p');
      info.className='muted';
      info.innerHTML='Syarat buka kunci: <b>minimal 60%</b> tingkat sebelumnya. Skor terbaik &amp; riwayat tersimpan otomatis di perangkat.';
      footEl.appendChild(info);
      updateProg();
    }

    function grade(){
      var arr=bank[state.level]; var benar=0;
      var qs=bodyEl.querySelectorAll('.quiz-q');
      arr.forEach(function(it,i){
        var key=state.level+'_'+i;
        var ok=checkAnswer(it,state.answers[key]);
        if(ok) benar++;
        var box=qs[i]; box.classList.remove('correct','wrong');
        box.classList.add(ok?'correct':'wrong');
        var fb=box.querySelector('[data-fb]');
        var kunci = it.choices? it.choices[it.answer] : it.answer;
        fb.innerHTML='<div class="alert '+(ok?'ok':'error')+'">'+(ok?'Benar! ':'Kurang tepat. Kunci: <b>'+kunci+'</b><br>')+'Pembahasan: '+it.discuss+'</div>';
      });
      var pct=Math.round(benar/arr.length*100);
      state.checked=true;
      state['_tmp_'+state.level]=pct;
      var rec = store ? store.recordQuiz(kb,state.level,pct) : null;
      var bestNow = rec ? rec.best : (state['_tmp_'+state.level]||pct);
      var div=document.createElement('div');
      div.className='alert '+(pct>=60?'ok':'warn');
      div.innerHTML='Skor <b>'+state.level+'</b>: '+benar+'/'+arr.length+' ('+pct+'%) — terbaik: <b>'+bestNow+'%</b>'
        +(rec&&rec.attempts>1?' • percobaan ke-'+rec.attempts:'')
        +(rec&&!rec.saved?' (gagal simpan)':'')
        +(pct>=60 && state.level!=='sulit'?' — tingkat berikutnya terbuka!':'');
      footEl.prepend(div);
      renderTabs();
      /* Layar akhir: tombol lanjut + scroll ke hasil */
      if(pct>=60&&state.level!=='sulit'){
        var idx=levels.indexOf(state.level), nx=levels[idx+1];
        if(nx&&unlocked(nx)){
          var nb=document.createElement('button');
          nb.className='btn secondary'; nb.style.marginLeft='8px'; nb.textContent='Lanjut: '+nx;
          nb.addEventListener('click',function(){ state.level=nx; state.checked=false; render(); root.scrollIntoView({behavior:'smooth'}); });
          div.appendChild(document.createElement('br')); div.appendChild(nb);
        }
      }
      if(div.scrollIntoView) div.scrollIntoView({behavior:'smooth',block:'center'});
      else { var y=div.getBoundingClientRect().top+window.scrollY-90; window.scrollTo({top:y,behavior:'smooth'}); }
    }

    render();
  }

  window.MTKQuiz={bind:bind};
})();
