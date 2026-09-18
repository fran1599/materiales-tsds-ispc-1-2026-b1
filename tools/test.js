'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'dist/catalog.json'), 'utf8'));
const nodes = new Map();
const node = selector => {
  if (!nodes.has(selector)) nodes.set(selector, { innerHTML: '', value: '', addEventListener() {}, querySelectorAll() { return []; } });
  return nodes.get(selector);
};
const context = vm.createContext({ document: { querySelector: node, querySelectorAll: () => [] }, Intl, Date, URL, URLSearchParams, console });
const code = fs.readFileSync(path.join(root, 'dist/app.js'), 'utf8').split("document.addEventListener('click'")[0];
vm.runInContext(code + '\nDATA=' + JSON.stringify(data) + ';', context);
const run = expression => vm.runInContext(expression, context);
assert.equal(run("monday('2026-09-20')"), '2026-09-14');
assert.equal(run("shiftDate('2026-12-31',1)"), '2027-01-01');
assert.equal(run("schedulesOn('2026-09-14').length"), 1);
assert.equal(run("schedulesOn('2026-09-16').length"), 2);
assert.equal(run("schedulesOn('2026-09-18').length"), 0);
assert.equal(run("schedulesOn('2026-09-07').length"), 0); // Do not invent earlier classes.
assert.equal(run("schedulesOn('2026-11-16','bases').length"), 1);
assert.equal(run("schedulesOn('2026-11-23','bases').length"), 0); // Until is a recurrence boundary.
assert.equal(run("schedulesOn('2026-11-26','comunicacion2').length"), 1);
assert.equal(run("schedulesOn('2026-12-03','comunicacion2').length"), 0);
assert.ok(run("DATA.resources.some(r=>matches(r,'logica digital'))"));
assert.equal(run("esc('<script>')"), '&lt;script&gt;');
assert.equal(run("safeURL('javascript:alert(1)')"), false);
run("renderWeek('#week')");
assert.match(node('#week').innerHTML, /Semana anterior/);
assert.doesNotMatch(node('#week').innerHTML, /undefined|NaN/);
for (const s of data.subjects) {
  run(`subjectPage(${JSON.stringify(s.id)},'clases')`);
  assert.doesNotMatch(node('#subject-content').innerHTML, /undefined|NaN/);
}
// Exercise automatic theme changes, persisted override and unavailable storage.
const themeCode = fs.readFileSync(path.join(root, 'dist/theme.js'), 'utf8');
function theme(saved, blocked=false) {
  const media = { matches: true, addEventListener(_, fn) { this.change = fn; } };
  const select = { addEventListener(_, fn) { this.change = fn; } };
  const doc = { documentElement: { dataset: {} }, querySelector: () => select, addEventListener(_, fn) { fn(); } };
  vm.runInNewContext(themeCode, { document: doc, window: { matchMedia: () => media }, localStorage: { getItem() { if(blocked)throw Error();return saved; }, setItem() { if(blocked)throw Error(); } } });
  return { media, select, state: doc.documentElement.dataset };
}
const auto = theme(null);
assert.equal(auto.state.theme, 'dark');
auto.media.matches = false; auto.media.change();
assert.equal(auto.state.theme, 'light');
auto.select.value = 'dark'; auto.select.change();
auto.media.change(); assert.equal(auto.state.theme, 'dark');
assert.equal(theme('light').state.theme, 'light');
assert.equal(theme(null,true).state.theme, 'dark');
console.log('OK: recurrencias, búsqueda, fichas de clases y preferencias de tema.');

// Calendar drafts preserve local time, title, links and weekly boundaries.
const moduleDraft = new URL(run("calendarURL(DATA.schedules[0],'programacion','2026-09-18')"));
assert.equal(moduleDraft.searchParams.get('text'),'Programación I');
assert.equal(moduleDraft.searchParams.get('dates'),'20260921T212000Z/20260921T234000Z');
assert.equal(moduleDraft.searchParams.get('ctz'),'America/Argentina/Cordoba');
assert.equal(moduleDraft.searchParams.get('recur'),'RRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20261118T025900Z');
assert.match(moduleDraft.searchParams.get('details'),/Meet: https:\/\/meet.google.com\/xqz-gmfr-dhc/);
assert.match(moduleDraft.searchParams.get('details'),/id=4279/);
assert.equal(run("calendarURL(DATA.schedules[0],null,'2026-11-18')"),null);
const mathDraft=new URL(run("calendarURL(DATA.schedules[2],'matematica','2026-09-18')"));
assert.equal(mathDraft.searchParams.get('recur'),'RRULE:FREQ=WEEKLY;BYDAY=WE');
assert.match(mathDraft.searchParams.get('details'),/Sin fecha de fin confirmada/);
assert.equal(run("nextClass(DATA.schedules[2],'2026-09-01')"),'2026-09-16');
const workDraft=new URL(run("calendarURL(DATA.schedules[3],null,'2026-09-18')"));
assert.doesNotMatch(workDraft.searchParams.get('details'),/Aula virtual/);
run("subjectPage('matematica')");
assert.ok(node('#main').innerHTML.indexOf('Entrar a Meet')<node('#main').innerHTML.indexOf('class="tabs"'));
assert.match(run("card(subject('matematica'))"),/<details class="card-details">/);
console.log('OK: enlaces Calendar, horarios UTC−3 y accesos antes de las pestañas.');
