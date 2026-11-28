import {chromium} from "playwright";
import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
const guid=n=>"00000000-0000-0000-0000-"+String(n).padStart(12,"0");
const a=guid(1),b=guid(2),outside=guid(3),actor=guid(4);
const base="http://127.0.0.1:5173";
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const errors=[],requests=[],routeErrors=[];
let blockA=false,heldA=false,releaseA,blockNew=false,heldNew=false,releaseNew,deny=false;
const aGate=new Promise(r=>{releaseA=r;});
const newGate=new Promise(r=>{releaseNew=r;});
page.on("pageerror",e=>errors.push(e.message));
const readings=(area,token)=>{
  const now=Date.now();
  const row=(id,code,value,extra={})=>({sensorId:guid(id),farmingAreaId:area,sensorCode:code,
    sensorType:"Salinity",unit:"ppt",latestValue:value,isActive:true,dataQuality:"Realtime",
    latestMeasuredAt:new Date(now-2000).toISOString(),lastReceivedAt:new Date(now-1000).toISOString(),
    status:"Online",minThreshold:0,maxThreshold:30,...extra});
  return area===a?[row(10,"RAS-A-IN",0),row(11,"RAS-A-OUT",18),
    row(12,"WRONG-AREA",99,{farmingAreaId:outside}),row(13,"CHEMISTRY",99,{sensorType:"NO2",unit:"mg/L"}),
    row(14,"MISSING-READING",null)]:[row(20,token==="synthetic-new"?"RAS-B-NEW":"RAS-B",24)];
};
const wait=async(fn,message)=>{for(let i=0;i<200;i++){if(await fn())return;await new Promise(r=>setTimeout(r,100));}throw new Error(message);};
const cards=page.getByTestId("ras-sensor");
const has=code=>cards.filter({hasText:code}).count().then(n=>n===1);
const none=()=>cards.count().then(n=>n===0);
const selected=async name=>{
  await page.getByRole("button",{name:"FARMING AREA",exact:true}).click();
  await page.getByRole("button",{name:new RegExp(name)}).click();
};
try{
  await page.addInitScript(({actor,a})=>{
    localStorage.setItem("accessToken","synthetic-old");
    localStorage.setItem("refreshToken","synthetic");
    localStorage.setItem("user",JSON.stringify({id:actor,role:"FarmAdministrator",fullName:"RAS CI"}));
    localStorage.setItem("crabsense:selectedFarmingAreaId",a);
    localStorage.setItem("crabsense-settings",JSON.stringify({language:"en",refreshInterval:300,alertsEnabled:true}));
  },{actor,a});
  await page.route("**/api/**",async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname;
    if(path==="/api/iot/live"){
      const area=url.searchParams.get("farmingAreaId"),auth=req.headers().authorization;
      requests.push({area,auth,method:req.method(),query:[...url.searchParams.keys()]});
      try{
        assert.ok([a,b].includes(area));assert.equal(req.method(),"GET");
        assert.deepEqual([...url.searchParams.keys()],["farmingAreaId"]);
        assert.ok(["Bearer synthetic-old","Bearer synthetic-new"].includes(auth));
        if(area===a&&blockA){heldA=true;await aGate;}
        if(auth==="Bearer synthetic-new"&&blockNew){heldNew=true;await newGate;}
        if(deny)return await route.fulfill({status:403,json:{success:false,message:"Forbidden"}});
        return await route.fulfill({json:{success:true,data:readings(area,auth.slice(7))}});
      }catch(e){if(!/aborted|closed|interception|handled/i.test(String(e)))routeErrors.push(String(e));}
      return;
    }
    if(path==="/api/dashboard/metrics"||path==="/api/auth/refresh"){
      routeErrors.push("Unexpected legacy or refresh request "+path);
      return route.fulfill({status:500,json:{success:false}});
    }
    let data=[];
    if(path==="/api/auth/me")data={id:actor,role:"FarmAdministrator",fullName:"RAS CI"};
    else if(path==="/api/farming-areas")data=[{id:a,name:"RAS Area Alpha",boxCount:2},{id:b,name:"RAS Area Beta",boxCount:2}];
    else if(path==="/api/dashboard/overview")data={totalBoxes:2,totalCrabs:1,activeBoxes:1,openAlerts:0,iotOnlinePercentage:100,lastUpdated:new Date().toISOString()};
    else if(path==="/api/boxes/overview")data={items:[],summary:null,areaDevices:{totalCount:1,onlineCount:1},areaWater:{salinity:999},syncedAt:new Date().toISOString()};
    await route.fulfill({json:{success:true,data}});
  });
  await page.goto(base+"/dashboard");
  await wait(()=>has("RAS-A-IN"),"Dashboard did not show area A");
  assert.equal(await cards.count(),2);
  assert.match(await cards.filter({hasText:"RAS-A-IN"}).innerText(),/0 ppt/);
  assert.equal(await cards.filter({hasText:/WRONG-AREA|CHEMISTRY|MISSING-READING/}).count(),0);
  console.log("PASS RAS dashboard separate sensors, actual zero, wrong-scope and chemistry excluded");
  blockA=true;
  await wait(()=>heldA,"No delayed area A request observed");
  await selected("RAS Area Beta");
  await wait(()=>has("RAS-B"),"Area B did not render during delayed A");
  releaseA();blockA=false;
  await page.waitForTimeout(1200);
  assert.equal(await cards.count(),1);assert.ok(await has("RAS-B"));
  console.log("PASS RAS area change discards delayed previous-area response");
  await selected("All Farming Areas");
  await page.getByText("Chọn một khu cụ thể để xem phép đo.",{exact:true}).waitFor();
  assert.ok(await none());
  const count=requests.length;
  await page.waitForTimeout(5500);
  assert.equal(requests.length,count,"All areas must not request live water");
  await selected("RAS Area Beta");
  await wait(()=>has("RAS-B"),"Area B did not restore");
  console.log("PASS RAS All Areas shows no aggregate or live query");
  await context.setOffline(true);
  await wait(none,"Offline readings did not clear");
  await context.setOffline(false);
  await wait(()=>has("RAS-B"),"Reconnect did not revalidate area B");
  console.log("PASS RAS offline clear and reconnect revalidation");
  blockNew=true;
  await page.evaluate(()=>{localStorage.setItem("accessToken","synthetic-new");window.dispatchEvent(new StorageEvent("storage",{key:"accessToken"}));});
  await wait(()=>heldNew,"No new credential request");
  await wait(none,"Old session readings remain");
  releaseNew();blockNew=false;
  await wait(()=>has("RAS-B-NEW"),"New credential readings did not appear");
  deny=true;
  await wait(none,"403 did not clear live data");
  deny=false;
  await wait(()=>has("RAS-B-NEW"),"Recovery after 403 did not revalidate");
  console.log("PASS RAS credential rotation, forbidden response and revalidation");
  await page.goto(base+"/monitoring");
  await wait(()=>has("RAS-A-IN"),"Monitoring did not render area A");
  assert.equal(await cards.count(),2);
  await selected("RAS Area Beta");
  await wait(()=>has("RAS-B"),"Monitoring did not switch area");
  assert.equal(await cards.count(),1);
  await selected("All Farming Areas");
  await page.getByText("Chọn một khu cụ thể để xem phép đo.",{exact:true}).waitFor();
  assert.ok(await none());
  assert.deepEqual(routeErrors,[]);assert.deepEqual(errors,[]);
  console.log("PASS RAS monitoring uses the same scoped cards and no all-area aggregation");
}catch(error){
  await mkdir("tests/browser/artifacts",{recursive:true});
  await page.screenshot({path:"tests/browser/artifacts/ras-failure.png",fullPage:true}).catch(()=>{});
  await writeFile("tests/browser/artifacts/ras-diagnostics.json",JSON.stringify({errors,routeErrors,requests,url:page.url(),body:await page.locator("body").innerText().catch(()=>"")},null,2));
  throw error;
}finally{releaseA();releaseNew();await browser.close();}
