/* AquaSeven V3 · capa didáctica y visual. Ningún mensaje representa telemetría física. */
const ASSETS="./assets/";
const PANORAMAS=["panorama-01.webp","panorama-02.webp","panorama-03.webp","panorama-04.webp","panorama-05.webp","panorama-06.webp","panorama-07.webp"];
const POSITION={
 intake:[11,73],pump:[23,43],filter:[36,42],ro:[51,40],tank:[72,37],solar:[88,23],brine:[76,76],controller:[50,16],gateway:[63,16],buffer:[79,59],analytics:[51,14],alarms:[59,60],storage:[82,61]
};
const DESCRIPTIONS={
 intake:["Captación marina","Es la entrada de agua de mar al sistema, como la boca de una manguera que recoge agua.","Permite alimentar la planta. Una rejilla conceptual evita el paso de objetos grandes.","Si no entra suficiente agua, el resto de la planta no puede producir. En un proyecto real, ubicarla exige estudiar corrientes y ecosistemas."],
 pump:["Bombeo","Es el equipo que impulsa el agua a través de tuberías y filtros.","Aporta el movimiento y la presión para que el agua recorra el proceso.","Si una bomba falla, puede detenerse la producción. Aquí la bomba es simulada y ninguna orden activa motores reales."],
 filter:["Filtros de pretratamiento","Son barreras que retienen partículas antes de llegar a las membranas.","Ayudan a que el agua llegue mejor preparada a la etapa de ósmosis.","Si el filtro se obstruye, aumenta la pérdida de presión y puede afectar la operación de las membranas."],
 ro:["Ósmosis inversa","Es una técnica que usa presión y membranas para separar gran parte de las sales del agua.","Produce dos corrientes: permeado con menor salinidad y rechazo con las sales concentradas.","Es el corazón del proceso de desalinización. El permeado virtual no equivale a agua potable certificada."],
 tank:["Tanque de almacenamiento","Es un depósito que guarda el agua producida y aceptada por el criterio virtual.","Equilibra producción y demanda durante el escenario.","Un tanque demasiado bajo limita el suministro; demasiado lleno implica restricciones de almacenamiento. Sus niveles se calculan, no se miden físicamente."],
 solar:["Paneles solares","Convierten parte de la energía del sol en electricidad.","Ayudan a alimentar las cargas de la planta con generación renovable.","Cuando baja la irradiancia también disminuye la potencia disponible. Las eficiencias usadas son supuestos del modelo."],
 brine:["Corriente de salmuera","Es el agua de rechazo que concentra las sales separadas por las membranas.","Permite cerrar los balances de agua y sal del proceso.","Su manejo requiere estudios de dispersión y de protección de ecosistemas marinos. La escena no valida una descarga real."],
 controller:["Controlador virtual","Es el conjunto de reglas que decide qué estado mostrar ante una condición.","Compara los resultados con umbrales y determina acciones de simulación.","Ayuda a comprender alarmas y fallas, pero no reemplaza un PLC de seguridad ni envía órdenes físicas."],
 gateway:["Gateway IoT simulado","Es una pasarela lógica que, en un sistema real, recibiría datos de varios sensores.","Organiza mensajes y los dirige hacia aplicaciones de control y visualización.","En zonas con internet irregular, una pasarela puede facilitar el almacenamiento temporal. Aquí solo se representa ese comportamiento."],
 buffer:["Cola local de mensajes","Es una lista temporal donde se guardan mensajes cuando la comunicación virtual no está disponible.","Representa el patrón 'guardar ahora y reenviar después'.","Evita confundir una interrupción de red con pérdida inevitable de información. La sincronización es una emulación local."],
 analytics:["Panel de analítica","Es una pantalla que resume números y gráficas del proceso.","Ayuda a interpretar caudales, energía y niveles con rapidez.","Facilita entender tendencias, pero solo representa ejecuciones simuladas."],
 alarms:["Alarmas","Son avisos cuando una variable supera un límite o se presenta una condición de falla.","Dirigen la atención del operador hacia posibles anomalías.","Permiten ensayar una respuesta ante problemas. No son un sistema certificado de protección industrial."],
 storage:["Historial local","Es el conjunto de ejecuciones guardadas en este navegador.","Permite consultar resultados anteriores y exportarlos.","Aporta trazabilidad. Cambiar de navegador o borrar su almacenamiento puede eliminar los registros."]
};
const SENSOR_EXPLAIN={
 "SOL-01":["Irradiancia","Cuánta radiación solar llega a una superficie.","Sirve para estimar cuánta potencia podrían aportar los paneles.","Menos radiación suele significar menos potencia solar."],
 "POT-01":["Potencia solar","Cuánta potencia útil calcula el modelo fotovoltaico.","Sirve para compararla con la demanda energética.","Ayuda a distinguir operación normal y limitaciones por energía."],
 "CAU-01":["Caudal de entrada","Cantidad de agua que entra por unidad de tiempo.","Sirve para conocer la alimentación del proceso.","Sin alimentación suficiente, no puede haber permeado."],
 "CAU-02":["Caudal de permeado","Cantidad de agua de menor salinidad que sale de las membranas.","Permite estimar producción virtual.","No indica por sí solo que el agua sea apta para consumo."],
 "CAU-03":["Caudal de rechazo","Cantidad de agua que sale con las sales concentradas.","Permite calcular el balance de agua.","Ayuda a evaluar el destino de la salmuera."],
 "SAL-01":["Salinidad del permeado","Cantidad calculada de sales en la corriente tratada.","Se compara con un umbral de calidad virtual.","Una salinidad baja no certifica potabilidad."],
 "SAL-02":["Salinidad del rechazo","Concentración calculada de sales en la salmuera.","Permite cerrar el balance salino.","Es relevante para evaluar riesgos ambientales en una planta real."],
 "PRE-01":["Presión de membranas","Presión aplicada al proceso de separación.","Ayuda a estudiar el funcionamiento de las membranas.","Una presión inapropiada puede afectar equipos y desempeño."],
 "TEM-01":["Temperatura","Qué tan caliente o fría está el agua de entrada.","Es una condición importante del proceso.","En instalaciones reales puede modificar el flujo y rendimiento."],
 "NIV-01":["Nivel del tanque","Qué porcentaje del volumen del tanque está ocupado.","Sirve para anticipar falta o exceso de almacenamiento.","Se relaciona con la continuidad del suministro."],
 "FILT-01":["Presión diferencial","Diferencia de presión a través de los filtros.","Sirve como indicio de obstrucción.","Si crece demasiado podría indicar mantenimiento."],
 "COM-01":["Latencia de comunicación","Tiempo que tardaría un mensaje en llegar, según la simulación.","Sirve para estudiar comunicaciones con retraso.","No mide una red real; el indicador permite ensayar escenarios de conectividad."]
};
const TOPICS={
 state:["Estado operativo","Es la situación resumida en la que se encuentra el proceso virtual.","Sirve para saber si el modelo opera normalmente o detecta una limitación.","Un estado de alarma invita a revisar sus causas antes de interpretar los demás indicadores."],
 power:["Energía solar útil","Es la potencia eléctrica disponible a partir del sol según los supuestos.","Se compara con lo que necesita el proceso.","Si es insuficiente, el simulador puede reducir la carga."],
 permeate:["Permeado","Es el agua que atraviesa las membranas de ósmosis inversa.","Es la corriente tratada que el modelo calcula.","No debe confundirse con agua potable certificada."],
 tank:["Nivel del tanque","Es el porcentaje calculado de agua almacenada.","Permite observar la relación entre producción y demanda.","Ayuda a evitar situaciones virtuales de tanque vacío o lleno."],
 scenario:["Escenarios","Son condiciones de entrada que puedes modificar para probar el sistema.","Permiten estudiar qué pasa si cambia el sol, la salinidad o falla una bomba.","Aprender mediante escenarios evita atribuir resultados sintéticos a una planta real."],
 communication:["Paquetes de datos","Un paquete es un mensaje pequeño con información, por ejemplo la lectura de un sensor.","Los paquetes recorren un camino virtual desde sensores hacia gateway y paneles.","Los paquetes amarillos indican retraso o interrupción del enlace en esta demostración, no tráfico real."]
};
const SVG_NS="http://www.w3.org/2000/svg";
const create=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
const $=id=>document.getElementById(id);
let app=null,selectedImage=-1,cycle=null,packetTimer=null,packetEvents=[],packetNum=0,packetPaused=false,packetSpeed=1;
let iotMode="logic",plantMode="3d",lastFocus=null,hotspotMode=false;
const safeNumber=v=>Number.isFinite(Number(v))?Number(v).toLocaleString("es-CO",{maximumFractionDigits:3}):String(v??"—");
function fallbackHero(i){return ["linear-gradient(115deg,#006b9a,#27c6c1 48%,#83e4d9)","linear-gradient(115deg,#00577d,#3bc5b0 48%,#a4e9d0)","linear-gradient(115deg,#13598c,#31b9d9 48%,#69e1d0)","linear-gradient(115deg,#0c7388,#78e2d2 48%,#3a95b0)","linear-gradient(115deg,#0d597f,#51bdc7 48%,#aedfb4)","linear-gradient(115deg,#135f83,#2ab7ae 48%,#58c7dc)","linear-gradient(115deg,#134f76,#32a1be 48%,#75e6d9)"][i]}
function changeHero(){
 const hero=document.querySelector(".hero-water");if(!hero)return;
 selectedImage=(selectedImage+1)%PANORAMAS.length;
 hero.style.backgroundImage='linear-gradient(90deg,rgba(8,77,96,.15),rgba(7,122,142,.05)),url("'+ASSETS+PANORAMAS[selectedImage]+'")';
 hero.style.backgroundColor=["#58b7c3","#41a4b2","#68bacc","#60cbc1","#418fab","#57babe","#358ba2"][selectedImage];
 hero.dataset.slide=String(selectedImage+1);
 $("heroPosition").textContent=(selectedImage+1)+" / "+PANORAMAS.length;
}
function navSlide(){
 if(!document.querySelector("#view-home.active"))return;
 changeHero();
}
function explain(kind,id){
 const item=kind==="sensor"?SENSOR_EXPLAIN[id]:kind==="topic"?TOPICS[id]:DESCRIPTIONS[id];
 if(!item)return;
 lastFocus=document.activeElement;
 $("eduTitle").textContent=item[0];
 $("eduWhat").textContent=item[1];
 $("eduUse").textContent=item[2];
 $("eduWhy").textContent=item[3];
 const current=kind==="sensor"?(app.readSensor?.(id)||"Lectura virtual consultable en Sensores"):
 kind==="component"?(app.readComponent?.(id)||"Consulte los indicadores del componente seleccionado"):
 kind==="topic"?(app.readTopic?.(id)||"Consulte el panel que contiene este indicador"):"";
 $("eduLive").textContent=current;
 $("eduPanel").hidden=false;$("eduPanel").setAttribute("aria-hidden","false");
 $("eduClose").focus();
}
function closeEdu(){
 $("eduPanel").hidden=true;$("eduPanel").setAttribute("aria-hidden","true");
 lastFocus?.focus?.();
}
function divHTML(x){const d=document.createElement("div");d.innerHTML=x.trim();return d.firstElementChild}
function createPanel(){
 document.body.append(divHTML('<aside id="eduPanel" class="edu-panel" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="eduTitle" hidden><button id="eduClose" class="edu-close" aria-label="Cerrar explicación">✕</button><div class="edu-eyebrow">EXPLICACIÓN SENCILLA</div><h2 id="eduTitle"></h2><section><h3>¿Qué es?</h3><p id="eduWhat"></p></section><section><h3>¿Para qué sirve?</h3><p id="eduUse"></p></section><section><h3>¿Por qué es importante?</h3><p id="eduWhy"></p></section><section class="edu-live"><h3>En esta simulación</h3><p id="eduLive"></p></section><p class="edu-caveat">Son datos y dispositivos virtuales; no se está leyendo una planta real.</p></aside>'));
 $("eduClose").addEventListener("click",closeEdu);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("eduPanel").hidden)closeEdu()});
}
function addExplainable(){
 const types=[["kState","state"],["kPower","power"],["kPermeate","permeate"],["kTank","tank"],["scenario","scenario"]];
 for(const [id,t] of types){
  const el=$(id)?.closest(".metric")||$(id)?.closest(".surface");
  if(!el||el.dataset.explain)return;
  const btn=create("button","learn-trigger","¿Qué significa?");
  btn.type="button";btn.dataset.explain=t;
  btn.setAttribute("aria-label","Explicación sencilla de "+TOPICS[t][0]);
  el.append(btn);el.dataset.explain=t;
 }
 const help=create("button","hero-learn","¿Qué es AquaSeven?");
 help.type="button";help.dataset.explain="scenario";
 document.querySelector(".hero-copy")?.append(help);
}
const HOTSPOTS=[
 ["intake","Captación",9,74],["pump","Bombeo",22,42],["filter","Filtros",35,41],["ro","Ósmosis",52,41],["tank","Tanque",72,40],["solar","Solar",88,26],["brine","Salmuera",75,74],["controller","Control",49,15],["gateway","Gateway IoT",62,16]
];
function mapHotspots(container,compact=false){
 container.replaceChildren();
 for(const [id,name,x,y] of HOTSPOTS){
  const b=create("button","map-hotspot"+(compact?" tiny":""));
  b.style.left=x+"%";b.style.top=y+"%";
  b.type="button";b.dataset.component=id;b.dataset.packetNode=id;b.innerHTML='<span class="map-pin" aria-hidden="true">●</span><span class="map-title">'+name+'</span>';
  b.setAttribute("aria-label","Ver qué es "+name);
  container.append(b);
 }
}
function mountPlantModes(){
 const controls=document.querySelector(".scene-mode");if(!controls)return;
 const old=$("modePhoto");old.textContent="Vista general";
 const aerial=create("button","mode-option","Vista ojo de águila");aerial.id="modeAerial";aerial.type="button";aerial.setAttribute("aria-pressed","false");controls.append(aerial);
 const photo=$("photoReference"),photoImg=photo?.querySelector("img");
 if(photoImg){photoImg.src=ASSETS+"planta-general.webp";photoImg.alt="Recreación hiperrealista ficticia de la planta desalinizadora, vista exterior";photoImg.loading="lazy";}
 photo.querySelector(".photo-credit").innerHTML="<strong>RECREACIÓN FICTICIA · VISTA GENERAL</strong><span>Imagen digital generada, no fotografía de una instalación real ni proyecto de ingeniería certificado.</span>";
 const eagle=divHTML('<div id="eagleView" class="photo-reference aerial-map" hidden><img src="./assets/planta-aerea.webp" alt="Vista aérea ficticia de la misma disposición conceptual de la planta" loading="lazy"><div class="map-hotspots" id="eagleHotspots"></div><div class="aerial-note">Vista aérea ilustrativa · seleccione un punto para conocerlo</div></div>');
 photo.after(eagle);mapHotspots($("eagleHotspots"));
 function show(mode){
  plantMode=mode;
  photo.hidden=mode!=="general";eagle.hidden=mode!=="aerial";
  $("plant3dMount").style.visibility=mode==="3d"?"visible":"hidden";
  document.querySelector(".plant-scene").classList.toggle("photo-active",mode!=="3d");
  for(const [id,m] of [["mode3d","3d"],["modePhoto","general"],["modeAerial","aerial"]]){
   $(id).classList.toggle("active",m===mode);$(id).setAttribute("aria-pressed",String(m===mode));
  }
 }
 for(const [id,mode] of [["mode3d","3d"],["modePhoto","general"],["modeAerial","aerial"]]){
  $(id).addEventListener("click",()=>show(mode));
 }
 show("3d");
}
function simulatePackets(){
 const nodes=["intake","pump","filter","ro","tank","solar","brine"];
 const source=nodes[packetNum++%nodes.length];
 const connected=app.isConnected?.()!==false;
 const delay=Number(app.delay?.()??0);
 const percent=Number(app.completeness?.()??100);
 const blocked=!connected||delay>10000||percent<50;
 const event={seq:packetNum,source,status:blocked?"RETENIDO":"ENTREGADO",detail:blocked?"Cola virtual por enlace no disponible":"Sensor → gateway → panel",time:new Date().toLocaleTimeString("es-CO")};
 packetEvents.unshift(event);packetEvents=packetEvents.slice(0,7);
 const lines=$("packetLog");
 lines.innerHTML=packetEvents.map(x=>'<div class="packet-event"><span class="'+(x.status==="RETENIDO"?"packet-drop":"packet-ok")+'">'+x.status+'</span> '+x.source.toUpperCase()+' → Gateway · #'+x.seq+'</div>').join("");
 $("packetCounter").textContent=packetNum+" paquetes virtuales";
 const layer=iotMode==="logic"?$("logicPacketOverlay"):$("packetOverlay");
 const scope=iotMode==="logic"?document.querySelector(".architecture-main"):iotMode==="three"?$("iotNetworkRoot"):$("iotPhotoHotspots");
 const origin=scope?.querySelector(iotMode==="logic"?'[data-component="'+source+'"]':'[data-packet-node="'+source+'"]');
 const dest=scope?.querySelector(iotMode==="logic"?'[data-component="gateway"]':'[data-packet-node="gateway"]');
 if(origin&&dest&&layer){
  const base=layer.getBoundingClientRect(),a=origin.getBoundingClientRect(),b=dest.getBoundingClientRect();
  const ball=create("div","packet-ball"+(blocked?" blocked":""));
  ball.style.left=(a.left+a.width/2-base.left)+"px";
  ball.style.top=(a.top+a.height/2-base.top)+"px";
  layer.append(ball);
  ball.animate([{transform:"translate(0,0)",opacity:1},{transform:"translate("+((b.left+b.width/2)-(a.left+a.width/2))+"px,"+((b.top+b.height/2)-(a.top+a.height/2))+"px)",opacity:blocked?.35:1}],{duration:blocked?500:950/packetSpeed,easing:"ease-in-out"}).onfinish=()=>ball.remove();
 }
}
function backgroundFor(mode){
 const src=mode==="map"?"iot-mapa.webp":mode==="real"?"iot-realista.webp":null;
 const host=$("iotVisual");
 host.className="iot-visual mode-"+mode;
 host.style.backgroundImage=src?'linear-gradient(rgba(5,40,55,.08),rgba(3,51,69,.12)),url("'+ASSETS+src+'")':"none";
}
function createNetworkSVG(){
 const nodes=[["intake",9,28],["pump",27,18],["filter",45,17],["ro",62,18],["tank",79,21],["solar",91,28],["brine",83,43],["controller",25,76],["gateway",49,64],["storage",75,76],["alarms",49,89],["analytics",67,89]];
 const canvas=divHTML('<div class="network-canvas"><svg class="packet-network" viewBox="0 0 1000 600" preserveAspectRatio="none" role="img" aria-label="Enlaces virtuales por paquetes entre sensores, gateway y aplicaciones"></svg><div class="packet-nodes"></div></div>');
 const svg=canvas.querySelector("svg");
 const G=[49,64],positions=Object.fromEntries(nodes.map(([id,x,y])=>[id,[x,y]]));
 let paths="";
 for(const [id,x,y] of nodes){
  if(id==="gateway")continue;
  const end=G;
  const x1=x*10,y1=y*6,x2=end[0]*10,y2=end[1]*6;
  const mid=(y1+y2)/2;
  paths+='<path class="network-path" d="M'+x1+' '+y1+' Q'+x1+' '+mid+' '+x2+' '+y2+'"/>';
 }
 svg.innerHTML=paths;
 const nodewrap=canvas.querySelector(".packet-nodes");
 for(const [id,x,y] of nodes){
  const b=create("button","network-node",id==="gateway"?"GATEWAY":(app.labels?.[id]||id).toUpperCase());
  b.style.left=x+"%";b.style.top=y+"%";b.dataset.component=id;b.dataset.packetNode=id;b.type="button";nodewrap.append(b);
 }
 return canvas;
}
function mountIotViews(){
 const top=document.querySelector("#view-iot .page-title");if(!top)return;
 const chooser=divHTML('<div class="iot-mode-controls"><div class="iot-mode-options" role="group" aria-label="Cambiar vista de arquitectura IoT"><button type="button" data-iot-mode="logic" aria-pressed="true">Diagrama por capas</button><button type="button" data-iot-mode="map" aria-pressed="false">Mapa de red</button><button type="button" data-iot-mode="three" aria-pressed="false">Vista 3D</button><button type="button" data-iot-mode="real" aria-pressed="false">Vista hiperrealista</button></div><p class="iot-disclaimer">Los paquetes iluminados representan mensajes ficticios. No existe tráfico de sensores o red reales.</p></div>');
 top.after(chooser);
 const section=document.querySelector("#view-iot .architecture");
 const visual=divHTML('<section id="iotVisual" class="iot-visual" hidden><div id="iotNetworkRoot"></div><div id="iotPhotoHotspots" class="map-hotspots"></div><div id="packetOverlay" aria-hidden="true"></div><div class="iot-visual-label">Simulación visual de comunicación IoT · no red real</div></section>');
 section.before(visual);
 const net=createNetworkSVG();$("iotNetworkRoot").append(net);
 mapHotspots($("iotPhotoHotspots"),true);
 const logicOverlay=create("div","logic-packet-overlay");logicOverlay.id="logicPacketOverlay";document.querySelector(".architecture-main").append(logicOverlay);
 const controls=divHTML('<section class="surface packet-console"><div class="packet-top"><div><strong>Simulador de paquetes</strong><p>Observa cómo viajan mensajes pequeños desde los sensores hacia la pasarela.</p></div><div class="packet-buttons"><button type="button" id="packetPause">Pausar</button><select id="packetSpeed" aria-label="Velocidad de paquetes"><option value="0.5">Lento</option><option value="1" selected>Normal</option><option value="2">Rápido</option></select></div></div><div class="packet-stats"><span id="packetCounter">0 paquetes virtuales</span><span>Camino: sensor → gateway → control</span></div><div id="packetLog" aria-live="polite" class="packet-log"></div></section>');
 visual.after(controls);
 const modes=chooser.querySelectorAll("[data-iot-mode]");
 function setMode(mode){
  iotMode=mode;section.hidden=mode!=="logic";visual.hidden=mode==="logic";
  modes.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.iotMode===mode)));
  $("iotPhotoHotspots").hidden=mode==="three"||mode==="logic";
  $("iotNetworkRoot").hidden=mode!=="three";
  backgroundFor(mode);
 }
 for(const button of modes)button.addEventListener("click",()=>setMode(button.dataset.iotMode));
 $("packetPause").addEventListener("click",()=>{packetPaused=!packetPaused;$("packetPause").textContent=packetPaused?"Reanudar":"Pausar"});
 $("packetSpeed").addEventListener("change",()=>packetSpeed=Number($("packetSpeed").value));
 setMode("logic");
 packetTimer=window.setInterval(()=>{if(!document.hidden&&!packetPaused&&document.querySelector("#view-iot.active"))simulatePackets()},1100);
}
function syncComponentSelect(event){
 const node=event.target.closest("[data-component]");
 if(node&&DESCRIPTIONS[node.dataset.component]){
  explain("component",node.dataset.component);
 }
 const sensor=event.target.closest("[data-sensor]");
 if(sensor&&SENSOR_EXPLAIN[sensor.dataset.sensor])explain("sensor",sensor.dataset.sensor);
 const topic=event.target.closest("[data-explain]");
 if(topic&&TOPICS[topic.dataset.explain])explain("topic",topic.dataset.explain);
}
export function installExperience(api){
 app=api;
 createPanel();addExplainable();mountPlantModes();mountIotViews();
 const hero=document.querySelector(".hero");
 if(hero){const indicator=create("span","hero-position","1 / 7");indicator.id="heroPosition";hero.append(indicator)}
 changeHero();
 cycle=window.setInterval(navSlide,15000);
 document.addEventListener("click",syncComponentSelect);
 return {
  onView(view,prior){
   if(view==="home"&&prior!=="home")changeHero();
  },
  inspectComponent(id){if(DESCRIPTIONS[id])explain("component",id)},
  inspectSensor(id){if(SENSOR_EXPLAIN[id])explain("sensor",id)},
  dispose(){window.clearInterval(cycle);window.clearInterval(packetTimer);document.removeEventListener("click",syncComponentSelect)}
 };
}
