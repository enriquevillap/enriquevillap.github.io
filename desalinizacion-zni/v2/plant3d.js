/*
 Visualización espacial 3D procedural del proceso de desalinización.
 Motor de proyección 3D autónomo sin CDN, texturas externas ni bibliotecas.
 Solamente didáctico: no representa una instalación, ingeniería de detalle ni gemelo conectado.
*/
const V=(x=0,y=0,z=0)=>[x,y,z], add=(a,b)=>a.map((v,i)=>v+b[i]), sub=(a,b)=>a.map((v,i)=>v-b[i]),
mul=(a,t)=>a.map(v=>v*t), dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
cross=(a,b)=>V(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]),
norm=a=>mul(a,1/(Math.hypot(...a)||1)), mix=(a,b,t)=>a+(b-a)*t,
clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const light=norm(V(-.55,1,.7));const makeColor=(hex)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function rgb(c,f=1){const a=makeColor(c);return "rgb("+a.map(v=>Math.round(clamp(v*f,0,255))).join(",")+")";}
const nodeInfo={
 "Captación marina":"Entrada conceptual de agua de mar, con rejillas y línea de captación. No representa una toma proyectada.",
 "Bombeo":"Bombas principales y de respaldo virtuales. Los estados del motor no activan equipos físicos.",
 "Filtración":"Vasos de pretratamiento. ΔP modelada como variable sintética, sin dimensionamiento mecánico.",
 "Ósmosis inversa":"Módulos RO conceptuales. Los caudales y salinidades proceden del balance matemático simplificado.",
 "Fotovoltaica":"Módulos FV procedurales y controlador de potencia. Dimensionamiento didáctico de 10 m².",
 "Tanque":"Almacenamiento virtual con nivel, demanda y desvío del producto fuera de criterio.",
 "Salmuera":"Corriente de rechazo que requiere estudios ambientales antes de una descarga real."
};
const labels=[
 {name:"Captación marina",p:V(-12,1.5,3),color:"#64d4e8"},
 {name:"Bombeo",p:V(-6,3,1.6),color:"#9fc9ee"},
 {name:"Filtración",p:V(-1.9,4,2.6),color:"#e9f2f2"},
 {name:"Ósmosis inversa",p:V(4.1,4,2.5),color:"#e6f6fa"},
 {name:"Fotovoltaica",p:V(-2,4.0,-6),color:"#ffd38d"},
 {name:"Tanque",p:V(10.4,5.5,1.1),color:"#7ff4d3"},
 {name:"Salmuera",p:V(8.6,1.0,5.6),color:"#efc081"}
];
export function mountPlant3D(canvas,status,getResult=()=>null){
 if(!canvas||!canvas.getContext)throw Error("Canvas no disponible");
 const ctx=canvas.getContext("2d",{alpha:false});
 if(!ctx)throw Error("Representación 3D no disponible en este navegador");
 let yaw=-.62,pitch=.44,zoom=33,target=V(0,1,0),width=900,height=570,dpr=1;
 let dragging=false,pointerX=0,pointerY=0,auto=false,raf=0,lastFrame=0,selected="Ósmosis inversa",alive=true;
 const root=canvas.closest(".scene-wrap")||canvas.parentElement;
 canvas.style.touchAction="none";
 const write=(message)=>{if(status)status.textContent=message;};
 const M=[];function triangle(a,b,c,color,rough=1){
   const normal=norm(cross(sub(b,a),sub(c,a)));
   M.push({pts:[a,b,c],normal,color,rough,center:mul(add(add(a,b),c),1/3)});
 }
 function quad(a,b,c,d,color,rough=1){triangle(a,b,c,color,rough);triangle(a,c,d,color,rough)}
 function cuboid(center,size,color,rough=.85){
   const [x,y,z]=center,[w,h,l]=size,X=w/2,Y=h/2,Z=l/2;
   const a=V(x-X,y-Y,z-Z),b=V(x+X,y-Y,z-Z),c=V(x+X,y+Y,z-Z),d=V(x-X,y+Y,z-Z);
   const e=V(x-X,y-Y,z+Z),f=V(x+X,y-Y,z+Z),g=V(x+X,y+Y,z+Z),j=V(x-X,y+Y,z+Z);
   quad(a,b,c,d,color,rough);quad(f,e,j,g,color,rough);
   quad(e,a,d,j,color,rough);quad(b,f,g,c,color,rough);
   quad(d,c,g,j,color,rough);quad(e,f,b,a,color,rough);
 }
 function tube(p0,p1,r,color,segments=14){
   const axis=norm(sub(p1,p0)),ref=Math.abs(axis[1])>.92?V(1,0,0):V(0,1,0);
   const u=norm(cross(axis,ref)),v=norm(cross(axis,u));
   const rings=[p0,p1].map(p=>Array.from({length:segments},(_,i)=>{
     const ang=i/segments*Math.PI*2;return add(p,add(mul(u,r*Math.cos(ang)),mul(v,r*Math.sin(ang))));
   }));
   for(let i=0;i<segments;i++){
    const n=(i+1)%segments;quad(rings[0][i],rings[0][n],rings[1][n],rings[1][i],color,.36);
   }
   for(let i=1;i<segments-1;i++){triangle(p0,rings[0][i+1],rings[0][i],color);triangle(p1,rings[1][i],rings[1][i+1],color);}
 }
 function pipe(points,r,color){for(let i=1;i<points.length;i++)tube(points[i-1],points[i],r,color,10)}
 function solarPanel(center){
  const [x,y,z]=center;
  const A=V(x-1.0,y,z-.62),B=V(x+1.0,y,z-.62),C=V(x+1.0,y+.6,z+.62),D=V(x-1.0,y+.6,z+.62);
  quad(A,B,C,D,"#123f60",.25);
  for(let i=0;i<5;i++){const xx=x-1+i*.5;tube(V(xx,y+.015,z-.61),V(xx,y+.615,z+.61),.012,"#9ab1c1",5);}
  for(let j=0;j<4;j++){const f=j/3;const p=V(x-1,y+.6*f,z-.62+1.24*f);const q=V(x+1,y+.6*f,z-.62+1.24*f);tube(p,q,.012,"#8baac4",5);}
  tube(V(x-.7,0,z),V(x-.7,y-.1,z),.055,"#687f8e");tube(V(x+.7,0,z),V(x+.7,y-.1,z),.055,"#687f8e");
 }
 function build(){
  cuboid(V(1.4,-.33,0),V(26,.55,13),"#b7b5a9");
  cuboid(V(1.4,-.03,6.25),V(26,.28,.38),"#9b9c91");
  // Safety walkways and bunds
  cuboid(V(2,.04,0),V(23,.12,2),"#b1ad9e");
  cuboid(V(10.2,.12,1.4),V(4.2,.20,4),"#808f95");
  // Coastal water channel and intake
  cuboid(V(-11.8,-.18,3.4),V(3.0,.30,6.6),"#1b7290");
  cuboid(V(-11.8,.03,3.2),V(2.8,.08,5.3),"#3187a0");
  for(let z=-.2;z<=5;z+=.6)tube(V(-11.2,.17,z),V(-10.4,.17,z),.035,"#b3ccd0",5);
  pipe([V(-10.6,.37,1.7),V(-8.7,.37,1.7),V(-7.2,.75,1.7)],.19,"#4881a3");
  // Skid pumps
  for(let z of [-.1,2]){cuboid(V(-6.35,.15,z),V(3.1,.32,1.2),"#708b96");tube(V(-7.4,.8,z),V(-5.45,.8,z),.54,z<1?"#526f8c":"#506b5f");
   cuboid(V(-7.85,.85,z),V(.4,.72,.82),"#e2b55d");cuboid(V(-4.9,.81,z),V(.5,.56,.85),"#8897a2");
   for(const i of [-1,1])tube(V(-6.3,.09,z+i*.55),V(-6.3,.26,z+i*.55),.09,"#536879");}
  pipe([V(-4.9,.75,1.4),V(-4.0,.75,1.4),V(-4.0,1.5,2)],.18,"#377ca5");
  // Three prefilters
  for(const x of [-3.4,-1.4,.6]){
   tube(V(x,.4,2.45),V(x,3.1,2.45),.65,"#c7d0d1",22);
   tube(V(x,3.05,2.45),V(x,3.36,2.45),.48,"#7294a5",18);
   for(let z of [-.38,.38])cuboid(V(x,.1,2.45+z),V(.88,.18,.25),"#758997");
   pipe([V(x,3.35,2.45),V(x,3.65,2.45)],.09,"#6487a2");
  }
  pipe([V(-3.4,3.7,2.45),V(.6,3.7,2.45),V(1.65,2,2.45)],.10,"#6294a8");
  // Reverse-osmosis vessels, rack and supports
  for(const z of [-.15,1.4,2.95]){
   cuboid(V(4.2,.36,z),V(5.7,.2,1.35),"#7a92a1");
   tube(V(1.55,1.48,z),V(6.95,1.48,z),.47,"#d3ddd9",20);
   tube(V(1.4,1.48,z),V(1.53,1.48,z),.48,"#587f92",18);
   tube(V(6.95,1.48,z),V(7.13,1.48,z),.48,"#7899a8",18);
   for(const x of [2.0,6.1])cuboid(V(x,.7,z),V(.21,1.05,.89),"#5d7280");
  }
  pipe([V(1.5,2.05,2.45),V(1.25,2.05,1.5),V(1.25,1.8,-.2)],.11,"#367ba7");
  pipe([V(7.1,1.5,1.4),V(8.1,1.5,1.4),V(8.1,2.9,.9),V(9.3,2.9,.9)],.16,"#52b9b2");
  pipe([V(7.1,.65,2.95),V(8.2,.65,2.95),V(8.2,.42,5.2),V(11,.42,5.2)],.14,"#ba8c57");
  // Polished steel tank
  tube(V(10.25,.35,.25),V(10.25,5.2,.25),1.6,"#a6c5c6",30);
  tube(V(10.25,5.1,.25),V(10.25,5.35,.25),1.5,"#5a9099",30);
  for(const y of [1.25,2.6,4.2])tube(V(11.78,y,.25),V(11.88,y,.25),.085,"#647e88",12);
  pipe([V(10.3,5.3,.25),V(10.3,5.65,.25),V(11.3,5.65,.25)],.08,"#d0d5ce");
  // solar PV canopy in back
  for(let x=-5;x<=3;x+=2.2)for(let z=-5.8;z<=-3.7;z+=2.2)solarPanel(V(x,2.25,z));
  cuboid(V(-2.6,.35,-1.4),V(1.7,.95,1.2),"#4d829a");
  cuboid(V(-2.6,.92,-1.4),V(1.2,.12,.72),"#f3c965");
  // Standpipes, ladders, safety fencing and service lighting
  for(let x=-7.5;x<=8.5;x+=4){tube(V(x,.1,5.65),V(x,1.3,5.65),.045,"#e6cb84",7);}
  for(let x=8.8;x<=11.2;x+=.48){tube(V(x,.3,1.8),V(x,.3,2.4),.015,"#edf2ea",6);}
  for(let x of [-8,-.5,7]){tube(V(x,.1,-.8),V(x,4.8,-.8),.065,"#738d93",8);
   cuboid(V(x,4.86,-.8),V(.35,.22,.35),"#fff0ae");}
 }
 build();
 function camera(){
  const eye=V(target[0]+zoom*Math.cos(pitch)*Math.sin(yaw),
              target[1]+zoom*Math.sin(pitch),
              target[2]+zoom*Math.cos(pitch)*Math.cos(yaw));
  const forward=norm(sub(target,eye)),right=norm(cross(forward,V(0,1,0))),up=norm(cross(right,forward));
  return {eye,forward,right,up};
 }
 function project(p,cam){
  const diff=sub(p,cam.eye),depth=dot(diff,cam.forward);
  if(depth<.6)return null;
  const f=height*1.33/depth;
  return {x:width/2+dot(diff,cam.right)*f,y:height*.54-dot(diff,cam.up)*f,d:depth};
 }
 function paint(now=0){
  if(!alive)return;
  const rect=canvas.getBoundingClientRect();
  if(rect.width<2||rect.height<2){raf=requestAnimationFrame(paint);return;}
  const pixelratio=clamp(window.devicePixelRatio||1,1,2);
  const w=rect.width,h=rect.height;
  if(Math.abs(w-width)>1||Math.abs(h-height)>1||dpr!==pixelratio){
   width=w;height=h;dpr=pixelratio;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  }
  if(now-lastFrame<32){raf=requestAnimationFrame(paint);return;}
  lastFrame=now;if(auto)yaw+=.003;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const sky=ctx.createLinearGradient(0,0,0,height);
  sky.addColorStop(0,"#173f5b");sky.addColorStop(.50,"#739eaf");sky.addColorStop(.63,"#d4d1bc");sky.addColorStop(1,"#243f47");
  ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  const cam=camera();
  const visible=[];
  // Ground and coastal plateau; 3D world geometry.
  const tris=[
   {pts:[V(-18,-.55,-16),V(18,-.55,-16),V(18,-.55,15)],color:"#385e60",normal:V(0,1,0),rough:1},
   {pts:[V(-18,-.55,-16),V(18,-.55,15),V(-18,-.55,15)],color:"#385e60",normal:V(0,1,0),rough:1},
   {pts:[V(-22,-.3,5.8),V(-8.8,-.3,5.8),V(-8.8,-.3,24)],color:"#247b97",normal:V(0,1,0),rough:.4},
   {pts:[V(-22,-.3,5.8),V(-8.8,-.3,24),V(-22,-.3,24)],color:"#247b97",normal:V(0,1,0),rough:.4},
   ...M
  ];
  for(const poly of tris){
   const projected=poly.pts.map(p=>project(p,cam));
   if(projected.some(p=>!p))continue;
   const depth=projected.reduce((a,p)=>a+p.d,0)/3;
   visible.push({projected,depth,poly});
  }
  visible.sort((a,b)=>b.depth-a.depth);
  for(const v of visible){
   const {projected,poly,depth}=v;
   let b=Math.max(.32,.61+Math.max(0,dot(poly.normal,light))*.42);
   b*=clamp(1.12-depth/200,.70,1.10);
   ctx.beginPath();ctx.moveTo(projected[0].x,projected[0].y);
   ctx.lineTo(projected[1].x,projected[1].y);
   ctx.lineTo(projected[2].x,projected[2].y);ctx.closePath();
   ctx.fillStyle=rgb(poly.color,b);ctx.fill();
  }
  // Coastline reflective streaks, physically illustrative rather than ocean dynamics.
  const t=now*.00035;
  for(let i=0;i<19;i++){
   const x=-17+(i*1.7)%12,z=8+i*.7,xx=x+Math.sin(t+i)*.15;
   const p1=project(V(xx,-.26,z),cam),p2=project(V(xx+1.3,-.26,z),cam);
   if(!p1||!p2)continue;
   ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);
   ctx.strokeStyle="rgba(190,245,249,.18)";ctx.lineWidth=1.5;ctx.stroke();
  }
  // Information overlays pinned to 3D locations.
  const mobile=width<650;
  for(const item of labels){
   const pt=project(item.p,cam);if(!pt||pt.x<-140||pt.x>width+140||pt.y<-100||pt.y>height+60)continue;
   const active=item.name===selected;
   const fontSize=mobile?10:12;
   ctx.font=(active?"700 ":"600 ")+fontSize+"px system-ui";
   const textWidth=ctx.measureText(item.name).width,boxW=textWidth+17;
   const bx=clamp(pt.x-boxW/2,4,width-boxW-4),by=pt.y-23;
   ctx.fillStyle=active?"rgba(16,61,78,.96)":"rgba(9,31,45,.82)";
   ctx.fillRect(bx,by,boxW,21);
   ctx.strokeStyle=active?"#f4d98b":"rgba(124,206,223,.48)";
   ctx.strokeRect(bx+.5,by+.5,boxW-1,20);
   ctx.fillStyle=active?"#fff0b5":"#e6f5fa";ctx.fillText(item.name,bx+8,by+14);
   ctx.beginPath();ctx.arc(pt.x,pt.y,3,0,2*Math.PI);ctx.fillStyle=item.color;ctx.fill();
  }
  ctx.fillStyle="rgba(5,17,29,.82)";ctx.fillRect(12,height-40,Math.min(width-24,423),26);
  ctx.font="600 11px system-ui";ctx.fillStyle="#d9e8f1";
  ctx.fillText("ESCENA 3D CONCEPTUAL · geometría procedural · no ingeniería de detalle",20,height-22);
  raf=requestAnimationFrame(paint);
 }
 function choose(screenX,screenY){
  const cam=camera(), candidates=labels.map(item=>{
   const pt=project(item.p,cam);return {...item,d:pt?Math.hypot(screenX-pt.x,screenY-(pt.y-12)):Infinity};
  });
  candidates.sort((a,b)=>a.d-b.d);
  if(candidates[0]?.d<80){selected=candidates[0].name;describe();}
 }
 function describe(){
  const r=getResult();
  const indicators=r&&selected==="Ósmosis inversa"?" Qp = "+r.permeate+" m³/h; Qb = "+r.brine+" m³/h.":
     r&&selected==="Tanque"?" Nivel virtual = "+r.tankLevelNext+" %.": 
     r&&selected==="Fotovoltaica"?" P útil = "+r.usefulPower+" kW.":"";
  write(selected+": "+nodeInfo[selected]+indicators);
 }
 function down(e){dragging=true;pointerX=e.clientX;pointerY=e.clientY;canvas.setPointerCapture(e.pointerId);}
 function move(e){if(!dragging)return;const dx=e.clientX-pointerX,dy=e.clientY-pointerY;pointerX=e.clientX;pointerY=e.clientY;
  yaw-=dx*.007;pitch=clamp(pitch+dy*.006,.13,1.23);}
 function up(e){if(!dragging)return;dragging=false;if(Math.abs(e.clientX-pointerX)<5&&Math.abs(e.clientY-pointerY)<5){const r=canvas.getBoundingClientRect();choose(e.clientX-r.left,e.clientY-r.top);}}
 function wheel(e){e.preventDefault();zoom=clamp(zoom+Math.sign(e.deltaY)*2,19,65);}
 canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);
 canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",()=>{dragging=false;});
 canvas.addEventListener("wheel",wheel,{passive:false});
 canvas.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){yaw-=.15;e.preventDefault();}if(e.key==="ArrowRight"){yaw+=.15;e.preventDefault();}
 if(e.key==="ArrowUp"){pitch=clamp(pitch+.1,.13,1.23);e.preventDefault();}
 if(e.key==="ArrowDown"){pitch=clamp(pitch-.1,.13,1.23);e.preventDefault();}});
 describe();raf=requestAnimationFrame(paint);
 return {reset(){yaw=-.62;pitch=.44;zoom=33;target=V(0,1,0);auto=false;}, 
 zoomIn(){zoom=clamp(zoom-3,19,65);},zoomOut(){zoom=clamp(zoom+3,19,65);},
 toggleRotate(){auto=!auto;return auto;},
 focus(name){if(nodeInfo[name]){selected=name;describe();}},
 dispose(){alive=false;cancelAnimationFrame(raf);canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerup",up);canvas.removeEventListener("wheel",wheel);}};
}
