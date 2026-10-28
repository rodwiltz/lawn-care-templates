import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:['ignore','pipe','inherit']});
await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(String(d).includes('Development server listening'))resolve();});server.on('exit',c=>reject(Error(`Server exited ${c}`)));});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
const base='http://127.0.0.1:4173/lawn-care-templates/';
let checks=0;
try{
 const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [slug,name,color] of [['green-acres','Green Acres','rgb(36, 76, 56)'],['juniper-yard','Juniper Yard Co.','rgb(49, 75, 96)']]){
  await page.setViewportSize({width:1440,height:1000});
  const res=await page.goto(base+slug+'/');assert.equal(res.status(),200);
  await page.locator('#tagline').waitFor();assert.match(await page.title(),new RegExp(name));
  assert.equal(await page.locator('h1').evaluate(n=>getComputedStyle(n).color),color);
  assert.equal(await page.locator('#reviews').isVisible(),false);
  assert.equal(await page.locator('#socials').textContent(),'');
  assert.equal(await page.locator('#header-phone').isVisible(),false);
  assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex, nofollow, noarchive');
  for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
  await page.evaluate(()=>scrollTo(0,0));
  const imgs=await page.locator('img').evaluateAll(imgs=>imgs.map(i=>({loaded:i.complete&&i.naturalWidth>0,url:i.src})));assert.ok(imgs.every(i=>i.loaded),JSON.stringify(imgs));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  for(const a of await page.locator('a[href^="#"]').all()){const id=await a.getAttribute('href');assert.ok(await page.locator(id).count(),`Missing ${id}`);}
  await mkdir('.test-output',{recursive:true});await page.screenshot({path:`.test-output/${slug}-desktop.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.locator('.menu-toggle').click();assert.equal(await page.locator('#navigation').isVisible(),true);
  await page.locator('#navigation a[href="#services"]').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:`.test-output/${slug}-mobile.png`,fullPage:true});
  await page.locator('.closing [data-book]').click();await page.locator('#request-form').scrollIntoViewIfNeeded();
  await page.locator('#submit-request').click();assert.equal(await page.locator('[name=name]').evaluate(n=>n.validity.valueMissing),true);
  await page.locator('[name=name]').fill('Demo Visitor');await page.locator('[name=phone]').fill('555-123-4567');await page.locator('[name=email]').fill('demo@example.com');await page.locator('[name=address]').fill('00000');await page.locator('[name=service]').selectOption({index:1});
  await page.locator('[name=date]').fill('2099-10-20');await page.locator('[name=time]').selectOption({index:1});
  let network=0;const record=r=>{if(['fetch','xhr'].includes(r.resourceType())||r.method()==='POST')network++;};page.on('request',record);
  await page.locator('#submit-request').click();assert.match(await page.locator('#form-status').textContent(),/Nothing was sent or saved/);assert.equal(network,0);page.off('request',record);
  assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);assert.equal((await context.cookies()).length,0);assert.equal(await page.locator('[name=name]').inputValue(),'');
  await page.locator('summary').first().click();assert.equal(await page.locator('details').first().getAttribute('open'),'');
  checks++;
 }
 // Inject isolated fixtures into the served HTML, exercising the same runtime without changing the business files.
 async function fixture(update){
  await page.route('**/fixture/',async route=>{const response=await context.request.get(base+'green-acres/');let html=await response.text();html=html.replace(/(<script id="business-config" type="application\/json">)(.*?)(<\/script>)/s,(_,a,b,c)=>a+JSON.stringify({...JSON.parse(b),...update}).replaceAll('<','\\u003c')+c);await route.fulfill({contentType:'text/html',body:html});});await page.goto(base+'fixture/');await page.locator('#tagline').waitFor();
 }
 await fixture({booking:{mode:'external',url:'https://example.com/schedule'},gallery:[],services:[],faqs:[],hours:'',benefits:[],testimonials:[],heroImage:''});
 assert.equal(await page.locator('#request-form').isVisible(),false);assert.equal(await page.locator('#external-booking').isVisible(),true);assert.equal(await page.locator('[data-book]').first().getAttribute('href'),'https://example.com/schedule');assert.equal(await page.locator('#gallery').isVisible(),false);assert.equal(await page.locator('#services').isVisible(),false);assert.equal(await page.locator('#faq').isVisible(),false);assert.equal(await page.locator('#hours').isVisible(),false);checks++;
 await page.unroute('**/fixture/');
 await fixture({booking:{mode:'request',endpoint:'https://example.com/request'},comparisons:[{title:'Sample comparison',before:'assets/garden.webp',after:'assets/garden.webp'}],testimonials:[{verified:true,name:'Verified fixture',quote:'Fixture only'}]});
 assert.equal(await page.locator('#reviews').isVisible(),true);await page.locator('input[type=range]').fill('70');assert.match(await page.locator('.comparison-before').getAttribute('style'),/30%/);
 async function fillRequest(){await page.locator('[name=name]').fill('Test Person');await page.locator('[name=phone]').fill('555-123-4567');await page.locator('[name=email]').fill('demo@example.com');await page.locator('[name=address]').fill('00000');await page.locator('[name=service]').selectOption({index:1});await page.locator('[name=date]').fill('2099-10-20');await page.locator('[name=time]').selectOption({index:1});}
 await page.route('https://example.com/request',r=>r.fulfill({status:500,body:'error'}));await fillRequest();await page.locator('#submit-request').click();await page.getByText('Your request could not be sent.',{exact:false}).waitFor();assert.equal(await page.locator('[name=name]').inputValue(),'Test Person');
 await page.unroute('https://example.com/request');await page.route('https://example.com/request',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));await page.locator('#submit-request').click();await page.getByText('Request received by the form provider.',{exact:false}).waitFor();assert.match(await page.locator('#form-status').textContent(),/not confirmed/);checks++;
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#hero-image').evaluate(n=>getComputedStyle(n).animationName),'none');
 assert.deepEqual(errors,[]);console.log(`Passed ${checks} browser scenarios: desktop/mobile brands, demo privacy, external mode, optional sections, request failure/success, comparison, reviews, reduced motion.`);
}finally{await browser.close();server.kill();}
