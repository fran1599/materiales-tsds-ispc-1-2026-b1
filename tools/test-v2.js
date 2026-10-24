// Run with Node; no dependencies. Checks shared-catalog navigation and date/link behavior.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = new Map();
function node(key) { if (!nodes.has(key)) nodes.set(key,{value:'',innerHTML:'',textContent:'',addEventListener(){},insertAdjacentHTML(){},focus(){},select(){},showModal(){this.open=true;},close(){this.open=false;}}); return nodes.get(key); }
const context = vm.createContext({URL,URLSearchParams,Intl,Date,console,document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){}},location:{hash:'#inicio',href:'https://example.org/v2/#inicio'},window:{addEventListener(){},scrollTo(){}},fetch:()=>new Promise(()=>{})});
vm.runInContext(fs.readFileSync('v2/app.js','utf8'),context);
vm.runInContext('DATA = '+fs.readFileSync('dist/catalog.json','utf8'),context);
const run = code => vm.runInContext(code,context);
const catalog = JSON.parse(fs.readFileSync('dist/catalog.json','utf8'));
for(const section of ['inicio','entregas','materiales','informacion']) {
 context.location.hash='#'+section;run('render()');assert.ok(node('#main').innerHTML.includes('<h1>'));
 for(const s of catalog.subjects){context.location.hash=`#materia/${s.id}/${section}`;run('render()');assert.ok(node('#main').innerHTML.includes(s.title.replaceAll('&','&amp;')));}
}
context.location.hash='#materiales';run('render()');assert.equal(node('#count').textContent,catalog.resources.length+' materiales encontrados');
node('#search').value='unlikely-no-match';run('renderResources()');assert.match(node('#count').textContent,/0 materiales/);
assert.equal(run('safe("javascript:alert(1)")'),'');assert.equal(run('esc("<img>")'),'&lt;img&gt;');

context.location.hash='#entregas';run('render()');
assert.match(node('#main').innerHTML,/Entregas y defensas de ABP/);
assert.match(node('#main').innerHTML,/Coloquios promocionales/);
assert.match(node('#main').innerHTML,/Grupo G – libManager/);
assert.match(node('#main').innerHTML,/Fecha no publicada/);
assert.match(node('#main').innerHTML,/Inscripciones desde/);
const defense=new URL(run("singleCalendarURL(DATA.importantDates.find(d=>d.id==='abp-module-day-1'))"));
assert.equal(defense.searchParams.get('dates'),'20261026T212500Z/20261026T234000Z');
run('openCorrection("important","abp-module-day-1")');assert.match(node('#proposal').value,/Fecha publicada: 2026-10-26/);

const url=new URL(run('calendarURL(DATA.schedules[0],"programacion","2026-10-12")'));
assert.equal(url.searchParams.get('text'),'Programación I');assert.match(url.searchParams.get('dates'),/^20261012T212000Z\/20261012T234000Z$/);
assert.match(url.searchParams.get('recur'),/BYDAY=MO;UNTIL=20261118T025900Z/);assert.match(url.searchParams.get('details'),/Aula virtual: https:/);
assert.match(new URL(run('calendarURL(DATA.schedules[2],"matematica","2026-10-12")')).searchParams.get('details'),/Sin fecha final confirmada/);
assert.equal(run('calendarURL(DATA.schedules[0],"programacion","2027-01-01")'),'');
run('openCorrection("event",0)');const issue=new URL(node('#issue').href);assert.equal(issue.pathname,'/fran1599/materiales-tsds-ispc-1-2026-b1/issues/new');assert.match(issue.searchParams.get('body'),/Fuente actual: https:/);assert.match(issue.searchParams.get('body'),/Fecha del aviso/);assert.equal(node('#correction').open,true);
console.log('v2: all course routes, filters, safe links, calendar timezone/recurrence and correction context passed');

// A local subject filter must combine with search and show the subject before expansion.
context.location.hash='#materiales';node('#search').value='';node('#material-subject').value='sistemas';run('render()');
assert.equal(node('#count').textContent,catalog.resources.filter(r=>r.subjects.includes('sistemas')).length+' materiales encontrados');
assert.match(node('#resources').innerHTML,/<summary>.*resource-subject">Sistemas y Organizaciones<\/span>/);
node('#search').value='evidencia 6';run('renderResources()');assert.match(node('#count').textContent,/1 material encontrado/);
context.location.hash='#materia/sistemas/materiales';run('render()');assert.ok(!node('#main').innerHTML.includes('id="material-subject"'));
assert.equal(run("addDays('2026-12-31',1)"),'2027-01-01');assert.equal(run("moveMonth('2026-12-31',1)"),'2027-01-01');assert.equal(run("monday('2026-11-01')"),'2026-10-26');
assert.equal(run("calendarWeeks('2026-11-15','month').length"),6);
assert.equal(run("calendarWeeks('2026-10-12','week').length"),1);
run("var sampleEvents=[{start:'2026-10-12',end:'2026-10-16',title:'Semana'},{start:'2026-10-14',end:'2026-10-14',title:'Coincide'},{start:'2026-10-17',end:'2026-10-20',title:'Continúa'}];var segments=weekSegments(sampleEvents,'2026-10-12')");
assert.equal(run('segments[0].span'),5);assert.equal(run('segments[0].col'),0);assert.equal(run('segments[1].lane'),1);assert.equal(run('segments[2].span'),2);assert.equal(run('segments[2].continuesAfter'),true);
assert.equal(run("weekSegments(sampleEvents,'2026-10-19')[0].span"),2);assert.equal(run("weekSegments(sampleEvents,'2026-10-19')[0].continuesBefore"),true);
assert.equal(run("weekSegments(sampleEvents,'2026-10-26').length"),0);
context.location.hash='#entregas';run("deliveryView='month';calendarAnchor='2026-10-12';render()");assert.match(node('#delivery-content').innerHTML,/calendar-event/);assert.match(node('#delivery-content').innerHTML,/data-event=/);
run("deliveryView='week';renderDeliveryView()");assert.match(node('#delivery-content').innerHTML,/Semana siguiente/);
console.log('v2 calendar: inclusive ranges, crossing weeks/months/years, overlapping lanes and subject filters passed');
