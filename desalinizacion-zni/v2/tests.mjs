import {simulate,DEFAULTS,SCENARIOS,runRegressionTests,MODEL_VERSION,validateThresholds} from "./model.js";
import {aggregateHistory,filterHistory,reportCsv} from "./reports.js";
import assert from "node:assert/strict";
const result=runRegressionTests();
for(const check of result.checks){console.log((check.pass?"PASS":"FAIL")+"  "+check.name+(check.error?" — "+check.error:""));}
assert.equal(result.passed,result.total,"Regresión del motor fallida");
const expectedStates={V04:"HIGH_SALINITY",V06:"COMMUNICATION_LOSS",V09:"PUMP_FAILURE"};
for(const [key,expected] of Object.entries(expectedStates)){
 const res=simulate({...DEFAULTS,...SCENARIOS[key].values});
 assert.equal(res.state,expected,key+" state");
 assert.ok(res.balanced&&res.saltBalanced,key+" conservation");
 assert.ok(res.requiredPower<=res.usefulPower+1e-6,key+" energy constraint");
}
for(const [key,scenario] of Object.entries(SCENARIOS)){
 const res=simulate({...DEFAULTS,...scenario.values});
 for(const field of ["permeate","brine","usefulPower","requiredPower","tankLevelNext","brineSalinity"]){
   assert.ok(Number.isFinite(res[field]),key+": "+field);
 }
 assert.ok(res.tankLevelNext>=0&&res.tankLevelNext<=100,key+": tank bounds");
}
const restored=simulate({...DEFAULTS,irradiance:1200,pump:true,communication:true});
assert.equal(restored.state,"NORMAL","restoration with adequate photovoltaic input");
const stop=simulate({...DEFAULTS,pump:false,reservePump:false});
assert.equal(stop.permeate,0);assert.equal(stop.feedEffective,0);assert.equal(stop.brine,0);
const now=Date.parse("2026-11-18T12:00:00Z");
const history=[
 {id:"TEST1",date:"2026-11-18T11:00:00Z",scenario:"V01",modelVersion:MODEL_VERSION,result:simulate({...DEFAULTS,irradiance:1200,duration:2})},
 {id:"TEST2",date:"2026-11-10T11:00:00Z",scenario:"V09",modelVersion:MODEL_VERSION,result:simulate({...DEFAULTS,pump:false,reservePump:false,duration:1})}
];
const reportAll=aggregateHistory(history,"all",now);
const report24=aggregateHistory(history,"24h",now);
assert.equal(reportAll.totals.runs,2);
assert.equal(report24.totals.runs,1);
assert.ok(Math.abs(report24.totals.acceptedVolumeM3-0.84)<0.00001);
assert.ok(Math.abs(report24.totals.energyKWh-2.94)<0.00001);
assert.equal(reportAll.series.length,2);
assert.equal(filterHistory(history,"7d",now).length,1);
assert.ok(reportCsv(reportAll).includes("permeado_aceptado"));
assert.throws(()=>validateThresholds({tankMin:80,tankMax:70}));
assert.equal(simulate({...DEFAULTS,irradiance:1200},null,{cpMax:0.25}).productAccepted,0);
console.log("REPORTES: 2 históricos, 1 ventana 24h, balances confirmados");

 // Exploración determinista de condiciones límite. No reemplaza validación experimental.
 let seed=20261118;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 let scanned=0;
 for(let i=0;i<240;i++){
  const p={
   irradiance:1400*rand(),feed:3*rand(),recovery:.9*rand(),
   feedSalinity:100*rand(),rejection:.9+.1*rand(),sec:.1+29.9*rand(),
   latency:120000*rand(),completeness:100*rand(),tankLevel:100*rand(),
   tankCapacity:.1+100*rand(),demand:5*rand(),duration:24*rand(),
   tmp:100*rand(),filterPressureDrop:10*rand(),
   communication:i%5!==0,pump:i%7!==0,reservePump:i%11!==0
  };
  const v=simulate(p);
  assert.equal(v.balanced,true,"Masa de agua "+i);
  assert.equal(v.saltBalanced,true,"Balance salino "+i);
  assert.ok(v.requiredPower<=v.usefulPower+0.00002,"Energía disponible "+i);
  assert.ok(v.permeate>=0&&v.brine>=0&&v.productAccepted>=0,"Flujos no negativos "+i);
  assert.ok(v.productAccepted<=v.permeate+0.00002,"Producto aceptado "+i);
  assert.ok(v.tankLevelNext>=0&&v.tankLevelNext<=100,"Límites de tanque "+i);
  assert.ok(Number.isFinite(v.brineSalinity)&&Number.isFinite(v.renewableCoverage),"Resultados finitos "+i);
  scanned++;
 }
 console.log("PROPERTY SCAN: "+scanned+" condiciones sintéticas deterministas, invariantes satisfactorias");

console.log("VERSION:",MODEL_VERSION,"SCENARIOS:",Object.keys(SCENARIOS).length,"REGRESSION:",result.passed+"/"+result.total);
