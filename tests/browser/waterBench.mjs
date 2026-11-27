import {chromium} from "playwright";
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
const browser=await chromium.launch({headless:true});
const guid=n=>"00000000-0000-0000-0000-"+String(n).padStart(12,"0");
const area=guid(1),station=guid(2),req=guid(3),camera=guid(4),salinity=guid(5);
const media=[10,11,12,13,14,15].map(n=>({id:guid(n),deviceId:camera,fileName:"fixture-"+n+".png",createdAt:"2026-01-01T00:00:00Z",contentType:"image/png",sizeBytes:100}));
const batch={stationId:station,bootId:"0123456789abcdef",firmwareBatchId:"abcdef0123456789",createdAt:"2026-01-01T00:00:00Z",start:{mode:"manual"}};
const p={requestId:req,action:"estimate",reason:"fixture",calibrationId:area,reagentLot:"lot",reactionSeconds:300,salinityPpt:15,sampleSource:"RAS_RETURN",operatorConditionsConfirmed:true};
const assessment=(a,unit)=>({id:guid(a==="NO2"?20:21),status:"estimate_review_required",estimatedValue:1.2,unit,holdoutError:.1});
const base="http://127.0.0.1:5173";
let sent=null,calibration=null,ammonia=null,review=null,publication=null,recoveryReads=0;
let page;
try{
 // Generate a deterministic test image in a real browser; never fetch a production asset.
 const fixture=await browser.newPage();
 const png=Buffer.from(await fixture.evaluate(()=>{
   const c=document.createElement("canvas");c.width=160;c.height=120;
   const x=c.getContext("2d");x.fillStyle="#ddd";x.fillRect(0,0,160,120);x.fillStyle="#879f4c";x.fillRect(16,12,40,36);
   return c.toDataURL("image/png").split(",")[1];
 }),"base64");
 await fixture.close();
 page=await browser.newPage({viewport:{width:1440,height:1000}});
 const pageErrors=[];
 page.on("pageerror",e=>pageErrors.push(e.message));
 await page.addInitScript(({area})=>{
   localStorage.setItem("accessToken","synthetic");localStorage.setItem("refreshToken","synthetic");
   localStorage.setItem("user",JSON.stringify({id:area,role:"FarmAdministrator",fullName:"CI"}));
   localStorage.setItem("crabsense:selectedFarmingAreaId",area);
   localStorage.setItem("crabsense-settings",JSON.stringify({language:"en",refreshInterval:30,alertsEnabled:true}));
   sessionStorage.clear();
 },{area});
 await page.route("**/api/**",async route=>{
   const request=route.request(),url=new URL(request.url()),path=url.pathname,method=request.method();
   let data=[];
   if(path.endsWith("/content")&&method==="GET"){
     assert.ok(media.some(m=>path==="/api/media/"+m.id+"/content"));
     assert.equal(request.headers()["authorization"],"Bearer synthetic");
     return route.fulfill({status:200,contentType:"image/png",body:png});
   }
   if(path.endsWith("/farming-areas"))data=[{id:area,name:"CI area"}];
   else if(path.endsWith("/auth/me"))data={id:area,role:"FarmAdministrator",fullName:"CI"};
   else if(path.endsWith("/station"))data=null;
   else if(path.endsWith("/batches"))data=[batch];
   else if(path.endsWith("/ai-readiness"))data={channels:[{analyte:"NO2",status:sent?"already_assessed":"operator_confirmation_required",calibrationId:area,reagentLot:"lot",unit:"mg/L NO2",reactionSeconds:300,timingToleranceSeconds:20,minSalinityPpt:10,maxSalinityPpt:20},{analyte:"NH3",status:"already_assessed"}]};
   else if(path.endsWith("/retry-status"))data={channels:[{analyte:"NO2",status:sent?"estimate_review_required":"retry_available",requestId:req,attempts:1,maxAttempts:3},{analyte:"NH3",status:"estimate_review_required",attempts:1,maxAttempts:3}]};
   else if(path.endsWith("/results"))data={channels:[{analyte:"NO2",sessionId:"s",status:sent?"estimate_review_required":"awaiting_assessment",assessment:sent?assessment("NO2","mg/L NO2"):null},{analyte:"NH3",sessionId:"n",status:"estimate_review_required",assessment:assessment("NH3","mg/L TAN-N")}]};
   else if(path.endsWith("/receipts"))data={total:1,mediaCount:1};
   else if(path.endsWith("/retry-request")){recoveryReads++;data=p;}
   else if(path.endsWith("/assessment")&&method==="POST"){sent=request.postDataJSON();data={status:"estimate_review_required"};}
   else if(path.endsWith("/admin-media")){
     assert.ok(path.includes("/areas/"+area+"/"));
     if(url.searchParams.has("cameraId"))assert.equal(url.searchParams.get("cameraId"),camera);
     data={cameras:[{id:camera,deviceCode:"CI camera"}],items:media,total:media.length};
   }
   else if(path.endsWith("/calibrations")&&method==="POST"){calibration=request.postDataJSON();data={id:guid(30)};}
   else if(path.endsWith("/salinity-candidates"))data={sampleAt:"2026-01-01T00:00:00Z",items:[{measurementId:salinity,value:15,sensorCode:"SAL-CI",installationLocation:"RAS",differenceSeconds:1}]};
   else if(path.endsWith("/ammonia-reference")&&method==="POST"){ammonia=request.postDataJSON();data={status:"estimated"};}
   else if(path.endsWith("/NO2/review")&&method==="POST"){review=request.postDataJSON();data=review;}
   else if(path.endsWith("/NO2/publish")&&method==="POST"){publication=request.postDataJSON();data={value:review.referenceValue,unit:review.referenceUnit};}
   else if(path.endsWith("/NO2/review"))data={status:publication?"published":review?"approved":"pending_review",review,publication:publication?{value:review.referenceValue,unit:review.referenceUnit}:null};
   else if(path.endsWith("/NH3/review"))data={status:"pending_review"};
   else if(path.endsWith("/"+batch.firmwareBatchId))data={timeline:{status:"firmware_complete_reported",mode:"manual"}};
   else if(method!=="GET")throw new Error("Unexpected mutation: "+method+" "+path);
   await route.fulfill({json:{success:true,data}});
 });
 const wait=async(fn,message)=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,100));}throw new Error(message);};
 await page.goto(base+"/water-bench");
 const retry=page.getByRole("button",{name:"Retry original request",exact:true});
 await retry.waitFor({timeout:20000});await retry.click();
 await wait(()=>sent,"retry request not submitted");
 assert.equal(recoveryReads,1);assert.deepEqual(sent,p,"fresh tab must recover exact server body");
 await page.getByLabel("NO2 review decision").waitFor();
 console.log("PASS original retry recovery");
 // Select a stored image and draw all three ROIs in image coordinates.
 await page.getByText("Guided calibration",{exact:true}).click();
 await page.getByLabel("Calibration camera").selectOption(camera);
 await page.getByLabel("ROI image",{exact:true}).selectOption(media[0].id);
 const canvas=page.locator('svg[aria-label="ROI canvas"]');
 await canvas.waitFor();await canvas.scrollIntoViewIfNeeded();
 const regions=[["sample",.10,.10,.35,.40],["reference",.55,.10,.85,.40],["anchor",.55,.55,.85,.90]];
 for(const [kind,x1,y1,x2,y2] of regions){
   await page.getByRole("button",{name:kind,exact:true}).click();
   await canvas.scrollIntoViewIfNeeded();const b=await canvas.boundingBox();assert.ok(b);
   await page.mouse.move(b.x+b.width*x1,b.y+b.height*y1);await page.mouse.down();
   await page.mouse.move(b.x+b.width*x2,b.y+b.height*y2,{steps:6});await page.mouse.up();
   const r=page.getByTestId("roi-"+kind);
   assert.ok(Number(await r.getAttribute("width"))>=16);
   assert.ok(Number(await r.getAttribute("height"))>=16);
 }
 await page.getByLabel("Reagent lot",{exact:true}).fill("CI lot");
 await page.getByLabel("Kit revision",{exact:true}).fill("CI revision");
 await page.getByLabel("Valid until",{exact:true}).fill("2026-12-15T12:00");
 const labels=["Standard 1","Standard 2","Standard 3","Independent holdout"];
 for(let i=0;i<labels.length;i++){
   const label=labels[i];
   await page.getByLabel(label,{exact:true}).selectOption(media[i].id);
   await page.getByLabel(label+" concentration",{exact:true}).fill(String([0,1,2,.5][i]));
   await page.getByLabel(label+" reactionSeconds",{exact:true}).fill("300");
   await page.getByLabel(label+" salinityPpt",{exact:true}).fill("15");
 }
 for(const [label,value] of Object.entries({reactionSeconds:"300",timingToleranceSeconds:"20",sampleVolumeMl:"5",procedure:"fixture",minSalinityPpt:"10",maxSalinityPpt:"20",maxValidationError:".1"}))
   await page.getByLabel(label,{exact:true}).fill(value);
 await page.getByRole("button",{name:"Create calibration",exact:true}).click();
 await wait(()=>calibration,"calibration payload not submitted");
 assert.equal(calibration.cameraDeviceId,camera);assert.equal(calibration.protocol.width,160);assert.equal(calibration.protocol.height,120);
 assert.ok(Math.abs(calibration.protocol.sample.x-16)<=1);assert.ok(Math.abs(calibration.protocol.sample.width-40)<=1);
 assert.equal(calibration.standards.length,3);assert.equal(calibration.validation.mediaId,media[3].id);
 assert.ok(calibration.protocol.geometryPolicy.anchor.width>=16);
 console.log("PASS private image picker, ROI drag, independent standards payload");
 // Only qualified readings are offered; submit selected measurement with attestations.
 await page.getByLabel("Ammonia method").selectOption("equilibrium");
 await page.getByLabel("Salinity measurement").selectOption(salinity);
 await page.getByLabel("Reason",{exact:true}).fill("same sample fixture");
 await page.getByLabel("Confirm same sample source",{exact:true}).check();
 await page.getByLabel("Confirm actual measurand and unit",{exact:true}).check();
 await page.getByRole("button",{name:"Create NH3 reference",exact:true}).click();
 await wait(()=>ammonia,"ammonia payload not submitted");
 assert.equal(ammonia.salinityMeasurementId,salinity);assert.equal(ammonia.method,"equilibrium");
 assert.equal(ammonia.sameSampleSourceConfirmed,true);assert.equal(ammonia.measurandConfirmed,true);
 console.log("PASS qualified salinity selection and ammonia request");
 const panel=page.locator("section").filter({has:page.getByRole("heading",{name:"NO2 · Review and publish record",exact:true})}).filter({has:page.getByLabel("NO2 review decision")}).last();
 await panel.getByLabel("NO2 review decision").selectOption("approved");
 await panel.getByLabel("Review reason",{exact:true}).fill("independent fixture");
 await panel.getByLabel("Independent reference image",{exact:true}).selectOption(media[5].id);
 await panel.getByLabel("Reference value (mg/L NO2)",{exact:true}).fill("1.1");
 await panel.getByLabel("Reference method",{exact:true}).fill("lab fixture");
 await panel.getByLabel("Confirm independent reference, same sample and unit",{exact:true}).check();
 assert.equal(await panel.getByRole("button",{name:"Publish record",exact:true}).count(),0);
 await panel.getByRole("button",{name:"Record review",exact:true}).click();
 await wait(()=>review,"review not submitted");
 assert.equal(review.referenceMediaId,media[5].id);assert.equal(review.referenceValue,1.1);assert.equal(review.referenceUnit,"mg/L NO2");
 const publishPanel=page.getByRole("heading",{name:"NO2 · Review and publish record",exact:true}).locator("..");
 await publishPanel.getByLabel("Publication reason",{exact:true}).fill("approved fixture");
 page.once("dialog",d=>d.accept());
 await publishPanel.getByRole("button",{name:"Publish record",exact:true}).click();
 await wait(()=>publication,"publication not submitted");
 await publishPanel.getByText(/Published WaterBench record: 1.1 mg\/L NO2/).waitFor();
 assert.equal(publication.reason,"approved fixture");assert.deepEqual(pageErrors,[]);
 console.log("PASS independent review and explicit publication");
 for(const role of ["FarmStaff","FarmManager"]){
   const denied=await browser.newPage();
   await denied.addInitScript(role=>{localStorage.setItem("accessToken","synthetic");localStorage.setItem("refreshToken","synthetic");localStorage.setItem("user",JSON.stringify({role}));},role);
   await denied.goto(base+"/water-bench");await denied.waitForURL("**/login",{timeout:15000});await denied.close();
 }
 console.log("PASS Staff and Manager web denial");
}catch(error){
 await mkdir("tests/browser/artifacts",{recursive:true});
 if(page){await page.screenshot({path:"tests/browser/artifacts/failure.png",fullPage:true}).catch(()=>{});}
 throw error;
}finally{await browser.close();}
