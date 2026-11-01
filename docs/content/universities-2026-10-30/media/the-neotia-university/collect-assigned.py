import json,re,sys,importlib.util,concurrent.futures,io
from pathlib import Path
ROOT=Path('D:/agrico-frontend')
BASE=ROOT/'docs/content/universities-2026-10-30'
spec=importlib.util.spec_from_file_location('media',ROOT/'scripts/agrico-media.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
profiles={x['id']:x for x in json.loads((BASE/'institutions.json').read_text(encoding='utf-8'))['institutions'] if x['id']>=41}
if sys.argv[1]=='pages':
 routes={42:'https://scopes.cutm.ac.in/',45:'https://www.iul.ac.in/Default.aspx',46:'https://www.careers360.com/colleges/sri-kinjarapu-yerran-naidu-college-of-agricultural-sciences-srikakulam',47:'https://www.careers360.com/university/sri-satya-sai-university-of-technology-and-medical-sciences-sehore',48:'https://www.gla.ac.in/ramsia/',50:'https://www.infra.soa.ac.in/',52:'https://www.arunachaluniversity.ac.in/gallery',53:'https://sraap.in/',55:'https://www.itmuniversity.ac.in/',56:'https://rkdf.ac.in/',57:'https://www.rnbglobal.edu.in/photo-gallery/album/infrastructure-at-rnb-global-university'}
 def page(i):
  try:
   r,b=m.fetch(routes[i]);s=b.decode('utf-8',errors='replace');p=m.ImageCandidates(r.url);p.feed(s)
   for v in re.findall(r'''["']([^"'<>\s]+\.(?:png|jpe?g|webp|svg|avif)(?:\?[^"'<>\s]*)?)["']''',s,re.I):p.add(v,'embedded')
   for v in re.findall(r'''url\(['"]?([^)'"\s]+)''',s):p.add(v,'background')
   items=[];seen=set()
   for a in p.items:
    if a['url'] not in seen:items.append(a);seen.add(a['url'])
   out={'id':i,'slug':profiles[i]['slug'],'source_page':r.url,'candidates':items};folder=BASE/'media'/profiles[i]['slug'];folder.mkdir(parents=True,exist_ok=True);(folder/'discovery-alt.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
   print(i,r.url,len(items),flush=True)
   for n,a in enumerate(items[:25]):print(n,a['url'],a['alt'],flush=True)
  except Exception as e:print(i,'ERROR',str(e),flush=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:list(ex.map(page,[i for i in routes if len(sys.argv)==2 or str(i) in sys.argv[2:]]))
if sys.argv[1]=='qa':
 from PIL import Image,ImageDraw
 files=[]
 for i,x in profiles.items():
  f=BASE/'media'/x['slug']/'assets.json'
  if f.exists():
   for a in json.loads(f.read_text(encoding='utf-8'))['assets']:
    files.append((i,a))
 sheet=Image.new('RGB',(1280,250*((len(files)+3)//4)), '#eeeeee');draw=ImageDraw.Draw(sheet)
 for n,(i,a) in enumerate(files):
  try:
   if a['file'].endswith('.svg'):
    import base64
    import xml.etree.ElementTree as ET
    svgroot=ET.parse(BASE/a['file']).getroot();values=[v for element in svgroot.iter() for v in element.attrib.values() if v.startswith('data:image/')]
    if not values:continue
    im=Image.open(io.BytesIO(base64.b64decode(values[0].split(',',1)[1])))
   else:im=Image.open(BASE/a['file'])
   rgba=im.convert('RGBA');im=Image.new('RGB',rgba.size,'white');im.paste(rgba,mask=rgba.getchannel('A'));im.thumbnail((310,215));xx=(n%4)*320;yy=(n//4)*250;sheet.paste(im,(xx+(310-im.width)//2,yy+25));draw.text((xx+5,yy+5),str(i)+' '+a['role'],fill='black')
  except Exception as e:print('QA',i,a['role'],str(e))
 sheet.save(BASE/'media'/'the-neotia-university'/'batch-qa.jpg');print(len(files))
if sys.argv[1]=='finalize':
 for i,x in profiles.items():
  folder=BASE/'media'/x['slug'];f=folder/'assets.json'
  if not f.exists():print('MISSING',i);continue
  doc=json.loads(f.read_text(encoding='utf-8'))
  if i==51:
   doc['assets']=[a for a in doc['assets'] if not (a['role']=='campus_secondary' and 'gku-life-6972016fb03c7' in a['download_url'])];doc['gaps'].append({'role':'campus_secondary','reason':'Homepage library promo shows students against a generic backdrop; excluded because the physical campus setting cannot be verified.','attempted_sources':['https://gku.ac.in/']})
  for a in doc['assets']:
   a['review_status']='needs_visual_review' if i==43 and a['file'].endswith('.svg') else 'verified_source'
   if a['role'] in ['campus_primary','campus_secondary'] and a['width']<800:a['notes']+=' Authentic source is below preferred 800px photo width; retained at original resolution without upscaling.'
   if a['role']=='logo' and (a['width']<96 or a['height']<96):a['notes']+=' Header wordmark has a short native height; preserve aspect ratio.'
   if i==46 and a['role']=='logo':
    a['description']=a['alt']='Sri Kinjarapu Yerran Naidu College of Agricultural Sciences college seal';a['identity_evidence']='Visually inspected college-specific crest reads SKYCAS and ESTD 2016; this is not the generic ANGRAU university mark. Served as logo on named Careers360 college profile.'
   if i==58 and a['role']=='campus_secondary':a['description']=a['alt']='Basketball court and adjacent academic building at Tilak Dhari P.G. College, Jaunpur';a['notes']+=' Source alt says Classroom, but visible content is an outdoor basketball court; corrected descriptive alt after inspection.'
   if i==55 and a['role']=='campus_secondary':a['description']=a['alt']='Students in a computer-based teaching laboratory at ITM University Gwalior'
   if i==55 and a['role']=='campus_primary':a['description']=a['alt']='Panoramic evening view of ITM University Gwalior campus buildings';a['notes']+=' Source is a dark evening panorama.'
   if i in [44,54,55] and a['role']=='logo':a['notes']+=' Official wordmark contains white lettering intended for a dark background.'
   if i==54 and a['role']=='card_logo':a['notes']+=' Separate official emblem; source is 226 by 174 pixels, not an exact square. No artificial square crop created.'
   if i==45 and a['role']=='campus_primary':a['notes']+=' Official aerial campus photo includes promotional text overlay in the original; unchanged.'
   if i==56 and a['role']=='campus_secondary':a['description']=a['alt']='Students demonstrating academic equipment at RKDF University Bhopal'
  goodroles={a['role'] for a in doc['assets']};doc['gaps']=[g for g in doc['gaps'] if g['role'] not in goodroles]
  # Remove failed non-image payloads and superseded selections only within assigned folders.
  referenced={Path(a['file']).name for a in doc['assets']}
  for p in folder.iterdir():
   if p.suffix=='.download' or (p.suffix.lower() in ['.jpg','.jpeg','.png','.webp','.svg','.gif'] and p.name not in referenced and p.name!='batch-qa.jpg'):p.unlink()
  f.write_text(json.dumps(doc,indent=2,ensure_ascii=False),encoding='utf-8')
  print(i,len(doc['assets']),','.join(sorted(goodroles)),len(doc['gaps']),flush=True)
if sys.argv[1]=='validate':
 rows=[]
 for i,x in profiles.items():
  folder=BASE/'media'/x['slug'];f=folder/'assets.json';doc=json.loads(f.read_text(encoding='utf-8'))
  if i==51:
   for a in doc['assets']:
    if a['role']=='campus_secondary':a['description']=a['alt']='Student selecting books in Guru Kashi University central library'
  if i==54:
   discarded=[a for a in doc['assets'] if a['role']=='card_logo'];doc['assets']=[a for a in doc['assets'] if a['role']!='card_logo']
   for a in discarded:(BASE/a['file']).unlink(missing_ok=True)
  for a in doc['assets']:
   meta=m.inspect_image(BASE/a['file']);assert meta['sha256']==a['sha256'],a['file']
   if i==52:a['review_status']='verified_source'
   if meta['format']=='MPO':a['notes']+=' Source JPEG includes MPF/MPO metadata; original JPEG-compatible bytes preserved under .jpg extension.'
   assert meta['width']==a['width'] and meta['height']==a['height'],a['file']
   if a['file'].endswith('.svg'):assert meta['safe_static_svg'],a['file']
   for k in ['role','cms_field','file','source_page','download_url','source_kind','description','alt','campus','agriculture_specific','identity_evidence','rights_status','attribution','review_status','notes']:assert k in a,(i,k)
  assert any(a['role']=='logo' for a in doc['assets']),i
  assert any(a['role']=='campus_primary' for a in doc['assets']),i
  f.write_text(json.dumps(doc,indent=2,ensure_ascii=False),encoding='utf-8')
  rows.append({'id':i,'assets':len(doc['assets']),'logos':sum(a['role']=='logo' for a in doc['assets']),'card_logos':sum(a['role']=='card_logo' for a in doc['assets']),'photos':sum(a['role'].startswith('campus_') for a in doc['assets']),'pending_visual':[a['file'] for a in doc['assets'] if a['review_status']!='verified_source']})
 (BASE/'media/the-neotia-university/assigned-coverage.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
 print(json.dumps({'institutions':len(rows),'selected_assets':sum(x['assets'] for x in rows),'logos':sum(x['logos'] for x in rows),'card_logos':sum(x['card_logos'] for x in rows),'photos':sum(x['photos'] for x in rows),'pending_visual':[p for x in rows for p in x['pending_visual']]},indent=2))
if sys.argv[1]=='list':
 for i in map(int,sys.argv[2:]):
  p=BASE/'media'/profiles[i]['slug']/'discovery.json'
  if p.exists():
   d=json.loads(p.read_text(encoding='utf-8'));print('\nID',i,d['source_page'])
   for n,x in enumerate(d['candidates']):
    if re.search('campus|about|agri|building|banner|logo|library|infrastructure',x['url']+' '+x['alt'],re.I) and not re.search('company-logo|icon|ranking|recruit|approve',x['url'],re.I):print(n,x['url'],x['alt'])
if sys.argv[1] in ['all','all-alt']:
 for i in map(int,sys.argv[2:]):
  p=BASE/'media'/profiles[i]['slug']/('discovery-alt.json' if sys.argv[1]=='all-alt' else 'discovery.json')
  if p.exists():
   d=json.loads(p.read_text(encoding='utf-8'));print('\nID',i)
   for n,x in enumerate(d['candidates']):print(n,x['url'],x['alt'])
if sys.argv[1] in ['extra','extra2','extra3','extra4']:
 plans=json.loads((BASE/('media/the-neotia-university/extra-plan'+('' if sys.argv[1]=='extra' else sys.argv[1][-1])+'.json')).read_text(encoding='utf-8'))
 def extra(i):
  x=profiles[i];folder=BASE/'media'/x['slug'];folder.mkdir(parents=True,exist_ok=True);f=folder/'assets.json'
  doc=json.loads(f.read_text(encoding='utf-8')) if f.exists() else {'id':i,'slug':x['slug'],'name':x['name'],'checked_on':'2026-10-30','assets':[],'gaps':[]}
  for a in [z for z in plans if z['id']==i]:
   try:
    r,data=m.fetch(a['url'],True);tmp=folder/(a['role']+'.download');tmp.write_bytes(data);meta=m.inspect_image(tmp)
    if meta['extension']=='.download':
     if meta['format']=='MPO':meta['extension']='.jpg'
     else:raise ValueError('Unmapped real image format '+meta['format'])
    final=folder/(a.get('filename',a['role']+'-verified')+meta['extension']);tmp.replace(final)
    asset={'role':a['role'],'cms_field':{'logo':'logo','card_logo':'card_logo','campus_primary':'image','campus_secondary':'gallery_candidate'}[a['role']],'file':str(final.relative_to(BASE)).replace('\\','/'),'source_page':a['page'],'download_url':a['url'],'source_kind':a.get('kind','official'),'description':a['description'],'alt':a['description'],'campus':x['identity']['city']+', '+x['identity']['state'],'agriculture_specific':a.get('agri',False),'identity_evidence':a['evidence'],'rights_status':'public_source_no_explicit_license','attribution':a.get('credit',x['name']),'review_status':'needs_visual_review','notes':a.get('notes','Original downloaded bytes preserved.'),'width':meta['width'],'height':meta['height'],'sha256':meta['sha256']}
    doc['assets']=[z for z in doc['assets'] if z['role']!=a['role']]+[asset];doc['gaps']=[z for z in doc['gaps'] if z['role']!=a['role']];print(i,a['role'],meta['width'],meta['height'],flush=True)
   except Exception as e:doc['gaps'].append({'role':a['role'],'reason':str(e),'attempted_sources':[a['page'],a['url']]});print(i,a['role'],'ERROR',str(e),flush=True)
   f.write_text(json.dumps(doc,indent=2,ensure_ascii=False),encoding='utf-8')
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:list(ex.map(extra,sorted(set(x['id'] for x in plans if len(sys.argv)==2 or str(x['id']) in sys.argv[2:]))))
if sys.argv[1]=='download':
 jobs={
 41:[('logo',0,'The Neotia University official wordmark',False),('campus_primary',57,'Teaching ship and surroundings on the Sarisa campus',False),('campus_secondary',58,'Cricket ground at The Neotia University campus',False)],
 43:[('logo',0,'Lovely Professional University official mark',False),('campus_primary',126,'Panoramic campus view at Lovely Professional University, Phagwara',False)],
 44:[('logo',0,'Kalasalingam Academy of Research and Education official mark',False),('campus_primary',1,'Academic building at Kalasalingam in Krishnankoil',False),('campus_secondary',7,'Biotechnology laboratory at Kalasalingam',False)],
 45:[('logo',5,'Integral University official mark',False),('campus_primary',6,'Integral University Lucknow campus view',False)],
 49:[('logo',0,'Shri Shivaji Education Society emblem used in the college header',False),('campus_primary',2,'Shri Shivaji Agriculture College campus view',False),('campus_secondary',3,'Shri Shivaji Agriculture College academic setting',False)],
 50:[('campus_primary',0,'Siksha O Anusandhan campus aerial view in Bhubaneswar',False)],
 51:[('logo',1,'Guru Kashi University official wordmark',False),('campus_primary',46,'Guru Kashi University campus at Talwandi Sabo',False),('campus_secondary',51,'Guru Kashi University library',False)],
 52:[('logo',5,'Arunachal University of Studies official mark',False),('campus_primary',4,'Arunachal University of Studies academic building in Namsai',False)],
 54:[('logo',2,'Malla Reddy University official mark',False)],
 55:[('logo',0,'ITM University Gwalior official mark',False),('campus_primary',23,'ITM University Gwalior campus',False)],
 56:[('logo',8,'RKDF University official mark',False)],
 58:[('logo',12,'Tilak Dhari P.G. College official emblem',False),('campus_primary',22,'Tilak Dhari P.G. College academic building in Jaunpur',False),('campus_secondary',29,'Tilak Dhari P.G. College classroom',False)]}
 def collect(i):
  x=profiles[i];folder=BASE/'media'/x['slug'];d=json.loads((folder/'discovery.json').read_text(encoding='utf-8'))
  manifest={'id':i,'slug':x['slug'],'name':x['name'],'checked_on':'2026-10-30','assets':[],'gaps':[]}
  for role,n,description,agri in jobs[i]:
   c=d['candidates'][n];url=c['url']
   if 'wixstatic.com' in url:url=url.split('/v1/')[0]
   filename='logo' if role=='logo' else ('campus-01' if role=='campus_primary' else 'campus-02')
   try:
    buf=io.StringIO()
    from contextlib import redirect_stdout
    # download in this worker without redirecting process-global stdout
    response,data=m.fetch(url,True);temporary=folder/(filename+'.download');temporary.write_bytes(data);meta=m.inspect_image(temporary);final=folder/(filename+meta['extension']);temporary.replace(final)
    asset={'role':role,'cms_field':{'logo':'logo','campus_primary':'image','campus_secondary':'gallery_candidate'}[role],'file':str(final.relative_to(BASE)).replace('\\','/'),'source_page':d['source_page'],'download_url':url,'source_kind':'official','description':description,'alt':description,'campus':x['identity']['city']+', '+x['identity']['state'],'agriculture_specific':agri,'identity_evidence':'Image embedded by the institution official website at '+d['source_page']+'; source alt: '+c['alt'],'rights_status':'public_source_no_explicit_license','attribution':x['name'],'review_status':'needs_visual_review','notes':'Original downloaded bytes preserved.','width':meta['width'],'height':meta['height'],'sha256':meta['sha256']}
    if i==49 and role=='logo':asset['notes']+=' Society emblem deployed as the official college header brand; no separate college seal is claimed.'
    manifest['assets'].append(asset);print(i,role,final.name,meta['width'],meta['height'],flush=True)
   except Exception as e:manifest['gaps'].append({'role':role,'reason':str(e),'attempted_sources':[url]});print(i,role,'ERROR',str(e),flush=True)
   (folder/'assets.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:list(ex.map(collect,[i for i in jobs if len(sys.argv)==2 or str(i) in sys.argv[2:]]))
