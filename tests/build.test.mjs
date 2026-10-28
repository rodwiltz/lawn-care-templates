import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,readdir,stat,mkdtemp,rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build,validate,root } from '../scripts/build.mjs';
const sample=JSON.parse(await readFile(path.join(root,'businesses/green-acres.json')));
test('build emits distinct previews, no-index, relative assets and safe embedded config',async()=>{
 const out=await mkdtemp(path.join(os.tmpdir(),'lawn-test-'));
 try {
  await build(out);
  const home=await readFile(path.join(out,'index.html'),'utf8');
  assert.match(home,/noindex, nofollow/);
  assert.match(home,/href="assets\/styles.css"/);
  for(const f of (await readdir(path.join(root,'businesses'))).filter(f=>f.endsWith('.json'))){
   const c=JSON.parse(await readFile(path.join(root,'businesses',f)));
   const html=await readFile(path.join(out,c.slug,'index.html'),'utf8');
   const embedded=JSON.parse(html.match(/<script id="business-config" type="application\/json">(.*?)<\/script>/s)[1]);assert.equal(embedded.name,c.name);
   assert.match(html,/src="..\/assets\/app.js"/);assert.equal(html.includes('{{'),false);
   for(const asset of [c.heroImage,...c.gallery.map(g=>g.image)]) assert.ok((await stat(path.join(out,asset))).size>100);
  }
 }finally{await rm(out,{recursive:true,force:true});}
});
test('booking modes fail closed without HTTPS configuration',()=>{
 for(const [mode,field] of [['external','url'],['request','endpoint']]){
  assert.throws(()=>validate({...sample,booking:{mode,[field]:''}}));
  assert.throws(()=>validate({...sample,booking:{mode,[field]:'javascript:alert(1)'}}));
  assert.doesNotThrow(()=>validate({...sample,booking:{mode,[field]:'https://example.com/booking'}}));
 }
 assert.throws(()=>validate({...sample,booking:{mode:'unknown'}}));
});
test('invalid brand colors, unsafe asset paths, and invented reviews are rejected',()=>{
 assert.throws(()=>validate({...sample,primaryColor:'red; color: black'}));
 assert.throws(()=>validate({...sample,heroImage:'../../secret'}));
 assert.throws(()=>validate({...sample,testimonials:[{quote:'Great',name:'Invented'}]}));
 assert.doesNotThrow(()=>validate({...sample,testimonials:[{quote:'Actual customer quote',name:'Consenting customer',verified:true}]}));
});
