'use strict';
let DATA, current = { section: 'inicio', subject: '' };
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe = url => { try { const u = new URL(url); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
const link = (url, label) => safe(url) ? `<a href="${esc(safe(url))}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';
const subject = id => DATA.subjects.find(s => s.id === id);
const resource = id => DATA.resources.find(r => r.id === id);
const today = () => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Argentina/Cordoba',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const date = s => s ? new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z')) : 'Sin fecha';
const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const belongs = item => !current.subject || item.subjects?.includes(current.subject);
const route = (section, id = current.subject) => id ? `#materia/${id}/${section}` : `#${section}`;
const names = ids => (ids || []).map(id => subject(id)?.title || id).join(' · ');
const correction = (type, id) => `<button type="button" data-correction="${type}" data-id="${esc(id)}">Sugerir corrección</button>`;
const modes = () => `<div class="modes">${[['entregas','01','Próximas entregas','Fechas y actividades según las fuentes'],['materiales','02','Materiales','Apuntes, consignas y bibliografía'],['informacion','03','Información de la materia','Docentes, cursada y enlaces de clase']].map(([key,n,title,desc])=>`<a class="mode" href="${route(key)}" ${current.section===key?'aria-current="page"':''}><small>${n}</small><strong>${title}</strong><span>${desc}</span></a>`).join('')}</div>`;
const help = (title, text) => `<details class="help"><summary>${esc(title)}</summary><p>${esc(text)}</p></details>`;
const official = () => `<div class="notice"><strong>Confirmá las fechas en el aula y los avisos docentes.</strong> Este calendario transcribe hojas de ruta y consignas; puede no reflejar cambios posteriores. ${help('¿Encontraste una fecha distinta?', 'Abrí “Sugerir corrección” en la actividad. Ya estarán incluidos la materia, la fecha publicada y su fuente. Agregá el enlace y la fecha del aviso más reciente; podés copiar la sugerencia o enviarla mediante GitHub.')}</div>`;
function calendarURL(s, id, from = today()) {
  let day = from > s.validFrom ? from : s.validFrom;
  const d = new Date(day+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+(s.weekday-d.getUTCDay()+7)%7); day=d.toISOString().slice(0,10);
  const end=s.until || DATA.collection?.academicYearEnd;
  if(end && day>end) return '';
  const stamp=(day,time)=>new Date(`${day}T${time}:00-03:00`).toISOString().replace(/[-:]/g,'').replace('.000','');
  const recur=`RRULE:FREQ=WEEKLY;BYDAY=${['SU','MO','TU','WE','TH','FR','SA'][s.weekday]}`+(end?`;UNTIL=${stamp(end,'23:59')}`:'');
  return 'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:subject(id)?.title||s.title,dates:stamp(day,s.startTime)+'/'+stamp(day,s.endTime),ctz:s.timeZone||'America/Argentina/Cordoba',location:s.meetUrl,details:`Meet: ${s.meetUrl}\n${s.classroomUrl?'Aula virtual: '+s.classroomUrl+'\n':''}Fuente: ${s.source}\n${s.note||''}\n${end?'Repetición hasta '+end:'Sin fecha final confirmada: ajustá la repetición en tu calendario.'}\nNo se sincroniza con cambios posteriores del sitio.`,recur});
}
function schedules(id, full=false) {
 return DATA.schedules.filter(s=>s.subjects.includes(id)).map(s=>`<div class="info"><strong>${['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][s.weekday]} · ${esc(s.startTime)}–${esc(s.endTime)}</strong><small class="muted"> · Hora de Argentina</small><div class="actions">${link(s.meetUrl,'Entrar al Meet')}${link(s.classroomUrl,'Aula virtual')}${link(calendarURL(s,id),'Agregar a Calendar')}</div>${full?`<p class="muted">${esc(s.source)} ${esc(s.note)}</p>${link(s.recordingsUrl,'Grabaciones')}${help('Sobre la repetición en Calendar',s.until?'Se repite semanalmente hasta '+date(s.until)+'. Los cambios posteriores no se sincronizan automáticamente.':'La fuente no confirma una fecha de fin. El evento se repite semanalmente; ajustá el final en tu calendario cuando se confirme.')}`:''}</div>`).join('');
}
function eventHTML(e) {
 const r=resource(e.source), index=DATA.events.indexOf(e);
 const classroom=DATA.schedules.find(s=>s.classroomUrl&&s.subjects.some(id=>e.subjects.includes(id)))?.classroomUrl;
 return `<article class="event"><div class="when">${esc(date(e.start))}${e.end&&e.end!==e.start?`<small>al ${esc(date(e.end))}</small>`:''}${e.time?`<small>${esc(e.time)} · Argentina</small>`:''}</div><div><p class="eyebrow">${esc(names(e.subjects))}</p><h3>${esc(e.title)}</h3>${e.end&&e.end!==e.start?'<span class="badge">Período de actividad</span>':''}<p>${esc(e.note)}</p><p class="meta">Fuente: ${r?link(r.url,r.title):'No identificada en el catálogo'}${r?.reviewedAt?' · Revisada '+esc(date(r.reviewedAt)):''}</p><div class="actions">${link(classroom,'Consultar aula')}${correction('event',index)}</div></div></article>`;
}
function deliveries(limit) {
 const events=DATA.events.filter(belongs).sort((a,b)=>a.start.localeCompare(b.start));
 const next=events.filter(e=>(e.end||e.start)>=today()), past=events.filter(e=>(e.end||e.start)<today());
 return `<div class="section-head"><h2>Próximas entregas según las hojas de ruta y consignas</h2>${limit?`<a href="${route('entregas')}">Ver todas las fechas →</a>`:''}</div><p class="muted">También se incluyen períodos de trabajo y evaluaciones indicados por las fuentes.</p>${official()}<div class="list">${next.length?next.slice(0,limit||next.length).map(eventHTML).join(''):'<p class="empty">No hay próximas fechas registradas para esta selección. Puede haber novedades en el aula: consultá los avisos docentes.</p>'}</div>${!next.length&&current.subject?`<div class="actions">${correction('subject',current.subject)}</div>`:''}${!limit&&past.length?`<details class="help"><summary>Fechas anteriores (${past.length})</summary><div class="list">${past.reverse().map(eventHTML).join('')}</div></details>`:''}`;
}
function materials() {
 const items=DATA.resources.filter(belongs);
 const options=key=>[...new Set(items.map(r=>r[key]).filter(Boolean))].sort().map(v=>`<option>${esc(v)}</option>`).join('');
 return `<h2>Materiales</h2><p class="lead">Buscá por tema o filtrá por unidad y tipo de recurso.</p>${help('¿Qué incluye cada ficha?','Desplegá el título para ver la descripción, las etiquetas y los enlaces específicos. Los materiales siguen alojados en sus fuentes; los permisos de acceso dependen de sus propietarios.')}<div class="filters"><label>Buscar<input id="search" type="search" placeholder="Título, tema o etiqueta"></label><label>Unidad o eje<select id="unit"><option value="">Todos</option>${options('unit')}</select></label><label>Tipo<select id="kind"><option value="">Todos</option>${options('kind')}</select></label></div><p id="count" role="status"></p><div id="resources" class="list"></div>`;
}
function renderResources() {
 const query=norm($('#search').value), unit=$('#unit').value, kind=$('#kind').value;
 const items=DATA.resources.filter(belongs).filter(r=>(!unit||r.unit===unit)&&(!kind||r.kind===kind)&&norm([r.title,r.description,...r.tags].join(' ')).includes(query));
 $('#count').textContent=`${items.length} ${items.length === 1 ? 'material encontrado' : 'materiales encontrados'}`;
 $('#resources').innerHTML=items.map(r=>`<details class="resource"><summary><strong>${esc(r.title)}</strong><span class="meta">${esc(r.unit)} · ${esc(r.kind)} · ${esc(r.format)}</span></summary><p class="eyebrow">${esc(names(r.subjects))}</p><p>${esc(r.description)}</p><p>${r.tags.map(t=>`<span class="badge">${esc(t)}</span>`).join(' ')}</p><p class="meta">${esc(r.review||'')}${r.reviewedAt?' · Revisado '+esc(date(r.reviewedAt)):''}</p><div class="actions">${link(r.url,'Abrir material')}${(r.alternateLinks||[]).map(l=>link(l.url,l.label||'Enlace alternativo')).join('')}${correction('resource',r.id)}</div></details>`).join('')||'<p class="empty">No se encontraron materiales con estos filtros.</p>';
}
function info(id) {
 const s=subject(id), r=resource(s.source);
 return `<article class="info"><h2>${esc(s.title)}</h2><p><strong>Período:</strong> ${esc(s.period)}<br><strong>Comisión:</strong> ${esc(s.commission)}<br><strong>Docencia:</strong> ${esc(s.teachers)}</p><p>${esc(s.notes)}</p>${r?`<p>Documento de referencia: ${link(r.url,r.title)}</p>`:''}${schedules(id,true)}<div class="actions">${(DATA.classes||[]).filter(c=>c.subjects.includes(id)).map(c=>link(c.url,c.title)).join('')}${correction('subject',id)}</div></article>`;
}
function render(focus=false) {
 const parts=location.hash.slice(1).split('/');
 current=parts[0]==='materia'&&subject(parts[1])?{subject:parts[1],section:parts[2]}:{subject:'',section:parts[0]||'inicio'};
 if(!['inicio','entregas','materiales','informacion'].includes(current.section))current.section='inicio';
 $('#subject').value=current.subject;
 document.querySelectorAll('[data-route]').forEach(a=>{a.href=route(a.dataset.route,a.dataset.route==='inicio'?'':current.subject);if(a.dataset.route===current.section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const s=subject(current.subject);
 let content=`<p class="eyebrow">${s?'Materia · '+esc(s.edition||'2026'):'ISPC · Desarrollo de Software · 2026'}</p><h1>${esc(s?.title||({inicio:'¿Qué necesitás consultar?',entregas:'Entregas y actividades',materiales:'Biblioteca de materiales',informacion:'Información de las materias'}[current.section]))}</h1>`;
 if(s)content+=schedules(s.id);
 content+=modes();
 if(current.section==='inicio')content+=deliveries(4)+`<h2>Elegí una materia</h2><div class="grid">${DATA.subjects.map(s=>`<a class="info" href="${route('entregas',s.id)}"><strong>${esc(s.title)}</strong><p class="muted">${esc(s.period)}</p><span>Ver entregas, materiales e información →</span></a>`).join('')}</div>`;
 if(current.section==='entregas')content+=deliveries();
 if(current.section==='materiales')content+=materials();
 if(current.section==='informacion')content+=s?info(s.id):`<p class="lead">Docentes, comisión, período y enlaces de cursada. Elegí una materia para consultar sus datos.</p><div class="grid">${DATA.subjects.map(s=>`<a class="info" href="${route('informacion',s.id)}"><strong>${esc(s.title)}</strong><p>${esc(s.period)}</p></a>`).join('')}</div>`;
 $('#main').innerHTML=content;document.title=(s?.title||'Entre apuntes')+' · '+current.section+' · v2';
 if(current.section==='materiales'){renderResources();['search','unit','kind'].forEach(id=>$('#'+id).addEventListener('input',renderResources));}
 if(focus){$('#main').focus();window.scrollTo({top:0,behavior:'instant'});}
}
let issueTitle='';
function updateIssue(){ $('#issue').href='https://github.com/fran1599/materiales-tsds-ispc-1-2026-b1/issues/new?'+new URLSearchParams({title:issueTitle,body:$('#proposal').value}); }
function openCorrection(type,id){
 const item=type==='event'?DATA.events[Number(id)]:type==='resource'?resource(id):subject(id);
 if(!item)return;
 const source=type==='resource'?item:resource(item.source);
 issueTitle='Corrección: '+item.title;
 $('#proposal').value=`${issueTitle}\nMateria: ${type==='subject'?item.title:names(item.subjects)}\n${type==='event'?'Fecha publicada: '+item.start+(item.end!==item.start?' al '+item.end:'')+'\n':''}Fuente actual: ${source?.url||'Consultar información de la materia'}\nPágina: ${location.href}\n\nQué cambió:\n\nEnlace al aviso o fuente oficial actualizado:\n\nFecha del aviso:\n`;
 $('#copy-status').textContent='';updateIssue();$('#correction').showModal();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-correction]');if(b)openCorrection(b.dataset.correction,b.dataset.id);});
$('#close').addEventListener('click',()=>$('#correction').close());
$('#proposal').addEventListener('input',updateIssue);
$('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#proposal').value);$('#copy-status').textContent='Sugerencia copiada. Podés enviarla por tu canal habitual.';}catch{$('#proposal').focus();$('#proposal').select();$('#copy-status').textContent='Seleccionamos el texto para que puedas copiarlo manualmente.';}});
$('#subject').addEventListener('change',e=>{location.hash=route(current.section==='inicio'?'entregas':current.section,e.target.value);});
window.addEventListener('hashchange',()=>{if(DATA&&location.hash!=='#main')render(true);});
async function init(){try{const response=await fetch('../dist/catalog.json');if(!response.ok)throw new Error('Catálogo no disponible');DATA=await response.json();$('#subject').insertAdjacentHTML('beforeend',DATA.subjects.map(s=>`<option value="${esc(s.id)}">${esc(s.title)}</option>`).join(''));$('#review').textContent='Última actualización del catálogo: '+date(DATA.updated)+'.';render();}catch{$('#main').innerHTML='<h1>No pudimos cargar el catálogo</h1><p>Revisá tu conexión e intentá nuevamente.</p><button id="retry">Reintentar</button>';$('#retry').addEventListener('click',init);}}
init();
