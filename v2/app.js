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
 if(!limit)return `<h2>Próximas entregas según las hojas de ruta y consignas</h2>${official()}<div class="calendar-controls"><div class="view-switch" role="group" aria-label="Vista de entregas">${[['list','Lista'],['month','Mes'],['week','Semana']].map(([value,label])=>`<button data-view="${value}" aria-pressed="${deliveryView===value}">${label}</button>`).join('')}</div></div><div id="delivery-content"></div>`;
 const events=DATA.events.filter(belongs).sort((a,b)=>a.start.localeCompare(b.start));
 const next=events.filter(e=>(e.end||e.start)>=today()), past=events.filter(e=>(e.end||e.start)<today());
 return `<div class="section-head"><h2>Próximas entregas según las hojas de ruta y consignas</h2>${limit?`<a href="${route('entregas')}">Ver todas las fechas →</a>`:''}</div><p class="muted">También se incluyen períodos de trabajo y evaluaciones indicados por las fuentes.</p>${official()}<div class="list">${next.length?next.slice(0,limit||next.length).map(eventHTML).join(''):'<p class="empty">No hay próximas fechas registradas para esta selección. Puede haber novedades en el aula: consultá los avisos docentes.</p>'}</div>${!next.length&&current.subject?`<div class="actions">${correction('subject',current.subject)}</div>`:''}${!limit&&past.length?`<details class="help"><summary>Fechas anteriores (${past.length})</summary><div class="list">${past.reverse().map(eventHTML).join('')}</div></details>`:''}`;
}
// Calendar intervals include both source dates. UTC arithmetic prevents DST shifts.
let deliveryView = 'list', calendarAnchor = today();
function addDays(day, n) { const d=new Date(day+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10); }
function monday(day) { return addDays(day,-((new Date(day+'T12:00:00Z').getUTCDay()+6)%7)); }
function monthStart(day) { return day.slice(0,7)+'-01'; }
function moveMonth(day, n) { const d=new Date(monthStart(day)+'T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);return d.toISOString().slice(0,10); }
function calendarWeeks(anchor, view) {
 const start=view==='week'?monday(anchor):monday(monthStart(anchor));
 const last=view==='week'?addDays(start,6):addDays(moveMonth(anchor,1),-1);
 const weeks=[];for(let day=start;day<=last;day=addDays(day,7))weeks.push(day);return weeks;
}
function weekSegments(events, start) {
 const end=addDays(start,6), lanes=[];
 return events.filter(e=>e.start<=end&&(e.end||e.start)>=start).sort((a,b)=>a.start.localeCompare(b.start)||(b.end||b.start).localeCompare(a.end||a.start)).map(e=>{
  const first=e.start<start?start:e.start, last=(e.end||e.start)>end?end:(e.end||e.start);
  const col=Math.round((new Date(first+'T12:00Z')-new Date(start+'T12:00Z'))/86400000), span=Math.round((new Date(last+'T12:00Z')-new Date(first+'T12:00Z'))/86400000)+1;
  let lane=lanes.findIndex(occupied=>occupied<col);if(lane<0)lane=lanes.length;lanes[lane]=col+span-1;
  return {event:e,col,span,lane,continuesBefore:e.start<start,continuesAfter:(e.end||e.start)>end};
 });
}
function renderDeliveryView(focusId) {
 const events=DATA.events.filter(belongs).sort((a,b)=>a.start.localeCompare(b.start));
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===deliveryView)));
 if(deliveryView==='list') {
  const next=events.filter(e=>(e.end||e.start)>=today()),past=events.filter(e=>(e.end||e.start)<today());
  $('#delivery-content').innerHTML=`<p class="muted">Fechas y períodos de actividad registrados. Consultá la fuente para confirmar el cierre.</p><div class="list">${next.length?next.map(eventHTML).join(''):'<p class="empty">No hay próximas fechas registradas. Consultá las novedades del aula.</p>'}</div>${!next.length&&current.subject?correction('subject',current.subject):''}${past.length?`<details class="help"><summary>Fechas anteriores (${past.length})</summary><div class="list">${past.reverse().map(eventHTML).join('')}</div></details>`:''}`;
  return;
 }
 const weeks=calendarWeeks(calendarAnchor,deliveryView), weekEnd=addDays(weeks[0],6);
 const heading=deliveryView==='week'?`${date(weeks[0])} – ${date(weekEnd)}`:new Intl.DateTimeFormat('es-AR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(calendarAnchor+'T12:00:00Z'));
 const inPeriod=events.filter(e=>e.start<=addDays(weeks.at(-1),6)&&(e.end||e.start)>=weeks[0]);
 $('#delivery-content').innerHTML=`<div class="calendar-controls"><div class="actions"><button id="cal-prev" data-step="-1" aria-label="${deliveryView==='week'?'Semana':'Mes'} anterior">‹</button><button id="cal-today" data-step="today">Hoy</button><button id="cal-next" data-step="1" aria-label="${deliveryView==='week'?'Semana':'Mes'} siguiente">›</button></div><h3 id="calendar-heading" aria-live="polite">${esc(heading)}</h3><label class="calendar-jump">Ir a fecha <input id="calendar-date" type="date" value="${calendarAnchor}"></label></div><p class="muted" id="calendar-help">Las barras cubren el período indicado por la fuente, incluido el último día. Seleccioná una actividad para consultar detalles. Las flechas en las barras indican que continúa en otra semana.</p><div class="calendar-scroll" role="region" aria-labelledby="calendar-heading" aria-describedby="calendar-help" tabindex="0"><div class="calendar-grid"><div class="weekdays" aria-hidden="true">${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=>`<span>${d}</span>`).join('')}</div>${weeks.map(start=>{
  const segments=weekSegments(events,start), laneCount=Math.max(1,...segments.map(s=>s.lane+1));
  return `<section class="calendar-week" aria-label="Semana del ${esc(date(start))}" style="grid-template-rows:36px repeat(${laneCount},minmax(42px,auto))"><div class="day-backgrounds" aria-hidden="true">${Array.from({length:7},(_,i)=>`<div class="${addDays(start,i).slice(0,7)!==calendarAnchor.slice(0,7)&&deliveryView==='month'?'outside':''}"></div>`).join('')}</div>${Array.from({length:7},(_,i)=>{const day=addDays(start,i);return `<time class="calendar-day ${day===today()?'is-today':''}" datetime="${day}" style="grid-column:${i+1};grid-row:1" aria-label="${esc(date(day))}${day===today()?', hoy':''}">${Number(day.slice(-2))}</time>`;}).join('')}${segments.map(({event:e,col,span,lane,continuesBefore,continuesAfter})=>`<button class="calendar-event ${span>1?'multi-day':''}" data-event="${DATA.events.indexOf(e)}" style="grid-column:${col+1}/span ${span};grid-row:${lane+2}" aria-label="${esc(e.title+' · '+names(e.subjects)+' · '+date(e.start)+(e.end&&e.end!==e.start?' al '+date(e.end):'')+(e.time?' · '+e.time:''))}"><span>${continuesBefore?'← ':''}${esc(e.title)}${continuesAfter?' →':''}</span><small>${esc(names(e.subjects))}${e.time?' · '+esc(e.time):''}</small></button>`).join('')}</section>`;
 }).join('')}</div></div>${!inPeriod.length?'<p class="empty">No hay actividades registradas en este período. Esto no reemplaza los avisos del aula.</p>':''}`;
 $('#calendar-date').addEventListener('change',e=>{if(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)){calendarAnchor=e.target.value;renderDeliveryView('calendar-date');}});
 if(focusId)$('#'+focusId)?.focus();
}
document.addEventListener('click',e=>{
 const view=e.target.closest('[data-view]');if(view){deliveryView=view.dataset.view;renderDeliveryView();}
 const step=e.target.closest('[data-step]');if(step){calendarAnchor=step.dataset.step==='today'?today():deliveryView==='week'?addDays(calendarAnchor,Number(step.dataset.step)*7):moveMonth(calendarAnchor,Number(step.dataset.step));renderDeliveryView(step.id);}
 const event=e.target.closest('[data-event]');if(event){const item=DATA.events[Number(event.dataset.event)];$('#event-details').innerHTML=eventHTML(item);$('#event-dialog').showModal();}
});
$('#event-close').addEventListener('click',()=>$('#event-dialog').close());
function materials() {
 const items=DATA.resources.filter(belongs);
 const options=key=>[...new Set(items.map(r=>r[key]).filter(Boolean))].sort().map(v=>`<option>${esc(v)}</option>`).join('');
 return `<h2>Materiales</h2><p class="lead">Buscá por tema o filtrá por unidad y tipo de recurso.</p>${help('¿Qué incluye cada ficha?','Desplegá el título para ver la descripción, las etiquetas y los enlaces específicos. Los materiales siguen alojados en sus fuentes; los permisos de acceso dependen de sus propietarios.')}<div class="filters"><label>Buscar<input id="search" type="search" placeholder="Título, tema o etiqueta"></label>${!current.subject?`<label>Materia<select id="material-subject"><option value="">Todas las materias</option>${DATA.subjects.map(s=>`<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('')}</select></label>`:''}<label>Unidad o eje<select id="unit"><option value="">Todos</option>${options('unit')}</select></label><label>Tipo<select id="kind"><option value="">Todos</option>${options('kind')}</select></label></div><p id="count" role="status"></p><div id="resources" class="list"></div>`;
}
function renderResources() {
 const query=norm($('#search').value), unit=$('#unit').value, kind=$('#kind').value;
 const selectedSubject=current.subject || $('#material-subject')?.value || '';
 const items=DATA.resources.filter(belongs).filter(r=>(!selectedSubject||r.subjects.includes(selectedSubject))).filter(r=>(!unit||r.unit===unit)&&(!kind||r.kind===kind)&&norm([r.title,r.description,...r.tags].join(' ')).includes(query));
 $('#count').textContent=`${items.length} ${items.length === 1 ? 'material encontrado' : 'materiales encontrados'}`;
 $('#resources').innerHTML=items.map(r=>`<details class="resource"><summary><strong>${esc(r.title)}</strong><span class="resource-subject">${esc(names(r.subjects))}</span><span class="meta">${esc(r.unit)} · ${esc(r.kind)} · ${esc(r.format)}</span></summary><p class="eyebrow">${esc(names(r.subjects))}</p><p>${esc(r.description)}</p><p>${r.tags.map(t=>`<span class="badge">${esc(t)}</span>`).join(' ')}</p><p class="meta">${esc(r.review||'')}${r.reviewedAt?' · Revisado '+esc(date(r.reviewedAt)):''}</p><div class="actions">${link(r.url,'Abrir material')}${(r.alternateLinks||[]).map(l=>link(l.url,l.label||'Enlace alternativo')).join('')}${correction('resource',r.id)}</div></details>`).join('')||'<p class="empty">No se encontraron materiales con estos filtros.</p>';
}
function info(id) {
 const s=subject(id), r=resource(s.source);
 const contacts=(s.contacts||[]).map(c=>`<li><strong>${esc(c.name)}</strong> · ${esc(c.role)}<br><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`).join('');
 return `<article class="info"><h2>${esc(s.title)}</h2><p><strong>Período:</strong> ${esc(s.period)}<br><strong>Comisión:</strong> ${esc(s.commission)}<br><strong>Docencia:</strong> ${esc(s.teachers)}</p>${contacts?`<h3>Contactos institucionales</h3><ul>${contacts}</ul>`:''}<p>${esc(s.notes)}</p>${r?`<p>Documento de referencia: ${link(r.url,r.title)}</p>`:''}${schedules(id,true)}<div class="actions">${(DATA.classes||[]).filter(c=>c.subjects.includes(id)).map(c=>link(c.url,c.title)).join('')}${correction('subject',id)}</div></article>`;
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
 if(current.section==='entregas')renderDeliveryView();
 if(current.section==='materiales'){renderResources();['search','unit','kind',...(!current.subject?['material-subject']:[])].forEach(id=>$('#'+id).addEventListener('input',renderResources));}
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
 $('#copy-status').textContent='';updateIssue();if($('#event-dialog').open)$('#event-dialog').close();$('#correction').showModal();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-correction]');if(b)openCorrection(b.dataset.correction,b.dataset.id);});
$('#close').addEventListener('click',()=>$('#correction').close());
$('#proposal').addEventListener('input',updateIssue);
$('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#proposal').value);$('#copy-status').textContent='Sugerencia copiada. Podés enviarla por tu canal habitual.';}catch{$('#proposal').focus();$('#proposal').select();$('#copy-status').textContent='Seleccionamos el texto para que puedas copiarlo manualmente.';}});
$('#subject').addEventListener('change',e=>{location.hash=route(current.section==='inicio'?'entregas':current.section,e.target.value);});
window.addEventListener('hashchange',()=>{if(DATA&&location.hash!=='#main')render(true);});
async function init(){try{const response=await fetch('../dist/catalog.json');if(!response.ok)throw new Error('Catálogo no disponible');DATA=await response.json();$('#subject').insertAdjacentHTML('beforeend',DATA.subjects.map(s=>`<option value="${esc(s.id)}">${esc(s.title)}</option>`).join(''));$('#review').textContent='Última actualización del catálogo: '+date(DATA.updated)+'.';render();}catch{$('#main').innerHTML='<h1>No pudimos cargar el catálogo</h1><p>Revisá tu conexión e intentá nuevamente.</p><button id="retry">Reintentar</button>';$('#retry').addEventListener('click',init);}}
init();


