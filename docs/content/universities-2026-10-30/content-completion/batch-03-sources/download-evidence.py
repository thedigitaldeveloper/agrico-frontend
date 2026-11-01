from pathlib import Path
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
import json
ROOT = Path(__file__).resolve().parent
TARGETS = {
 'aus-prospectus-2026-27.pdf': 'https://www.arunachaluniversity.ac.in/aus/prospectus/AUS%20Prospectus%202026-27.pdf',
 'gku-prospectus-2025-26.pdf': 'https://www.gku.ac.in/public/uploads/page_section_attributes/NjonmmIpxcbOkvFoejgohlFRlHQF9wFaLVGS2vj7.pdf',
 'soa-fees-box.html': 'https://soadu.app.box.com/s/ixgqyh556vfdf2thrxgjzhvzbnw8hlk0',
 'soa-scholarships-box.html': 'https://soadu.app.box.com/s/wdzsogkipivhkh1sch82p3ax0hdmtojy',
}
def fetch(item):
 name, url = item
 try:
  response = urlopen(Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=50)
  body = response.read(100 * 1024 * 1024)
  (ROOT / name).write_bytes(body)
  result = {'file':name, 'url':url, 'status':response.status, 'bytes':len(body), 'content_type':response.headers.get('Content-Type')}
  if body.startswith(b'%PDF'):
   import fitz
   pdf = fitz.open(stream=body, filetype='pdf')
   text = '\n'.join('\nPAGE '+str(i+1)+'\n'+page.get_text() for i,page in enumerate(pdf))
   (ROOT / (name+'.txt')).write_text(text, encoding='utf-8')
   result['pages'] = len(pdf)
  return result
 except Exception as error: return {'file':name, 'url':url, 'error':str(error)}
results = list(ThreadPoolExecutor(max_workers=4).map(fetch, TARGETS.items()))
(ROOT / 'download-results.json').write_text(json.dumps(results,indent=2), encoding='utf-8')
print(json.dumps(results,indent=2))
