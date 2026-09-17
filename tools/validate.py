import json,re,pathlib,datetime,urllib.parse
root=pathlib.Path(__file__).resolve().parents[1]
data=json.loads((root/'dist/catalog.json').read_text())
ss={s['id'] for s in data['subjects']}
ids=[r['id'] for r in data['resources']]
assert len(ids)==len(set(ids)), 'Identificadores duplicados'
for r in data['resources']:
 assert set(r['subjects'])<=ss and r['subjects']
 assert all(r.get(k) for k in ['title','description','unit','kind','originalName','reviewedAt'])
 u=urllib.parse.urlparse(r['url'])
 assert u.scheme=='https' and u.hostname in ['drive.google.com','docs.google.com']
 assert '/d/'+r['id']+'/' in u.path
 assert r['format'] in ['PDF','DOCX','PPTX']
 datetime.date.fromisoformat(r['reviewedAt'])
for s in data['subjects']:
 assert s['source'] is None or s['source'] in ids
for e in data['events']:
 assert set(e['subjects'])<=ss and e['subjects']
 assert e['source'] in ids
 assert datetime.date.fromisoformat(e['start'])<=datetime.date.fromisoformat(e['end'])
 if e.get('time'):datetime.time.fromisoformat(e['time'])
for c in data['classes']:
 assert set(c['subjects'])<=ss and c['subjects']
 u=urllib.parse.urlparse(c['url'])
 assert u.scheme=='https' and u.hostname in ['meet.google.com','acceso.ispc.edu.ar']
schedule_ids=[]
for s in data.get('schedules',[]):
 schedule_ids.append(s['id'])
 assert set(s['subjects'])<=ss and s['subjects']
 assert s['timeZone']=='America/Argentina/Cordoba'
 start=datetime.date.fromisoformat(s['validFrom'])
 assert start.isoweekday()==s['weekday']
 assert datetime.time.fromisoformat(s['startTime'])<datetime.time.fromisoformat(s['endTime'])
 if s['until']:assert start<=datetime.date.fromisoformat(s['until'])
 assert s['source'] and s['note']
 assert re.fullmatch(r'https://meet\.google\.com/[a-z]{3}-[a-z]{4}-[a-z]{3}',s['meetUrl'])
 for key in ['classroomUrl','recordingsUrl']:
  if s[key]:
   u=urllib.parse.urlparse(s[key]);assert u.scheme=='https' and u.hostname=='acceso.ispc.edu.ar'
assert len(schedule_ids)==len(set(schedule_ids))
html=(root/'dist/index.html').read_text()
for ref in re.findall(r'(?:href|src)="(\./[^"]+)"',html):
 assert (root/'dist'/ref).is_file(),ref
assert 'catalog.json' in (root/'dist/app.js').read_text()
assert not any(p.suffix.lower()=='.pdf' for p in (root/'dist').rglob('*')), 'Los documentos originales no deben copiarse al sitio'
print(f"OK: {len(ids)} recursos únicos, {len(ss)} secciones, {len(data['events'])} entradas de agenda y enlaces locales.")
