from pathlib import Path
import json,urllib.request,urllib.parse,concurrent.futures,re,time
from html.parser import HTMLParser
base=Path('docs/content/universities-2026-10-30'); out=base/'content-completion/batch-02-sources';out.mkdir(parents=True,exist_ok=True)
p=json.loads((base/'institutions.json').read_text(encoding='utf8'))['institutions'];p=[x for x in p if 21<=x['id']<=40]
class Parse(HTMLParser):
 def __init__(self):super().__init__();self.text=[];self.links=[];self.skip=0
 def handle_starttag(self,t,a):
  if t in ['script','style']:self.skip+=1
  attrs=dict(a)
  if t=='a' and attrs.get('href'):self.links.append(attrs['href'])
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip and d.strip():self.text.append(d.strip())
def get(job):
 i,url=job;key=str(i)+'-'+__import__('hashlib').sha256(url.encode()).hexdigest()[:12];record={'id':i,'requested_url':url,'file':key}
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=18) as r:
   raw=r.read(30*1024*1024);record.update(url=r.url,status=r.status,content_type=r.headers.get('Content-Type',''))
  if record['content_type'].startswith('image/'):
   (out/(key+'.jpg')).write_bytes(raw);record['links']=[];return record
  if raw.startswith(b'%PDF'):
   (out/(key+'.pdf')).write_bytes(raw)
   from pypdf import PdfReader
   doc=PdfReader(out/(key+'.pdf'));record['text']='\n'.join(page.extract_text() or '' for page in doc.pages[:35]);record['links']=[]
  else:
   txt=raw.decode('utf8','replace');(out/(key+'.html')).write_text(txt,encoding='utf8');parser=Parse();parser.feed(txt);record['text']='\n'.join(parser.text);record['links']=list(dict.fromkeys(urllib.parse.urljoin(record['url'],h) for h in parser.links if h.startswith(('http','/','?')) or not ':' in h))
  (out/(key+'.txt')).write_text(record.pop('text'),encoding='utf8')
 except Exception as e:record['error']=str(e)
 return record
jobs=json.loads((out/'extra-jobs.json').read_text())
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:records=list(ex.map(get,jobs))
(out/'index-extra.json').write_text(json.dumps(records,indent=2),encoding='utf8');print(json.dumps({'pages':len(records),'ok':sum('status'in x for x in records),'errors':sum('error'in x for x in records)}))
