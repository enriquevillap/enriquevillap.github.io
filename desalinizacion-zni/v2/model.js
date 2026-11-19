// Modelo académico: todos los resultados son virtuales. Sin sensores ni potabilidad certificada.
export const MODEL_VERSION = "2.0.0-dev.1";
export const DEFAULTS = Object.freeze({
  irradiance:800, feed:1.2, recovery:0.35, feedSalinity:35, rejection:0.99,
  temperature:25, tmp:55, sec:3.5, latency:1000, completeness:99.5,
  pump:true, communication:true, reservePump:true, tankLevel:50,
  tankCapacity:20, demand:0.25, duration:1, filterPressureDrop:0.6
});
export const THRESHOLDS = Object.freeze({
  cpMax:0.50, feedSalinityMax:40, latencyMax:5000, completenessMin:98,
  tankMin:20, tankMax:95, tmpMax:70, filterDpMax:1.0
});
export const SENSOR_DEFINITIONS = Object.freeze([
  ["SOL-01","Irradiancia FV","irradiance","W/m²"],
  ["POT-01","Potencia utilizable","usefulPower","kW"],
  ["CAU-01","Caudal alimentación","feedEffective","m³/h"],
  ["CAU-02","Caudal permeado","permeate","m³/h"],
  ["CAU-03","Caudal rechazo","brine","m³/h"],
  ["SAL-01","Salinidad permeado","permeateSalinity","g/L"],
  ["SAL-02","Salinidad rechazo","brineSalinity","g/L"],
  ["PRE-01","Presión TMP","tmp","bar"],
  ["TEM-01","Temperatura","temperature","°C"],
  ["NIV-01","Nivel tanque","tankLevelNext","%"],
  ["FILT-01","ΔP filtro","filterPressureDrop","bar"],
  ["COM-01","Latencia","latency","ms"]
]);
export const SCENARIOS = Object.freeze({
  V01:{label:"V01 · Nominal",values:{}},
  V02:{label:"V02 · Baja irradiancia",values:{irradiance:400}},
  V03:{label:"V03 · Potencia insuficiente",values:{irradiance:300}},
  V04:{label:"V04 · Alta salinidad",values:{feedSalinity:50}},
  V05:{label:"V05 · Bajo caudal",values:{feed:0.6}},
  V06:{label:"V06 · Pérdida comunicación",values:{communication:false}},
  V07:{label:"V07 · Perturbación solar",values:{irradiance:300}},
  V08:{label:"V08 · Comunicación recuperada",values:{communication:true}},
  V09:{label:"V09 · Falla bomba",values:{pump:false,reservePump:false}},
  V10:{label:"V10 · Recuperación",values:{pump:true,communication:true,reservePump:true,irradiance:800}},
  TANK:{label:"Nivel bajo tanque",values:{tankLevel:12}},
  FILTER:{label:"Filtro obstruido",values:{filterPressureDrop:1.3}}
});
const LIMITS={irradiance:[0,1400],feed:[0,3],recovery:[0,0.9],feedSalinity:[0,100],
  rejection:[0.9,1],temperature:[0,50],tmp:[0,100],sec:[0,30],latency:[0,120000],
  completeness:[0,100],tankLevel:[0,100],tankCapacity:[0.1,500],
  demand:[0,5],duration:[0,24],filterPressureDrop:[0,10]};
const BOOLEAN_KEYS=["pump","communication","reservePump"];
function finite(value,key){const v=Number(value);if(!Number.isFinite(v))throw Error("Entrada no finita: "+key);return v;}
export function normalizeInputs(raw={}){
  const input={...DEFAULTS,...raw}, cleaned={};
  for(const [key,[min,max]] of Object.entries(LIMITS)){
    const val=finite(input[key],key);
    if(val<min||val>max)throw Error(key+" fuera de rango ["+min+", "+max+"]");
    cleaned[key]=val;
  }
  for(const key of BOOLEAN_KEYS)cleaned[key]=input[key]===true||input[key]==="true";
  return cleaned;
}
const round=(v,n=5)=>Number(v.toFixed(n));
export function simulate(raw={},previousTankLevel=null){
  const a=normalizeInputs(raw);
  const tankInitial=previousTankLevel===null?a.tankLevel:Math.max(0,Math.min(100,finite(previousTankLevel,"previousTankLevel")));
  const area=10, etaPV=0.20, etaConv=0.90;
  const pvPower=a.irradiance*area*etaPV/1000, usefulPower=pvPower*etaConv;
  const designPermeate=a.feed*a.recovery, nominalRequired=a.sec*designPermeate;
  const nominalCp=a.feedSalinity*(1-a.rejection);
  const commBad=!a.communication||a.latency>THRESHOLDS.latencyMax||a.completeness<THRESHOLDS.completenessMin;
  const salinityBad=nominalCp>THRESHOLDS.cpMax||a.feedSalinity>THRESHOLDS.feedSalinityMax;
  const energyBad=usefulPower+1e-9<nominalRequired;
  const pumpBad=!a.pump&&!a.reservePump;
  const tankLow=tankInitial<THRESHOLDS.tankMin;
  const tmpHigh=a.tmp>THRESHOLDS.tmpMax;
  const filterBad=a.filterPressureDrop>THRESHOLDS.filterDpMax;
  let state="NORMAL",action="MAINTAIN",load=1;
  const alarms=[];
  if(pumpBad){state="PUMP_FAILURE";action="STOP_PROCESS";load=0;}
  else if(commBad){state="COMMUNICATION_LOSS";action="SAFE_MODE";load=0;}
  else if(salinityBad){state="HIGH_SALINITY";action="REDUCE_LOAD";load=0.5;}
  else if(energyBad){state="ENERGY_LIMIT";action="REDUCE_LOAD";load=nominalRequired>0?Math.min(1,usefulPower/nominalRequired):1;}
  else if(tmpHigh||filterBad){state="PROCESS_LIMIT";action="REDUCE_LOAD";load=0.6;}
  else if(tankLow){state="LOW_TANK";action="WATCH";load=1;}
  if(energyBad)alarms.push({code:"ENERGY_LIMIT",severity:"warning",message:"Potencia FV inferior a la demanda de diseño"});
  if(salinityBad)alarms.push({code:"HIGH_SALINITY",severity:"critical",message:"Criterio virtual de salinidad excedido"});
  if(commBad)alarms.push({code:"COMMUNICATION_LOSS",severity:"critical",message:"Telemetría no disponible: modo seguro"});
  if(pumpBad)alarms.push({code:"PUMP_FAILURE",severity:"critical",message:"No hay bomba disponible"});
  if(tmpHigh)alarms.push({code:"TMP_HIGH",severity:"warning",message:"Presión de membrana superior al umbral"});
  if(filterBad)alarms.push({code:"FILTER_DP_HIGH",severity:"warning",message:"Caída de presión en filtros elevada"});
  if(tankLow)alarms.push({code:"LOW_TANK",severity:"warning",message:"Almacenamiento por debajo del mínimo"});
  // La orden REDUCE_LOAD se refleja en la producción: cierre de la brecha de la versión 1.
  // Se mantiene el caudal de alimentación como dato nominal disponible, sin fingir un PLC físico.
  const permeate=designPermeate*load;
  const feedEffective=load===0?0:a.feed;
  const brine=Math.max(0,feedEffective-permeate);
  const permeateSalinity=permeate>0?nominalCp:0;
  const brineSalinity=brine>0?(feedEffective*a.feedSalinity-permeate*permeateSalinity)/brine:0;
  const recovered=feedEffective>0?permeate/feedEffective:0;
  const requiredPower=a.sec*permeate;
  // Equivalencia de volumen: m³/h * h; nivel de tanque m³ / capacidad m³.
  const tankVolume=tankInitial/100*a.tankCapacity;
  const netVolume=(permeate-a.demand)*a.duration;
  const tankVolumeNext=Math.max(0,Math.min(a.tankCapacity,tankVolume+netVolume));
  const tankLevelNext=tankVolumeNext/a.tankCapacity*100;
  const excessSpill=Math.max(0,tankVolume+netVolume-a.tankCapacity);
  const unmetDemand=Math.max(0,-(tankVolume+netVolume));
  const usableEnergy=requiredPower*a.duration;
  const renewableCoverage=requiredPower>0?Math.min(100,usefulPower/requiredPower*100):100;
  return {
    ...a,modelVersion:MODEL_VERSION,state,action,loadFactor:round(load),
    pvPower:round(pvPower),usefulPower:round(usefulPower),nominalRequired:round(nominalRequired),
    requiredPower:round(requiredPower),feedEffective:round(feedEffective),
    designPermeate:round(designPermeate),permeate:round(permeate),brine:round(brine),
    permeateSalinity:round(permeateSalinity),brineSalinity:round(brineSalinity),
    effectiveRecovery:round(recovered*100),tankLevelStart:round(tankInitial),
    tankLevelNext:round(tankLevelNext),tankVolumeNext:round(tankVolumeNext),
    excessSpill:round(excessSpill),unmetDemand:round(unmetDemand),
    usableEnergy:round(usableEnergy),renewableCoverage:round(renewableCoverage),
    pumpMode:pumpBad?"STOP":(!a.pump&&a.reservePump?"RESERVE":"MAIN"),
    alarms,balanced:Math.abs(feedEffective-(permeate+brine))<1e-8,
    saltBalanced:Math.abs(feedEffective*a.feedSalinity-(permeate*permeateSalinity+brine*brineSalinity))<1e-7
  };
}
export function runRegressionTests(){
  const checks=[],test=(name,fn)=>{try{if(!fn())throw Error("assertion false");checks.push({name,pass:true});}catch(e){checks.push({name,pass:false,error:String(e.message||e)});}};
  const base=simulate();
  test("Nominal: potencia FV 1,44 kW",()=>Math.abs(base.usefulPower-1.44)<1e-9);
  test("Nominal: demanda de diseño 1,47 kW",()=>Math.abs(base.nominalRequired-1.47)<1e-9);
  test("Energía: carga reducida al máximo viable",()=>base.state==="ENERGY_LIMIT"&&base.permeate<0.42&&base.requiredPower<=base.usefulPower+1e-7);
  test("Balance hídrico nominal",()=>base.balanced);
  test("Balance de sal nominal",()=>base.saltBalanced);
  test("Salinidad: alerta activa",()=>simulate({feedSalinity:50,irradiance:1000}).state==="HIGH_SALINITY");
  test("Fallo: caudal virtual detenido",()=>simulate({pump:false,reservePump:false}).permeate===0);
  test("Fallo: alimentación y rechazo detenidos",()=>simulate({pump:false,reservePump:false}).brine===0);
  test("Comunicación: modo seguro sin producción",()=>simulate({communication:false}).action==="SAFE_MODE"&&simulate({communication:false}).permeate===0);
  test("Bomba: respaldo disponible",()=>simulate({pump:false,reservePump:true}).pumpMode==="RESERVE");
  test("Tanque: límite máximo respetado",()=>simulate({tankLevel:99,demand:0,duration:24,irradiance:1300}).tankLevelNext===100);
  test("Cero caudal: sin NaN",()=>Number.isFinite(simulate({feed:0}).brineSalinity));
  test("Recuperación cero: sin división por cero",()=>Number.isFinite(simulate({recovery:0}).effectiveRecovery));
  test("Entrada inválida rechazada",()=>{try{simulate({feed:-2});return false;}catch{return true;}});
  test("Prioridad bomba > comunicación",()=>simulate({pump:false,reservePump:false,communication:false}).state==="PUMP_FAILURE");
  test("Prioridad comunicación > salinidad",()=>simulate({communication:false,feedSalinity:70}).state==="COMMUNICATION_LOSS");
  return {passed:checks.filter(x=>x.pass).length,total:checks.length,checks};
}
