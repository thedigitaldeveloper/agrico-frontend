import json,hashlib,concurrent.futures,io
from pathlib import Path
from urllib.request import Request,urlopen
from html.parser import HTMLParser
from urllib.parse import urljoin
base=Path('docs/content/universities-2026-10-30'); target=base/'content-completion/batch-01-sources'
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
urls={
'https://www.apachc.in/ac/faculty.html':[1], 'https://www.apachc.in/ac/about-the-college.html':[1], 'https://www.apachc.in/ac/bsc-agriculture.html':[1],
'https://acar.ac.in/index/faculty/':[2], 'https://acar.ac.in/wp-content/uploads/2026/05/ACAR-Scholarship-Details-1.png':[2], 'https://acar.ac.in/index/placements/':[2],
'https://pgpagricollege.ac.in/departmental-faculty/':[5], 'https://pgpagricollege.ac.in/contact/':[5],
'https://pushkaram.in/contact-us/':[6], 'https://tiac.rajas.edu/faculty/':[7],
'https://palaragri.ac.in/faculties-agronomy/':[8], 'https://palaragri.ac.in/scholarship-cell/':[8],
'https://roeveragri.ac.in/academics/crop-management/':[9], 'https://roeveragri.ac.in/placement/':[9],
'https://upcollege.ac.in/about/faculty':[10], 'https://upcollege.ac.in/about/contact':[10],
'https://www.sbvr.in/agriculturecollege/faculty/':[11], 'https://nsagri.ac.in/faculty':[12],
'https://skcas.ac.in/admissions/':[13], 'https://www.gadvasu.in/Welcome/download/document/225':[14],
'https://khalsacollege.edu.in/images/feestructure.pdf':[15], 'https://khalsacollege.edu.in/images/admissionprocedure.pdf':[15],
'https://ghru.edu.in/bsc-agriculture':[16], 'https://ghru.edu.in/scholarship':[16], 'https://ghru.edu.in/contact':[16],
'https://www.jagannathuniversity.org/faculties/agriculture':[17], 'https://www.jagannathuniversity.org/faculties/agriculture/bsc-hons-agriculture':[17], 'https://www.jagannathuniversity.org/contact-us':[17],
'https://www.jnujaipur.ac.in/scholarships':[18], 'https://www.jnujaipur.ac.in/contact-us':[18],
'https://www.cuchd.in/contact/':[19], 'https://www.cuchd.in/admissions/course-fee.php':[19], 'https://www.cuchd.in/scholarship/':[19],
'https://eternaluniversity.edu.in/fee':[20], 'https://eternaluniversity.edu.in/content/university-scholarships':[20], 'https://eternaluniversity.edu.in/ContactUs':[20],
'https://eternaluniversity.edu.in/docs/final-prospectus-1to75-changes1(1)om23.9.2623.48FINALPPT(1)(3)38om9.55(1)(3)FINAL15.24.pdf':[20],
'https://angrau.ac.in/UPLOADS/AdmissionsPDFs/Revised_Manual_coun_chedule_30_10.pdf':[11,12,13]
}
def fetch(item):
 url,ids=item;k=hashlib.sha256(url.encode()).hexdigest()[:16];r0={'url':url,'institution_ids':ids,'key':k}
 try:
  with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=18) as r:body=r.read(25*1024*1024);r0.update(status=r.status,final_url=r.url,content_type=r.headers.get('Content-Type',''))
  if b'%PDF-' in body[:2048]:
   file=target/(k+'.pdf');file.write_bytes(body)
   try:
    import fitz
    pdf=fitz.open(file);r0['text']='\n'.join(p.get_text() for p in pdf);r0['page_count']=len(pdf)
   except ImportError:
    from pypdf import PdfReader
    pdf=PdfReader(io.BytesIO(body));r0['text']='\n'.join(p.extract_text() or '' for p in pdf.pages)
  elif r0['content_type'].startswith('image/'):
   file=target/(k+'.png');file.write_bytes(body);r0['image_file']=str(file)
  else:
   text=body.decode('utf8',errors='replace');(target/(k+'.html')).write_text(text,encoding='utf8');p=Parser();p.feed(text);r0.update(text='\n'.join(p.parts),links=p.links)
  (target/(k+'.json')).write_text(json.dumps(r0,ensure_ascii=False,indent=2),encoding='utf8')
 except Exception as e:r0['error']=str(e)
 return {k:v for k,v in r0.items() if k not in ['text','links']}
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:results=list(ex.map(fetch,urls.items()))
(target/'fetch-more-log.json').write_text(json.dumps(results,indent=2),encoding='utf8')
print(json.dumps({'requests':len(results),'success':sum('error' not in r for r in results),'failures':[r for r in results if 'error' in r]},indent=2))
