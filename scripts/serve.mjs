import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { build, root } from './build.mjs';
await build();
const base='/lawn-care-templates/';
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
http.createServer(async(req,res)=>{
 try {
  let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(url==='/' || url==='/lawn-care-templates') {res.writeHead(302,{Location:base});return res.end();}
  if(!url.startsWith(base)) throw Error();
  let file=path.resolve(root,'dist','.'+url.slice(base.length-1));
  if(!file.startsWith(path.join(root,'dist')+path.sep) && file!==path.join(root,'dist')) throw Error();
  if((await stat(file)).isDirectory()) {if(!url.endsWith('/')) {res.writeHead(302,{Location:url+'/'});return res.end();} file=path.join(file,'index.html');}
  const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(body);
 }catch {res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT||4173),'0.0.0.0',()=>console.log('Development server listening on port '+(process.env.PORT||4173)));
