/* Grafik Fungsi - parser + canvas renderer (offline fallback, tanpa CDN) */
(function(){
  function parseMath(expr){
    if(typeof expr!=='string') throw {token:'(kosong)'};
    var s = expr.trim();
    // buang prefix f(x)= / y=
    s = s.replace(/^\s*(f\s*\(\s*x\s*\)|y)\s*=\s*/i,'');
    if(!s) throw {token:'(kosong)'};
    // deteksi karakter ilegal
    var m = s.match(/[^0-9xX+\-*/^().\s]/);
    if(m) throw {token:m[0]};
    var t = s.replace(/X/g,'x').replace(/\s+/g,'');
    if(!/[x0-9)]/.test(t)) throw {token:t||'(kosong)'};
    // implicit multiplication: 2x -> 2*x, 2( -> 2*(, )x -> )*x, )( -> )*(
    t = t.replace(/(\d|\))(?=x|\()/g,'$1*').replace(/x(?=x|\d|\()/g,'x*').replace(/\)(?=\()/g,')*');
    // ^n bulat -> **n
    // validasi pangkat: ^ harus diikuti [-+]?digit
    var caret = t.match(/\^([^0-9+\-]|$)/);
    if(caret) throw {token:'^'+(caret[1]||'')};
    t = t.replace(/\^/g,'**');
    // cegah ** yang invalid ganda
    if(/\*\*\*/.test(t)) throw {token:'**'};
    var fn;
    try{ fn = new Function('x','"use strict"; return ('+t+');'); }
    catch(e){ throw {token:'sintaks'}; }
    // uji evaluasi
    try{ var v = fn(0); if(typeof v!=='number'||!isFinite(v)){ /* boleh inf di titik lain */ } }
    catch(e){ throw {token:'evaluasi'}; }
    return {fn:fn, normalized:t};
  }

  function drawPlot(canvas, fn, opts){
    opts = opts||{};
    var xmin = opts.xmin!=null?opts.xmin:-10, xmax = opts.xmax!=null?opts.xmax:10;
    var ymin = opts.ymin!=null?opts.ymin:-10, ymax = opts.ymax!=null?opts.ymax:10;
    var dpr = window.devicePixelRatio||1;
    var W = canvas.clientWidth||600, H = 320;
    canvas.width = W*dpr; canvas.height = H*dpr;
    var ctx = canvas.getContext('2d'); ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);
    /* warna mengikuti tema CSS (terang/gelap) */
    var cs = window.getComputedStyle ? getComputedStyle(document.documentElement) : null;
    function cssVar(n,f){ var v = cs ? cs.getPropertyValue(n) : ''; return (v&&v.trim()) || f; }
    var GRID = cssVar('--line','#e9edf7'), AXIS = cssVar('--muted','#9aa5c4'), CURVE = cssVar('--primary','#6d7ef7');
    function X(x){ return (x-xmin)/(xmax-xmin)*W; }
    function Y(y){ return H-(y-ymin)/(ymax-ymin)*H; }
    // grid
    ctx.strokeStyle=GRID; ctx.lineWidth=1;
    for(var gx=Math.ceil(xmin); gx<=xmax; gx++){ ctx.beginPath(); ctx.moveTo(X(gx),0); ctx.lineTo(X(gx),H); ctx.stroke(); }
    for(var gy=Math.ceil(ymin); gy<=ymax; gy++){ ctx.beginPath(); ctx.moveTo(0,Y(gy)); ctx.lineTo(W,Y(gy)); ctx.stroke(); }
    // sumbu
    ctx.strokeStyle=AXIS; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(0,Y(0)); ctx.lineTo(W,Y(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(0),0); ctx.lineTo(X(0),H); ctx.stroke();
    // label
    ctx.fillStyle=AXIS; ctx.font='11px "Plus Jakarta Sans",Segoe UI';
    for(var lx=Math.ceil(xmin); lx<=xmax; lx+=2){ if(lx!==0) ctx.fillText(lx, X(lx)+3, Y(0)-4); }
    for(var ly=Math.ceil(ymin); ly<=ymax; ly+=2){ if(ly!==0) ctx.fillText(ly, X(0)+4, Y(ly)-3); }
    // kurva
    ctx.strokeStyle=CURVE; ctx.lineWidth=2.5; ctx.beginPath();
    var pen=false;
    for(var px=0; px<=W; px+=1){
      var x = xmin + px/W*(xmax-xmin);
      var y; try{ y=fn(x); }catch(e){ pen=false; continue; }
      if(typeof y!=='number'||!isFinite(y)){ pen=false; continue; }
      if(y<ymin-50||y>ymax+50){ pen=false; continue; }
      var cy=Y(Math.max(ymin,Math.min(ymax,y)));
      if(!pen){ ctx.moveTo(px,cy); pen=true; } else ctx.lineTo(px,cy);
    }
    ctx.stroke();
  }

  function bindGraph(rootId){
    var root = document.getElementById(rootId);
    if(!root) return;
    var input = root.querySelector('[data-graph-input]');
    var canvas = root.querySelector('[data-graph-canvas]');
    var msg = root.querySelector('[data-graph-msg]');
    var vals = root.querySelector('[data-graph-vals]');
    var xminEl = root.querySelector('[data-graph-xmin]');
    var xmaxEl = root.querySelector('[data-graph-xmax]');
    function render(example){
      var raw = example!=null?example:input.value;
      if(example!=null) input.value = example;
      msg.innerHTML=''; vals.innerHTML='';
      var xmin = xminEl?parseFloat(xminEl.value):-10;
      var xmax = xmaxEl?parseFloat(xmaxEl.value):10;
      if(!(xmin<xmax)){ msg.innerHTML='<div class="alert error">Domain tidak valid: xmin &lt; xmax.</div>'; return; }
      try{
        var p = parseMath(raw);
        drawPlot(canvas,p.fn,{xmin:xmin,xmax:xmax,ymin:-10,ymax:10});
        var f0,f2;
        try{ f0=p.fn(0); f2=p.fn(2);}catch(e){ f0=NaN; f2=NaN; }
        var fmt=function(v){ return (typeof v==='number'&&isFinite(v))? (Math.round(v*1000)/1000) : 'tak terdefinisi'; };
        vals.innerHTML='<div class="alert ok">f(x) = '+escapeHtml(raw.trim())+' ⇒ f(0) = <b>'+fmt(f0)+'</b>, f(2) = <b>'+fmt(f2)+'</b></div>';
      }catch(err){
        msg.innerHTML='<div class="alert error">Sintaks invalid pada token: <b>'+escapeHtml(err.token||'?')+'</b>. Hanya boleh x, angka, + − * / ^n bulat, tanda kurung. Contoh: x+3, x^2+5, (x+1)*(x-2)/2</div>';
      }
    }
    root.querySelector('[data-graph-submit]').addEventListener('click',function(){render();});
    input.addEventListener('keydown',function(e){ if(e.key==='Enter') render(); });
    root.querySelectorAll('[data-graph-example]').forEach(function(b){
      b.addEventListener('click',function(){ render(b.getAttribute('data-graph-example')); });
    });
    var rst = root.querySelector('[data-graph-reset]');
    if(rst) rst.addEventListener('click',function(){ input.value='x+3'; render('x+3'); });
    render(input.value||'x+3');
    /* gambar ulang saat tema berubah agar warna canvas tetap serasi */
    window.addEventListener('themechange',function(){ render(); });
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  window.MTKGraph = {parse:parseMath, draw:drawPlot, bind:bindGraph};
})();
