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
    ctx.clearRect(0,0,w,h); ctx.fillStyle=c.dataset.color||'#2A45FF';
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

  /* ==========================================================
     STORY page: rendered from content/story.json (edited in the CMS).
     Empty content keeps the "coming soon" placeholder from index.html.
     ========================================================== */
  function esc(t){ return String(t==null?'':t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function escParas(t){ return String(t||'').split(/\n\n+/).filter(Boolean).map(function(x){ return '<p>'+esc(x).replace(/\n/g,'<br>')+'</p>'; }).join(''); }
  function list(a){ return Array.isArray(a)?a.filter(function(x){ return x && (x.title||x.year); }):[]; }

  /* turn a cover into cobalt / navy / paper pixel art (same ordered dither as the portrait) */
  var PAPER=[247,246,240], COB=[42,69,255], NAVY=[18,23,42];
  function ditherCover(cv,img){
    var W=cv.width, H=cv.height, off=document.createElement('canvas'); off.width=W; off.height=H;
    var o=off.getContext('2d'), iw=img.naturalWidth, ih=img.naturalHeight; if(!iw||!ih) return;
    var sc=Math.max(W/iw,H/ih), sw=W/sc, sh=H/sc;
    o.drawImage(img,(iw-sw)/2,(ih-sh)/2,sw,sh,0,0,W,H);
    var src; try{ src=o.getImageData(0,0,W,H); }catch(e){ return; }   /* tainted canvas: leave the real cover showing */
    var px=src.data, n=W*H, lum=new Float32Array(n), hist=new Uint32Array(256), i;
    for(i=0;i<n;i++){ var L=(.2126*px[i*4]+.7152*px[i*4+1]+.0722*px[i*4+2]); lum[i]=L; hist[L|0]++; }
    var lo=0,hi=255,acc=0; for(i=0;i<256;i++){ acc+=hist[i]; if(acc>n*.03){ lo=i; break; } }
    acc=0; for(i=255;i>=0;i--){ acc+=hist[i]; if(acc>n*.03){ hi=i; break; } }
    var span=Math.max(24,hi-lo), out=cv.getContext('2d').createImageData(W,H), od=out.data;
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){
      var k=y*W+x, d=1-Math.min(1,Math.max(0,(lum[k]-lo)/span));
      var lvl=Math.floor(d*2+thr(x,y)); if(lvl>2) lvl=2;
      var col=lvl===0?PAPER:(lvl===1?COB:NAVY);
      od[k*4]=col[0]; od[k*4+1]=col[1]; od[k*4+2]=col[2]; od[k*4+3]=255;
    }
    cv.getContext('2d').putImageData(out,0,0);
  }
  function ditherAll(root){
    var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ io.unobserve(e.target); run(e.target); } }); },{rootMargin:'200px'}):null;
    function run(cover){
      var img=cover.querySelector('img'), cv=cover.querySelector('canvas'); if(!img||!cv) return;
      var go=function(){ ditherCover(cv,img); };
      if(img.complete&&img.naturalWidth) go(); else { img.addEventListener('load',go,{once:true}); }
    }
    root.querySelectorAll('.cover:not(.cover--type)').forEach(function(c){ if(io) io.observe(c); else run(c); });
  }
  function pickHTML(it,i,shape){
    var by=[it.creator,it.year].filter(Boolean).map(esc).join(' · ');
    var cls='cover '+(shape==='sq'?'cover--sq':'cover--tall');
    var cover = it.cover
      ? '<button type="button" class="'+cls+'" aria-label="Show the real cover of '+esc(it.title)+'"><img src="'+esc(it.cover)+'" alt="Cover of '+esc(it.title)+(it.creator?' by '+esc(it.creator):'')+'" loading="lazy" decoding="async"><canvas width="'+(shape==='sq'?96:80)+'" height="'+(shape==='sq'?96:120)+'" aria-hidden="true"></canvas></button>'
      : '<div class="'+cls+' cover--type"><span>'+esc(it.title)+'</span></div>';
    return '<li class="pick in-step">'+cover+'<div class="pick-meta"><span class="pick-no">'+pad2(i+1)+'</span><h4>'+esc(it.title)+'</h4>'
      +(by?'<p class="pick-by">'+by+'</p>':'')+(it.note?'<div class="pick-note">'+escParas(it.note)+'</div>':'')+'</div></li>';
  }
  /* ---------- pixel scenes for "currently building" ---------- */
  var PC={navy:'#12172A',cob:'#2A45FF',cream:'#F7F6F0',orange:'#FF5B1F',tan:'#DCD2BC',tan2:'#C7B993'};

  /* Still Here: an island that grows a little with every honest day you plant */
  function mountIsland(card){
    var cv=card.querySelector('canvas'), btn=card.querySelector('[data-act]'), out=card.querySelector('.build-count'); if(!cv||!btn) return;
    var W=64,H=44, ctx=cv.getContext('2d'), n=0, growth=1, busy=0;
    function R(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),w,h); }
    function disc(cx,cy,rad,c){ for(var y=-rad;y<=rad;y++)for(var x=-rad;x<=rad;x++) if(x*x+y*y<=rad*rad+1) R(cx+x,cy+y,1,1,c); }
    function stage(){ return Math.min(5,n); }
    function sky(st){
      R(0,0,W,H,st>=5?PC.navy:PC.cream);
      if(st<5){ disc(52,9,4,PC.orange); [[6,9],[27,5],[40,15]].forEach(function(p){ R(p[0]+1,p[1],5,1,PC.tan); R(p[0],p[1]+1,7,1,PC.tan); }); }
      else{ disc(51,9,4,PC.cream); disc(53,8,3,PC.navy); for(var i=0;i<26;i++){ var x=Math.floor(hash(i,3)*W), y=Math.floor(hash(i,9)*20); R(x,y,1,1,hash(i,5)>.7?PC.orange:PC.cream); } }
    }
    function island(){
      var cx=32, y0=28;
      for(var y=y0;y<H;y++){
        var hw=Math.round(25-(y-y0)*1.55); if(hw<3) break;
        for(var x=cx-hw;x<=cx+hw;x++){
          var col = y<y0+2?PC.cob : (y<y0+10?PC.tan : null);
          if(!col && hash(x,y)<1-(y-(y0+9))/7) col=PC.tan2;
          if(col) R(x,y,1,1,col);
        }
      }
      for(var t=0;t<22;t++){ var gx=cx-24+Math.floor(hash(t,1)*48); if(hash(t,2)>.45) R(gx,y0-1,1,1,PC.cob); }
    }
    function tree(x,h,r){
      var th=Math.max(1,Math.round(h*.4*r)), ch=Math.max(2,Math.round(h*.62*r)), cw=Math.max(2,2*Math.round(h*.3*r)+2);
      R(x-1,28-th,2,th,PC.navy);
      for(var dy=0;dy<ch;dy++){ var t=(dy+.5)/ch*2-1, w=Math.max(1,Math.round(cw*Math.sqrt(1-t*t))); R(x-w/2,28-th-ch+dy,w,1,PC.cob); }
      if(ch>4) R(x-cw/4,28-th-ch+1,1,1,PC.cream);
    }
    function sapling(x,h,r){ var sh=Math.max(1,Math.round(h*r)); R(x,28-sh,1,sh,PC.navy); if(sh>2){ R(x-1,28-sh-1,3,2,PC.cob); R(x-2,28-sh+1,2,1,PC.cob); R(x+1,28-sh+2,2,1,PC.cob); } }
    function flower(x,r){ var sh=Math.max(1,Math.round(3*r)); R(x,28-sh,1,sh,PC.navy); if(r>.5){ R(x-1,28-sh-1,3,1,PC.orange); R(x,28-sh-2,1,3,PC.orange); R(x,28-sh-1,1,1,PC.cream); } }
    function deer(x,dusk){
      var b=dusk?PC.cream:PC.navy;
      R(x,22,8,3,b); R(x+1,25,1,3,b); R(x+3,25,1,3,b); R(x+5,25,1,3,b); R(x+7,25,1,3,b);
      R(x+7,19,2,4,b); R(x+8,18,3,2,b); R(x+8,15,1,3,PC.orange); R(x+10,15,1,3,PC.orange); R(x+9,16,1,1,PC.orange);
    }
    function plants(st,r){
      if(st===1){ R(31,27,3,1,PC.tan2); R(32,25,2,2,PC.orange); }
      if(st===2) sapling(32,6,r);
      if(st===3){ sapling(22,5,r); sapling(32,8,r); sapling(42,6,r); }
      if(st>=4){ tree(18,16,r); tree(31,22,r); tree(45,14,r); [25,38,51,12].forEach(function(fx){ flower(fx,r); }); }
      if(st>=5){ deer(36,true); [[10,20],[24,14],[40,18],[55,22],[47,10]].forEach(function(p,i){ if(hash(i,n)>.2) R(p[0],p[1],1,1,PC.orange); }); }
    }
    function draw(r){ var st=stage(); sky(st); island(); plants(st,r); }
    function label(){
      var t=n===0?'Bare soil':(n===1?'Day 1 · a seed':(n===2?'Day 2 · a sapling':(n===3?'Day 3 · a small grove':(n===4?'Day 4 · a grove in bloom':'Day '+n+' · a haven at dusk'))));
      out.textContent=t; btn.textContent=n>=5?'Plant another honest day':'Plant an honest day';
    }
    function grow(){
      if(busy) return; busy=1; n++; label();
      cv.classList.remove('pop'); void cv.offsetWidth; if(!reduce) cv.classList.add('pop');
      if(reduce){ draw(1); busy=0; return; }
      var f=0,steps=[.25,.5,.75,1];
      (function step(){ draw(steps[f++]); if(f<steps.length) setTimeout(step,90); else busy=0; })();
    }
    draw(1); label(); btn.addEventListener('click',grow); cv.addEventListener('click',grow);
  }

  /* SANTAI: a pixel tee that flips to a new quirky print, a nod to the 360 degree shirt on the site */
  function mountTee(card){
    var cv=card.querySelector('canvas'), btn=card.querySelector('[data-act]'), out=card.querySelector('.build-count'); if(!cv||!btn) return;
    var W=48,H=44, ctx=cv.getContext('2d'), i=0, off=0, busy=0;
    var SH=[[2,11],[11,3],[17,3],[24,7],[31,3],[37,3],[46,11],[41,17],[36,13],[36,41],[12,41],[12,13],[7,17]];
    var LOOKS=[{body:PC.cream,ink:PC.navy,acc:PC.orange,print:'sun'},{body:PC.cob,ink:PC.cream,acc:PC.orange,print:'smile'},{body:PC.orange,ink:PC.navy,acc:PC.cream,print:'bolt'},{body:PC.navy,ink:PC.cream,acc:PC.orange,print:'shroom'},{body:PC.tan2,ink:PC.navy,acc:PC.cob,print:'star'}];
    function R(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),w,h); }
    function inside(x,y){ var c=false; for(var a=0,b=SH.length-1;a<SH.length;b=a++){ var xi=SH[a][0],yi=SH[a][1],xj=SH[b][0],yj=SH[b][1]; if(((yi>y)!==(yj>y)) && (x<(xj-xi)*(y-yi)/(yj-yi)+xi)) c=!c; } return c; }
    function printSprite(kind,ox,oy,L){
      var P=function(x,y,col,w,h){ R(ox+x,oy+y,w||1,h||1,col); };
      if(kind==='sun'){ for(var y=-3;y<=3;y++)for(var x=-3;x<=3;x++) if(x*x+y*y<=9) P(6+x,6+y,L.acc); [[0,-5],[0,5],[-5,0],[5,0],[-4,-4],[4,-4],[-4,4],[4,4]].forEach(function(d){ P(6+d[0],6+d[1],L.ink,1,1); P(6+Math.round(d[0]*1.15),6+Math.round(d[1]*1.15),L.ink); }); }
      if(kind==='smile'){ for(var y2=-5;y2<=5;y2++)for(var x2=-5;x2<=5;x2++) if(x2*x2+y2*y2<=25) P(6+x2,6+y2,L.acc); P(4,4,L.ink,1,2); P(8,4,L.ink,1,2); [[3,7],[4,8],[5,8],[6,8],[7,8],[8,8],[9,7]].forEach(function(d){ P(d[0],d[1],L.ink); }); }
      if(kind==='bolt'){ [[5,0,4,2],[4,2,4,2],[3,4,6,2],[5,6,4,2],[4,8,4,2],[3,10,3,2]].forEach(function(b){ P(b[0]+1,b[1]+1,L.ink,b[2],b[3]); }); [[5,0,4,2],[4,2,4,2],[3,4,6,2],[5,6,4,2],[4,8,4,2],[3,10,3,2]].forEach(function(b){ P(b[0],b[1],L.acc,b[2],b[3]); }); }
      if(kind==='shroom'){ [[3,1,6],[2,2,8],[1,3,10],[1,4,10],[1,5,10]].forEach(function(r){ P(r[0],r[1],L.acc,r[2],1); }); [[4,3],[7,2],[8,4],[3,5]].forEach(function(d){ P(d[0],d[1],L.ink); }); P(4,6,L.ink,4,5); P(3,10,L.ink,6,1); }
      if(kind==='star'){ ['....##....','....##....','##########','.########.','..######..','..######..','.###..###.','.##....##.'].forEach(function(row,y3){ for(var x3=0;x3<row.length;x3++) if(row[x3]==='#') P(1+x3,2+y3,L.acc); }); }
    }
    function draw(scaleX){
      var L=LOOKS[i%LOOKS.length]; ctx.clearRect(0,0,W,H); R(0,0,W,H,'#E6E0CE');
      for(var y=0;y<H;y+=2)for(var x=(y/2)%2*2;x<W;x+=4) R(x,y,1,1,PC.tan);            /* faint pixel grid */
      ctx.save(); ctx.translate(W/2+off,0); ctx.scale(scaleX,1); ctx.translate(-W/2,0);
      for(var yy=0;yy<H;yy++)for(var xx=0;xx<W;xx++){
        if(!inside(xx+.5,yy+.5)) continue;
        var edge=!inside(xx+1.5,yy+.5)||!inside(xx-.5,yy+.5)||!inside(xx+.5,yy+1.5)||!inside(xx+.5,yy-.5);
        R(xx,yy,1,1,edge?(L.body===PC.navy?PC.cream:PC.navy):L.body);
      }
      for(var cx=17;cx<=31;cx++){ var cy=cx<=24?3+Math.round((cx-17)*4/7):3+Math.round((31-cx)*4/7); R(cx,cy+1,1,2,L.acc); }   /* collar */
      R(13,38,23,2,L.acc);                                                                   /* hem stripe */
      printSprite(L.print,18,17,L);
      ctx.restore();
    }
    function label(){ out.textContent='Tee '+pad2((i%LOOKS.length)+1)+' / '+pad2(LOOKS.length); }
    function flip(){
      if(busy) return; busy=1;
      if(reduce){ i++; draw(1); label(); busy=0; return; }
      var seq=[.7,.4,.12], k=0;
      (function down(){ if(k<seq.length){ draw(seq[k++]); setTimeout(down,70); } else { i++; label(); k=seq.length-1; up(); } })();
      function up(){ if(k>=0){ draw(seq[k--]); setTimeout(up,70); } else { draw(1); busy=0; } }
    }
    cv.addEventListener('pointermove',function(e){ if(busy||e.pointerType==='touch') return; var r=cv.getBoundingClientRect(), o=Math.round(((e.clientX-r.left)/r.width-.5)*3); if(o!==off){ off=o; draw(1); } });
    cv.addEventListener('pointerleave',function(){ if(off){ off=0; if(!busy) draw(1); } });
    draw(1); label(); btn.addEventListener('click',flip); cv.addEventListener('click',flip);
  }
  function buildHTML(it){
    var domain=it.url?esc(stripProto(it.url).replace(/^www\./,'')):esc(it.title);
    var art=it.art==='island'?'island':(it.art==='tee'?'tee':'plain');
    var scene = art==='plain' ? '' :
      '<div class="build-scene"><canvas width="'+(art==='island'?64:48)+'" height="44" role="img" aria-label="'+(art==='island'?'A pixel island that grows as you plant honest days. Click to plant.':'A pixel T-shirt that flips to a new quirky print. Click to change.')+'"></canvas></div>'
      +'<div class="build-act"><button type="button" class="btn btn--sm" data-act="'+art+'">'+(art==='island'?'Plant an honest day':'Next tee')+'</button><span class="build-count" aria-live="polite"></span></div>';
    return '<article class="build-card build-card--'+art+' in-step" data-art="'+art+'">'
      +'<div class="build-bar"><span>'+domain+'</span>'+(it.status?'<span class="build-chip">'+esc(it.status)+'</span>':'')+'</div>'
      +scene
      +'<div class="build-text"><h4>'+esc(it.title)+'</h4>'+(it.tagline?'<p class="build-tag">'+esc(it.tagline)+'</p>':'')
      +(it.body?'<div class="build-body">'+escParas(it.body)+'</div>':'')
      +(art==='island'?'<p class="build-note">No streaks. No red marks. Every honest day is kept.</p>':'')
      +'<div class="build-links">'+(it.url?'<a class="btn" href="'+esc(it.url)+'" target="_blank" rel="noopener">Visit '+domain+' &#8599;</a>':'')
      +(it.case?'<a class="textlink" data-case="'+esc(it.case)+'" role="button" tabindex="0">Read the case study</a>':'')+'</div></div></article>';
  }
  function renderStory(d){
    var root=document.getElementById('storyRoot'); if(!root||!d) return;
    var tl=list(d.timeline), now=d.now||{}, hasNow=!!(now.reading||now.watching||now.listening), building=list(d.building).slice(0,4);
    var shelves=[['books','Books','The books that shaped me','tall'],['movies','Films','The films that shaped me','tall'],['albums','Albums','The albums that shaped me','sq']]
      .map(function(m){ return {key:m[0],label:m[1],title:m[2],shape:m[3],items:list(d[m[0]]).slice(0,5)}; }).filter(function(m){ return m.items.length; });
    if(!d.intro && !tl.length && !shelves.length && !hasNow && !building.length) return;       /* nothing yet: keep the placeholder */

    var html='<section class="story-top" data-band="tan"><div class="wrap"><p class="kick">[ The long version ]</p><h2 class="stub-h">Story</h2>'
      +(d.intro?'<div class="intro-copy">'+escParas(d.intro)+'</div>':'');
    if(tl.length){
      html+='<h3 class="tl-h">The timeline</h3><ol class="tl">'+tl.map(function(t){
        return '<li class="tl-item in-step"><span class="tl-year">'+esc(t.year)+'</span><div class="tl-body"><h4>'+esc(t.title)+'</h4>'+(t.body?'<div>'+escParas(t.body)+'</div>':'')+'</div></li>';
      }).join('')+'</ol>';
    }
    html+='</div></section>';

    var colors=['cobalt','navy','paper'], bandBg={tan:'var(--tan)',cobalt:'var(--cobalt)',navy:'var(--navy)',paper:'var(--paper)'}, bandHex={tan:'#DCD2BC',cobalt:'#2A45FF',navy:'#12172A',paper:'#F7F6F0'};
    var prev='tan';
    function edge(next){ return '<div class="band-edge" style="background:'+bandBg[prev]+'"><canvas class="edge" data-mode="up" data-cell="8" data-seed="'+(Math.random()*9).toFixed(1)+'" data-color="'+bandHex[next]+'" aria-hidden="true"></canvas></div>'; }
    if(building.length){
      html+=edge('paper')+'<section class="band band--paper" aria-label="Currently building"><div class="wrap"><p class="kick">[ Currently building ]</p><h3 class="shelf-h">'+(building.length===1?'One project':(building.length===2?'Two projects':building.length+' projects'))+', on my own time</h3><div class="build-grid">'
        +building.map(buildHTML).join('')+'</div></div></section>';
      prev='paper';
    }
    shelves.forEach(function(m,i){
      var col=colors[i%colors.length];
      html+=edge(col)+'<section class="band band--'+col+'" aria-label="'+esc(m.title)+'"><div class="wrap"><p class="kick">[ '+pad2(i+1)+' / '+esc(m.label)+' ]</p><h3 class="shelf-h">'+esc(m.title)+'</h3>'
        +'<ul class="picks">'+m.items.map(function(it,j){ return pickHTML(it,j,m.shape); }).join('')+'</ul></div></section>';
      prev=col;
    });
    if(hasNow){
      html+=edge('tan')+'<section class="band band--tan"><div class="wrap"><p class="kick">[ Now ]</p><h3 class="shelf-h">What I’m into right now</h3><dl class="now">'
        +[['Reading',now.reading],['Watching',now.watching],['Listening',now.listening]].filter(function(r){ return r[1]; }).map(function(r){ return '<div class="in-step"><dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd></div>'; }).join('')
        +'</dl></div></section>';
      prev='tan';
    }
    html+='<div class="story-end"><div class="wrap"><a class="btn" data-go="chat" role="button" tabindex="0">Say hi &rarr;</a></div></div>';
    root.innerHTML=html;

    root.querySelectorAll('[data-go]').forEach(function(el){
      el.addEventListener('click',function(e){ e.preventDefault(); go(el.getAttribute('data-go')); });
      el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(el.getAttribute('data-go')); } });
    });
    root.querySelectorAll('button.cover').forEach(function(b){ b.addEventListener('click',function(){ b.classList.toggle('reveal'); }); });   /* touch: tap to show the real cover */
    var steps=root.querySelectorAll('.in-step');
    if(reduce||!('IntersectionObserver' in window)){ steps.forEach(function(el){ el.classList.add('in'); }); }
    else{
      var sio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); sio.unobserve(e.target); } }); },{threshold:.12});
      steps.forEach(function(el,i){ el.style.transitionDelay=((i%5)*60)+'ms'; sio.observe(el); });
    }
    root.querySelectorAll('.build-card--island').forEach(mountIsland);
    root.querySelectorAll('.build-card--tee').forEach(mountTee);
    root.querySelectorAll('[data-case]').forEach(function(el){
      var open=function(e){ e.preventDefault(); go('work'); setTimeout(function(){ openCase(el.getAttribute('data-case')); },reduce?0:700); };
      el.addEventListener('click',open); el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' ') open(e); });
    });
    ditherAll(root);
    drawEdges();
  }
  fetch('content/story.json',{cache:'no-store'}).then(function(r){ return r.ok?r.json():null; }).then(renderStory).catch(function(){});

  redrawAll();
})();
