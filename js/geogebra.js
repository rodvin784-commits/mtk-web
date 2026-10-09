/* GeoGebra online embed + fallback offline otomatis (KB2)
   - Probe koneksi ke geogebra.org sebelum memuat iframe (jadi offline tidak ada error/request gagal)
   - Offline: iframe disembunyikan, panel fallback + grafik canvas offline yang aktif
   - Online: iframe dimuat normal; ada tombol coba ulang kalau tetap gagal */
(function(){
  var GEO_URL='https://www.geogebra.org/graphing/bvj8o7mt';
  var PROBE_URL='https://www.geogebra.org/favicon.ico';
  var PROBE_TIMEOUT=8000;
  function $(id){ return document.getElementById(id); }
  var frame=$('geoFrame'), wrap=$('geoFrameWrap'), panel=$('geoOffline'),
      status=$('geoStatus'), statusText=$('geoStatusText'), retry=$('geoRetry');
  if(!frame) return;

  function setStatus(state,msg){
    if(status) status.classList.remove('online','offline');
    if(state) status.classList.add(state);
    if(statusText) statusText.textContent=msg;
  }
  function applyOffline(){
    if(wrap) wrap.hidden=true;
    if(panel) panel.hidden=false;
    setStatus('offline','Offline — GeoGebra tidak dimuat. Grafik canvas di bawah aktif.');
    try{ frame.src='about:blank'; }catch(e){}
  }
  function applyOnline(){
    if(wrap) wrap.hidden=false;
    if(panel) panel.hidden=true;
    setStatus('online','Online — GeoGebra aktif. Geser slider atau ketik fungsi di dalam grafik.');
    if(frame.getAttribute('src')!==GEO_URL){
      try{ frame.src=GEO_URL; }catch(e){ applyOffline(); }
    }
  }
  function probe(){
    setStatus(null,'Memeriksa koneksi GeoGebra…');
    if(navigator.onLine===false){ applyOffline(); return; }
    if(typeof fetch==='undefined'){ applyOnline(); return; } /* tidak bisa probe: biarkan iframe jalan */
    var ctrl=null, to=null;
    if(typeof AbortController!=='undefined'){
      ctrl=new AbortController();
      to=setTimeout(function(){ ctrl.abort(); },PROBE_TIMEOUT);
    }
    fetch(PROBE_URL,{mode:'no-cors',cache:'no-store',signal:ctrl?ctrl.signal:null})
      .then(function(){ if(to) clearTimeout(to); applyOnline(); })
      .catch(function(){ if(to) clearTimeout(to); applyOffline(); });
  }

  if(retry) retry.addEventListener('click',function(){
    try{ frame.src=GEO_URL; }catch(e){}
    probe();
  });
  frame.addEventListener('error',function(){ applyOffline(); });
  window.addEventListener('offline',function(){ applyOffline(); });
  window.addEventListener('online',function(){ probe(); });
  probe();
})();
