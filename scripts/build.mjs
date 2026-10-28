import { readFile, readdir, mkdir, cp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function validate(c) {
  for (const k of ['slug','name','tagline','description']) if (typeof c[k] !== 'string' || !c[k].trim()) throw Error(`Missing ${k}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug)) throw Error('Invalid slug');
  for (const k of ['primaryColor','secondaryColor']) if (!/^#[\da-f]{6}$/i.test(c[k])) throw Error(`Invalid ${k}`);
  if (!['demo','request','external'].includes(c.booking?.mode)) throw Error('Invalid booking mode');
  const https = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
  if (c.booking.mode === 'external' && !https(c.booking.url)) throw Error('External booking requires an HTTPS URL');
  if (c.booking.mode === 'request' && !https(c.booking.endpoint)) throw Error('Request mode requires an HTTPS form endpoint');
  for (const s of c.socials || []) if (!https(s.url)) throw Error('Social links require HTTPS');
  for (const t of c.testimonials || []) if (t.verified !== true || !t.quote || !t.name) throw Error('Only verified testimonials may be published');
  for (const list of ['services','benefits','gallery','comparisons','testimonials','trustIndicators','socials','faqs','serviceAreas']) if (c[list] !== undefined && !Array.isArray(c[list])) throw Error(`${list} must be an array`);
  for (const item of c.services || []) if (!item.title || !item.description) throw Error('Services need a title and description');
  const asset = value => !value || /^assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..');
  for (const v of [c.logo,c.heroImage,...(c.gallery || []).map(i=>i.image),...(c.comparisons || []).flatMap(i=>[i.before,i.after])]) if (!asset(v)) throw Error('Images must use local assets/ paths');
  return c;
}
export async function build(out = path.join(root,'dist')) {
  const template=await readFile(path.join(root,'templates/index.html'),'utf8');
  const configs=[];
  for (const f of (await readdir(path.join(root,'businesses'))).filter(f=>f.endsWith('.json')).sort()) configs.push(validate(JSON.parse(await readFile(path.join(root,'businesses',f),'utf8'))));
  if (!configs.length || new Set(configs.map(c=>c.slug)).size !== configs.length) throw Error('At least one unique business is required');
  await rm(out,{recursive:true,force:true}); await mkdir(out,{recursive:true});
  await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
  const html=(c,prefix)=>template.replaceAll('{{ASSET_PREFIX}}',prefix).replace('{{TITLE}}',c.name.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')).replace('{{CONFIG}}',JSON.stringify(c).replaceAll('<','\\u003c'));
  await writeFile(path.join(out,'index.html'),html(configs.find(c=>c.slug==='green-acres')||configs[0],''));
  for(const c of configs) { await mkdir(path.join(out,c.slug)); await writeFile(path.join(out,c.slug,'index.html'),html(c,'../')); }
  await writeFile(path.join(out,'.nojekyll'),'');
  console.log(`Built ${configs.length} branded previews and the default homepage.`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await build();
