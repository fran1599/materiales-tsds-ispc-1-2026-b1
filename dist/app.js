'use strict';
let DATA;
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = v => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const date = v => new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(v+'T12:00:00Z'));
const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Cordoba',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const subject = id => DATA.subjects.find(s=>s.id===id);
const resource = id => DATA.resources.find(r=>r.id===id);
const count = id => DATA.resources.filter(r=>r.subjects.includes(id)).length;
const searchIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg>';
const searchBox = (placeholder='Buscar un tema, un apunte o una materia…') => '<div class="search-wrap">'+searchIcon+'<input type="search" id="search" aria-label="Buscar materiales" placeholder="'+esc(placeholder)+'"><span class="key-hint" aria-hidden="true">/</span></div>';
const tags = r => '<div class="tags"><span class="tag kind">'+esc(r.kind)+'</span>'+r.tags.map(t=>'<span class="tag">'+esc(t)+'</span>').join('')+'</div>';
const sourceLink = (id,label='Ver documento fuente') => resource(id)?'<a class="inline-link" href="'+esc(resource(id).url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+' ↗</a>':'Fuente pendiente';
const safeURL = url => {try{return ['https:'].includes(new URL(url).protocol);}catch{return false;}};
function nav(){
 $('#subject-nav').innerHTML=DATA.subjects.filter(s=>s.id!=='institucional').map(s=>'<a class="nav-subject '+s.color+'" href="#materia/'+s.id+'" data-nav="'+s.id+'"><i class="nav-dot" aria-hidden="true"></i>'+esc(s.short)+'</a>').join('');
}
function heading(kicker,title,desc){
 return '<div class="intro"><div><div class="eyebrow">'+esc(kicker)+'</div><h1>'+esc(title)+'</h1><p>'+esc(desc)+'</p></div><div class="review-date">Última revisión<strong>'+date(DATA.updated)+' '+DATA.updated.slice(0,4)+'</strong></div></div>';
}
function card(s){
 const n=count(s.id);
 return '<a href="#materia/'+s.id+'" class="subject-card '+s.color+(n?'':' empty')+'"><span class="arrow" aria-hidden="true">↗</span><span class="subject-code" aria-hidden="true">'+esc(s.code)+'</span><h3>'+esc(s.title)+'</h3><p>'+esc(s.period)+'</p><div class="subject-card-foot"><span>'+(n?n+' materiales':'Sin materiales aún')+'</span><span class="count-pill">'+(s.id==='matematica'?'Comisión B1':s.id==='arquitectura'?'Comisión B':'Ver cursada')+'</span></div></a>';
}
function home(){
 $('#main').innerHTML=heading('TECNICATURA SUPERIOR · ISPC','Un lugar para tus materiales.','Apuntes, programas y prácticas de Desarrollo de Software. Encontrá lo que necesitás para seguir estudiando, incluso cuando Moodle no está disponible.')+searchBox()+
 '<div class="collection-info"><span><strong>'+DATA.resources.length+' materiales</strong> · '+(DATA.subjects.length-1)+' espacios de cursada · Cohorte 2026 · B1</span><a class="inline-link" href="#acerca">¿Cómo se actualiza?</a></div><a class="schedule-shortcut" href="#agenda"><span><strong>Tu semana de cursada</strong><span>Horarios, enlaces de Meet y próximas fechas</span></span><span aria-hidden="true">↗</span></a><div id="home-results" aria-live="polite"></div><section id="home-subjects"><div class="section-heading"><h2>Explorá por materia</h2><span>Primer año · Material disponible</span></div><div class="subject-grid">'+DATA.subjects.filter(s=>s.id!=='institucional').map(card).join('')+'</div><a class="institution-strip" href="#materia/institucional"><span class="subject-code" aria-hidden="true">IS</span><div><h3>La información institucional, a mano.</h3><p>Régimen Académico Institucional y Régimen Académico Marco.</p></div><span class="arrow" aria-hidden="true">↗</span></a><div class="notice">Este es un espacio estudiantil, no un sitio oficial del Instituto Superior Politécnico Córdoba (ISPC). Los archivos se abren desde Drive y conservan sus permisos originales.</div></section>';
 $('#search').addEventListener('input',()=>{
  const q=$('#search').value.trim();$('#home-subjects').hidden=!!q;
  $('#home-results').innerHTML=q?results(DATA.resources.filter(r=>matches(r,q)),true):'';
 });
}
function matches(r,q){
 const hay=norm([r.title,r.originalName,r.description,r.unit,...r.tags,...r.subjects.map(s=>subject(s).title)].join(' '));
 return norm(q).split(/\s+/).filter(Boolean).every(t=>hay.includes(t));
}
function row(r,showSubject){
 return '<article class="resource-row"><span class="file-icon" aria-hidden="true">'+esc(r.format)+'</span><div class="resource-content"><button class="resource-title" data-resource="'+r.id+'">'+esc(r.title)+'</button>'+(showSubject?'<div class="quiet" style="font-size:12px;margin-top:4px">'+r.subjects.map(s=>esc(subject(s).short)).join(' · ')+'</div>':'')+'<p>'+esc(r.description)+'</p>'+tags(r)+'</div><div class="resource-actions"><button class="detail-link" data-resource="'+r.id+'">Ver ficha</button><a class="open-link" href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer" aria-label="Abrir '+esc(r.title)+' en Drive">Abrir <span aria-hidden="true">↗</span></a></div></article>';
}
function results(list,showSubject=false){
 if(!list.length)return '<div class="empty-state" role="status"><h2>No encontramos ese material.</h2><p>Probá con otro tema o quitá algún filtro. El catálogo sólo incluye los archivos revisados hasta el 17 de septiembre.</p><button class="button secondary" data-reset>Limpiar búsqueda y filtros</button></div>';
 const groups={};list.forEach(r=>(groups[r.unit]??=[]).push(r));
 const units=Object.keys(groups).sort((a,b)=>a==='General'?-1:b==='General'?1:a.localeCompare(b,'es',{numeric:true}));
 return '<div class="results-label" role="status" aria-live="polite">'+list.length+' materiales encontrados</div>'+units.map(u=>'<section class="material-group"><h2 class="group-title">'+esc(u)+'<span>'+groups[u].length+'</span></h2>'+groups[u].map(r=>row(r,showSubject)).join('')+'</section>').join('');
}
function filters(items,all){
 const kinds=[...new Set(items.map(r=>r.kind))].sort();
 const units=[...new Set(items.map(r=>r.unit))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true}));
 return '<div class="filters">'+(all?'<label>Materia<select id="subject-filter"><option value="">Todas las materias</option>'+DATA.subjects.map(s=>'<option value="'+s.id+'">'+esc(s.short)+'</option>').join('')+'</select></label>':'')+'<label>Tipo de material<select id="kind-filter"><option value="">Todos los tipos</option>'+kinds.map(k=>'<option>'+esc(k)+'</option>').join('')+'</select></label><label>Unidad o eje<select id="unit-filter"><option value="">Todas las unidades</option>'+units.map(u=>'<option>'+esc(u)+'</option>').join('')+'</select></label><button class="reset" data-reset>Limpiar filtros</button></div>';
}
function bindFilters(items,all=false){
 const draw=()=>$('#results').innerHTML=results(items.filter(r=>matches(r,$('#search').value)&&(!$('#kind-filter').value||r.kind===$('#kind-filter').value)&&(!$('#unit-filter').value||r.unit===$('#unit-filter').value)&&(!all||!$('#subject-filter').value||r.subjects.includes($('#subject-filter').value))),all);
 $('#search').addEventListener('input',draw);
 document.querySelectorAll('.filters select').forEach(s=>s.addEventListener('change',draw));
 draw();
}
function materials(){
 $('#main').innerHTML=heading('CATÁLOGO','Todos los materiales','Buscá por tema y combiná filtros de materia, unidad y tipo de archivo.')+searchBox()+filters(DATA.resources,true)+'<div id="results"></div>';
 bindFilters(DATA.resources,true);
}
function subjectPage(id,tab='materiales'){
 const s=subject(id);if(!s){notFound();return;}
 const items=DATA.resources.filter(r=>r.subjects.includes(id));
 $('#main').innerHTML='<div class="subject-header '+s.color+'"><span class="subject-code" aria-hidden="true">'+esc(s.code)+'</span><div><div class="eyebrow">'+(id==='institucional'?'INFORMACIÓN INSTITUCIONAL':'ESPACIO DE CURSADA')+'</div><h1>'+esc(s.title)+'</h1><p>'+esc(s.period)+' · '+items.length+' materiales</p></div></div><nav class="tabs" aria-label="Secciones de la materia">'+[['materiales','Materiales'],['cursada','Sobre la cursada'],...(id!=='institucional'?[['agenda','Agenda'],['clases','Clases y encuentros']]:[])].map(([k,label])=>'<a href="#materia/'+id+'/'+k+'" class="'+(tab===k?'active':'')+'"'+(tab===k?' aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav><div id="subject-content"></div>';
 if(tab==='cursada'){
  $('#subject-content').innerHTML='<div class="context-grid"><section class="context-box"><h2>Período y comisión</h2><p>'+esc(s.period)+'</p><p>'+esc(s.commission)+'</p></section><section class="context-box"><h2>'+(id==='institucional'?'Institución':'Docentes y autorías identificadas')+'</h2><p>'+esc(s.teachers)+'</p></section><section class="context-box full"><h2>Alcance de esta colección</h2><p>'+esc(s.notes)+'</p>'+(s.source?sourceLink(s.source):'')+'</section></div><div class="notice">La fecha de revisión del catálogo es el 17/09/2026. No implica que cada documento haya sido publicado o actualizado ese día.</div>';return;
 }
 if(tab==='agenda'){agenda(id,'#subject-content');return;}
 if(tab==='clases'){
  const links=DATA.classes.filter(c=>c.subjects.includes(id));
  $('#subject-content').innerHTML=links.length?'<div id="subject-schedule"></div><div class="class-links">'+links.map(c=>'<article class="context-box"><h2>'+esc(c.title)+'</h2><p>'+esc(c.description)+'</p><a class="open-link" target="_blank" rel="noopener noreferrer" href="'+esc(c.url)+'">Abrir enlace ↗</a></article>').join('')+'</div>':'<div class="empty-state"><h2>Todavía no hay enlaces de clases.</h2><p>No se incorporaron enlaces de encuentros o grabaciones verificados. Las presentaciones disponibles están en Materiales, bajo el tipo Clase.</p><a class="button secondary" href="#materia/'+id+'">Ir a materiales</a></div>';if(links.length)renderWeek('#subject-schedule',id);return;
 }
 if(!items.length){$('#subject-content').innerHTML='<div class="empty-state"><h2>Este espacio está listo para crecer.</h2><p>'+esc(s.notes)+'</p><a class="button secondary" href="#inicio">Explorar otras materias</a></div>';return;}
 $('#subject-content').innerHTML=searchBox('Buscar dentro de esta materia…')+filters(items,false)+'<div id="results"></div>';
 bindFilters(items,false);
}
const weekdays = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
function shiftDate(value,days){const d=new Date(value+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
function monday(value){return shiftDate(value,-((new Date(value+'T12:00:00Z').getUTCDay()+6)%7));}
function schedulesOn(value,id=null){
 const weekday=new Date(value+'T12:00:00Z').getUTCDay();
 return (DATA.schedules||[]).filter(s=>(!id||s.subjects.includes(id))&&s.weekday===weekday&&value>=s.validFrom&&(!s.until||value<=s.until)).sort((a,b)=>a.startTime.localeCompare(b.startTime));
}
function renderWeek(target,id=null){
 let week=monday(today());
 const container=$(target);
 if(!container)return;
 const draw=()=>{
  const days=Array.from({length:5},(_,i)=>shiftDate(week,i));
  const list=(DATA.schedules||[]).filter(s=>!id||s.subjects.includes(id));
  container.innerHTML='<section class="week" aria-label="Calendario semanal de clases"><div class="week-toolbar"><div><h2>Clases de la semana</h2><p id="week-label" role="status" aria-live="polite">'+date(week)+' – '+date(days[4])+' · '+week.slice(0,4)+'</p></div><div class="week-controls"><button class="button secondary" data-week="-1" aria-label="Semana anterior">←</button><button class="button secondary" data-week="0">Esta semana</button><button class="button secondary" data-week="1" aria-label="Semana siguiente">→</button></div></div><div class="week-grid">'+days.map(value=>{
   const entries=schedulesOn(value,id);
   return '<section class="week-day'+(value===today()?' is-today':'')+'"><h3>'+weekdays[new Date(value+'T12:00:00Z').getUTCDay()]+' <time datetime="'+value+'">'+date(value)+'</time>'+(value===today()?'<span class="today-label">Hoy</span>':'')+'</h3>'+(entries.length?entries.map(s=>'<article class="class-card"><p class="class-time"><time>'+esc(s.startTime)+'</time>–<time>'+esc(s.endTime)+'</time></p><h4>'+esc(s.title)+'</h4><a class="button" href="'+esc(s.meetUrl)+'" target="_blank" rel="noopener noreferrer" aria-label="Abrir Meet de '+esc(s.title)+'">Abrir Meet ↗</a>'+(s.classroomUrl?'<a class="inline-link" href="'+esc(s.classroomUrl)+'" target="_blank" rel="noopener noreferrer">Aula virtual ↗</a>':'')+'</article>').join(''):'<p class="no-class">Sin clases registradas.</p>')+'</section>';
  }).join('')+'</div><details class="schedule-sources"><summary>Fuentes y vigencia de los horarios</summary><p>Horarios de Argentina (UTC−3). Transcritos de las capturas compartidas el 17/09/2026; no se comprobó el ingreso a las reuniones. Los feriados, suspensiones y cambios de horario requieren un aviso de la materia.</p><ul>'+list.map(s=>'<li><strong>'+esc(s.title)+'</strong>: registro desde '+date(s.validFrom)+' de 2026; '+(s.until?'repetición hasta '+date(s.until)+' de 2026.':'sin fecha de fin informada.')+' '+esc(s.note)+'</li>').join('')+'</ul></details></section>';
  container.querySelectorAll('[data-week]').forEach(b=>b.addEventListener('click',()=>{
   const direction=Number(b.dataset.week),key=b.dataset.week;
   week=direction?shiftDate(week,direction*7):monday(today());draw();
   container.querySelector('[data-week="'+key+'"]').focus({preventScroll:true});
  }));
 };
 draw();
}
function agenda(id=null,target='#main'){
 const items=DATA.events.filter(e=>!id||e.subjects.includes(id));
 $(target).innerHTML=(!id?heading('FECHAS DOCUMENTADAS','Horarios y agenda','Tu semana de clases, accesos a Meet y fechas de las actividades. Horarios de Argentina (UTC−3).'):'')+'<div id="weekly-schedule"></div><h2 class="agenda-heading">Entregas y actividades</h2><div class="notice">Agenda parcial basada en documentos revisados el 17/09/2026. Las semanas no equivalen a fechas límite exactas. Confirmá cambios y horarios con la materia.</div><div class="agenda-controls"><label>Mostrar<select id="event-time"><option value="next">En curso y próximas</option><option value="all">Todas las fechas</option><option value="past">Fechas anteriores</option></select></label>'+(!id?'<label>Materia<select id="event-subject"><option value="">Todas las materias</option>'+DATA.subjects.filter(s=>DATA.events.some(e=>e.subjects.includes(s.id))).map(s=>'<option value="'+s.id+'">'+esc(s.short)+'</option>').join('')+'</select></label>':'')+'</div><div class="timeline" id="events"></div>';
 renderWeek('#weekly-schedule',id);
 const draw=()=>{
  const now=today(), mode=$('#event-time').value, sid=$('#event-subject')?.value;
  const visible=items.filter(e=>(!sid||e.subjects.includes(sid))&&(mode==='all'||(mode==='next'?e.end>=now:e.end<now))).sort((a,b)=>a.start.localeCompare(b.start));
  $('#events').innerHTML=visible.length?visible.map(e=>{
   const state=e.end<now?'past':e.start<=now?'current':'future';
   const label=state==='past'?'FECHA PASADA':state==='current'?'PERÍODO EN CURSO':'PRÓXIMA';
   return '<article class="event '+state+'"><div class="event-date">'+date(e.start)+(e.end!==e.start?' – '+date(e.end):'')+'<span>'+e.start.slice(0,4)+(e.time?' · '+esc(e.time)+' h':'')+'</span><span class="status">'+label+'</span></div><div><div class="quiet" style="font-size:12px;margin-bottom:5px">'+e.subjects.map(s=>esc(subject(s).short)).join(' + ')+'</div><h3>'+esc(e.title)+'</h3><p>'+esc(e.note)+'</p><span style="font-size:13px">'+sourceLink(e.source)+'</span></div></article>';
  }).join(''):'<div class="empty-state"><h2>No hay fechas para esta selección.</h2><p>Esto no significa que no haya actividades. El catálogo sólo muestra las fechas documentadas en las fuentes revisadas.</p><button class="button secondary" id="all-events">Ver todas las fechas registradas</button></div>';
  $('#all-events')?.addEventListener('click',()=>{$('#event-time').value='all';if($('#event-subject'))$('#event-subject').value='';draw();});
 };
 $('#event-time').addEventListener('change',draw);$('#event-subject')?.addEventListener('change',draw);draw();
}
function about(){
 $('#main').innerHTML=heading('SOBRE ESTE ESPACIO','Materiales que se encuentran.','Una biblioteca estudiantil para acompañar la cursada de Desarrollo de Software.')+'<div class="prose"><h2>Qué vas a encontrar</h2><p>Un catálogo de '+DATA.resources.length+' archivos: apuntes, presentaciones, prácticas, consignas generales, programas, cronogramas y documentación institucional. La colección corresponde al material disponible y revisado hasta el 17 de septiembre de 2026; no representa la totalidad de la carrera.</p><h2>Cómo se organiza</h2><p>Cada materia conserva un espacio de cursada con período, comisión y docentes cuando esos datos están documentados. Los materiales se agrupan por su contenido y por las unidades o ejes de las fuentes. Las diferencias entre nombres de carpetas, portadas y programas se señalan en las fichas o en Sobre la cursada.</p><h2>Cómo leer y descargar</h2><p>El botón Abrir lleva al archivo específico en Google Drive. Desde Ver ficha podés activar una vista previa dentro del sitio. Si Drive pide iniciar sesión o solicitar acceso, necesitás el permiso del propietario: el catálogo no modifica ni evita esos permisos. Para descargar, utilizá la opción que ofrezca Drive.</p><h2>Si se cae Moodle</h2><p>La navegación del catálogo no depende de Moodle. Los documentos siguen alojados en Drive, por lo que necesitás conexión y acceso al archivo. Este sitio no guarda una copia local de los documentos ni garantiza acceso sin internet.</p><h2>Una colección cuidada</h2><p>No se incorporan entregas personales, trabajos de grupos ni documentación interna de representación estudiantil. Los archivos que no pudieron leerse o cuya procedencia requiere confirmación permanecen fuera del catálogo. Las descripciones ayudan a identificar el contenido; no certifican su exactitud académica ni sustituyen la lectura del original.</p><h2>Cómo se actualiza</h2><p>La incorporación es revisada: agregar un archivo a Drive no lo publica automáticamente aquí. Cada nuevo material necesita descripción, materia, unidad, período y verificación de que es compartible. Las fechas y los enlaces de clases también deben tener una fuente y una comisión identificadas.</p><h2>Fechas y versiones</h2><p>La agenda muestra fechas exactas sólo cuando constan en una fuente. Cuando el cronograma indica una semana, se conserva ese intervalo. Los avisos posteriores de la materia pueden cambiar la planificación: consultá el canal oficial antes de una entrega.</p><h2>Un sitio liviano</h2><p>El catálogo usa archivos estáticos, sin cuenta propia, publicidad ni rastreadores añadidos. La vista previa carga Google Drive sólo cuando la activás. El código puede alojarse en GitHub Pages; los archivos siguen en su ubicación original.</p></div>';
}
function notFound(){ $('#main').innerHTML='<div class="empty-state"><h1>No encontramos esta página.</h1><p>El enlace no corresponde a una materia del catálogo.</p><a href="#inicio" class="button">Volver a materias</a></div>'; }
function route(){
 if(!DATA)return;
 const parts=location.hash.replace(/^#/,'').split('/'),page=parts[0]||'inicio';
 document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===(page==='materia'?parts[1]:page);a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const titles={inicio:'Biblioteca',materiales:'Materiales',agenda:'Agenda',acerca:'Sobre este espacio'};
 const title=page==='materia'?(subject(parts[1])?.short||'Materia'):titles[page]||'Biblioteca';
 $('#breadcrumb-current').textContent=title;document.title=title+' · Entre apuntes';
 if(page==='main'){document.querySelector('#main').focus();return;}
 if(page==='inicio')home();else if(page==='materiales')materials();else if(page==='materia')subjectPage(parts[1],parts[2]||'materiales');else if(page==='agenda')agenda();else if(page==='acerca')about();else notFound();
 setMenu(false);window.scrollTo(0,0);
}
function openResource(id){
 const r=resource(id);if(!r)return;
 $('#resource-body').innerHTML='<header class="dialog-head"><div>'+tags(r)+'<h2 id="resource-title">'+esc(r.title)+'</h2></div><button class="close-dialog" aria-label="Cerrar ficha" id="close-dialog">×</button></header><div class="dialog-content"><p>'+esc(r.description)+'</p><dl class="file-facts"><dt>Materia</dt><dd>'+r.subjects.map(s=>esc(subject(s).title)).join(' · ')+'</dd><dt>Unidad / eje</dt><dd>'+esc(r.unit)+'</dd><dt>Archivo original</dt><dd>'+esc(r.originalName)+'</dd><dt>Ubicación de origen</dt><dd>'+esc(r.sourcePath)+'</dd><dt>Revisado</dt><dd>'+date(r.reviewedAt)+' '+r.reviewedAt.slice(0,4)+' · '+esc(r.review)+'</dd><dt>Acceso</dt><dd>'+esc(r.access)+'</dd></dl><div class="dialog-buttons"><a class="button" href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">Abrir en Drive ↗</a><button class="button secondary" id="show-preview">Ver documento aquí</button></div><div id="preview" class="preview-area"></div></div>';
 $('#close-dialog').addEventListener('click',()=>$('#resource-dialog').close());
 $('#show-preview').addEventListener('click',e=>{
  $('#preview').innerHTML='<p>Vista de Google Drive. Si el documento no aparece o pide acceso, abrilo con el botón superior. El sitio no puede comprobar el estado de una vista alojada en otro dominio.</p><iframe src="https://drive.google.com/file/d/'+encodeURIComponent(r.id)+'/preview" title="'+esc(r.title)+'" allow="fullscreen" referrerpolicy="no-referrer"></iframe>';
  e.currentTarget.disabled=true;e.currentTarget.textContent='Vista de Drive activada';
 });
 $('#resource-dialog').showModal();
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-resource]');if(b)openResource(b.dataset.resource);
 if(e.target.closest('[data-reset]')){
  if($('#search')){$('#search').value='';}
  document.querySelectorAll('.filters select').forEach(s=>s.value='');
  $('#search')?.dispatchEvent(new Event('input'));
 }
});
$('#resource-dialog').addEventListener('close',()=>{$('#resource-body').innerHTML='';});
$('#resource-dialog').addEventListener('click',e=>{if(e.target===$('#resource-dialog')){const rect=e.target.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)e.target.close();}});
const mobileMenu = window.matchMedia('(max-width: 760px)');
function setMenu(open, restoreFocus=false){
 const sidebar=$('#sidebar');
 sidebar.classList.toggle('open',open);
 sidebar.inert=mobileMenu.matches&&!open;
 $('#menu').setAttribute('aria-expanded',String(open));
 $('#menu').setAttribute('aria-label',open?'Cerrar navegación':'Abrir navegación');
 $('.shell').inert=open;
 $('#menu-backdrop').hidden=!open;
 document.body.classList.toggle('menu-open',open);
 if(open){sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');sidebar.setAttribute('aria-label','Navegación');$('#close-menu').focus();}
 else {sidebar.removeAttribute('role');sidebar.removeAttribute('aria-modal');sidebar.removeAttribute('aria-label');if(restoreFocus)$('#menu').focus();}
}
$('#menu').addEventListener('click',()=>setMenu(true));
$('#close-menu').addEventListener('click',()=>setMenu(false,true));
$('#menu-backdrop').addEventListener('click',()=>setMenu(false,true));
$('#sidebar').addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.getAttribute('href')===location.hash){setMenu(false);$('#main').focus();}});
mobileMenu.addEventListener('change',()=>setMenu(false));
setMenu(false);
document.addEventListener('keydown',e=>{
 if($('#sidebar').classList.contains('open')){
  if(e.key==='Escape'){e.preventDefault();setMenu(false,true);return;}
  if(e.key==='Tab'){
   const nodes=[...$('#sidebar').querySelectorAll('a,button')], first=nodes[0],last=nodes[nodes.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 }
 if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable&&!$('#resource-dialog').open){e.preventDefault();$('#search')?.focus();}
});
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();$('#main').focus();});
window.addEventListener('hashchange',()=>{route();$('#main').focus({preventScroll:true});});
fetch('./catalog.json').then(r=>{if(!r.ok)throw new Error('catalog');return r.json();}).then(d=>{
 if(!Array.isArray(d.resources)||!Array.isArray(d.subjects)||d.resources.some(r=>!safeURL(r.url)))throw new Error('data');
 DATA=d;nav();route();
}).catch(()=>{$('#main').innerHTML='<div class="error-box" role="alert"><h1>No se pudo cargar el catálogo.</h1><p>Revisá la conexión y volvé a intentarlo. Si abriste un archivo descargado, necesitás servir la carpeta desde un sitio web.</p><button class="button" onclick="location.reload()">Volver a intentar</button></div>';});
