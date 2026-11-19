// Informes exclusivamente sintéticos de escenarios ejecutados por el usuario.
// Agrupa por fecha de ejecución en el navegador, no por operación real en una planta.
const FINITE=(v)=>Number.isFinite(v)?v:0;
export const REPORT_PERIODS=Object.freeze({
 all:{label:"Todas las ejecuciones",hours:Infinity},
 "24h":{label:"Últimas 24 horas",hours:24},
 "7d":{label:"Últimos 7 días",hours:24*7},
 "30d":{label:"Últimos 30 días",hours:24*30}
});
export function filterHistory(history,period="all",now=Date.now()){
 if(!Object.hasOwn(REPORT_PERIODS,period))throw new Error("Período no soportado: "+period);
 if(!Array.isArray(history))throw new TypeError("Historial inválido");
 const cutoff=period==="all"?-Infinity:now-REPORT_PERIODS[period].hours*3600000;
 return history.filter(entry=>{
  const ts=Date.parse(entry?.date);
  return Number.isFinite(ts)&&ts>=cutoff&&ts<=now&&entry.result&&typeof entry.result==="object";
 });
}
export function aggregateHistory(history,period="all",now=Date.now()){
 const filtered=filterHistory(history,period,now);
 const totals={runs:filtered.length,durationHours:0,permeateVolumeM3:0,acceptedVolumeM3:0,
  divertedVolumeM3:0,virtualDemandM3:0,energyKWh:0,solarAvailableKWh:0,alarmCount:0,
  stoppedRuns:0,energyLimitedRuns:0,offspecRuns:0};
 const byState={};const dailyMap=new Map();
 for(const e of filtered){
  const r=e.result, duration=Math.max(0,FINITE(r.duration));
  const date=new Date(e.date);
  const dateKey=[date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
  const daily=dailyMap.get(dateKey)||{date:dateKey,runs:0,acceptedM3:0,energyKWh:0,alarms:0};
  const accepted= Math.max(0,FINITE(r.productAccepted))*duration;
  const produced= Math.max(0,FINITE(r.permeate))*duration;
  const diverted= Math.max(0,FINITE(r.divertedPermeate))*duration;
  const energy=Math.max(0,FINITE(r.usableEnergy));
  const alarms=Array.isArray(r.alarms)?r.alarms.length:0;
  totals.durationHours+=duration;
  totals.permeateVolumeM3+=produced;
  totals.acceptedVolumeM3+=accepted;
  totals.divertedVolumeM3+=diverted;
  totals.virtualDemandM3+=Math.max(0,FINITE(r.demand))*duration;
  totals.energyKWh+=energy;
  totals.solarAvailableKWh+=Math.max(0,FINITE(r.usefulPower))*duration;
  totals.alarmCount+=alarms;
  if(["PUMP_FAILURE","COMMUNICATION_LOSS"].includes(r.state))totals.stoppedRuns++;
  if(r.state==="ENERGY_LIMIT")totals.energyLimitedRuns++;
  if(diverted>0)totals.offspecRuns++;
  byState[r.state||"UNKNOWN"]=(byState[r.state||"UNKNOWN"]||0)+1;
  daily.runs++;daily.acceptedM3+=accepted;daily.energyKWh+=energy;daily.alarms+=alarms;
  dailyMap.set(dateKey,daily);
 }
 const round=x=>Number(x.toFixed(5));
 for(const k of Object.keys(totals)){if(k!=="runs"&&!k.endsWith("Runs")&&k!=="alarmCount")totals[k]=round(totals[k]);}
 const series=Array.from(dailyMap.values()).sort((a,b)=>a.date.localeCompare(b.date)).map(r=>({
  date:r.date,runs:r.runs,acceptedM3:round(r.acceptedM3),energyKWh:round(r.energyKWh),alarms:r.alarms
 }));
 return {period,label:REPORT_PERIODS[period].label,generatedAt:new Date(now).toISOString(),
  disclaimer:"Agregados de ejecuciones sintéticas. Las fechas identifican cuándo se ejecutó el escenario, no cuándo operó una planta real.",
  totals,byState,series,records:filtered.map(({id,date,scenario,modelVersion,result})=>({
   id,date,scenario,modelVersion,
   state:result.state||"UNKNOWN",action:result.action||"",
   durationHours:FINITE(result.duration),
   acceptedM3:round(Math.max(0,FINITE(result.productAccepted))*Math.max(0,FINITE(result.duration))),
   divertedM3:round(Math.max(0,FINITE(result.divertedPermeate))*Math.max(0,FINITE(result.duration))),
   energyKWh:round(Math.max(0,FINITE(result.usableEnergy)))
  }))};
}
export function reportCsv(report){
 const cols=["fecha","ejecuciones","permeado_aceptado_m3_sintetico","consumo_kwh_sintetico","alertas"];
 const esc=s=>'"'+String(s??"").replaceAll('"','""')+'"';
 return [cols.map(esc).join(";"),...report.series.map(x=>[
  x.date,x.runs,x.acceptedM3,x.energyKWh,x.alarms].map(esc).join(";"))].join("\r\n");
}
