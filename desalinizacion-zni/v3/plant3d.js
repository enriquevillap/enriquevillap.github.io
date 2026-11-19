/*
  AquaSeven · Escena WebGL de mayor fidelidad visual.
  Renderizador PBR con materiales, sombras, texturas procedurales, costa caribeña,
  equipos de proceso y selección por raycasting. Ilustración conceptual, no CAD/BIM.
*/
export async function mountPlant3D(mount,onSelect=()=>{}){
 const THREE=await import("https://esm.sh/three@0.162.0");
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x99dbe9);scene.fog=new THREE.FogExp2(0xbfe8e9,.011);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
 renderer.setSize(Math.max(mount.clientWidth,400),Math.max(mount.clientHeight,430));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.16;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 mount.innerHTML="";mount.append(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(40,mount.clientWidth/Math.max(mount.clientHeight,430),.1,1200);
 const target=new THREE.Vector3(0,1.7,0);let az=-.75,el=.46,dist=49,autorotate=false,drag=false,moved=false,lastX=0,lastY=0,selected=null,disposed=false;
 const hemi=new THREE.HemisphereLight(0xf2ffff,0x668998,2.0);scene.add(hemi);
 const sunlight=new THREE.DirectionalLight(0xfff7e4,3.2);sunlight.position.set(-29,58,23);sunlight.castShadow=true;sunlight.shadow.mapSize.set(2048,2048);sunlight.shadow.camera.left=-65;sunlight.shadow.camera.right=65;sunlight.shadow.camera.top=65;sunlight.shadow.camera.bottom=-65;sunlight.shadow.normalBias=.045;sunlight.shadow.bias=-.00008;scene.add(sunlight);
 const fill=new THREE.DirectionalLight(0xc0f8ff,1.4);fill.position.set(20,14,-20);scene.add(fill);
 const mat=(c,metal=.0,rough=.55,opt={})=>new THREE.MeshStandardMaterial({color:c,metalness:metal,roughness:rough,...opt});
 const stainless=mat("#b6cdd3",.89,.21),chrome=mat("#dde9e8",.96,.13),bluePipe=mat("#4b9dbb",.48,.24),turquoise=mat("#24b9b7",.45,.26),brine=mat("#c49b65",.38,.35);
 const aluminum=mat("#97adb8",.75,.31),rubber=mat("#263e4b",.17,.84),white=mat("#f4faf6",.12,.32),navy=mat("#24586f",.63,.37),glass=mat("#c1f6ed",.15,.09,{transparent:true,opacity:.6,depthWrite:false}),sand=mat("#efe1bf",0,.98),concrete=mat("#d8ded9",.02,.86),grass=mat("#468d71",0,.99);
 const objects=new Map(),pickables=[],markers=[];
 const group=(id)=>{const g=new THREE.Group();g.userData.component=id;scene.add(g);if(!objects.has(id))objects.set(id,[]);objects.get(id).push(g);return g};
 function addMesh(g,geo,material,pos,rot=null,shadow=true){const m=new THREE.Mesh(geo,material);m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=shadow;m.receiveShadow=true;g.add(m);return m}
 function cube(g,pos,size,material){return addMesh(g,new THREE.BoxGeometry(...size),material,pos)}
 function cyl(g,pos,r1,r2,h,material,segments=32,rotate=null){return addMesh(g,new THREE.CylinderGeometry(r1,r2,h,segments),material,pos,rotate)}
 function ball(g,pos,r,material){return addMesh(g,new THREE.SphereGeometry(r,16,10),material,pos)}
 function pathPipe(g,pts,r,material,segments=12){const p=pts.map(x=>new THREE.Vector3(...x));const curve=new THREE.CatmullRomCurve3(p);const m=addMesh(g,new THREE.TubeGeometry(curve,Math.max(16,p.length*16),r,segments,false),material,[0,0,0]);return m}
 function torus(g,pos,r,t,material,rot){return addMesh(g,new THREE.TorusGeometry(r,t,9,32),material,pos,rot)}
 function label(id,pos){const canvas=document.createElement("canvas");canvas.width=360;canvas.height=82;const c=canvas.getContext("2d");c.fillStyle="rgba(6,41,60,.9)";c.beginPath();c.roundRect(4,4,352,72,17);c.fill();c.strokeStyle="rgba(151,243,239,.7)";c.lineWidth=3;c.stroke();c.fillStyle="#edfffc";c.textAlign="center";c.font="bold 24px system-ui";c.fillText(id,180,51);const tex=new THREE.CanvasTexture(canvas);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,transparent:true}));sp.position.set(...pos);sp.scale.set(4.2,1,1);scene.add(sp);markers.push(sp);return sp}
 function attachPick(g,id){g.traverse(obj=>{if(obj.isMesh){obj.userData.component=id;pickables.push(obj)}})}
 function texture(type){
 const c=document.createElement("canvas");c.width=256;c.height=256;const ctx=c.getContext("2d");
 if(type==="concrete"){ctx.fillStyle="#d9e1dd";ctx.fillRect(0,0,256,256);}
 else if(type==="sand"){ctx.fillStyle="#e9dcaf";ctx.fillRect(0,0,256,256);}
 else if(type==="water"){ctx.fillStyle="#7de6dc";ctx.fillRect(0,0,256,256);}
 for(let i=0;i<2700;i++){const x=(i*1741)%256,y=(i*2939)%256,n=Math.sin(i*39.14)*.5+.5;ctx.fillStyle=type==="concrete"?"rgba(55,86,89,"+(n*.07)+")":type==="sand"?"rgba(196,141,81,"+(n*.15)+")":"rgba(241,255,253,"+(n*.06)+")";ctx.fillRect(x,y,1+n*2,1+n*2);}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(type==="concrete"?9:18,type==="concrete"?6:18);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return t;
 }
 // Wide sky dome with physical-looking gradients, island and sea of seven colors.
 const sky=new THREE.Mesh(new THREE.SphereGeometry(450,48,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{},vertexShader:"varying vec3 vP; void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:"varying vec3 vP;void main(){float t=clamp(normalize(vP).y*0.55+0.5,0.,1.);vec3 horizon=vec3(.76,.92,.94);vec3 zenith=vec3(.19,.60,.84);vec3 col=mix(horizon,zenith,smoothstep(.27,.96,t));gl_FragColor=vec4(col,1.);}"}));scene.add(sky);
 const coast=new THREE.Group();scene.add(coast);
 const seaMesh=new THREE.Mesh(new THREE.PlaneGeometry(550,550,128,128),new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uSun:{value:new THREE.Vector3(-.5,.8,.4)}},vertexShader:"uniform float uTime;varying vec3 vPos;varying float vFoam;void main(){vec3 p=position;float wave=sin(p.x*.24+uTime*.72)*.115+cos(p.y*.36-uTime*.51)*.084+sin(p.x*.69+p.y*.52+uTime*.9)*.023;p.z+=wave;vFoam=wave;vPos=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}",fragmentShader:"uniform float uTime;varying vec3 vPos;varying float vFoam;void main(){float d=sin(vPos.x*.062)+cos(vPos.y*.088);float shelf=smoothstep(-.4,.9,d);vec3 deep=vec3(.022,.35,.53);vec3 mid=vec3(.035,.63,.70);vec3 shallow=vec3(.24,.84,.77);vec3 col=mix(deep,mid,smoothstep(-1.2,.6,d));col=mix(col,shallow,shelf*.47);float sparkle=pow(max(0.,sin(vPos.x*4.2+uTime*.45)*cos(vPos.y*3.8-uTime*.39)),18.)*.13;col+=vec3(sparkle);gl_FragColor=vec4(col,1.);}"}));
 seaMesh.rotation.x=-Math.PI/2;seaMesh.position.y=-.35;scene.add(seaMesh);
 const island=addMesh(coast,new THREE.CylinderGeometry(37,40,1.4,96),sand,[0,-.66,0],null,false);
 const shore=addMesh(coast,new THREE.CylinderGeometry(35,38,.45,96),mat("#e7d1a0",0,1),[0,-.06,0],null,false);
 const ground=addMesh(coast,new THREE.CylinderGeometry(32,34,.28,96),mat("#a9c7a1",0,.95),[0,.11,0],null,false);
 const concreteTexture=texture("concrete"),sandTexture=texture("sand");
 concrete.map=concreteTexture;concrete.needsUpdate=true;sand.map=sandTexture;sand.needsUpdate=true;
 const site=group("site");cube(site,[0,.48,0],[33,.5,22],concrete);cube(site,[0,.8,0],[32,.1,21],mat("#b5c9c7",0,.87));
 for(const z of [-10.2,10.2])cube(site,[0,1.12,z],[33,.65,.22],white);
 for(const x of [-16.2,16.2])cube(site,[x,1.12,0],[.22,.65,20.5],white);
 for(let x=-13;x<=13;x+=4)for(let z of [-8,8]){cyl(site,[x,1.25,z],.065,.065,.75,aluminum,9);}
 function palm(x,z,size=1){const g=group("landscape");const top=4.4*size;const trunk=pathPipe(g,[[x,.4,z],[x+.3,top*.55,z],[x+.4,top,z]],.13*size,mat("#947657",0,.89),10);for(let i=0;i<8;i++){const a=i*Math.PI/4;const pts=[];for(let j=0;j<6;j++){const r=j/5*3*size;pts.push([x+.4+Math.cos(a)*r,top+.4*size-Math.sin(j/5*Math.PI)*1.1*size-j/5*.7*size,z+Math.sin(a)*r])}pathPipe(g,pts,.055*size,mat("#338a61",0,.87),6)}}
 for(const [x,z,s] of [[-23,-13,1.1],[-27,4,.9],[22,-15,1.15],[26,12,.85],[-24,13,.75],[27,-4,1]])palm(x,z,s);
 const intake=group("intake");
 cube(intake,[-12,.95,7],[4,.4,3],mat("#7aafb6",.12,.6));
 cube(intake,[-12,1.46,7],[3.5,.9,2.3],mat("#86bed2",.3,.32));
 for(let i=0;i<7;i++)cyl(intake,[-13.45+i*.47,1.5,8.2],.055,.055,1.1,chrome,8);
 pathPipe(intake,[[-13,.6,6],[-10,.6,6],[-8,1.2,3]],.22,bluePipe);
 label("Captación marina",[-11,4.7,7]);
 const pump=group("pump");cube(pump,[-7,1.12,1.9],[6,.42,4],mat("#819aa4",.4,.54));
 for(let z of [.6,3.1]){cyl(pump,[-8,2.16,z],.74,.74,2.7,navy,28,[0,0,Math.PI/2]);cyl(pump,[-8.5,2.1,z],.86,.86,.15,chrome,32,[0,0,Math.PI/2]);cyl(pump,[-7.6,2.1,z],.9,.9,.16,chrome,32,[0,0,Math.PI/2]);cube(pump,[-9.2,1.95,z],[.85,.65,.65],mat("#f4c577",.4,.31));for(let x of [-8.85,-7.05])cube(pump,[x,1.48,z],[.23,.4,1.2],stainless);}
 pathPipe(pump,[[-5.2,2.2,1.7],[-4.35,2.2,1.7],[-3.8,3.2,1.7]],.2,turquoise);
 label("Bombeo",[-7,5.7,1.6]);
 const filter=group("filter");cube(filter,[-2,1.18,3],[5.7,.42,5.3],mat("#8eaaa8",.5,.51));
 for(let x of [-3.75,-2,-.25]){cyl(filter,[x,3.2,3],.66,.66,3.9,white,36);cyl(filter,[x,5.2,3],.63,.63,.16,stainless,36);cyl(filter,[x,1.42,3],.7,.7,.17,chrome,36);for(let z of [2.6,3.4])cube(filter,[x,2.2,z],[1.6,.11,.09],aluminum)}
 pathPipe(filter,[[-3.8,5.2,3],[-2.0,5.4,3],[-.2,5.2,3],[1.6,4,2]],.11,chrome);
 label("Filtración",[-1.8,7,3]);
 const ro=group("ro");cube(ro,[5,1.11,1.5],[8.5,.4,7],mat("#7a949e",.58,.49));
 for(let z of [-.55,1.55,3.65]){for(let y of [2.2,3.8]){cyl(ro,[4.9,y,z],.46,.46,7.1,white,28,[0,0,Math.PI/2]);for(let x of [1.4,8.35])cyl(ro,[x,y,z],.49,.49,.14,chrome,26,[0,0,Math.PI/2]);for(let x of [1.6,8.2])cube(ro,[x,1.7,z],[.15,.6,.93],aluminum);}
 for(let x of [2,8.0])pathPipe(ro,[[x,1.5,z],[x,4.35,z]],.08,bluePipe);}
 pathPipe(ro,[[8.6,3.85,1.6],[9.7,3.85,1.6],[9.7,4.2,-.6],[11,4.2,-.6]],.16,turquoise);
 label("Ósmosis inversa",[5,6.3,1.6]);
 const tank=group("tank");cube(tank,[12,1.2,-2],[6,.4,6],mat("#a5b9bb",.25,.74));
 cyl(tank,[12,4.8,-2],2.2,2.2,6.5,stainless,64);
 cyl(tank,[12,8.1,-2],2.18,2.18,.18,chrome,64);
 cyl(tank,[12,1.45,-2],2.21,2.21,.25,aluminum,64);
 const tankWater=cyl(tank,[12,3.3,-2],1.96,1.96,3.9,glass,48);tankWater.visible=false;
 for(let y=2;y<7;y+=.55){torus(tank,[12,y,-2],2.205,.028,chrome,[Math.PI/2,0,0]);}
 for(let y=2;y<=7;y+=.65){cube(tank,[14.23,y,-2],[.14,.035,.38],aluminum);}
 pathPipe(tank,[[10.5,8.2,-2],[11.5,8.5,-2],[11.5,8.3,-1.5]],.08,bluePipe);
 label("Tanque",[12,10.2,-2]);
 const brineStation=group("brine");cube(brineStation,[10.8,1.1,6],[5.5,.4,2.8],concrete);pathPipe(brineStation,[[8.5,2.1,3.6],[9.7,1.8,5],[12.9,1.55,6],[16,1.45,6]],.22,brine);for(let i=0;i<4;i++)cyl(brineStation,[10+i*.6,1.57,6.3],.15,.15,.24,chrome,12);label("Salmuera",[11,4.2,6.5]);
 const solar=group("solar");cube(solar,[0,1.1,-7.2],[13,.28,7],concrete);
 for(let row=0;row<3;row++)for(let col=0;col<5;col++){const x=-5.2+col*2.6,z=-9.1+row*2.2;
 cube(solar,[x,2.0,z],[.08,2.0,.08],aluminum);
 const frame=cube(solar,[x,3.03,z],[2.35,.07,1.7],aluminum);frame.rotation.x=-.23;
 const pv=cube(solar,[x,3.10,z],[2.22,.045,1.57],mat("#123b65",.62,.16));pv.rotation.x=-.23;
 for(let a=-.8;a<=.8;a+=.4)cube(solar,[x+a,3.14,z],[.015,.012,1.55],chrome);
 for(let a=-.48;a<=.48;a+=.48)cube(solar,[x,3.146,z+a],[2.2,.013,.014],chrome);
 }
 label("Fotovoltaica",[0,6.6,-7]);
 const controller=group("controller");cube(controller,[-1,1.9,-1.3],[1.2,1.7,.9],white);cube(controller,[-.39,2.2,-1.3],[.08,.5,.6],mat("#375e75",.3,.37));label("Control",[-1,4.2,-1.4]);
 const gateway=group("gateway");cube(gateway,[-2.4,2.3,-1.1],[.55,.9,.45],navy);for(let z of [-1.25,-1.05,-.85])ball(gateway,[-2.1,2.2,z],.07,mat("#3cf1c2",.2,.25));label("Gateway",[-3,4.5,-1.8]);
 // Protective railings, instrumentation and reflective steel fittings.
 const details=group("details");
 for(let x=-13;x<13;x+=1.1){cyl(details,[x,1.15,-10],.035,.035,.85,aluminum,7);}
 for(let x of [-10,-2,5,12]){cyl(details,[x,1.9,9.2],.09,.09,1.85,aluminum,12);ball(details,[x,2.92,9.2],.21,white);}
 for(const id of ["intake","pump","filter","ro","tank","solar","brine","controller","gateway"]){for(const g of objects.get(id)||[])attachPick(g,id);}
 const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
 function viewpoint(){const p=target.clone().add(new THREE.Vector3(Math.sin(az)*Math.cos(el)*dist,Math.sin(el)*dist,Math.cos(az)*Math.cos(el)*dist));camera.position.copy(p);camera.lookAt(target);}
 viewpoint();
 function hit(event){const rect=renderer.domElement.getBoundingClientRect();mouse.x=((event.clientX-rect.left)/rect.width)*2-1;mouse.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(mouse,camera);const match=raycaster.intersectObjects(pickables,false)[0];if(match?.object?.userData?.component){const id=match.object.userData.component;selected=id;onSelect(id)}}
 let downX=0,downY=0;
 function pointerDown(e){drag=true;moved=false;lastX=downX=e.clientX;lastY=downY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);}
 function pointerMove(e){if(!drag)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.hypot(e.clientX-downX,e.clientY-downY)>5)moved=true;az-=dx*.0055;el=THREE.MathUtils.clamp(el+dy*.005,.17,1.26);lastX=e.clientX;lastY=e.clientY;}
 function pointerUp(e){if(!drag)return;drag=false;if(!moved)hit(e);}
 function wheel(e){e.preventDefault();dist=THREE.MathUtils.clamp(dist+Math.sign(e.deltaY)*2.4,19,90);}
 renderer.domElement.addEventListener("pointerdown",pointerDown);renderer.domElement.addEventListener("pointermove",pointerMove);
 renderer.domElement.addEventListener("pointerup",pointerUp);renderer.domElement.addEventListener("pointercancel",()=>drag=false);
 renderer.domElement.addEventListener("wheel",wheel,{passive:false});
 let last=0,frame=0,lastRender=0,visibility=true,result=null;
 const observer=new IntersectionObserver(entries=>{visibility=entries.some(x=>x.isIntersecting)},{threshold:.01});observer.observe(mount);
 function animate(time){if(disposed)return;frame=requestAnimationFrame(animate);if(!visibility)return;if(time-lastRender<28)return;lastRender=time;
 seaMesh.material.uniforms.uTime.value=time*.001;
 if(autorotate)az+=.0013;
 if(result){const t=THREE.MathUtils.clamp(result.tankLevelNext/100,.01,1);tankWater.scale.y=t;tankWater.position.y=1.8+3.5*t;}
 viewpoint();renderer.render(scene,camera);
 }
 frame=requestAnimationFrame(animate);
 const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;if(w>0&&h>0){camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}};
 const robs=new ResizeObserver(resize);robs.observe(mount);resize();
 return {
 update(r){result=r},
 select(id){selected=id;const g=objects.get(id)?.[0];if(g&&["intake","pump","filter","ro","tank","solar","brine"].includes(id)){const dest=g.position;}},
 reset(){az=-.75;el=.46;dist=49;autorotate=false},
 zoom(delta){dist=THREE.MathUtils.clamp(dist+delta*3,18,90)},
 rotate(active){autorotate=!!active},
 dispose(){disposed=true;cancelAnimationFrame(frame);robs.disconnect();observer.disconnect();renderer.dispose();mount.innerHTML=""}
 };
}
