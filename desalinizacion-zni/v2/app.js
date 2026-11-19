import {MODEL_VERSION,DEFAULTS,THRESHOLDS,SCENARIOS,SENSOR_DEFINITIONS,simulate,runRegressionTests} from "./model.js";
const $=(id)=>document.getElementById(id);
const KEY="zni_v2_history_1", ALARM_KEY="zni_v2_alarms_1", QUEUE_KEY="zni_v2_queue_1";
const read=(key)=>{try{const v=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(v)?v:[]}catch{return []}};
const restoredHistory=read(KEY);
const state={history:restoredHistory,alarmHistory:read(ALARM_KEY),queue:read(QUEUE_KEY),current:restoredHistory.at(-1)?.result||null,node:null,seq:restoredHistory.length};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state.history));localStorage.setItem(ALARM_KEY,JSON.stringify(state.alarmHistory));localStorage.setItem(QUEUE_KEY,JSON.stringify(state.queue));}catch(err){console.warn("Almacenamiento local no disponible",err);}};
const fmt=(v,d=2)=>Number(v).toLocaleString("es-CO",{minimumFractionDigits:d,maximumFractionDigits:d});
const escape=(s)=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const inputs=[
 ["irradiance","Irradiancia","W/m²",0,1400,1],["feed","Caudal alimentación","m³/h",0,3,.01],
 ["recovery","Recuperación nominal","fracción",0,.9,.01],["feedSalinity","Salinidad alimentación","g/L",0,100,.1],
 ["rejection","Rechazo de sales supuesto","fracción",.9,1,.001],["temperature","Temperatura","°C",0,50,.1],
 ["tmp","Presión TMP","bar",0,100,.5],["sec","SEC de diseño","kWh/m³",0,30,.1],
 ["latency","Latencia sintética","ms",0,120000,100],["completeness","Completitud","%",0,100,.1],
 ["tankLevel","Nivel inicial tanque","%",0,100,1],["tankCapacity","Capacidad tanque","m³",.1,500,.5],
 ["demand","Demanda del tanque","m³/h",0,5,.01],["duration","Duración escenario","horas",0,24,.25],
 ["filterPressureDrop","ΔP filtros","bar",0,10,.1]
];
function renderInputs(){
 $("scenario").innerHTML=Object.entries(SCENARIOS).map(([k,s])=>'<option value="'+k+'">'+escape(s.label)+'</option>').join("");
 $("formControls").innerHTML=inputs.map(([id,label,unit,min,max,step])=>
 '<div class="field"><label for="'+id+'">'+escape(label)+' ('+escape(unit)+')</label><input type="number" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'"></div>').join("");
 setForm(DEFAULTS);
}
function setForm(values){
 for(const [id] of inputs)$(id).value=values[id]??DEFAULTS[id];
 for(const id of ["pump","reservePump","communication"])$(id).checked=values[id]??DEFAULTS[id];
 $("formError").hidden=true;
}
function getForm(){
 const data={};
 for(const [id] of inputs){if($(id).value.trim()==="")throw Error("Debe completar "+id);data[id]=Number($(id).value);}
 for(const id of ["pump","reservePump","communication"])data[id]=$(id).checked;
 return data;
}
function changeView(view){
 document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+view));
 document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
 window.scrollTo({top:0,behavior:"smooth"});
}
function activateScenario(code){const s=SCENARIOS[code];if(!s)return;setForm({...DEFAULTS,...s.values});}
function execute(code=null,keepTank=true){
 try{
  const raw=getForm();
  const prev=keepTank&&state.current?state.current.tankLevelNext:null;
  const result=simulate(raw,prev);
  state.current=result;
  const id="SIM-"+new Date().toISOString().replace(/[^\d]/g,"").slice(0,14)+"-"+(++state.seq);
  const entry={id,date:new Date().toISOString(),scenario:code||$("scenario").value,modelVersion:MODEL_VERSION,
    inputs:raw,result};
  state.history.push(entry);
  if(state.history.length>1000)state.history.shift();
  for(const alarm of result.alarms){
   state.alarmHistory.unshift({id:id+"-"+alarm.code,runId:id,date:entry.date,code:alarm.code,
     message:alarm.message,severity:alarm.severity,status:"Pendiente"});
  }
  if(!result.communication||result.latency>THRESHOLDS.latencyMax||result.completeness<THRESHOLDS.completenessMin){
    state.queue.push({id,created:entry.date,simulation:entry,status:"Pendiente de sincronización simulada"});
  }
  if(state.alarmHistory.length>3000)state.alarmHistory.length=3000;
  save(); render(); $("runTag").textContent=id; $("formError").hidden=true;
  return result;
 }catch(err){$("formError").textContent="No se pudo ejecutar: "+err.message;$("formError").hidden=false;return null;}
}
function render(){
 const r=state.current||simulate(DEFAULTS);
 const k=(id,text)=>$(id).textContent=text;
 k("kState",r.state);k("kAction",r.action);k("kPower",fmt(r.usefulPower));
 k("kRequired",fmt(r.nominalRequired));k("kPermeate",fmt(r.permeate,3));
 k("kSalinity",fmt(r.permeateSalinity,3));k("kTank",fmt(r.tankLevelNext,1)+" %");
 k("oFeed",fmt(r.feedEffective,3)+" m³/h");k("oBrine",fmt(r.brine,3)+" m³/h");
 k("oRecovery",fmt(r.effectiveRecovery,1)+" %");k("oBrineSal",fmt(r.brineSalinity,2)+" g/L");
 k("oPump",r.pumpMode);k("oBalance",r.balanced&&r.saltBalanced?"COHERENTE":"VERIFICAR");
 k("oDemand",fmt(r.unmetDemand,3)+" m³");
 const alarmNodes=r.alarms.length?r.alarms.map(a=>'<div class="alarm-'+escape(a.severity)+'">'+escape(a.code)+": "+escape(a.message)+"</div>").join(""):"Sin alarmas para los parámetros vigentes.";
 $("overviewAlarms").innerHTML=alarmNodes;
 const nodeDesc={
  "Captación":"Entrada virtual de agua de mar; caudal efectivo: "+fmt(r.feedEffective,3)+" m³/h.",
  "Bombeo":"Estado lógico: "+r.pumpMode+". Orden: "+r.action+". Sin actuadores físicos.",
  "Filtros":"Caída de presión supuesta: "+fmt(r.filterPressureDrop,2)+" bar. Límite: "+THRESHOLDS.filterDpMax+" bar.",
  "Ósmosis inversa":"Permeado: "+fmt(r.permeate,3)+" m³/h; rechazo: "+fmt(r.brine,3)+" m³/h.",
  "Tanque":"Nivel después del escenario: "+fmt(r.tankLevelNext,1)+" %. Demanda: "+fmt(r.demand,2)+" m³/h.",
  "Fotovoltaica":"Irradiancia "+fmt(r.irradiance,0)+" W/m² → potencia útil "+fmt(r.usefulPower)+" kW.",
  "Salmuera":"Salinidad calculada: "+fmt(r.brineSalinity,2)+" g/L. Sin evaluación de impacto ambiental."
 };
 if(state.node)$("nodeDetail").textContent=nodeDesc[state.node]||"Componente virtual";
 $("resultBlock").textContent="ESTADO: "+r.state+"\nACCIÓN: "+r.action+
 "\nCarga virtual: "+fmt(r.loadFactor*100,1)+" %"+
 "\nPotencia útil: "+fmt(r.usefulPower)+" kW"+
 "\nPotencia nominal requerida: "+fmt(r.nominalRequired)+" kW"+
 "\nPotencia efectivamente consumida (modelo): "+fmt(r.requiredPower)+" kW"+
 "\nQp membrana: "+fmt(r.permeate,3)+" m³/h · Qb: "+fmt(r.brine,3)+" m³/h"+
 "\nPermeado aceptado en tanque: "+fmt(r.productAccepted,3)+" m³/h · desviado: "+fmt(r.divertedPermeate,3)+" m³/h"+
 "\nRecuperación efectiva: "+fmt(r.effectiveRecovery,1)+" %"+
 "\nNivel final tanque: "+fmt(r.tankLevelNext,1)+" %"+
 "\nAlertas: "+r.alarms.length+
 "\nALCANCE: resultado matemático virtual, no medición física.";
 $("sensorBody").innerHTML=SENSOR_DEFINITIONS.map(([id,label,key,unit])=>
  '<tr><td>'+escape(id)+'</td><td>'+escape(label)+'</td><td>'+fmt(r[key],key==="completeness"?1:2)+' '+escape(unit)+'</td><td>Sintético</td></tr>').join("");
 $("alarmBody").innerHTML=state.alarmHistory.length?state.alarmHistory.slice(0,200).map((a,i)=>
 '<tr><td>'+escape(new Date(a.date).toLocaleString("es-CO"))+'<br><small>'+escape(a.runId)+'</small></td><td>'+escape(a.code)+'<br><small>'+escape(a.message)+'</small></td><td class="alarm-'+escape(a.severity)+'">'+escape(a.severity)+'</td><td>'+escape(a.status)+'</td><td>'+(a.status==="Pendiente"?'<button data-ack="'+escape(a.id)+'">Reconocer</button>':"—")+'</td></tr>').join(""):'<tr><td colspan="5">Sin alarmas registradas.</td></tr>';
 $("histCount").textContent=state.history.length;
 $("histVolume").textContent=fmt(state.history.reduce((s,x)=>s+(x.result?.productAccepted||0)*(x.result?.duration||0),0),2)+" m³";
 $("histEnergy").textContent=fmt(state.history.reduce((s,x)=>s+(x.result?.usableEnergy||0),0),2)+" kWh";
 $("historyBody").innerHTML=state.history.length?state.history.slice(-200).reverse().map(x=>'<tr><td>'+escape(x.id)+'</td><td>'+escape(new Date(x.date).toLocaleString("es-CO"))+'</td><td>'+escape(x.scenario)+'</td><td>'+escape(x.result.state)+'</td><td>'+fmt(x.result.permeate,3)+'</td><td>'+fmt(x.result.usefulPower)+'</td><td>'+fmt(x.result.nominalRequired)+'</td><td>'+fmt(x.result.tankLevelNext,1)+'</td></tr>').join(""):'<tr><td colspan="8">Aún no hay ejecuciones.</td></tr>';
 $("queueStatus").textContent="Cola local: "+state.queue.filter(x=>x.status!=="Sincronizado virtualmente").length+" pendientes de sincronización simulada · "+state.queue.length+" registros totales. NO se transmiten datos a servidores.";
 drawChart();
}
function drawChart(){
 const svg=$("energyChart"),data=state.history.slice(-16),W=640,H=240;
 svg.innerHTML='<rect width="'+W+'" height="'+H+'" rx="8" fill="#0b2333"/>';
 if(!data.length){svg.innerHTML+='<text x="320" y="120" fill="#abc5d2" text-anchor="middle">Ejecute escenarios para generar la tendencia</text>';return;}
 const max=Math.max(2,...data.flatMap(d=>[d.result.usefulPower,d.result.nominalRequired,d.result.requiredPower]))*1.12;
 const x=i=>55+(data.length===1?250:i*(W-95)/(data.length-1)),y=v=>H-35-v/max*(H-65);
 for(let p=0;p<=4;p++){let yy=y(max*p/4);svg.innerHTML+='<line x1="50" y1="'+yy+'" x2="620" y2="'+yy+'" stroke="#28506a" stroke-dasharray="3 5"/><text x="7" y="'+(yy-3)+'" fill="#b0cad3" font-size="12">'+fmt(max*p/4,1)+'</text>';}
 for(const [key,color,label] of [["usefulPower","#57d5bf","Pútil"],["nominalRequired","#e6c062","Preq diseño"],["requiredPower","#e88c9e","Pconsumo"]]){
 const points=data.map((d,i)=>x(i)+","+y(d.result[key])).join(" ");
 svg.innerHTML+='<polyline points="'+points+'" stroke="'+color+'" stroke-width="3" fill="none"/>';
 const lx=60+[["usefulPower"],["nominalRequired"],["requiredPower"]].findIndex(z=>z[0]===key)*175;
 svg.innerHTML+='<rect x="'+lx+'" y="212" width="14" height="4" fill="'+color+'"/><text x="'+(lx+19)+'" y="220" fill="#c1d8e5" font-size="12">'+label+'</text>';
 }
}
const csvEscape=v=>'"'+String(v===null||v===undefined?"":v).replaceAll('"','""')+'"';
function download(filename,content,mime){const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function csvRows(rows){
 if(!rows.length)return "";
 const keys=[...new Set(rows.flatMap(x=>Object.keys(x)))];
 return [keys.map(csvEscape).join(";"),...rows.map(x=>keys.map(k=>csvEscape(x[k])).join(";"))].join("\r\n");
}
function flattenHistory(){return state.history.map(x=>({id:x.id,fecha:x.date,escenario:x.scenario,version:x.modelVersion,
  estado:x.result.state,accion:x.result.action,irradiancia_Wm2:x.result.irradiance,
  caudal_alimentacion_m3h:x.result.feedEffective,caudal_permeado_m3h:x.result.permeate,
  caudal_rechazo_m3h:x.result.brine,permeado_aceptado_m3h:x.result.productAccepted,permeado_desviado_m3h:x.result.divertedPermeate,potencia_util_kW:x.result.usefulPower,
  potencia_diseno_kW:x.result.nominalRequired,potencia_consumida_kW:x.result.requiredPower,
  salinidad_permeado_gL:x.result.permeateSalinity,nivel_tanque_pct:x.result.tankLevelNext,
  alarmas:x.result.alarms.map(a=>a.code).join("|")}));
}
function wire(){
 document.querySelectorAll(".nav").forEach(n=>n.addEventListener("click",()=>changeView(n.dataset.view)));
 $("jumpSim").onclick=()=>changeView("simulate");$("jumpIot").onclick=()=>changeView("iot");
 document.querySelectorAll(".plantnode").forEach(node=>{const select=()=>{state.node=node.dataset.node;render();};node.onclick=select;node.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select();}}});
 $("scenario").onchange=()=>activateScenario($("scenario").value);
 $("run").onclick=()=>execute();
 $("reset").onclick=()=>{setForm(DEFAULTS);$("scenario").value="V01";};
 $("demo").onclick=()=>{
  for(const key of ["V01","V02","V04","V06","V09","V10"]){activateScenario(key);execute(key,true);}
  changeView("history");
 };
 $("solarProfile").onclick=()=>{
  for(const irradiance of [800,750,600,400,300,400,600,750,800]){
    setForm({...DEFAULTS,irradiance});execute("V07",true);
  }
  changeView("history");
 };
 $("runTests").onclick=()=>renderTests();$("testRun").onclick=()=>{changeView("tests");renderTests();};
 $("exportCsv").onclick=()=>download("zni-v2-registros.csv","\ufeff"+csvRows(flattenHistory()),"text/csv;charset=utf-8");
 $("exportJson").onclick=()=>download("zni-v2-registros.json",JSON.stringify({modelVersion:MODEL_VERSION,exportedAt:new Date().toISOString(),history:state.history},null,2),"application/json");
 $("alarmExport").onclick=()=>download("zni-v2-alarmas.csv","\ufeff"+csvRows(state.alarmHistory),"text/csv;charset=utf-8");
 $("queueExport").onclick=()=>download("zni-v2-cola-simulada.json",JSON.stringify(state.queue,null,2),"application/json");
 $("ackAll").onclick=()=>{state.alarmHistory.forEach(a=>{if(a.status==="Pendiente")a.status="Reconocida";});save();render();};
 $("alarmBody").onclick=e=>{const btn=e.target.closest("[data-ack]");if(!btn)return;const a=state.alarmHistory.find(x=>x.id===btn.dataset.ack);if(a){a.status="Reconocida";save();render();}};
 $("syncQueue").onclick=()=>{if(!state.current?.communication){alert("La conexión virtual sigue desactivada. Ejecute primero un escenario con comunicación disponible.");return;}
   state.queue.forEach(x=>x.status="Sincronizado virtualmente");save();render();};
 $("clearHistory").onclick=()=>{if(!confirm("¿Borrar únicamente el historial y alarmas locales de esta versión?"))return;state.history=[];state.alarmHistory=[];state.queue=[];state.current=null;save();$("runTag").textContent="Sin ejecuciones";render();};
}
function renderTests(){
 const result=runRegressionTests();
 $("testResults").innerHTML="<p><strong>"+result.passed+" / "+result.total+" comprobaciones satisfactorias</strong></p>"+result.checks.map(t=>
 '<div class="'+(t.pass?"pass":"fail")+'">'+(t.pass?"✓":"✕")+" "+escape(t.name)+(t.error?" · "+escape(t.error):"")+"</div>").join("");
}
renderInputs();wire();render();