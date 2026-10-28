const config=JSON.parse(document.querySelector('#business-config').textContent);
const $=s=>document.querySelector(s);
const text=(s,t)=>{$(s).textContent=t||'';};
const el=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content)n.textContent=content;return n;};
const imageUrl=p=>new URL(p,new URL('.',import.meta.url).href.replace(/assets\/$/,'' )).href;
document.documentElement.style.setProperty('--primary',config.primaryColor);
document.documentElement.style.setProperty('--accent',config.secondaryColor);
$('meta[name="theme-color"]').content=config.primaryColor;
document.querySelectorAll('[data-name]').forEach(n=>n.textContent=config.name);
text('#descriptor',config.descriptor);text('#tagline',config.tagline);text('#description',config.description);
if(config.logo) document.querySelectorAll('.brand-mark').forEach(mark=>{const img=el('img');img.src=imageUrl(config.logo);img.alt='';mark.replaceChildren(img);});
if(config.heroImage){$('#hero-image').src=imageUrl(config.heroImage);$('#hero-image').alt=config.heroAlt||'Illustrative garden';$('#about-image').src=imageUrl(config.heroImage);}else{$('.hero-visual').hidden=true;$('.about-art').hidden=true;}
text('#areas',(config.serviceAreas||[]).join('  /  ')||'Let’s talk about your outdoor space');text('#footer-areas',(config.serviceAreas||[]).join(' · '));
text('#hours',config.hours);if(!config.hours)$('#hours').hidden=true;
text('#year',new Date().getFullYear());
if(config.phone){const p=$('#header-phone');p.textContent=config.phone;p.href='tel:'+config.phone.replace(/[^\d+]/g,'');}else $('#header-phone').hidden=true;
for(const [value,scheme] of [[config.phone,'tel:'],[config.email,'mailto:']]) if(value){const a=el('a','contact-link',value);a.href=scheme+(scheme==='tel:'?value.replace(/[^\d+]/g,''):value);$('#contact-details').append(a);}
const icons={grass:'M4 27h28M10 27V13m8 14V7m8 20V16M10 18l-5-5m13 3 6-6m2 12 5-4',leaf:'M8 27C3 10 20 5 31 5c0 17-7 27-23 22Zm0 0 16-15M8 27l-3 5',sun:'M18 4V1m0 34v-3M4 18H1m34 0h-3M8 8 5 5m26 26-3-3M8 28l-3 3M31 5l-3 3M26 18a8 8 0 1 1-16 0 8 8 0 0 1 16 0'};
for(const [i,s] of (config.services||[]).entries()){
 const card=el('article','service-card');const top=el('div','service-top');const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 36 36');icon.setAttribute('aria-hidden','true');const p=document.createElementNS(icon.namespaceURI,'path');p.setAttribute('d',icons[s.icon]||icons.leaf);icon.append(p);top.append(icon,el('span','service-number',String(i+1).padStart(2,'0')));
 const a=el('a','service-link','Explore service ↗');a.href='#booking';a.setAttribute('aria-label',`Request ${s.title}`);a.addEventListener('click',()=>{$('[name="service"]').value=s.title;});
 card.append(top,el('h3','',s.title),el('p','',s.description),el('small','service-detail',s.detail),a);$('#service-grid').append(card);
 const option=el('option','',s.title);option.value=s.title;$('[name="service"]').append(option);
}
if(!config.services?.length){$('#services').hidden=true;document.querySelectorAll('a[href="#services"]').forEach(a=>a.hidden=true);const o=el('option','','General inquiry');$('[name="service"]').append(o);}
for(const [i,b] of (config.benefits||[]).entries()){const item=el('div','benefit');item.append(el('span','benefit-num',String(i+1).padStart(2,'0')));const body=el('div');body.append(el('h3','',b.title),el('p','',b.description));item.append(body);$('#benefits').append(item);}
for(const t of config.trustIndicators||[])$('#trust-indicators').append(el('span','trust',t));
for(const g of config.gallery||[]){const f=el('figure','gallery-item');const img=el('img');img.src=imageUrl(g.image);img.alt=g.alt||'';img.loading='lazy';img.width=900;img.height=650;if(g.position)img.style.objectPosition=g.position;const cap=el('figcaption');cap.append(el('small','',g.category),el('h3','',g.title));f.append(img,cap);$('#gallery-grid').append(f);}
for(const [i,c] of (config.comparisons||[]).entries()){
 const group=el('figure','comparison');const visual=el('div','comparison-visual');const after=el('img'), before=el('img','comparison-before');after.src=imageUrl(c.after);after.alt=c.afterAlt||'After';before.src=imageUrl(c.before);before.alt=c.beforeAlt||'Before';visual.append(after,before);const label=el('label','',c.title||'Compare before and after');const range=el('input');range.type='range';range.min='0';range.max='100';range.value='50';range.setAttribute('aria-label',`${c.title||'Before and after'}: reveal before image`);range.addEventListener('input',()=>before.style.clipPath=`inset(0 ${100-Number(range.value)}% 0 0)`);label.append(range);group.append(visual,label,el('figcaption','','Before / After · '+(c.caption||'Demonstration comparison')));$('#comparisons').append(group);
}
if(!config.gallery?.length&&!config.comparisons?.length){$('#gallery').hidden=true;document.querySelectorAll('a[href="#gallery"]').forEach(a=>a.hidden=true);}
const reviews=(config.testimonials||[]).filter(t=>t.verified===true);
if(reviews.length){$('#reviews').hidden=false;for(const t of reviews){const q=el('blockquote','service-card');q.append(el('p','',t.quote),el('cite','',t.name));$('#review-grid').append(q);}}
for(const f of config.faqs||[]){const d=el('details');d.append(el('summary','',f.question),el('p','',f.answer));$('#faq-list').append(d);}if(!config.faqs?.length)$('#faq').hidden=true;
for(const s of config.socials||[]){const a=el('a','',s.label);a.href=s.url;a.rel='noopener noreferrer';$('#socials').append(a);}
const menu=$('.menu-toggle'),nav=$('#navigation');
const closeMenu=()=>{menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');nav.classList.remove('open');};
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open);});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
const booking=config.booking;
document.querySelectorAll('[data-book], a[href="#booking"]').forEach(a=>{a.href=booking.mode==='external'?booking.url:'#booking';});
const today=new Date();const minDate=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;$('[name="date"]').min=minDate;
const form=$('#request-form');
if(booking.mode==='external'){
 form.hidden=true;$('#external-booking').hidden=false;$('#external-link').href=booking.url;text('#mode-notice','External scheduling · You will leave this preview to use the configured provider.');
}else if(booking.mode==='request'){
 text('#mode-notice','Appointment request · Your appointment is confirmed only after the business contacts you.');text('#form-intro','Share your details to request a visit.');text('#submit-request','Send appointment request ↗');text('#form-disclaimer','Your details will be sent to the business’s form-processing provider. This is a request, not a confirmed appointment.');
}else text('#mode-notice','DEMO MODE · Try the form with fictional details. Nothing is transmitted or stored. No appointment is booked.');
form.addEventListener('submit',async e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const status=$('#form-status');
 if(booking.mode==='demo'){form.reset();status.textContent='Demo complete! Nothing was sent or saved. No appointment has been requested or booked.';status.focus();return;}
 if(booking.mode!=='request')return;
 const button=$('#submit-request');button.disabled=true;status.textContent='Sending your request…';
 try{const response=await fetch(booking.endpoint,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error();form.reset();status.textContent='Request received by the form provider. The business must contact you to confirm availability. Your appointment is not confirmed.';}
 catch{status.textContent='Your request could not be sent. Please try again or contact the business directly. Your appointment is not confirmed.';}
 finally{button.disabled=false;status.focus();}
});
