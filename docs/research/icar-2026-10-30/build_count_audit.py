"""Read-only audit of ICAR's published 2026 lists. Never saves source workbooks."""
from pathlib import Path
import csv
import datetime as dt
import hashlib
import json

BASE = Path(__file__).resolve().parent
AS_OF = dt.date(2026, 10, 30)
PAGE = 'https://icar.org.in/en/list-accreditation-status-agricultural-universitiescollegesinstitutionprogrammes'
II = 'https://icar.org.in/sites/default/files/Circulars/List%20of%20%20ICAR%20Accredited%20Private%20Colleges%20Affliated%20to%20SAUs%20General%20Universities%20%28Private%20and%20Public%29-List-II.xlsx'
III = 'https://icar.org.in/sites/default/files/Circulars/List%20of%20ICAR%20Accredited%20Constituent%20affiliated%20Colleges%20Programmes%20of%20General%20Universities%20%28Public%29-%20List-III.xlsx'

states = {
  1:'Uttar Pradesh', **{i:'Tamil Nadu' for i in range(2,12)}, 12:'Uttar Pradesh',
  13:'Maharashtra', 14:'Andhra Pradesh', 15:'Andhra Pradesh', 16:'Andhra Pradesh',
  17:'Punjab', 18:'Punjab', 19:'Madhya Pradesh', 20:'Rajasthan', 21:'Rajasthan',
  22:'Punjab', 23:'Himachal Pradesh', 24:'Madhya Pradesh', 25:'Odisha', 26:'Rajasthan',
  27:'Uttar Pradesh', 28:'Rajasthan', 29:'Haryana', 30:'Rajasthan', 31:'Tamil Nadu',
  32:'Rajasthan', 33:'Haryana', 34:'Uttarakhand', 35:'Tamil Nadu', 36:'Tamil Nadu',
  37:'Madhya Pradesh', 38:'Odisha', 39:'Rajasthan', 40:'Tamil Nadu', 41:'Rajasthan',
  42:'Rajasthan', 43:'Haryana', 44:'West Bengal', 45:'Odisha', 46:'Odisha', 47:'Punjab',
  48:'Tamil Nadu', 49:'Uttar Pradesh', 50:'Andhra Pradesh', 51:'Madhya Pradesh',
  52:'Uttar Pradesh', 53:'Maharashtra', 54:'Odisha', 55:'Punjab', 56:'Arunachal Pradesh',
  57:'Telangana', 58:'Madhya Pradesh', 59:'Telangana', 60:'Madhya Pradesh',
  61:'Madhya Pradesh', 62:'Rajasthan',
}
name_overrides = {
  1:'Teerthanker Mahaveer University', 19:'G H Raisoni University, Chhindwara',
  22:'Chandigarh University', 26:'Janardan Rai Nagar Rajasthan Vidyapeeth',
  29:'SGT University', 30:'Bhupal Nobles University',
  35:'Vellore Institute of Technology', 36:'SRM Institute of Science and Technology',
  43:'Maharishi Markandeshwar (Deemed to be University), Mullana',
  44:'The Neotia University', 45:'Centurion University of Technology and Management, Odisha',
  46:'Centurion University of Technology and Management, Odisha',
  48:'Kalasalingam Academy of Research and Education',
  50:'Sri Kinjarapu Yerran Naidu College of Agricultural Sciences (SKYCAS)',
  51:'Sri Satya Sai University of Technology and Medical Sciences',
  53:'Shri Shivaji Agriculture College, Amravati',
  54:'Siksha O Anusandhan', 56:'Arunachal University of Studies',
  57:'SR University', 58:'College of Agriculture, Ganjbasoda',
  59:'Malla Reddy University', 60:'ITM University, Gwalior', 61:'RKDF University, Bhopal',
}
ownership_sources = {
  2:['https://www.via.ac.in/latest_events/72.pdf'],
  50:['https://angrau.ac.in/ANGRU/Constituent_Affiliated_Colleges.aspx/1000',
      'https://unnatbharatabhiyan.gov.in/public/uploads/aishe_codes/College%20Institution%20AISHE%20Code.pdf'],
  53:['https://www.pdkv.ac.in/?page_id=3950',
      'https://rajbhavan-maharashtra.gov.in/en/24-11-2021-governor-inaugurated-the-new-administrative-building-of-the-shri-shivaji-agriculture-college/'],
  58:['https://www.jnkvv.org/about-colleges'],
  36:['https://webstor.srmist.edu.in/web_assets/downloads/2026/bsc-hons-agriculture-curriculum-and-syllabus-2025-regulations.pdf'],
}
rows = json.loads((BASE/'private-list-ii-normalised.json').read_text(encoding='utf-8'))
raw = json.loads((BASE/'private-list-ii-raw.json').read_text(encoding='utf-8'))['Sheet1']['rows']
audit = []
for r in rows:
    serial = r['serial']
    source_row = raw[r['excel_row']-1]
    unit = (r['college'] or '').strip()
    if serial in (50,51,53):
        unit = str(source_row[4]).strip()
    name = name_overrides.get(serial, (unit if r['type']=='Private college' else r['university']).strip())
    status = 'included'
    if not r['active']:
        status = 'excluded_printed_term_expired_renewal_unverified'
    elif r['type']=='Public college':
        status = 'excluded_public_constituent_college'
    elif serial==45:
        status = 'merged_centurion_second_accredited_unit'
    record = {
        'source_list':'II', 'serial':serial, 'source_sheet':'Sheet1',
        'source_excel_row':r['excel_row'], 'source_range':f'A{r["excel_row"]}:G{r["excel_row"]}',
        'source_url':II, 'institution_name':name,
        'count_type':r['type'], 'state':states[serial],
        'affiliating_or_parent_university':r['university'],
        'accredited_unit':unit or name,
        'valid_from':r['start'], 'valid_until':r['end'],
        'active_on_as_of':r['active'], 'count_status':status,
        'programmes_as_printed':r['programmes'],
        'ownership_support':ownership_sources.get(serial,[]),
        'scope_note':('Only B.Sc. (Hons.) Horticulture is explicitly shown in this ICAR row.' if serial==36
          else 'Only B.V.Sc. & A.H. is explicitly shown in this ICAR row.' if serial==17
          else 'Centurion University counted once; agriculture and fisheries schools retained as two source records.' if serial in(45,46)
          else 'College name is displaced into the programme column in the official workbook; name normalised without changing its date.' if serial in(50,53)
          else ''),
    }
    audit.append(record)

tdraw = json.loads((BASE/'general-universities-list-iii-raw.json').read_text(encoding='utf-8'))['Sheet1']['rows'][10]
assert tdraw[0]==7 and 'Tilak Dhari' in tdraw[1]
audit.append({
    'source_list':'III', 'serial':7, 'source_sheet':'Sheet1', 'source_excel_row':11,
    'source_range':'A11:G11', 'source_url':III,
    'institution_name':'Tilak Dhari P.G. College, Jaunpur', 'count_type':'Private college',
    'state':'Uttar Pradesh', 'affiliating_or_parent_university':'Veer Bahadur Singh Purvanchal University',
    'accredited_unit':'Tilak Dhari P.G. College, Jaunpur', 'valid_from':'2024-09-26', 'valid_until':'2029-09-25',
    'active_on_as_of':True, 'count_status':'included', 'programmes_as_printed':[x for x in tdraw[4:7] if x],
    'ownership_support':[
      'https://tdcollege.org/pdf/information/SAR.pdf',
      'https://www.biyanicolleges.org/wp-content/uploads/2024/03/list-of-colleges-included-under-Section-2fand12B30-04-2018.pdf',
      'https://tdcollege.ac.in/en/page/aboutus-history'],
    'scope_note':'Privately managed grant-in-aid affiliated college; SAR p7 marks Grant-in-aid and UGC list p1352 labels Non Government. Included consistently with other private-aided colleges, although its agriculture row is in List III for public affiliating universities.'
})

included = [r for r in audit if r['count_status']=='included']
assert len(included)==58
assert len({(r['count_type'],r['institution_name']) for r in included})==58
university_count = sum(r['count_type']=='Private university' for r in included)
college_count = sum(r['count_type']=='Private college' for r in included)
assert (university_count,college_count)==(39,19)
strict = [r for r in included if not (r['source_list']=='II' and r['serial'] in (17,36))]
assert len(strict)==56

by_state = {}
for r in included:
    s=by_state.setdefault(r['state'],{'private_universities':0,'private_colleges':0,'total':0})
    s['private_universities' if r['count_type']=='Private university' else 'private_colleges']+=1
    s['total']+=1

summary = {
    'as_of':AS_OF.isoformat(),
    'headline':'58 unique privately managed institutions have a currently date-valid ICAR accreditation entry in the checked published 2026 lists.',
    'verified_private_institutions':58, 'private_universities_with_an_accredited_programme_or_unit':39,
    'independent_private_affiliated_colleges':19,
    'active_accredited_source_units':59,
    'strict_bsc_agriculture_institutions_by_explicit_programme_labels':56,
    'scope':'Agriculture and allied degree programmes. Private includes privately managed aided colleges and private deemed universities. A university is counted once when one or more of its schools/programmes is listed; this is not a claim that every course or campus of that university is accredited.',
    'arithmetic':'62 List-II rows - 3 printed expired terms - 1 public constituent college - 1 duplicate Centurion university row + 1 privately managed aided college from List III = 58 unique institutions.',
    'listed_unique_private_institutions_including_2026_expired_terms':61,
    'listed_private_universities_including_expired_terms':40,
    'listed_private_colleges_including_expired_terms':21,
    'source_page':PAGE,
    'source_workbooks':[
      {'file':'private-list-ii.xlsx','url':II,'sheet':'Sheet1','range':'A3:G67'},
      {'file':'general-universities-list-iii.xlsx','url':III,'sheet':'Sheet1','range':'A3:G15'},
    ],
    'workbook_modified_metadata':'2026-06-22 (source internal OOXML metadata)',
    'publication_note':'2026 official files downloaded from the live ICAR publication page. A site-wide footer last-update value is not treated as a file version or accreditation renewal.',
    'additional_verified_evidence':[
      {'institution':'Vanavarayar Institute of Agriculture','url':'https://www.via.ac.in/latest_events/72.pdf','finding':'The linked official letter was downloaded and its scanned first page visually read. Letter dated 3 September 2021 grants 17 August 2021–16 August 2026, not a renewal beyond 2026.'},
      {'institution':'Tilak Dhari P.G. College','url':'https://tdcollege.org/pdf/information/SAR.pdf','pages':'7, 94–100','finding':'The institution marks grant-in-aid funding and describes its management. Its UGC listing labels it Non Government.'},
      {'institution':'Shri Shivaji Agriculture College, Amravati','url':'https://www.pdkv.ac.in/?page_id=3950','finding':'Affiliating public university explicitly states that the college is run by Shri Shivaji Education Society.'},
      {'institution':'Sri Kinjarapu Yerran Naidu College of Agricultural Sciences','url':'https://unnatbharatabhiyan.gov.in/public/uploads/aishe_codes/College%20Institution%20AISHE%20Code.pdf','finding':'Official AISHE directory search record labels C-56759 Private Un-Aided, affiliated to ANGRAU.'},
      {'institution':'SRM College of Agricultural Sciences','url':'https://webstor.srmist.edu.in/web_assets/downloads/2026/bsc-hons-agriculture-curriculum-and-syllabus-2025-regulations.pdf','finding':'SRMIST official curriculum identifies this as its Faculty/College of Agricultural Sciences, so it belongs to one private deemed university rather than an independent affiliated college.'}
    ],
    'by_state':dict(sorted(by_state.items())),
    'exclusions':[r for r in audit if r['count_status'].startswith('excluded')],
    'deduplication':[r for r in audit if r['count_status'].startswith('merged')],
    'limits':[
      'This is a reproducible current-date-valid count from the checked published records, not confirmation that the national register includes every new or renewed accreditation issued after the workbook update.',
      'No dated renewal decision was found for TMU, Vanavarayar or ADT Baramati during targeted official-site checks. Their generic marketing claims were not used to extend printed validity.',
      'SHUATS is absent from the checked current lists. Historical accreditation and generic ICAR-admission wording do not establish a current dated term, so it is not added.',
      'The strict B.Sc. Agriculture count follows the specific programme labels printed in the source. It does not infer accreditation for an unlisted programme from an accredited institution.'
    ],
    'integrity':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in BASE.glob('*.xlsx')},
}
(BASE/'count-audit.json').write_text(json.dumps({'summary':summary,'records':audit},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(BASE/'count-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
fields=['institution_name','count_type','state','accredited_unit','valid_from','valid_until','source_list','serial','source_excel_row','source_range','source_url','scope_note']
with (BASE/'verified-private-institutions.csv').open('w',newline='',encoding='utf-8-sig') as f:
    w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(sorted(included,key=lambda r:(r['count_type'],r['state'],r['institution_name'])))
print(json.dumps({'active_unique_private':len(included),'private_universities':university_count,'private_colleges':college_count,'strict_BScAgriculture':len(strict),'state_totals':by_state},indent=2))
