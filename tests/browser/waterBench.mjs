import {chromium} from "playwright";
import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
const browser=await chromium.launch({headless:true});
const guid=n=>"00000000-0000-0000-0000-"+String(n).padStart(12,"0");
const area=guid(1),station=guid(2),req=guid(3),camera=guid(4),salinity=guid(5);
const media=[10,11,12,13,14,15].map(n=>({id:guid(n),deviceId:camera,fileName:"fixture-"+n+".png",createdAt:"2026-01-01T00:00:00Z",contentType:"image/png",sizeBytes:100}));
const batch={stationId:station,bootId:"0123456789abcdef",firmwareBatchId:"abcdef0123456789",createdAt:"2026-01-01T00:00:00Z",start:{mode:"manual"}};
const p={requestId:req,action:"estimate",reason:"fixture",calibrationId:area,reagentLot:"lot",reactionSeconds:300,salinityPpt:15,sampleSource:"RAS_RETURN",operatorConditionsConfirmed:true};
const assessment=(a,unit)=>({id:guid(a==="NO2"?20:21),status:"estimate_review_required",estimatedValue:1.2,unit,holdoutError:.1});
const base="http://127.0.0.1:5173";
let sent=null,calibration=null,ammonia=null,review=null,publication=null,recoveryReads=0;
let page,diagnosticPage;
let releaseCalibration;
const calibrationResponseGate=new Promise(resolve=>{releaseCalibration=resolve;});
const pageErrors=[],requestFailures=[];
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
 diagnosticPage=page;
 page.on("pageerror",e=>pageErrors.push(e.message));
 page.on("requestfailed",r=>{if(r.failure()?.errorText!=="net::ERR_ABORTED")requestFailures.push({url:r.url(),error:r.failure()?.errorText});});
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
   else if(path.endsWith("/calibrations")&&method==="POST"){calibration=request.postDataJSON();await calibrationResponseGate;data={id:guid(30)};}
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
 const wizard=page.getByTestId("calibration-wizard");
 await wizard.locator("summary").click();
 const cameraPicker=wizard.getByTestId("calibration-camera");
 await cameraPicker.locator('option[value="'+camera+'"]').waitFor({state:"attached"});
 await cameraPicker.selectOption(camera);
 assert.equal(await cameraPicker.inputValue(),camera);
 const roiPicker=wizard.getByTestId("roi-image-picker");
 await roiPicker.waitFor({state:"visible"});
 assert.equal(await roiPicker.getAttribute("aria-label"),"ROI image");
 await roiPicker.locator('option[value="'+media[0].id+'"]').waitFor({state:"attached"});
 await roiPicker.selectOption(media[0].id);
 assert.equal(await roiPicker.inputValue(),media[0].id);
 const canvas=wizard.getByTestId("roi-canvas");
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
   await wizard.getByTestId("media-"+label.toLowerCase().replaceAll(" ","-")).selectOption(media[i].id);
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
 const ammoniaPanel=page.getByTestId("ammonia-panel");
 const method=ammoniaPanel.getByLabel("Ammonia method");
 const reading=ammoniaPanel.getByTestId("salinity-measurement");
 const reason=ammoniaPanel.getByTestId("ammonia-reason");
 const same=ammoniaPanel.getByTestId("ammonia-same-source");
 const basis=ammoniaPanel.getByTestId("ammonia-confirm-basis");
 await method.selectOption("equilibrium");
 await reading.selectOption(salinity);
 await reason.fill("same sample fixture");
 await same.check();await basis.check();
 // Calibration success used to unmount the batch form and lose these inputs.
 releaseCalibration();
 const resetWizard=page.getByTestId("calibration-wizard");
 await resetWizard.locator("summary").waitFor({state:"visible"});
 await page.waitForFunction(()=>{const x=document.querySelector('[data-testid="calibration-wizard"]');return x&&!x.open;});
 assert.equal(await method.inputValue(),"equilibrium");
 assert.equal(await reading.inputValue(),salinity);
 assert.equal(await reason.inputValue(),"same sample fixture");
 assert.equal(await same.isChecked(),true);assert.equal(await basis.isChecked(),true);
 await basis.uncheck();
 await ammoniaPanel.getByTestId("ammonia-submit").click();
 await page.getByRole("alert").filter({hasText:"Confirm actual measurand and unit"}).waitFor();
 assert.equal(ammonia,null,"missing attestation must prevent submission");
 await basis.check();
 await ammoniaPanel.getByTestId("ammonia-submit").click();
 await wait(()=>ammonia,"ammonia payload not submitted");
 assert.equal(ammonia.salinityMeasurementId,salinity);assert.equal(ammonia.method,"equilibrium");
 assert.equal(ammonia.sameSampleSourceConfirmed,true);assert.equal(ammonia.measurandConfirmed,true);
 console.log("PASS qualified salinity selection and ammonia request");
 const panel=page.getByTestId("review-panel-NO2");
 await panel.getByLabel("NO2 review decision").selectOption("approved");
 await panel.getByLabel("Review reason",{exact:true}).fill("independent fixture");
 await panel.getByTestId("review-image-NO2").selectOption(media[5].id);
 await panel.getByLabel("Reference value (mg/L NO2)",{exact:true}).fill("1.1");
 await panel.getByLabel("Reference method",{exact:true}).fill("lab fixture");
 await panel.getByLabel("Confirm independent reference, same sample and unit",{exact:true}).check();
 assert.equal(await panel.getByRole("button",{name:"Publish record",exact:true}).count(),0);
 await panel.getByRole("button",{name:"Record review",exact:true}).click();
 await wait(()=>review,"review not submitted");
 assert.equal(review.referenceMediaId,media[5].id);assert.equal(review.referenceValue,1.1);assert.equal(review.referenceUnit,"mg/L NO2");
 const publishPanel=page.getByTestId("review-panel-NO2");
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
 const system=await browser.newPage();
 diagnosticPage=system;
 const forbiddenSystemRequests=[],systemErrors=[];
 system.on("pageerror",e=>systemErrors.push(e.message));
 system.on("request",r=>{const path=new URL(r.url()).pathname;if(/^\/api\/areas\/[^/]+\/(water-bench|water-analysis)(\/|$)/.test(path))forbiddenSystemRequests.push(r.method()+" "+path);});
 await system.addInitScript(()=>{
   localStorage.setItem("accessToken","synthetic");localStorage.setItem("refreshToken","synthetic");
   localStorage.setItem("user",JSON.stringify({id:"system",role:"SystemAdministrator",fullName:"CI"}));
   localStorage.setItem("crabsense-settings",JSON.stringify({language:"en",refreshInterval:30,alertsEnabled:true}));
 });
 let technicalReads=0;
 await system.route("**/api/**",async route=>{
   const request=route.request(),url=new URL(request.url());
   if(/^\/api\/areas\/[^/]+\/(water-bench|water-analysis)(\/|$)/.test(url.pathname))return route.fulfill({status:403,json:{success:false,message:"Forbidden"}});
   if(url.pathname==="/api/system/water-bench/stations"){
     technicalReads++;
     assert.equal(request.method(),"GET");
     assert.equal(request.headers()["authorization"],"Bearer synthetic");
     assert.equal(url.searchParams.get("page"),"1");
     return route.fulfill({json:{success:true,data:{source:"persisted_technical_metadata",chemicalDataIncluded:false,
       commandsEnabled:false,liveHardwareVerified:false,attemptCountsAreHistorical:true,windowHours:24,
       generatedAt:"2026-11-27T00:00:00Z",windowStart:"2026-11-26T00:00:00Z",page:1,pageSize:25,total:1,
       items:[{id:station,kioskId:camera,kioskCode:"KIOSK-TECH-CI",configurationVersion:2,stationRevoked:false,
       technicalReceiptFreshness:"stale",technicalReceipts24h:4,cameraErrors24h:1,clockObservations24h:2,
       retryableFailures24h:1,contractBlocked24h:2,expiredRunningLeases24h:1,activeRunningLeases24h:0,
       requestJson:"PRIVATE_FIXTURE",candidateValue:999}]}}});
   }
   if(url.pathname==="/api/auth/me")return route.fulfill({json:{success:true,data:{id:"system",role:"SystemAdministrator"}}});
   assert.equal(request.method(),"GET");
   return route.fulfill({json:{success:true,data:[]}});
 });
 await system.goto(base+"/system/water-bench");
 await system.getByText("KIOSK-TECH-CI",{exact:true}).waitFor({timeout:20000});
 assert.ok(technicalReads>=1);
 assert.equal(await system.getByText("PRIVATE_FIXTURE",{exact:false}).count(),0);
 assert.equal(await system.getByRole("button",{name:/publish|calibrat|retry AI/i}).count(),0);
 console.log("PASS System Admin technical workspace read-only");
 await system.goto(base+"/water-bench");
 await system.waitForURL(url=>url.pathname==="/system",{timeout:15000});
 assert.equal(await system.getByRole("button",{name:"Retry original request",exact:true}).count(),0);
 assert.equal(await system.getByTestId("calibration-wizard").count(),0);
 assert.deepEqual(forbiddenSystemRequests,[],"System Admin must not issue farm WaterBench or calibration requests");
 assert.equal(await system.evaluate(()=>JSON.parse(localStorage.getItem("user")).role),"SystemAdministrator");
 assert.deepEqual(systemErrors,[]);
 console.log("PASS System Admin denied farm workspace and API dispatch; redirected to /system");
 await system.close();
 const farm=await browser.newPage();
 diagnosticPage=farm;
 const forbiddenFarmRequests=[];
 farm.on("request",r=>{if(new URL(r.url()).pathname.startsWith("/api/system/water-bench"))forbiddenFarmRequests.push(r.method()+" "+r.url());});
 await farm.addInitScript(({area})=>{
   localStorage.setItem("accessToken","synthetic");localStorage.setItem("refreshToken","synthetic");
   localStorage.setItem("user",JSON.stringify({id:area,role:"FarmAdministrator",fullName:"CI"}));
   localStorage.setItem("crabsense:selectedFarmingAreaId",area);
   localStorage.setItem("crabsense-settings",JSON.stringify({language:"en",refreshInterval:30,alertsEnabled:true}));
 },{area});
 await farm.route("**/api/**",route=>{
   const path=new URL(route.request().url()).pathname;
   if(path.startsWith("/api/system/water-bench"))return route.fulfill({status:403,json:{success:false,message:"Forbidden"}});
   const data=path==="/api/auth/me"?{id:area,role:"FarmAdministrator",fullName:"CI"}:
     path==="/api/farming-areas"?[{id:area,name:"CI area"}]:[];
   return route.fulfill({json:{success:true,data}});
 });
 await farm.goto(base+"/system/water-bench");
 await farm.waitForURL(url=>url.pathname==="/dashboard",{timeout:15000});
 assert.equal(await farm.getByRole("heading",{name:"WaterBench diagnostics",exact:true}).count(),0);
 assert.deepEqual(forbiddenFarmRequests,[],"Farm Admin must not issue platform WaterBench requests");
 assert.equal(await farm.evaluate(()=>JSON.parse(localStorage.getItem("user")).role),"FarmAdministrator");
 await farm.close();
 diagnosticPage=page;
 console.log("PASS Farm Admin denied technical workspace and API dispatch; redirected to /dashboard");
 console.log("PASS platform technical diagnostics and cross-role denial");
}catch(error){
 await mkdir("tests/browser/artifacts",{recursive:true});
 if(diagnosticPage){
   await diagnosticPage.screenshot({path:"tests/browser/artifacts/failure.png",fullPage:true}).catch(()=>{});
   await writeFile("tests/browser/artifacts/diagnostics.json",JSON.stringify({pageErrors,requestFailures,url:diagnosticPage.url(),body:await diagnosticPage.locator("body").innerText().catch(()=>"")},null,2));
 }
 throw error;
}finally{releaseCalibration?.();await browser.close();}
