import json,hashlib,concurrent.futures,re
from pathlib import Path
from urllib.request import Request,urlopen
from html.parser import HTMLParser
base=Path('docs/content/universities-2026-10-30'); target=base/'content-completion/batch-01-sources'
profiles=[x for x in json.loads((base/'institutions.json').read_text(encoding='utf8'))['institutions'] if x['id']<=20]
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.links=[];self.skip=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ['script','style']:self.skip+=1
  if tag=='a' and a.get('href'):self.links.append(a['href'])
 def handle_endtag(self,tag):
  if tag in ['script','style']:self.skip=max(self.skip-1,0)
 def handle_data(self,data):
  if not self.skip and data.strip():self.parts.append(data.strip())
urls={}
for p in profiles:
 for url in [p['identity']['website'],p['identity'].get('admissions_url'),*[g.get('next_source') for g in p['verification_gaps']]]:
  if url:urls.setdefault(url,[]).append(p['id'])
def fetch(item):
 url,ids=item;k=hashlib.sha256(url.encode()).hexdigest()[:16];record={'url':url,'institution_ids':sorted(set(ids)),'key':k}
 try:
  with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=18) as r:body=r.read(25*1024*1024);record.update(status=r.status,final_url=r.url,content_type=r.headers.get('Content-Type',''))
  if body[:4]==b'%PDF':
   file=target/(k+'.pdf');file.write_bytes(body)
   try:
    from pypdf import PdfReader
    text='\n'.join(p.extract_text() or '' for p in PdfReader(file).pages);record['text']=text
   except Exception as e:record['parse_error']=str(e)
  else:
   text=body.decode('utf8',errors='replace');(target/(k+'.html')).write_text(text,encoding='utf8');p=Parser();p.feed(text);record.update(text='\n'.join(p.parts),links=p.links)
  (target/(k+'.json')).write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf8')
  return {k:v for k,v in record.items() if k not in ['text','links']}
 except Exception as e:record['error']=str(e);return record
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:results=list(ex.map(fetch,urls.items()))
(target/'fetch-log.json').write_text(json.dumps(results,indent=2),encoding='utf8')
print(json.dumps(results,indent=2))
