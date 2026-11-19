import {simulate,DEFAULTS,SCENARIOS,runRegressionTests,MODEL_VERSION} from "./model.js";
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
console.log("VERSION:",MODEL_VERSION,"SCENARIOS:",Object.keys(SCENARIOS).length,"REGRESSION:",result.passed+"/"+result.total);
