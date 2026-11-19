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
console.log("VERSION:",MODEL_VERSION,"SCENARIOS:",Object.keys(SCENARIOS).length,"REGRESSION:",result.passed+"/"+result.total);
