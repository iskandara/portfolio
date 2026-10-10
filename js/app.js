/* ==========================================================
   aradnaksi — app
   Content comes from content/works.json (generated from content/works/*.json by the CMS build).
   ========================================================== */
var WORKS = [];

/* ---------- icons ---------- */
var IC_EXT='<svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/></svg>';

/* ---------- helpers ---------- */
function stripProto(u){return (u||'').replace(/^https?:\/\//,'').replace(/\/$/,'');}
function paras(t){return String(t||'').split(/\n\n+/).map(function(x){return '<p>'+x.replace(/\n/g,'<br>')+'</p>';}).join('');}
function pad2(n){return (n<10?'0':'')+n;}
function imgframe(src,cls){
  if(!src) return '';
  return '<div class="cs-imgframe '+(cls||'')+'"><img src="'+src+'" alt="" loading="lazy" decoding="async"></div>';
}

/* ---------- work cards ---------- */
function cardThumb(w){
  if(w.thumb) return '<div class="frame"><div class="frame-body"><img src="'+w.thumb+'" alt="'+w.title+'" loading="lazy" decoding="async"></div></div>';
  return '<div class="frame frame--type"><div class="frame-body"><span class="frame-type">'+(w.url?stripProto(w.url).replace(/^www\./,''):w.title)+'</span></div></div>';
}
function cardHTML(w){
  return '<article class="work" data-cat="'+w.cats.join(' ')+'" data-id="'+w.id+'">'
    +'<button class="work-link" type="button" data-open="'+w.id+'">'
    +'<div class="work-head"><div class="work-title-row"><span class="work-no" aria-hidden="true">'+pad2(WORKS.indexOf(w)+1)+'</span><span class="work-title">'+w.title+'</span></div>'
    +'<div class="work-right"><span class="work-cat">'+w.cat+'</span></div></div>'
    +'<p class="work-desc">'+w.summary+'</p>'+cardThumb(w)+'<span class="work-more">Read the story</span></button></article>';
}
/* rhythm: every third visible card is wide (image beside text, alternating sides); the rest are half width */
function layoutCards(){
  var vis=[].filter.call(document.querySelectorAll('#workList .work'),function(c){return !c.classList.contains('hide');});
  var wide=0;
  vis.forEach(function(c,i){
    var isWide=(i%3===0)||(i===vis.length-1&&i%3===1);
    c.classList.toggle('is-wide',isWide);
    c.classList.toggle('flip',isWide&&(wide++%2===1));
  });
}
/* thumbnails resolve from big blocks to sharp, as if loading in pixels */
function resolveThumb(card){
  var img=card.querySelector('.frame-body img'); if(!img) return;
  var body=img.parentNode, cv=document.createElement('canvas'); cv.className='px-cover'; body.appendChild(cv);
  function run(){
    var w=body.clientWidth,h=body.clientHeight; if(!w||!h||!img.naturalWidth){ cv.remove(); return; }
    cv.width=w; cv.height=h;
    var ctx=cv.getContext('2d'), off=document.createElement('canvas'), octx=off.getContext('2d');
    var iw=img.naturalWidth, ih=img.naturalHeight, sc=Math.max(w/iw,h/ih), sw=w/sc, sh=h/sc, sx=(iw-sw)/2, sy=(ih-sh)/2;
    var steps=[10,18,32,56,100,180], i=0;
    (function step(){
      if(i>=steps.length){ cv.remove(); return; }
      var rw=steps[i], rh=Math.max(1,Math.round(rw*h/w)); off.width=rw; off.height=rh;
      octx.imageSmoothingEnabled=true; octx.drawImage(img,sx,sy,sw,sh,0,0,rw,rh);
      ctx.imageSmoothingEnabled=false; ctx.clearRect(0,0,w,h); ctx.drawImage(off,0,0,rw,rh,0,0,w,h);
      i++; setTimeout(step,85);
    })();
  }
  if(img.complete&&img.naturalWidth) run(); else { img.addEventListener('load',run,{once:true}); img.addEventListener('error',function(){cv.remove();},{once:true}); }
}
function renderCards(){
  var list=document.getElementById('workList');
  list.innerHTML = WORKS.map(cardHTML).join('');
  layoutCards();
  var stat=document.getElementById('statProjects'); if(stat) stat.textContent=WORKS.length;
  var cards=list.querySelectorAll('.work');
  var still=window.matchMedia('(prefers-reduced-motion:reduce)').matches||!('IntersectionObserver' in window);
  if(still){ cards.forEach(function(c){c.classList.add('in');}); return; }
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); resolveThumb(e.target); }
  });},{threshold:.08});
  cards.forEach(function(c){io.observe(c);});
}

/* ---------- case study sections ---------- */
function renderSection(s){
  switch(s.type){
    case 'banner':
      return '<section class="cs-banner">'+(s.image?'<img src="'+s.image+'" alt="" loading="lazy" decoding="async">':'')+'<h2 class="cs-banner-title">'+(s.title||'')+'</h2></section>';
    case 'heading':
      return '<div class="cs-block">'+(s.kicker?'<div class="cs-kicker">'+s.kicker+'</div>':'')+'<h3 class="cs-h-title">'+(s.title||'')+'</h3></div>';
    case 'text':
      return '<div class="cs-block cs-text">'+paras(s.body)+'</div>';
    case 'quote':
      return '<blockquote class="cs-block cs-quote">'+(s.body||'')+'</blockquote>';
    case 'list':
      var tag=s.ordered?'ol':'ul';
      var items=(s.items||[]).map(function(i){return '<li>'+i+'</li>';}).join('');
      return '<div class="cs-block">'+(s.label?'<div class="cs-list-label">'+s.label+'</div>':'')+'<'+tag+' class="cs-list">'+items+'</'+tag+'></div>';
    case 'note':
      return '<div class="cs-block cs-note">'+paras(s.body)+'</div>';
    case 'image':
      if(!s.image) return '';
      return '<figure class="cs-block cs-figure">'+imgframe(s.image)+(s.caption?'<figcaption>'+s.caption+'</figcaption>':'')+'</figure>';
    case 'gallery':
      var imgs=(s.images||[]).filter(Boolean);
      if(!imgs.length) return '';
      var n=Math.min(imgs.length,3);
      return '<div class="cs-block cs-gallery n'+n+'">'+imgs.map(function(src){return imgframe(src);}).join('')+'</div>';
    case 'colors':
      var groups=(s.groups||[]).map(function(g){
        var sw=(g.swatches||[]).map(function(c){return '<div class="cs-swatch"><i style="background:'+c+'"></i><span>'+c+'</span></div>';}).join('');
        return '<div class="cs-color-group"><h4>'+(g.name||'')+'</h4><div class="cs-swatches">'+sw+'</div></div>';
      }).join('');
      return '<div class="cs-block">'+(s.label?'<div class="cs-colors-label">'+s.label+'</div>':'')+'<div class="cs-color-groups">'+groups+'</div></div>';
    default: return '';
  }
}
function renderCase(w){
  var head='<header class="case-head">'
    +'<h1 class="case-title">'+w.heading+'</h1>'
    +'<div class="case-headright">'
      +'<p class="case-summary">'+w.summary+'</p>'
      +'<div class="case-challenge"><span class="mark">The Challenge</span><p>'+w.challenge+'</p></div>'
      +'<div class="case-metarow">'
        +'<div><span class="mark">My Role</span><p>'+(w.role||'')+'</p></div>'
        +'<div><span class="mark">Client</span><p>'+(w.client||'')+'</p></div>'
        +'<div><span class="mark">Project Time</span><p>'+(w.time||'')+'</p></div>'
      +'</div>'
      +(w.url?'<a class="case-visit" href="'+w.url+'" target="_blank" rel="noopener">Visit site '+IC_EXT+'</a>':'')
    +'</div></header>';
  var cover=w.cover?'<div class="cs-cover">'+imgframe(w.cover)+'</div>':'';
  var body=(w.sections||[]).map(renderSection).join('');
  var foot='<footer class="case-foot"><span class="fn">aradnaksi</span><span class="fs"><a href="https://www.linkedin.com/in/iskandara/" target="_blank" rel="noopener">LinkedIn</a></span></footer>';
  return head+cover+body+foot;
}

/* ==========================================================
   everything below needs the DOM
   ========================================================== */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var pages=['about','work','story','chat'];
  var currentPage='about';
  window.openId=null;

  /* ----- pixel helpers ----- */
  var BAYER=[[0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],[12,44,4,36,14,46,6,38],[60,28,52,20,62,30,54,22],[3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],[15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]];
  function thr(x,y){ return (BAYER[y&7][x&7]+.5)/64; }
  function hash(x,y){ var n=Math.sin(x*127.1+y*311.7)*43758.5453; return n-Math.floor(n); }
  function vnoise(x,y){
    var xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi;
    var u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
    var a=hash(xi,yi), b=hash(xi+1,yi), c=hash(xi,yi+1), d=hash(xi+1,yi+1);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
  }
  function fbm(x,y){ return vnoise(x,y)*.6+vnoise(x*2.1,y*2.1)*.28+vnoise(x*4.3,y*4.3)*.12; }
  function fit(c){ var w=c.clientWidth,h=c.clientHeight; if(c.width!==w) c.width=w; if(c.height!==h) c.height=h; return [w,h]; }

  /* ----- dithered edges: a wavy boundary that dissolves into scattered pixels ----- */
  function drawEdge(c){
    var wh=fit(c), w=wh[0], h=wh[1]; if(!w||!h) return;
    var ctx=c.getContext('2d'), cell=+c.dataset.cell||8, seed=+c.dataset.seed||0, up=c.dataset.mode==='up';
    ctx.clearRect(0,0,w,h); ctx.fillStyle='#2A45FF';
    var cols=Math.ceil(w/cell), rows=Math.ceil(h/cell);
    for(var x=0;x<cols;x++){
      var p=.5+.5*(Math.sin(x*.13+seed)*.5+Math.sin(x*.047+seed*2.1)*.35+Math.sin(x*.31+seed*.7)*.15);
      for(var y=0;y<rows;y++){
        var t=up?1-(y+.5)/rows:(y+.5)/rows;      /* 0 at the solid side, 1 far from it */
        var v=(1-t)*1.25+(p-.5)*.9-.08;
        if(v>thr(x,y)*1.05) ctx.fillRect(x*cell,y*cell,cell-1,cell-1);
      }
    }
  }
  function drawEdges(){ document.querySelectorAll('canvas.edge').forEach(drawEdge); }

  /* ----- story: scattered pixel landmass ----- */
  function drawField(){
    var c=document.getElementById('field'); if(!c) return;
    var wh=fit(c), w=wh[0], h=wh[1]; if(!w||!h) return;
    var ctx=c.getContext('2d'), cell=9; ctx.clearRect(0,0,w,h);
    var cols=Math.ceil(w/cell), rows=Math.ceil(h/cell);
    for(var x=0;x<cols;x++)for(var y=0;y<rows;y++){
      var n=fbm(x*.045+3.1,y*.06+1.7), fade=Math.min(1,x/(cols*.45));   /* dissolve toward the text side */
      var tt=thr(x,y);
      if(n>.5 && (n-.5)*3.2*fade>tt*1.1){ ctx.fillStyle='#F4F0E4'; ctx.fillRect(x*cell,y*cell,cell-1,cell-1); }
      else if(n>.42 && (n-.4)*3*fade>tt*1.3){ ctx.fillStyle='#C7B993'; ctx.fillRect(x*cell,y*cell,cell-1,cell-1); }
    }
  }

  /* ----- chat: a dithered globe that turns with the cursor ----- */
  var globe={c:document.getElementById('globe'),rot:.35,target:.35,raf:0};
  function drawGlobe(){
    globe.raf=0; var c=globe.c; if(!c) return;
    var wh=fit(c), w=wh[0], h=wh[1]; if(!w||!h) return;
    var ctx=c.getContext('2d'), cell=8; ctx.clearRect(0,0,w,h);
    var R=Math.min(w*.46,780), cx=w/2, cy=h*.24+R;
    var Lx=-.5,Ly=-.62,Lz=.6, ln=Math.hypot(Lx,Ly,Lz); Lx/=ln;Ly/=ln;Lz/=ln;
    var cols=Math.ceil(w/cell), rows=Math.ceil(h/cell);
    for(var x=0;x<cols;x++)for(var y=0;y<rows;y++){
      var px=x*cell+cell/2-cx, py=y*cell+cell/2-cy, r=Math.hypot(px,py); if(r>R) continue;
      var nx=px/R, ny=py/R, nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
      var lum=Math.max(0,nx*Lx+ny*Ly+nz*Lz), t=thr(x,y);
      var lon=Math.atan2(nx,nz)+globe.rot, lat=Math.asin(-ny);
      var land=fbm(lon*1.9+7.3,lat*2.3+2.1)>.56;
      if(land){ if(.25+lum*1.05>t){ ctx.fillStyle='#F4F0E4'; ctx.fillRect(x*cell,y*cell,cell-1,cell-1);} }
      else if(.35+lum*1.1>t){ ctx.fillStyle='#2A45FF'; ctx.fillRect(x*cell,y*cell,cell-1,cell-1); }
    }
  }
  function queueGlobe(){ if(!globe.raf) globe.raf=requestAnimationFrame(drawGlobe); }

  /* ----- layout redraw on resize ----- */
  var rzT=0;
  function redrawAll(){ drawEdges(); drawField(); drawGlobe(); }
  window.addEventListener('resize',function(){ clearTimeout(rzT); rzT=setTimeout(redrawAll,120); });

  /* ----- nav pill ----- */
  var navEl=document.querySelector('nav'), pill=navEl.querySelector('.nav-pill');
  function movePill(){
    var a=navEl.querySelector('a.active'); if(!a) return;
    pill.style.width=a.offsetWidth+'px';
    pill.style.transform='translateX('+a.offsetLeft+'px)';
  }
  window.addEventListener('resize',movePill);
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){ movePill(); requestAnimationFrame(function(){ pill.classList.add('ready'); }); redrawAll(); });

  /* ----- hero name: letters rise in ----- */
  (function(){
    var h=document.getElementById('heroName'); if(!h||reduce) return;
    var t=h.textContent; h.textContent='';
    t.split('').forEach(function(c,i){ var sp=document.createElement('span'); sp.className='ch'; sp.setAttribute('aria-hidden','true'); sp.style.setProperty('--i',i); sp.textContent=c; h.appendChild(sp); });
  })();

  /* ----- swipe navigation ----- */
  var track=document.getElementById('track'), current=0;
  function go(name){
    if(openId!==null) closeCase(true);
    var i=pages.indexOf(name); if(i<0) i=0; current=i; currentPage=pages[i];
    track.style.transform='translateX(-'+(i*100)+'vw)';
    document.body.setAttribute('data-page',currentPage);
    document.querySelectorAll('nav a').forEach(function(a){a.classList.toggle('active',a.getAttribute('data-go')===currentPage);});
    movePill();
    var pg=track.children[i]; if(pg) pg.scrollTop=0;
    if(history.replaceState) history.replaceState(null,'','#'+currentPage);
    if(currentPage!=='about') showLine(false);
    if(currentPage==='chat') queueGlobe();
  }
  document.querySelectorAll('[data-go]').forEach(function(el){
    el.addEventListener('click',function(e){e.preventDefault();go(el.getAttribute('data-go'));});
    if(el.getAttribute('role')==='button') el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go(el.getAttribute('data-go'));}});
  });
  window.addEventListener('keydown',function(e){
    if(e.target.matches('input,textarea')) return;
    if(openId!==null){ if(e.key==='Escape') closeCase(); return; }
    if(e.key==='ArrowRight'&&current<pages.length-1) go(pages[current+1]);
    if(e.key==='ArrowLeft'&&current>0) go(pages[current-1]);
  });

  /* ----- filters ----- */
  document.getElementById('filters').addEventListener('click',function(e){
    var c=e.target.closest('.chip'); if(!c) return;
    document.querySelectorAll('.chip').forEach(function(x){x.classList.remove('active');}); c.classList.add('active');
    var f=c.getAttribute('data-filter');
    document.querySelectorAll('#workList .work').forEach(function(card){
      var cats=(card.getAttribute('data-cat')||'').split(' ');
      card.classList.toggle('hide',!(f==='all'||cats.indexOf(f)>-1));
    });
    layoutCards();
  });

  /* ----- case study open/close ----- */
  var overlay=document.getElementById('caseOverlay'), inner=document.getElementById('caseInner');
  var scroller=overlay.querySelector('.case-scroll'), prog=overlay.querySelector('.case-progress');
  scroller.addEventListener('scroll',function(){ var m=scroller.scrollHeight-scroller.clientHeight; prog.style.setProperty('--p',m>0?(scroller.scrollTop/m).toFixed(4):0); },{passive:true});
  function boxTo(r){overlay.style.top=r.top+'px';overlay.style.left=r.left+'px';overlay.style.width=r.width+'px';overlay.style.height=r.height+'px';}
  function fullBox(){overlay.style.top='0px';overlay.style.left='0px';overlay.style.width=window.innerWidth+'px';overlay.style.height=window.innerHeight+'px';}

  /* ----- pixel-form: the case study opens as chunky blocks and sharpens into the real page ----- */
  var pf=document.getElementById('pxf'), pfFlood=pf.querySelector('feFlood'), pfComp=pf.querySelector('feComposite'), pfMorph=pf.querySelector('feMorphology');
  var pxRun=0;
  function setBlock(size){
    var h=size/2;
    pfFlood.setAttribute('x',h-1); pfFlood.setAttribute('y',h-1);
    pfComp.setAttribute('width',size); pfComp.setAttribute('height',size);
    pfMorph.setAttribute('radius',h);
    scroller.style.filter='url(#pxf)';
  }
  /* time-based: if a frame is slow (weak GPU), steps are skipped so the whole thing never takes longer than steps x gap */
  function pixelSteps(steps,gap){
    var run=++pxRun;
    if(reduce){ scroller.style.filter=''; return; }
    var t0=performance.now(), applied=-1;
    (function frame(now){
      if(run!==pxRun) return;
      var i=Math.floor((now-t0)/gap);
      if(i>=steps.length){ scroller.style.filter=''; return; }
      if(i!==applied){ applied=i; setBlock(steps[i]); }
      requestAnimationFrame(frame);
    })(t0);
  }
  var FORM=[24,18,14,10,8,6,4,2], UNFORM=[4,8,14,22];

  window.openCase=function(id,instant){
    var w=WORKS.find(function(x){return x.id===id;}); if(!w) return;
    var card=document.querySelector('.work[data-id="'+id+'"]');
    var r=card?card.getBoundingClientRect():{top:window.innerHeight/2,left:window.innerWidth/2,width:2,height:2};
    inner.innerHTML=renderCase(w);
    scroller.scrollTop=0; prog.style.setProperty('--p',0);
    overlay.hidden=false; overlay.setAttribute('aria-hidden','false');
    overlay.classList.remove('open');
    boxTo(r);
    document.body.classList.add('case-open');
    openId=id;
    if(history.replaceState) history.replaceState(null,'','#work/'+id);
    overlay.getBoundingClientRect();
    scroller.scrollTop=0; prog.style.setProperty('--p',0);   /* reset after the overlay is visible: a hidden element ignores scrollTop */
    if(instant||reduce){ fullBox(); overlay.classList.add('open'); pixelSteps(FORM,80); return; }
    if(!reduce) setBlock(24);
    requestAnimationFrame(function(){requestAnimationFrame(function(){ fullBox(); overlay.classList.add('open'); pixelSteps(FORM,80); });});
  };
  window.closeCase=function(instant){
    if(openId===null) return;
    var card=document.querySelector('.work[data-id="'+openId+'"]');
    var r=card?card.getBoundingClientRect():null;
    openId=null;
    if(history.replaceState) history.replaceState(null,'','#work');
    overlay.classList.remove('open');
    if(!instant) pixelSteps(UNFORM,70);
    function reset(){ pxRun++; scroller.style.filter=''; scroller.scrollTop=0; overlay.hidden=true; overlay.setAttribute('aria-hidden','true'); overlay.removeAttribute('style'); document.body.classList.remove('case-open'); }
    if(instant||reduce){ reset(); return; }
    if(r) boxTo(r); else { overlay.style.width='0px'; overlay.style.height='0px'; }
    var done=false;
    function fin(){ if(done) return; done=true; reset(); overlay.removeEventListener('transitionend',onEnd); }
    function onEnd(e){ if(e.target===overlay && e.propertyName==='width') fin(); }
    overlay.addEventListener('transitionend',onEnd);
    setTimeout(fin,640);
  };
  document.getElementById('workList').addEventListener('click',function(e){
    var b=e.target.closest('[data-open]'); if(!b) return;
    openCase(b.getAttribute('data-open'));
  });
  overlay.addEventListener('click',function(e){ if(e.target.closest('[data-close]')) closeCase(); });
  window.addEventListener('resize',function(){ if(openId!==null){ fullBox(); } });

  /* ----- load content ----- */
  var pendingId=null, loc=(location.hash||'').replace('#','');
  if(loc.indexOf('work/')===0){ pendingId=loc.split('/')[1]; go('work'); }
  else if(pages.indexOf(loc)>0){ go(loc); }
  fetch('content/works.json',{cache:'no-store'})
    .then(function(r){ if(!r.ok) throw new Error('http '+r.status); return r.json(); })
    .then(function(data){ WORKS=(data&&data.works)||[]; renderCards(); if(pendingId) openCase(pendingId,true); })
    .catch(function(){ document.getElementById('workList').innerHTML='<div class="load-note">Couldn’t load <b>content/works.json</b>. If you opened this file directly from disk, run a small local server (e.g. <code>npx serve</code>) so the browser can fetch it — once the site is hosted it loads automatically.</div>'; });

  /* ----- "Read" block follows the mouse over project cards ----- */
  if(!reduce && fine){
    var cur=document.createElement('div'); cur.className='cursor'; cur.setAttribute('aria-hidden','true'); cur.textContent='Read'; document.body.appendChild(cur);
    document.body.classList.add('has-bubble');
    var wl=document.getElementById('workList');
    wl.addEventListener('pointermove',function(e){
      if(!e.target.closest('.work-link')){ cur.classList.remove('on'); return; }
      cur.style.transform='translate3d('+e.clientX+'px,'+e.clientY+'px,0)'; cur.classList.add('on');
    });
    wl.addEventListener('pointerleave',function(){ cur.classList.remove('on'); });
  }

  /* ----- copy email ----- */
  var copyBtn=document.getElementById('copyMail');
  if(copyBtn){
    copyBtn.setAttribute('aria-live','polite');
    copyBtn.addEventListener('click',function(){
      var done=function(t){ copyBtn.textContent=t; setTimeout(function(){ copyBtn.textContent='Copy email'; },1800); };
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText('iskandara@live.com').then(function(){done('Copied');},function(){done('Copy failed');}); }
      else done('Copy failed');
    });
  }

  /* ----- pixel trail: cells light up under the cursor, then fade ----- */
  var trail=document.getElementById('trail'), tctx=trail.getContext('2d'), CELL=12, cells=new Map(), tRaf=0;
  function sizeTrail(){ trail.width=window.innerWidth; trail.height=window.innerHeight; }
  sizeTrail(); window.addEventListener('resize',sizeTrail);
  function tick(now){
    tRaf=0; tctx.clearRect(0,0,trail.width,trail.height);
    cells.forEach(function(c,k){
      var a=1-(now-c.t)/950; if(a<=0){ cells.delete(k); return; }
      tctx.globalAlpha=a*a*.9; tctx.fillStyle=c.o?'#FF5B1F':'#2A45FF'; tctx.fillRect(c.x*CELL,c.y*CELL,CELL-1,CELL-1);
    });
    tctx.globalAlpha=1;
    if(cells.size) tRaf=requestAnimationFrame(tick);
  }
  function lightCell(x,y,now){ var k=x+','+y; cells.set(k,{x:x,y:y,t:now,o:hash(x,y)>.9}); }
  if(!reduce && fine){
    addEventListener('pointermove',function(e){
      var now=performance.now(), cx=Math.floor(e.clientX/CELL), cy=Math.floor(e.clientY/CELL);
      lightCell(cx,cy,now);
      if(hash(cx,cy+3)>.55) lightCell(cx+(hash(cy,cx)>.5?1:-1),cy+(hash(cx,cy)>.5?1:-1),now);
      if(!tRaf) tRaf=requestAnimationFrame(tick);
    },{passive:true});
  }

  /* ----- globe follows the cursor on the chat page ----- */
  if(!reduce && fine){
    addEventListener('pointermove',function(e){
      if(currentPage!=='chat') return;
      globe.target=(e.clientX/window.innerWidth-.5)*2.4;
      if(Math.abs(globe.target-globe.rot)>.02){ globe.rot+=(globe.target-globe.rot)*.35; queueGlobe(); }
    },{passive:true});
  }

  /* ----- gaze: swap between dithered portraits taken at different angles ----- */
  /* bearing = where he looks on screen, degrees: 0 up, 90 right, 180 down, 270 left */
  var GAZE=[[305,'03'],[295,'04'],[285,'05'],[275,'06'],[262,'07'],[245,'08'],[225,'09'],[205,'10'],[190,'11'],[182,'12'],[172,'13'],[160,'14'],
            [140,'16'],[125,'17'],[110,'18'],[100,'19'],[92,'20'],[80,'21'],[68,'22'],[55,'23'],[45,'24'],[38,'25'],[28,'26'],[18,'27'],
            [5,'29'],[0,'30'],[352,'31'],[340,'32'],[325,'33']];
  var COMPASS=['up','up-right','right','down-right','down','down-left','left','up-left'];
  var gazeImg=document.getElementById('gaze'), gazeRead=document.getElementById('gazeRead');
  var svg=document.getElementById('gazeSvg'), gPath=document.getElementById('gazePath'), gNode=document.getElementById('gazeNode');
  var gBg=gNode.querySelector('.gn-bg'), gTxt=gNode.querySelector('.gn-txt');
  function showLine(on){ if(svg) svg.classList.toggle('on',!!on); }
  function src(n){ return 'content/gaze/px-'+n+'.png'; }
  if(gazeImg && !reduce){
    var CENTER=src('center'), cache=[], shown=CENTER, rafId=0, px=0, py=0, active=false, curIdx=-1, bearing=0;
    function preload(){ GAZE.forEach(function(g,i){ var im=new Image(); im.decoding='async'; im.src=src(g[1]); cache[i]=im; }); }
    if(document.readyState==='complete') setTimeout(preload,200); else addEventListener('load',function(){ setTimeout(preload,200); });
    function angDist(a,b){ var d=Math.abs(a-b)%360; return d>180?360-d:d; }
    function pick(){
      rafId=0;
      var r=gazeImg.parentNode.getBoundingClientRect(); if(!r.width) return;
      var fx=r.left+r.width/2, fy=r.top+r.height*.42, dx=px-fx, dy=py-fy, dist=Math.hypot(dx,dy);
      var next=CENTER, idx=-1, lineOn=false;
      if(active && dist>r.width*.32 && currentPage==='about'){
        bearing=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;
        var best=1e9; GAZE.forEach(function(g,i){ var d=angDist(bearing,g[0]); if(d<best){best=d;idx=i;} });
        if(curIdx>-1 && idx!==curIdx && angDist(bearing,GAZE[curIdx][0])-best<2) idx=curIdx;
        next=src(GAZE[idx][1]);
        /* dashed route from the portrait to the cursor, like the arcs on the map reference */
        var ux=dx/dist, uy=dy/dist, R0=r.width*.56, x0=fx+ux*R0, y0=fy+uy*R0, len=Math.hypot(px-x0,py-y0);
        if(len>40){
          var bend=Math.min(70,len*.16), qx=(x0+px)/2-uy*bend, qy=(y0+py)/2+ux*bend;
          gPath.setAttribute('d','M'+x0.toFixed(1)+' '+y0.toFixed(1)+' Q'+qx.toFixed(1)+' '+qy.toFixed(1)+' '+px.toFixed(1)+' '+py.toFixed(1));
          var label='GAZE '+Math.round(bearing)+'°';
          gTxt.textContent=label; gBg.setAttribute('width',(label.length*7+16).toFixed(0));
          var flipX=px>window.innerWidth-130, flipY=py>window.innerHeight-40;
          gNode.setAttribute('transform','translate('+px.toFixed(1)+' '+py.toFixed(1)+')');
          gBg.setAttribute('x',flipX?-(label.length*7+28):12); gTxt.setAttribute('x',flipX?-(label.length*7+21):19);
          gBg.setAttribute('y',flipY?-26:6); gTxt.setAttribute('y',flipY?-12:20);
          lineOn=true;
        }
        if(gazeRead) gazeRead.textContent='Gaze: '+COMPASS[Math.round(bearing/45)%8]+' '+Math.round(bearing)+'°';
      } else if(gazeRead){ gazeRead.textContent='Gaze: centre'; }
      showLine(lineOn);
      curIdx=idx;
      if(next!==shown){ shown=next; gazeImg.src=next; }
    }
    function queue(){ if(!rafId) rafId=requestAnimationFrame(pick); }
    addEventListener('pointermove',function(e){ if(e.pointerType==='touch') return; px=e.clientX; py=e.clientY; active=true; queue(); },{passive:true});
    document.documentElement.addEventListener('pointerleave',function(){ active=false; queue(); });
    /* touch: look toward the finger while it is down on the portrait, back to centre on release */
    var scope=document.getElementById('scope');
    scope.addEventListener('pointerdown',function(e){ if(e.pointerType==='touch'){ try{scope.setPointerCapture(e.pointerId);}catch(_){} px=e.clientX; py=e.clientY; active=true; queue(); } });
    scope.addEventListener('pointermove',function(e){ if(e.pointerType==='touch'&&active){ px=e.clientX; py=e.clientY; queue(); } });
    function touchEnd(e){ if(e.pointerType==='touch'){ active=false; queue(); } }
    scope.addEventListener('pointerup',touchEnd); scope.addEventListener('pointercancel',touchEnd);
  }

  redrawAll();
})();
