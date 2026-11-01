from urllib.request import Request,urlopen
from pathlib import Path
import json
from pypdf import PdfReader
from io import BytesIO
p=Path('docs/content/universities-2026-10-30/content-completion/batch-01-sources');url='https://ucanapplym.s3.ap-south-1.amazonaws.com/TNAU%2BUG%2BBrochure%2B2026-2027%2B-%2B%2813.05.2026%29.pdf';record={'url':url,'checked_on':'2026-10-31'}
try:
 with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=20) as r:b=r.read(20*1024*1024);record['status']=r.status
 (p/'tnau-ug-brochure-2026-27.pdf').write_bytes(b);r=PdfReader(BytesIO(b));record['pages']=len(r.pages);record['text']='\n'.join(x.extract_text() or '' for x in r.pages);(p/'tnau-ug-brochure-2026-27.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps({k:v for k,v in record.items() if k!='text'}))
except Exception as e:print(str(e))
