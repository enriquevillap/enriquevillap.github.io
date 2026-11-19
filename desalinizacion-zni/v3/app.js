import {MODEL_VERSION,DEFAULTS,THRESHOLDS,SCENARIOS,SENSOR_DEFINITIONS,simulate,runRegressionTests,validateThresholds} from "./model.js";
import {aggregateHistory,reportCsv} from "./reports.js";
import {COMPONENTS,SENSOR_INFO} from "./components.js";
const $=id=>document.getElementById(id);
const qa=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=(n,d=2)=>Number(n??0).toLocaleString("es-CO",{minimumFractionDigits:d,maximumFractionDigits:d});
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number(x)||0));
const KEYS={history:"aquaseven-v3-history",alarms:"aquaseven-v3-alarms",queue:"aquaseven-v3-queue",thresholds:"aquaseven-v3-thresholds"};
const read=k=>{try{const v=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(v)?v:[]}catch{return []}};
const loadThresholds=()=>{try{return validateThresholds(JSON.parse(localStorage.getItem(KEYS.thresholds)||"{}"))}catch{return validateThresholds()}};
const previous=read(KEYS.history);
const state={history:previous,alarms:read(KEYS.alarms),queue:read(KEYS.queue),current:previous.at(-1)?.result||simulate(),thresholds:loadThresholds(),view:"home",component:"ro",sensor:"SOL-01",scene:null,seq:previous.length};
const save=()=>{try{localStorage.setItem(KEYS.history,JSON.stringify(state.history));localStorage.setItem(KEYS.alarms,JSON.stringify(state.alarms));localStorage.setItem(KEYS.queue,JSON.stringify(state.queue))}catch(e){console.warn("Almacenamiento local no disponible",e)}};
const fields=[
["irradiance","Irradiancia","W/m²",0,1400,5],["feed","Caudal alimentación","m³/h",0,3,.01],
["recovery","Recuperación","fracción",0,.9,.01],["feedSalinity","Salinidad alimentación","g/L",0,100,.1],
["rejection","Rechazo salino","fracción",.9,1,.001],["temperature","Temperatura","°C",0,50,.1],
["tmp","Presión TMP","bar",0,100,.5],["sec","SEC de diseño","kWh/m³",.1,30,.1],
["latency","Latencia","ms",0,120000,100],["completeness","Completitud","%",0,100,.1],
["tankLevel","Nivel inicial tanque","%",0,100,1],["tankCapacity","Capacidad tanque","m³",.1,500,.5],
["demand","Demanda","m³/h",0,5,.01],["duration","Duración","h",0,24,.25],
["filterPressureDrop","ΔP filtro","bar",0,10,.1]];
const thresholdFields=[
["cpMax","Salinidad máxima permeado","g/L",.01,10,.01],
["feedSalinityMax","Salinidad máxima alimentación","g/L",.1,100,.1],
["latencyMax","Latencia máxima","ms",1,120000,1],
["completenessMin","Completitud mínima","%",0,100,.1],
["tankMin","Nivel mínimo tanque","%",0,99,1],
["tankMax","Nivel máximo tanque","%",1,100,1],
["tmpMax","Presión TMP máxima","bar",1,100,.5],
["filterDpMax","ΔP máximo filtro","bar",.01,10,.01]];
const measuresMax={irradiance:1400,usefulPower:2.6,feedEffective:3,permeate:2,brine:3,permeateSalinity:3,brineSalinity:120,tmp:100,temperature:50,tankLevelNext:100,filterPressureDrop:10,latency:120000};
function amount(k){if(k==="_queue")return state.queue.filter(x=>x.status!=="Sincronizado virtualmente").length;if(k==="_runs")return state.history.length;if(k==="_alarms")return state.current.alarms.length;if(k==="_pending")return state.alarms.filter(x=>x.status==="Pendiente").length;return state.current[k]}
function display(k,u,d){const v=amount(k);return typeof v==="boolean"?(v?"Disponible":"No disponible"):typeof v==="string"?v:fmt(v,d)+(u?" "+u:"")}
function renderForms(){
$("scenario").innerHTML=Object.entries(SCENARIOS).map(([k,v])=>'<option value="'+esc(k)+'">'+esc(v.label)+'</option>').join("");
$("formControls").innerHTML=fields.map(([id,name,unit,min,max,step])=>'<div class="field"><label for="'+id+'">'+esc(name)+' · '+esc(unit)+'</label><input type="number" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'"></div>').join("");
$("thresholdForm").innerHTML=thresholdFields.map(([id,name,unit,min,max,step])=>'<div class="field"><label for="th-'+id+'">'+esc(name)+' · '+esc(unit)+'</label><input type="number" id="th-'+id+'" min="'+min+'" max="'+max+'" step="'+step+'"></div>').join("");
$("plantSelect").innerHTML=Object.entries(COMPONENTS).filter(([id])=>["intake","pump","filter","ro","tank","solar","brine"].includes(id)).map(([id,c])=>'<option value="'+id+'">'+esc(c.name)+'</option>').join("");
$("archProcess").innerHTML=["intake","pump","filter","ro","tank","solar","brine"].map(id=>{const c=COMPONENTS[id];return '<button class="arch-node" data-component="'+id+'"><span class="node-pict">'+c.icon+'</span><strong>'+esc(c.name)+'</strong><small>'+esc(c.sensors.slice(0,2).join(" · "))+'</small></button>'}).join("");
setForm(DEFAULTS);for(const [id] of thresholdFields)$("th-"+id).value=state.thresholds[id];
}
function setForm(data){for(const [id] of fields)$(id).value=data[id]??DEFAULTS[id];for(const id of ["pump","reservePump","communication"])$(id).checked=data[id]??DEFAULTS[id];$("formError").hidden=true;}
function getForm(){const data={};for(const [id] of fields){const val=$(id).value.trim();if(!val)throw Error("Complete "+id);data[id]=Number(val)}for(const id of ["pump","reservePump","communication"])data[id]=$(id).checked;return data}
function applyScenario(key){const s=SCENARIOS[key];if(!s)return;setForm({...DEFAULTS,...s.values});$("scenario").value=key}
function setView(view){if(!$("view-"+view))return;state.view=view;qa(".view").forEach(el=>el.classList.toggle("active",el.id==="view-"+view));qa(".nav").forEach(el=>el.classList.toggle("active",el.dataset.view===view));$("breadcrumb").textContent=qa(".nav").find(x=>x.dataset.view===view)?.textContent.trim()||view;document.querySelector(".sidebar").classList.remove("open");if(view==="plant")init3D();if(view==="iot")selectComponent(state.component);if(view==="sensors")selectSensor(state.sensor);window.scrollTo({top:0,behavior:"instant"})}
function simulateNow(key=null,chained=false){
try{
const inputs=getForm(),seq=Boolean(chained&&state.history.length),previousTank=seq?state.current.tankLevelNext:null;
const result=simulate(inputs,previousTank,state.thresholds),stamp=new Date().toISOString(),id="AQS3-"+stamp.replace(/[^\d]/g,"").slice(0,14)+"-"+(++state.seq);
state.current=result;
const entry={id,date:stamp,scenario:key||$("scenario").value,mode:seq?"SECUENCIAL":"INDEPENDIENTE",modelVersion:MODEL_VERSION,inputs,result};
state.history.push(entry);if(state.history.length>1000)state.history.shift();
for(const a of result.alarms)state.alarms.unshift({id:id+"-"+a.code,runId:id,date:stamp,...a,status:"Pendiente"});
state.alarms=state.alarms.slice(0,3000);
if(!result.communication||result.latency>state.thresholds.latencyMax||result.completeness<state.thresholds.completenessMin)state.queue.push({id,date:stamp,status:"Pendiente de sincronización simulada",simulation:entry});
state.queue=state.queue.slice(-1000);save();render();$("formError").hidden=true;return result;
}catch(err){$("formError").textContent="No se ejecutó: "+err.message;$("formError").hidden=false;return null}
}
function runSeries(items){let first=true;for(const item of items){if(typeof item==="string")applyScenario(item);else setForm({...DEFAULTS,...item});simulateNow(typeof item==="string"?item:"PERFIL",!first);first=false}setView("history")}
function download(name,body,type){const blob=new Blob([body],{type}),url=URL.createObjectURL(blob),anchor=document.createElement("a");anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function csv(rows){if(!rows.length)return"";const cols=[...new Set(rows.flatMap(Object.keys))],q=v=>'"'+String(v??"").replaceAll('"','""')+'"';return [cols.map(q).join(";"),...rows.map(row=>cols.map(k=>q(row[k])).join(";"))].join("\r\n")}
function historyFlat(){return state.history.map(e=>({id:e.id,date:e.date,scenario:e.scenario,mode:e.mode,version:e.modelVersion,...e.inputs,state:e.result.state,action:e.result.action,permeate:e.result.permeate,accepted:e.result.productAccepted,brine:e.result.brine,usefulPower:e.result.usefulPower,requiredPower:e.result.nominalRequired,tankLevel:e.result.tankLevelNext}))}
function renderChart(id,keys,color="#36c6bd"){const el=$(id);if(!el)return;const values=state.history.slice(-18).map(e=>e.result);if(!values.length)values.push(state.current);const max=Math.max(.01,...values.flatMap(x=>keys.map(k=>Number(x[k])||0)))*1.2,W=640,H=195;const path=k=>values.map((r,i)=>(i?"L":"M")+(36+(values.length===1?240:i*(W-70)/(values.length-1))).toFixed(1)+","+(H-25-(Number(r[k])||0)/max*(H-55)).toFixed(1)).join(" ");const colors=[color,"#edc384","#74a9db"];let lines="";for(let j=0;j<4;j++){const y=H-25-j*(H-55)/3;lines+='<line x1="30" y1="'+y+'" x2="624" y2="'+y+'" stroke="#93c4c7" stroke-opacity=".35" stroke-dasharray="4 5"/>'}keys.forEach((k,i)=>lines+='<path d="'+path(k)+'" stroke="'+colors[i%3]+'" stroke-width="3" fill="none"/>');el.innerHTML=el.tagName.toLowerCase()==="svg"?lines:'<svg viewBox="0 0 640 195" preserveAspectRatio="none">'+lines+'</svg>'}
function spark(id,key){const el=$(id),vals=state.history.slice(-16).map(e=>Number(e.result[key])).filter(Number.isFinite);if(!vals.length)vals.push(Number(amount(key))||0);const min=Math.min(0,...vals),max=Math.max(1,...vals),line=vals.map((v,i)=>(i?"L":"M")+(10+i*280/Math.max(1,vals.length-1)).toFixed(1)+","+(97-(v-min)/(max-min||1)*82).toFixed(1)).join(" ");el.innerHTML='<line x1="10" y1="98" x2="290" y2="98" stroke="#cbe9e9"/><path d="'+line+'" fill="none" stroke="#24adbd" stroke-width="3" stroke-linecap="round"/>'}
function measures(c){return c.measures.map(([label,key,unit,max,d])=>'<div class="measure"><label>'+esc(label)+'</label><strong>'+esc(display(key,unit,d))+'</strong>'+(typeof amount(key)==="number"?'<div class="part-bar"><span style="width:'+clamp(amount(key)/max*100,0,100)+'%"></span></div>':'')+'</div>').join("")}
function selectComponent(id){const c=COMPONENTS[id]||COMPONENTS.ro;state.component=id;qa("[data-component]").forEach(x=>x.classList.toggle("selected",x.dataset.component===id));$("iotIcon").textContent=c.icon;$("iotTitle").textContent=c.name;$("iotDescription").textContent=c.description;$("iotMeasures").innerHTML=measures(c);
const key=c.measures.find(x=>typeof amount(x[1])==="number")?.[1]||"permeate";spark("iotSpark",key);
$("processDetail").textContent=c.name+" · "+c.measures.map(([label,k,u,,d])=>label+": "+display(k,u,d)).join(" · ");
$("plantPartName").textContent=c.name;$("plantPartDesc").textContent=c.description;$("plantPartMetrics").innerHTML=measures(c);
if($("plantSelect").querySelector('option[value="'+id+'"]'))$("plantSelect").value=id;
if(state.scene?.select)state.scene.select(id);
}
function selectSensor(id){const def=SENSOR_DEFINITIONS.find(x=>x[0]===id)||SENSOR_DEFINITIONS[0];state.sensor=def[0];$("sensorGrid").innerHTML=SENSOR_DEFINITIONS.map(([code,name,key,unit])=>{const v=amount(key),max=measuresMax[key]||100;return '<button class="sensor-card '+(code===def[0]?"active":"")+'" data-sensor="'+esc(code)+'"><span class="id">'+esc(code)+'</span><strong>'+esc(name)+'</strong><b>'+fmt(v,2)+'</b><small> '+esc(unit)+'</small><div class="mini-track"><span style="width:'+clamp(v/max*100,0,100)+'%"></span></div></button>'}).join("");
$("sensorTitle").textContent=def[1];$("sensorMeta").innerHTML='<span class="subtle-tag">'+esc(def[0])+'</span><p>'+esc(SENSOR_INFO[def[0]])+'</p>';
$("sensorGauge").innerHTML='<div class="gauge-ring" style="--value:'+clamp(amount(def[2])/(measuresMax[def[2]]||100)*100,0,100)+'"><strong>'+fmt(amount(def[2]),2)+'</strong></div><small>'+esc(def[3])+'</small>';spark("sensorSpark",def[2]);}
let scenePromise=null;
async function init3D(){if(scenePromise)return scenePromise;scenePromise=import("./plant3d.js").then(async mod=>{state.scene=await mod.mountPlant3D($("plant3dMount"),id=>selectComponent(id));state.scene.update?.(state.current);return state.scene}).catch(error=>{console.warn("Planta 3D",error);$("plant3dMount").innerHTML='<div class="scene-placeholder"><strong>La vista 3D requiere un navegador compatible y acceso inicial a su biblioteca gráfica.</strong><small>'+esc(error.message)+'</small></div>';scenePromise=null;return null});return scenePromise}

function report(){const data=aggregateHistory(state.history,$("reportPeriod").value);$("reportSummary").textContent=data.totals.runs+" ejecuciones · "+fmt(data.totals.acceptedVolumeM3,3)+" m³ virtuales aceptados · "+fmt(data.totals.divertedVolumeM3,3)+" m³ desviados · "+fmt(data.totals.energyKWh,3)+" kWh calculados · "+data.totals.alarmCount+" alertas";return data}
function render(){const r=state.current;
$("kState").textContent=r.state;$("kAction").textContent=r.action;$("kPower").textContent=fmt(r.usefulPower,2);$("kPermeate").textContent=fmt(r.permeate,3);$("kTank").textContent=fmt(r.tankLevelNext,1);
$("lastRun").textContent=state.history.length?"Última ejecución · "+new Date(state.history.at(-1).date).toLocaleString("es-CO"):"Escenario de referencia";
const activity=state.history.length?state.history.slice(-3).reverse().map(e=>[e.result.state,e.scenario+" · "+new Date(e.date).toLocaleString("es-CO")]):[["Modelo listo","Simulación de referencia cargada"],["Red de sensores","12 variables sintéticas disponibles"]];
$("homeActivity").innerHTML=activity.map(([name,details])=>'<div class="activity"><span class="activity-icon">◉</span><div><b>'+esc(name)+'</b><small>'+esc(details)+'</small></div></div>').join("");
$("controlState").textContent=r.state;$("crFeed").textContent=fmt(r.feedEffective,2)+" m³/h";$("crPump").textContent=r.pumpMode;$("crRO").textContent=fmt(r.permeate,3)+" m³/h";$("crTank").textContent=fmt(r.tankLevelNext,1)+" %";
$("crPermeate").textContent=fmt(r.permeate,3)+" m³/h";$("crReq").textContent=fmt(r.nominalRequired,2)+" kW";$("crSal").textContent=fmt(r.permeateSalinity,3)+" g/L";
$("crCoverage").textContent=fmt(r.renewableCoverage,0)+"%";$("crSolar").textContent=fmt(r.usefulPower,2)+" kW";$("crDemand").textContent=fmt(r.nominalRequired,2)+" kW";
$("energyRing").style.background="radial-gradient(circle,#0a2639 55%,transparent 56%),conic-gradient(#5cdece 0 "+clamp(r.renewableCoverage,0,100)+"%,#194255 "+clamp(r.renewableCoverage,0,100)+"% 100%)";
$("controlAlarms").innerHTML=r.alarms.length?r.alarms.slice(0,4).map(a=>'<div class="alarm-'+esc(a.severity)+'"><b>'+esc(a.code)+'</b><br>'+esc(a.message)+'</div>').join(""):'<div>Sin alarmas adicionales en el escenario actual.</div>';
$("controlGauges").innerHTML=[["Permeado","permeate","m³/h",2],["Tanque","tankLevelNext","%",100],["Potencia","usefulPower","kW",2.6]].map(([name,key,unit,max])=>'<div class="gauge"><div class="gauge-ring" style="--value:'+clamp(amount(key)/max*100,0,100)+'"><strong>'+fmt(amount(key),key==="permeate"?3:1)+'</strong></div><label>'+name+' · '+unit+'</label></div>').join("");
$("resultStatus").textContent=r.state;
$("resultBlock").textContent="ESTADO: "+r.state+" · "+r.action+"\nPotencia FV disponible: "+fmt(r.usefulPower)+" kW\nDemanda de diseño: "+fmt(r.nominalRequired)+" kW\nPermeado virtual: "+fmt(r.permeate,3)+" m³/h\nPermeado aceptado: "+fmt(r.productAccepted,3)+" m³/h\nPermeado desviado: "+fmt(r.divertedPermeate,3)+" m³/h\nRechazo: "+fmt(r.brine,3)+" m³/h\nSalinidad de permeado: "+fmt(r.permeateSalinity,3)+" g/L\nNivel de tanque: "+fmt(r.tankLevelNext,1)+" %\nBalances: "+(r.balanced&&r.saltBalanced?"COHERENTES":"REVISAR")+"\nAlarmas: "+r.alarms.length;
$("alarmBody").innerHTML=state.alarms.length?state.alarms.slice(0,200).map(a=>'<tr><td>'+esc(new Date(a.date).toLocaleString("es-CO"))+'<br><small>'+esc(a.runId)+'</small></td><td>'+esc(a.code)+'<br><small>'+esc(a.message)+'</small></td><td class="alarm-'+esc(a.severity)+'">'+esc(a.severity)+'</td><td>'+esc(a.status)+'</td><td>'+(a.status==="Pendiente"?'<button data-ack="'+esc(a.id)+'">Reconocer</button>':'—')+'</td></tr>').join(""):'<tr><td colspan="5">Sin eventos registrados.</td></tr>';
$("histCount").textContent=state.history.length;$("histVolume").textContent=fmt(state.history.reduce((t,e)=>t+(Number(e.result.productAccepted)||0)*(Number(e.result.duration)||0),0),2)+" m³";$("histEnergy").textContent=fmt(state.history.reduce((t,e)=>t+(Number(e.result.usableEnergy)||0),0),2)+" kWh";
$("historyBody").innerHTML=state.history.length?state.history.slice(-150).reverse().map(e=>'<tr><td>'+esc(new Date(e.date).toLocaleString("es-CO"))+'</td><td>'+esc(e.scenario)+'</td><td>'+esc(e.mode||"LEGADO")+'</td><td>'+esc(e.result.state)+'</td><td>'+fmt(e.result.permeate,3)+' m³/h</td><td>'+fmt(e.result.usableEnergy,3)+' kWh</td></tr>').join(""):'<tr><td colspan="6">Sin simulaciones registradas.</td></tr>';
$("queueStatus").textContent=state.queue.filter(q=>q.status!=="Sincronizado virtualmente").length+" eventos pendientes";
renderChart("controlChart",["permeate","feedEffective"],"#6ce6c7");renderChart("energyChart",["usefulPower","nominalRequired","requiredPower"],"#25b2bd");
report();selectComponent(state.component);selectSensor(state.sensor);state.scene?.update?.(r);
}
function wire(){
document.addEventListener("click",event=>{
 const nav=event.target.closest("[data-view]");if(nav)setView(nav.dataset.view);
 const go=event.target.closest("[data-go]");if(go)setView(go.dataset.go);
 const c=event.target.closest("[data-component]");if(c)selectComponent(c.dataset.component);
 const sensor=event.target.closest("[data-sensor]");if(sensor)selectSensor(sensor.dataset.sensor);
 const quick=event.target.closest("[data-quick]");if(quick){applyScenario(quick.dataset.quick);simulateNow(quick.dataset.quick,false);setView("control")}
 const ack=event.target.closest("[data-ack]");if(ack){const item=state.alarms.find(a=>a.id===ack.dataset.ack);if(item){item.status="Reconocida";save();render();}}
});
$("mobileMenu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
$("scenario").onchange=()=>applyScenario($("scenario").value);
$("run").onclick=()=>simulateNow(null,$("chainScenarios").checked);
$("reset").onclick=()=>{applyScenario("V01");$("chainScenarios").checked=false};
$("demo").onclick=()=>runSeries(["V01","V02","V04","V06","V09","V10"]);
$("solarProfile").onclick=()=>runSeries([800,750,600,400,300,450,620,750,800].map(irradiance=>({irradiance})));
$("recoverProfile").onclick=()=>runSeries([300,450,600,800,1050].map(irradiance=>({irradiance})));
$("ackAll").onclick=()=>{state.alarms.forEach(a=>a.status="Reconocida");save();render()};
$("alarmExport").onclick=()=>download("aquaseven-alarmas.csv","\ufeff"+csv(state.alarms),"text/csv;charset=utf-8");
$("reportPeriod").onchange=report;
$("exportReportCsv").onclick=()=>download("aquaseven-reporte.csv","\ufeff"+reportCsv(report()),"text/csv;charset=utf-8");
$("exportReportJson").onclick=()=>download("aquaseven-reporte.json",JSON.stringify(report(),null,2),"application/json");
$("exportCsv").onclick=()=>download("aquaseven-historial.csv","\ufeff"+csv(historyFlat()),"text/csv;charset=utf-8");
$("exportJson").onclick=()=>download("aquaseven-historial.json",JSON.stringify({modelVersion:MODEL_VERSION,history:state.history},null,2),"application/json");
$("clearHistory").onclick=()=>{if(confirm("¿Borrar solo el historial de simulaciones de AquaSeven V3?")){state.history=[];state.alarms=[];state.queue=[];state.current=simulate({},null,state.thresholds);save();render()}};
$("saveThresholds").onclick=()=>{try{const v={};for(const [id] of thresholdFields){const raw=$("th-"+id).value;if(!raw)throw Error("Falta "+id);v[id]=Number(raw)}const valid=validateThresholds(v);localStorage.setItem(KEYS.thresholds,JSON.stringify(valid));state.thresholds=valid;$("thresholdMsg").textContent="Umbrales guardados para próximas ejecuciones."}catch(e){$("thresholdMsg").textContent="No guardado: "+e.message}};
$("restoreThresholds").onclick=()=>{try{localStorage.removeItem(KEYS.thresholds);state.thresholds=validateThresholds();for(const [id] of thresholdFields)$("th-"+id).value=state.thresholds[id];$("thresholdMsg").textContent="Valores de referencia restaurados."}catch(e){$("thresholdMsg").textContent=e.message}};
$("runTests").onclick=()=>{const r=runRegressionTests();$("testResults").innerHTML='<div class="subtle-panel"><strong>'+r.passed+' / '+r.total+' pruebas</strong>'+r.checks.map(t=>'<p>'+esc((t.pass?"✓ ":"✕ ")+t.name)+'</p>').join("")+'</div>'};
$("queueExport").onclick=()=>download("aquaseven-cola.json",JSON.stringify(state.queue,null,2),"application/json");
$("syncQueue").onclick=()=>{if(!state.current.communication){alert("Ejecute primero un escenario con comunicación virtual disponible.");return}state.queue.forEach(q=>q.status="Sincronizado virtualmente");save();render()};
$("plantSelect").onchange=()=>selectComponent($("plantSelect").value);
$("sceneReset").onclick=()=>state.scene?.reset?.();
$("sceneRotate").onclick=()=>{const active=$("sceneRotate").getAttribute("aria-pressed")!=="true";$("sceneRotate").setAttribute("aria-pressed",String(active));state.scene?.rotate?.(active)};
$("sceneZoomIn").onclick=()=>state.scene?.zoom?.(-1);
$("sceneZoomOut").onclick=()=>state.scene?.zoom?.(1);
}
function connectivity(){$("networkStatus").textContent=navigator.onLine?"Navegador conectado":"Sin internet"}
window.addEventListener("online",connectivity);window.addEventListener("offline",connectivity);
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(e=>console.warn("PWA",e)));
renderForms();wire();render();connectivity();
