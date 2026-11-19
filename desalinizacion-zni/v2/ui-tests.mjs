import assert from "node:assert/strict";
import {chromium} from "playwright";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,dirname,extname} from "node:path";
import {fileURLToPath} from "node:url";
const base=dirname(fileURLToPath(import.meta.url));
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8"};
const server=http.createServer(async (req,res)=>{
  const route=(req.url||"/").split("?")[0];const name=route==="/"?"/index.html":route;
  if(!/^\/(?:index\.html|style\.css|app\.js|model\.js)$/.test(name)){res.writeHead(404);res.end("Not found");return;}
  try{let content=await readFile(resolve(base,"."+name));res.writeHead(200,{"Content-Type":types[extname(name)]});res.end(content);}
  catch(e){res.writeHead(500);res.end(String(e));}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const page=await browser.newPage({acceptDownloads:true,viewport:{width:1440,height:900}});
const errors=[];
page.on("pageerror",e=>errors.push(e.message));
try{
 await page.goto("http://127.0.0.1:"+port,{waitUntil:"networkidle"});
 assert.match(await page.locator("h1").innerText(),/DESALINIZACIÓN ZNI/);
 assert.equal(await page.locator("#kState").innerText(),"ENERGY_LIMIT");
 await page.screenshot({path:"v2-preview.png",fullPage:true});
 console.log("PASS landing + nominal state ENERGY_LIMIT");
 await page.locator('[data-view="sensors"]').click();
 assert.equal(await page.locator("#sensorBody tr").count(),12);
 console.log("PASS 12 sensores sintéticos");
 await page.locator('[data-view="simulate"]').click();
 await page.selectOption("#scenario","V09");
 await page.locator("#run").click();
 await page.locator('[data-view="overview"]').click();
 assert.equal(await page.locator("#kState").innerText(),"PUMP_FAILURE");
 assert.equal(await page.locator("#kPermeate").innerText(),"0,000");
 console.log("PASS bomba detenida, caudal cero");
 await page.locator('[data-view="simulate"]').click();
 await page.selectOption("#scenario","V04");
 await page.fill("#feedSalinity","70");
 await page.locator("#run").click();
 await page.locator("#resultBlock").waitFor();
 assert.match(await page.locator("#resultBlock").innerText(),/HIGH_SALINITY/);
 assert.match(await page.locator("#resultBlock").innerText(),/desviado:/);
 console.log("PASS salinidad y desvío documentado");
 await page.locator('[data-view="alarms"]').click();
 assert.ok(await page.locator("#alarmBody tr").count()>0);
 console.log("PASS registro de alarmas");
 await page.locator('[data-view="history"]').click();
 const countBefore=Number(await page.locator("#histCount").innerText());
 assert.ok(countBefore>=2);
 await page.reload({waitUntil:"networkidle"});
 await page.locator('[data-view="history"]').click();
 assert.equal(Number(await page.locator("#histCount").innerText()),countBefore,"persistencia local entre recargas");
 console.log("PASS persistencia local entre recargas");
 const pending=page.waitForEvent("download");
 await page.locator("#exportCsv").click();
 const artifact=await pending;
 assert.match(artifact.suggestedFilename(),/zni-v2-registros.csv/);
 console.log("PASS exportación CSV");
 await page.locator('[data-view="tests"]').click();
 await page.locator("#runTests").click();
 assert.match(await page.locator("#testResults").innerText(),/comprobaciones satisfactorias/);
 assert.equal(errors.length,0,"Errores JS: "+errors.join(" | "));
 console.log("PASS suites y sin errores JS");
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
