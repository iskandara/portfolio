/* ==========================================================
   404: a spinning pixel globe that your cursor comet can shatter.
   - the globe is a grid of square "cells" drawn on #nfCanvas
   - hit it and a shockwave releases the cells from the impact point outward
   - after a few seconds the pieces drift back and rebuild it
   ========================================================== */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var slot=document.getElementById('nfSlot'), cv=document.getElementById('nfCanvas'), ctx=cv.getContext('2d');
  var statusEl=document.getElementById('nfStatus'), pathEl=document.getElementById('nfPath'), cometBtn=document.getElementById('nfComet');

  /* what was asked for, shown (as text, never as HTML) */
  try{ var p=decodeURIComponent(location.pathname||''); if(p&&p!=='/'&&p!=='/404.html') pathEl.textContent=p.length>60?p.slice(0,57)+'...':p; }catch(e){}

  var PC={navy:'#12172A',cob:'#2A45FF',cream:'#F7F6F0',orange:'#FF5B1F'};

  /* ----- noise + ordered dither (same family as the rest of the site) ----- */
  var BAYER=[[0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],[12,44,4,36,14,46,6,38],[60,28,52,20,62,30,54,22],[3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],[15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]];
  function thr(x,y){ return (BAYER[y&7][x&7]+.5)/64; }
  function hash(x,y){ var n=Math.sin(x*127.1+y*311.7)*43758.5453; return n-Math.floor(n); }
  function vnoise(x,y){ var xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi, u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
    var a=hash(xi,yi), b=hash(xi+1,yi), c=hash(xi,yi+1), d=hash(xi+1,yi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; }
  function fbm(x,y){ return vnoise(x,y)*.6+vnoise(x*2.1,y*2.1)*.28+vnoise(x*4.3,y*4.3)*.12; }

  /* ----- state ----- */
  var dpr=Math.min(2,window.devicePixelRatio||1), W=0,H=0;
  var cells=[], stars=[], cx=0,cy=0,R=1,cell=6, rot=.6;
  var state='intact', brokeAt=0, armed=true, reformAt=0;
  var last=0, px=-999, py=-999, pvx=0, pvy=0, pt=0, hasPointer=false;
  var tilt=-.34, orbitA=.9;

  function msg(s){ statusEl.textContent=s; }
  function intactMsg(){ if(reduce){ msg('Motion is reduced, so the globe is resting.'); return; } msg(fine?'Fragile: please do not hit the globe with your cursor.':'Fragile: please do not touch the globe.'); }

  function build(){
    var r=slot.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height/2; R=Math.max(20,r.width/2);
    cell=Math.max(4,Math.round(2*R/58));
    cells=[]; var n=Math.ceil(R/cell), Lx=-.5,Ly=-.62,Lz=.6, ln=Math.hypot(Lx,Ly,Lz); Lx/=ln;Ly/=ln;Lz/=ln;
    for(var gy=-n;gy<=n;gy++)for(var gx=-n;gx<=n;gx++){
      var ox=gx*cell+cell/2, oy=gy*cell+cell/2, rr=Math.hypot(ox,oy); if(rr>R) continue;
      var nx=ox/R, ny=oy/R, nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
      cells.push({hx:cx+gx*cell, hy:cy+gy*cell, x:0,y:0,vx:0,vy:0, lon0:Math.atan2(nx,nz), lat:Math.asin(-ny),
        lum:Math.max(0,nx*Lx+ny*Ly+nz*Lz), t:thr(gx+64,gy+64), mode:0, col:null, delay:0, retDelay:0});
    }
    stars=[]; for(var i=0;i<70;i++) stars.push({x:Math.floor(hash(i,1)*W), y:Math.floor(hash(i,2)*H), s:hash(i,3)>.85?2:1, o:hash(i,4)>.8});
  }
  function size(){
    W=window.innerWidth; H=window.innerHeight; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
    build(); if(state!=='intact'){ /* resized mid-break: just rebuild the globe */ state='intact'; armed=false; intactMsg(); }
    draw(0);
  }

  /* what colour is this cell right now (null = a gap in the dithering) */
  function colorAt(c){
    var land=fbm((c.lon0+rot)*1.9+7.3,c.lat*2.3+2.1)>.56;
    if(land) return (.25+c.lum*1.05>c.t)?PC.cream:null;
    return (.35+c.lum*1.1>c.t)?PC.cob:null;
  }

  /* ----- the break ----- */
  function impact(ix,iy,vx,vy){
    if(state!=='intact') return;
    state='broken'; brokeAt=performance.now()/1000;
    var sp=Math.hypot(vx,vy), S0=Math.min(950,520+sp*.22);
    cells.forEach(function(c){
      var col=colorAt(c);
      if(!col){ c.mode=4; return; }                                     /* dithering gaps just vanish */
      c.col=col; c.mode=1; c.x=c.hx; c.y=c.hy;
      var dx=c.hx-ix, dy=c.hy-iy, d=Math.hypot(dx,dy)||1, f=Math.pow(Math.max(0,1-d/(2.2*R)),1.2), j=.6+Math.random()*.8;
      c.delay=d/1500;                                                   /* the shockwave travels outward */
      c.vx=(dx/d)*S0*f*j + vx*.14*Math.random() + (Math.random()-.5)*70;
      c.vy=(dy/d)*S0*f*j + vy*.14*Math.random() + (Math.random()-.5)*70;
    });
    msg('You broke the world. It will grow back.');
  }
  function startReform(){
    state='reforming'; msg('Rebuilding the globe...');
    cells.forEach(function(c){ if(c.mode===1||c.mode===2){ c.mode=3; c.retDelay=Math.random()*.55+Math.hypot(c.x-c.hx,c.y-c.hy)/5200; } });
  }
  function update(dt,now){
    if(state==='intact'){ rot+=dt*.32; return; }
    rot+=dt*.32;
    var t=now-brokeAt, allHome=true;
    if(state==='broken' && t>3.7) startReform();
    var drag=Math.exp(-.75*dt), k=1-Math.exp(-7*dt);
    for(var i=0;i<cells.length;i++){
      var c=cells[i];
      if(c.mode===1){ allHome=false; if(t>=c.delay) c.mode=2; }
      else if(c.mode===2){ allHome=false; c.x+=c.vx*dt; c.y+=c.vy*dt; c.vx*=drag; c.vy*=drag; }
      else if(c.mode===3){
        c.retDelay-=dt;
        if(c.retDelay>0){ allHome=false; c.x+=c.vx*dt; c.y+=c.vy*dt; c.vx*=drag; c.vy*=drag; continue; }
        c.x+=(c.hx-c.x)*k; c.y+=(c.hy-c.y)*k;
        var live=colorAt(c); if(live) c.col=live;                       /* pieces pick up the spinning texture as they return */
        if(Math.abs(c.hx-c.x)<.7&&Math.abs(c.hy-c.y)<.7){ c.mode=0; } else allHome=false;
      }
      else if(c.mode===4 && state==='reforming'){ /* wait */ }
    }
    if(state==='reforming'&&allHome){
      cells.forEach(function(c){ c.mode=0; });
      state='intact'; armed=false; intactMsg();
    }
  }

  /* ----- drawing ----- */
  function snap(v){ return Math.round(v*dpr)/dpr; }
  function ring(front){
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(tilt); ctx.setLineDash([7,7]); ctx.lineWidth=2; ctx.strokeStyle=PC.orange;
    ctx.beginPath(); ctx.ellipse(0,0,R*1.75,R*.46,0,front?0:Math.PI,front?Math.PI:Math.PI*2); ctx.stroke(); ctx.restore();
  }
  function satellite(){
    var rx=R*1.75, ry=R*.46, ex=rx*Math.cos(orbitA), ey=ry*Math.sin(orbitA);
    var X=cx+ex*Math.cos(tilt)-ey*Math.sin(tilt), Y=cy+ex*Math.sin(tilt)+ey*Math.cos(tilt);
    ctx.fillStyle=PC.orange; ctx.fillRect(snap(X-5),snap(Y-5),10,10);
    ctx.fillStyle=PC.navy; ctx.fillRect(snap(X+9),snap(Y-9),32,16); ctx.fillStyle=PC.cream; ctx.font='500 10px "DM Mono",monospace'; ctx.textBaseline='middle'; ctx.fillText('404',snap(X+14),snap(Y-1));
    return Math.sin(orbitA)>0;
  }
  function draw(now){
    ctx.clearRect(0,0,W,H);
    stars.forEach(function(s,i){ var tw=(!reduce&&s.o)&&(Math.floor(now*1.6+i)%4===0); ctx.fillStyle=tw?PC.orange:PC.cream; ctx.globalAlpha=s.o?.9:.45; ctx.fillRect(s.x,s.y,s.s,s.s); });
    ctx.globalAlpha=1;
    ring(false);
    var satFront=Math.sin(orbitA)>0;
    if(!satFront) satellite();
    for(var i=0;i<cells.length;i++){
      var c=cells[i], col, x, y;
      if(c.mode===4) continue;
      if(c.mode===0){ col=colorAt(c); if(!col) continue; x=c.hx; y=c.hy; }
      else{ col=c.col; x=c.x; y=c.y; }
      ctx.fillStyle=col; ctx.fillRect(snap(x),snap(y),cell-1,cell-1);
    }
    ring(true);
    if(satFront) satellite();
  }

  /* ----- pointer: the comet hits the globe ----- */
  function onMove(e){
    var now=performance.now(), x=e.clientX, y=e.clientY;
    if(hasPointer && now>pt){ var dt=(now-pt)/1000; pvx=pvx*.4+((x-px)/dt)*.6; pvy=pvy*.4+((y-py)/dt)*.6; }
    px=x; py=y; pt=now; hasPointer=true;
    var d=Math.hypot(x-cx,y-cy);
    if(state==='intact'){
      if(!armed){ if(d>R*1.12) armed=true; return; }
      if(d<R*.92 && !reduce){ var vx=Math.max(-3000,Math.min(3000,pvx)), vy=Math.max(-3000,Math.min(3000,pvy)); impact(x,y,vx,vy); }
    }
  }
  if(fine) window.addEventListener('pointermove',onMove,{passive:true});
  /* touch and click: a tap on the globe is a direct hit */
  window.addEventListener('pointerdown',function(e){
    if(reduce||state!=='intact') return;
    if(Math.hypot(e.clientX-cx,e.clientY-cy)<R){ var a=Math.random()*6.283; impact(e.clientX,e.clientY,Math.cos(a)*900,Math.sin(a)*900); }
  });
  /* keyboard / touch friendly: throw a comet from a random direction */
  if(cometBtn) cometBtn.addEventListener('click',function(){
    if(reduce) return;
    if(state!=='intact'){ return; }
    var a=Math.random()*6.283, s=1700; impact(cx+Math.cos(a)*R*.9, cy+Math.sin(a)*R*.9, -Math.cos(a)*s, -Math.sin(a)*s);
  });

  /* ----- pixel comet trail (same as the main site; mouse only) ----- */
  var trail=document.getElementById('trail'), tctx=trail.getContext('2d'), CELL=12, tcells=new Map(), tRaf=0;
  function sizeTrail(){ trail.width=window.innerWidth; trail.height=window.innerHeight; }
  sizeTrail(); window.addEventListener('resize',sizeTrail);
  function tick(now){
    tRaf=0; tctx.clearRect(0,0,trail.width,trail.height);
    tcells.forEach(function(c,k){ var a=1-(now-c.t)/950; if(a<=0){ tcells.delete(k); return; } tctx.globalAlpha=a*a*.9; tctx.fillStyle=c.o?PC.orange:PC.cob; tctx.fillRect(c.x*CELL,c.y*CELL,CELL-1,CELL-1); });
    tctx.globalAlpha=1; if(tcells.size) tRaf=requestAnimationFrame(tick);
  }
  function light(x,y,now){ tcells.set(x+','+y,{x:x,y:y,t:now,o:hash(x,y)>.9}); }
  if(!reduce&&fine){
    window.addEventListener('pointermove',function(e){
      var now=performance.now(), x=Math.floor(e.clientX/CELL), y=Math.floor(e.clientY/CELL);
      light(x,y,now); if(hash(x,y+3)>.55) light(x+(hash(y,x)>.5?1:-1),y+(hash(x,y)>.5?1:-1),now);
      if(!tRaf) tRaf=requestAnimationFrame(tick);
    },{passive:true});
  }

  /* ----- loop ----- */
  function frame(ts){
    var now=ts/1000, dt=Math.min(.05,last?now-last:.016); last=now;
    if(!reduce){ orbitA+=dt*.55; }
    if(!reduce) update(dt,performance.now()/1000);
    draw(now);
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize',function(){ clearTimeout(size._t); size._t=setTimeout(size,100); });
  intactMsg();
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){ size(); if(!reduce) requestAnimationFrame(frame); });
  size();
})();
