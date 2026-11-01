const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const directory = path.join(base, 'batch-02');
const files = fs.readdirSync(directory).filter(file => file.endsWith('.json'));
const baselineFile = path.join(__dirname, 'batch-02-baseline.json');
if (!fs.existsSync(baselineFile)) fs.writeFileSync(baselineFile, JSON.stringify(files.map(file => ({ file, profile: JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')) })), null, 2));
const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8')).filter(row => row.profile.id >= 21 && row.profile.id <= 40);
const profiles = new Map(baseline.map(({ file, profile }) => [profile.id, { file, profile: structuredClone(profile), changes: [], resolutions: new Map(), partials: new Map(), evidence: [] }]));
const row = id => profiles.get(id);
function source(id, key, title, url, note = '') {
  const r = row(id); let s = r.profile.sources.find(s => s.url === url);
  if (!s) { s = { id: 'o31_' + key, title, url, kind: 'official', checked_on: '2026-10-31', access: 'page_read', note }; r.profile.sources.push(s); }
  else Object.assign(s, { checked_on: '2026-10-31', access: 'page_read', note: [s.note, note].filter(Boolean).join(' ') });
  r.evidence.push(url); return s.id;
}
function changed(id, text) { row(id).changes.push(text); }
function resolve(id, field, reason) { row(id).resolutions.set(field, reason); }
function partial(id, field, reason) { row(id).partials.set(field, reason); }
function references(target, ids) { target.source_ids = [...new Set([...(target.source_ids || []), ...ids])]; }
function quoteFee(id, index, amount, period, academicYear, note, sourceId, includes = 'Published programme fee; other charges are separate unless stated.') {
  const p = row(id).profile.programmes[index]; p.fees = { amount_inr: amount, period, academic_year: academicYear, includes, note, verification: 'verified', source_ids: [sourceId] }; references(p, [sourceId]); changed(id, p.name + ': added source-specific fee amount with period and session status.');
}
function roster(id, people, sourceId, intro) { const p = row(id).profile; p.faculty = { intro, people: people.map(([name, role]) => ({ name, role, source_ids: [sourceId] })), source_ids: [sourceId] }; changed(id, 'Added ' + people.length + ' named academic staff entries with scope/date labels.'); }
function outcomes(id, sourceId, records) {
  const p = row(id).profile;
  p.placements.statistics = records.map(([programme, year, graduates, placed, median, higher]) => ({ label: programme + ' outcomes ' + year, value: graduates + ' graduates in minimum stipulated time; ' + placed + ' placed; ' + higher + ' selected for higher studies; median annual salary of placed graduates INR ' + new Intl.NumberFormat('en-IN').format(median) + '.', programme_scope: programme, academic_year: year, graduates_in_minimum_time: graduates, placed, higher_studies: higher, median_salary_inr: median, reporting_source: 'NIRF 2026 Agriculture and Allied Sectors; institution-submitted data, not an independently audited placement guarantee', source_ids: [sourceId] }));
  p.placements.text = p.name + ' publishes an Agriculture and Allied Sectors submission for NIRF 2026. Its programme-duration cohorts report the graduating group, students placed, students entering higher studies and the median salary of placed graduates. These historical institutional submissions are not a placement promise or a salary estimate for every student or individual specialisation.';
  references(p.placements, [sourceId]);
  for (const faq of p.faqs) if (/placement|salary|recruit/i.test(faq.question)) { const first = p.placements.statistics[0]; faq.answer = 'The institution-submitted NIRF 2026 Agriculture and Allied Sectors record reports ' + first.programme_scope + ' for ' + first.academic_year + ': ' + first.value + ' The denominator is the reported minimum-time graduating group; these historical outcomes do not guarantee an individual result.'; references(faq, [sourceId]); }
  resolve(id, 'placements.statistics', 'Added dated Agriculture and Allied Sectors NIRF 2026 programme-duration cohort outcomes, with graduating denominator and median definition.'); changed(id, 'Added ' + records.length + ' scoped NIRF agriculture placement/higher-study cohort rows.');
}
// AKS: current official process supplies an actual common checklist.
{
  const id=21,p=row(id).profile,s=source(id,'process','AKS University official admission process','https://www.aksuniversity.ac.in/admission-Process','University-wide process checked 31 October 2026; separate programme selection deadlines remain to be confirmed.');
  p.admissions.steps=[{title:'Check the course requirements',text:'Read the published agriculture qualification and any selection requirement under the university ordinance.'},{title:'Complete the application',text:'AKS accepts its online form or an offline form obtained through the admissions office.'},{title:'Submit the required records',text:'Provide qualifying records and identity/transfer/character documents from the official common checklist.'},{title:'Confirm admission and enrolment',text:'After the admissions section issues confirmation, complete the specified payment, registration and enrolment formalities.'}];
  p.admissions.documents=['Educational certificates and qualifying mark sheets for Class X, XII and the applicable UG/PG qualification.','Aadhaar or the specified identity proof.','Passport-size photographs.','Transfer certificate and character certificate.'];references(p.admissions,[s]);
  resolve(id,'admissions.documents','Official admissions page now supplies the university-wide supporting-document list; programme/claim-specific additions remain subject to the offer.');partial(id,'admissions','Procedural steps and common documents are verified; programme-specific selection notice and deadlines remain unverified.');changed(id,'Replaced generic applicant-preparation steps with the official application and enrolment flow.');
}
// Sri Sri: original institutional pages were actually read after earlier 403 failures.
{
  const id=22,p=row(id).profile,s=source(id,'faculty','Sri Sri University agriculture faculty directory','https://srisriuniversity.edu.in/faculty-of-agriculture-teachers/','Full official page downloaded and read on 31 October 2026; roster publication date is not stated.');
  source(id,'school','Sri Sri University Faculty of Agriculture','https://srisriuniversity.edu.in/faculty-of-agriculture/','Full official page read on 31 October 2026.');
  roster(id,[['Prof. Kumaraswamy S','Dean and Professor'],['Dr Anupama Singh','Assistant Professor; Assistant Dean, Student Affairs'],['Dr Chinmayee Mohapatra','Assistant Professor, Plant Pathology; Assistant Dean, Academic Affairs'],['Dr Mahipal Singh','Assistant Professor; Assistant Dean, Research'],['Dr Madhab Kumar Datta','Assistant Professor, Agronomy'],['Dr Lopamudra Jena','Assistant Professor, Horticulture'],['Dr Mandakini Kabi','Assistant Professor, Plant Breeding and Genetics']],s,'SSU’s public agriculture directory identifies its dean, assistant deans and subject teachers. These selected entries are a website snapshot checked on 31 October 2026; they do not represent a separately dated staffing certificate.');
  resolve(id,'sources.official_page_read','Institutional agriculture, admissions and faculty HTML pages were successfully downloaded and read directly; the earlier access-only limitation no longer applies to these pages.');changed(id,'Replaced the one-person roster with named leadership and subject faculty from the recovered official directory.');
}
// Sanskriti: common reporting documents and genuine general scholarship conditions.
{
  const id=24,p=row(id).profile,s=source(id,'admission','Sanskriti official admission procedure','https://www.sanskriti.edu.in/admissions/admission-procedure.php','Undated university-wide reporting checklist; intake-specific amendments should be checked.');
  p.admissions.documents=['Signed admission form and proof of date of birth.','Class X and XII certificates/mark sheets; graduation or postgraduate records where applicable.','Migration/transfer certificate and conduct/character certificate.','Medical-fitness certificate from an MBBS or equivalent practitioner, and Aadhaar.','Originals and three photocopy sets; ten applicant and four parent passport-size photographs.','Prescribed result-awaited undertaking when applicable; anti-ragging undertakings at course registration.'];references(p.admissions,[s]);resolve(id,'admissions.documents','Official common reporting checklist is now recorded; the programme offer may specify additional documents.');
  const ss=source(id,'scholarship','Sanskriti official scholarship policy','https://www.sanskriti.edu.in/admissions/scholarship.php','Policy page is undated. General categories are documented; agriculture intake-year award applicability must be confirmed in writing.');
  p.scholarships.text='Sanskriti’s undated scholarship policy describes general categories including sports, defence, girls and disability. Its published conditions limit awards to tuition, allow one scheme at a time and require academic continuation without back papers. Agriculture applicants should obtain a dated programme-specific award; engineering and MBA merit tables are not agriculture entitlements.';
  p.scholarships.schemes=[{name:'General-category scholarship conditions (undated)',details:'The page lists defence, girls, disability and sports categories, with supporting-proof requirements. Only one scheme may apply, tuition-only limits and continuation conditions apply, and the stated exclusions include BAMS, BUMS, B.Sc. Nursing and Ph.D. Agriculture-specific current approval is still required.',source_ids:[ss]}];p.scholarships.source_ids=[ss];partial(id,'scholarships','General official policy categories and exclusions now recorded; dated agriculture-specific award applicability remains unverified.');changed(id,'Added supported general scholarship categories and conditions without importing engineering/MBA percentages.');
}
// VGU: a dated UG reporting event and the actual required records.
{
  const id=25,p=row(id).profile,s=source(id,'ug_documents','VGU undergraduate admission 2026-27','https://vgu.ac.in/admission/ug-admission','2026-27 page records reporting on 24 July 2026; this is historical, not an open application window.');
  p.admissions.documents=['Class X certificate and mark sheet.','Class XII certificate/mark sheet or appearing proof.','Transfer or migration certificate.','Entrance rank/score card where applicable; the page marks it optional in the common checklist.','Aadhaar or another valid government photo ID.','Colour passport-size photographs and relevant caste/category proof.','The page requires ABC/APAAR ID creation; originals are verified at reporting.'];
  p.admissions.dates=[{label:'University UG reporting date (historical published notice)',date:'2026-07-24',academic_year:'2026-27',source_ids:[s]}];references(p.admissions,[s]);resolve(id,'admissions.documents','2026-27 UG admissions page supplies the actual common document and ABC/APAAR requirements.');partial(id,'admissions.dates','The 24 July 2026 reporting event is now recorded; a separate agriculture-specific application/counselling deadline was not established.');
  const ss=source(id,'scholarship','VGU scholarship policy 2025-26','https://vgu.ac.in/admission/scholarship','The main policy explicitly identifies 2025-26 despite the global Admissions 2026 header; do not relabel it as 2026-27.');
  p.scholarships.text='VGU’s scholarship page labels its detailed policy as 2025-26. It describes qualifying-mark, alumni/employee and co-curricular categories. Awards are restricted to academic fees for Indian students, credited in even semesters, and continue only with the stated performance and attendance conditions. A current agriculture-specific award should be confirmed separately.';
  p.scholarships.schemes=[{name:'Historical general scholarship policy, 2025-26',details:'The policy requires at least 6 SGPA each semester, no detention for attendance shortage and only one applicable category. A later agriculture intake must not assume the older policy continues unchanged.',source_ids:[ss]}];p.scholarships.source_ids=[ss];partial(id,'scholarships','Added dated historical 2025-26 policy conditions; current 2026-27 agriculture applicability remains unverified.');changed(id,'Filled admissions checklist/reporting-date content and historical scholarship conditions.');
}
// SGT: consistent undated official amounts plus an important Agronomy exclusion.
{
  const id=26,p=row(id).profile,s=source(id,'agri_catalogue','SGT agriculture course fees and entry criteria','https://sgtuniversity.ac.in/admissions/prgmData/agri','Official programme table is undated; current intake-year applicability is not established.');
  quoteFee(id,0,175000,'year',null,'Undated official annual amount; intake-year applicability is not established. Not a confirmed 2026/2027 quotation. The separate B.Sc. course page shows INR87,500 per semester.',s);
  quoteFee(id,1,250000,'year',null,'Undated official annual amount; not a confirmed 2026/2027 quotation. The dedicated masters landing shows INR125,000 per semester for Agronomy.',s);
  partial(id,'programmes.fees','Official programme-specific annual amounts are recorded with year null; a dated current-intake schedule remains unverified.');
  const ss=source(id,'masters','SGT agriculture masters fees and scholarship exclusions','https://sgtuniversity.ac.in/admissions/masters-in-agriculture/','Undated agriculture-specific landing page; broad promotional university package/recruiter figures were not used as agriculture placement evidence.');
  p.scholarships.text='The agriculture masters landing explicitly excludes M.Sc. Ag. Agronomy from its displayed postgraduate merit-scholarship scheme. Other listed agriculture/horticulture programmes have UG-mark-based tuition concessions on that page. B.Sc. applicants and Agronomy applicants should obtain the policy for their own programme rather than assume those awards apply.';
  p.scholarships.schemes=[{name:'Agriculture masters merit scheme: Agronomy exclusion',details:'M.Sc. Ag. Agronomy is expressly excluded from the landing page’s postgraduate merit scheme. The page is undated and does not establish an award for a B.Sc. Agriculture applicant.',source_ids:[ss]}];p.scholarships.source_ids=[ss];partial(id,'scholarships','Agriculture-specific Agronomy exclusion is verified; dated intake-year B.Sc./Agronomy award terms remain unverified.');
  const n=source(id,'nirf2026','SGT NIRF 2026 Agriculture and Allied Sectors submission','https://iqac1.sgtuniversity.ac.in/assets/files/NIRF/2026/Agricultural-%20Shree%20Guru%20Gobind%20Singh%20Tricentenary%20University%2020260219-.pdf','Institution-submitted category-specific outcomes; undergraduate four-year cohort, not university-wide placements.');outcomes(id,n,[['UG four-year programme category','2024-25',40,5,240000,30]]);
  roster(id,[['Pooja Upadhyay','Assistant Professor; listed currently working in NIRF 2026 submission'],['Pooja Pant','Assistant Professor; listed currently working in NIRF 2026 submission'],['Debabrata Dhar','Associate Professor; listed currently working in NIRF 2026 submission'],['Anupam Singh','Professor; listed currently working in NIRF 2026 submission'],['Om Pal Singh Khola','Professor; listed currently working in NIRF 2026 submission']],n,'Selected agriculture staff listed as currently working in the institution’s NIRF 2026 submission are shown here. The filing is dated evidence, not a guarantee that staffing has remained unchanged since submission.');resolve(id,'faculty.people','Added selected named agriculture staff and roles from the dated NIRF 2026 faculty table.');
}
// Bhupal: an apparent current fee link is actually a broken older target.
{
  const id=27,p=row(id).profile,s=source(id,'online','Bhupal Nobles University admission registration 2026-27','https://www.bnuniversity.ac.in/Online-Admission','The link labelled Fee structure2026-27 points to /documents/fee-structure-2020-21.pdf, which returned404; no amount was inferred.');
  const d=source(id,'instructions','Bhupal Nobles official application instructions','https://www.bnuniversity.ac.in/documents/instructions-for-filling-application-form.pdf','Undated common online-application instructions linked by the2026-27 registration page.');
  p.admissions.documents=['Class X and XII mark sheets, photograph and signature for upload under the common form instructions.','A valid email address and mobile number for registration/login.'];references(p.admissions,[s,d]);p.admissions.application_fee_inr=500;p.admissions.intro='Bhupal Nobles’ official registration page identifies the 2026-27 first-year/first-semester admission form. Linked common instructions describe account creation, document upload and an online INR500 form payment. The instructions are undated; confirm the agriculture offer and payable application charge before paying.';partial(id,'admissions.documents','Linked common instructions identify marksheets/photo/signature; a programme-specific current checklist remains unverified.');partial(id,'programmes.fees','The purported2026-27 fee link was checked and found to target a missing2020-21 PDF. No current agriculture amount was recovered.');changed(id,'Added actual registration and upload requirements and documented the misleading/broken fee target.');
}
// Karunya: the agriculture filing replaces unsupported salary uncertainty.
{
  const id=28,p=row(id).profile,n=source(id,'nirf2026','Karunya NIRF 2026 Agriculture and Allied Sectors submission','https://www.karunya.edu/sites/default/files/img/2026/NIRF/NIRF2026-AGRI.pdf','Institution-submitted duration-category outcomes; PG figures combine two-year programmes and cannot be assigned to an individual specialisation.');outcomes(id,n,[['UG four-year programme category','2024-25',240,170,337500,9],['PG two-year programme category','2024-25',20,2,240000,11]]);
  roster(id,[['Sajan Kurien','Professor; NIRF2026 currently-working roster'],['Jenita Thinakaran','Professor; NIRF2026 currently-working roster'],['R. Philip Sridhar','Professor, Agricultural Entomology'],['Dr. K. Indira Petchiammal','Assistant Professor, Genetics and Plant Breeding'],['Dr. S. Praveena Katharine','Assistant Professor, Soil Science and Agricultural Chemistry']],n,'The NIRF2026 agriculture filing provides named teaching staff and association status. The public agriculture directory also identifies subject divisions. These are source-dated listings; appointments can subsequently change.');resolve(id,'faculty.people','Added dated NIRF2026 agriculture roster entries, cross-checked against the public agriculture directory.');
  const f=source(id,'directory','Karunya agriculture faculty directory','https://www.karunya.edu/school-of-agricultural-sciences/faculty/','Public subject-directory snapshot checked31October2026.');references(p.faculty,[f]);changed(id,'Preserved separate2027 KEE admissions wording and2026 historical fee session while enriching career/faculty evidence.');
}
// GD Goenka: exact programme prices exist, but the page supplies no intake year.
{
  const id=30,s=source(id,'fees','GD Goenka official fee structure','https://www.gdgoenkauniversity.com/admissions/fee-structure','School of Agricultural Sciences table is undated; no2026/2027 price claim is made.');
  for(const [i,amount] of [[0,175000],[1,215000],[2,215000]])quoteFee(id,i,amount,'year',null,'Undated official annual programme fee; intake-year applicability is not established. The row separately lists INR15,000 admission fee and INR10,000 security fee. Living costs are not included.',s);
  partial(id,'programmes.fees','All three listed programmes now have source-specific annual amounts, but the official table is undated; current-year confirmation remains open.');
}
// SGRRU: selected public subject heads strengthen the infrastructure/faculty content.
{
  const id=31,p=row(id).profile,s=source(id,'school','SGRR School of Agricultural Sciences faculty and facilities','https://www.sgrru.ac.in/sgrrsas','Undated public school roster checked31October2026.');
  roster(id,[['Prof. (Dr.) Priyanka Bankoti','Professor and Dean'],['Dr. Hitendra Kumar','Associate Professor and Head, Entomology'],['Dr. J. P. Singh','Associate Professor and Head, Agronomy'],['Dr. Suneeta Singh','Professor and Head, Horticulture'],['Dr. A. K. Saxena','Professor and Head, Soil Science'],['Dr. Girish Chandra','Associate Professor and Head, Seed Science and Technology'],['Dr. Himanki Dabral','Associate Professor and Head, Genetics and Plant Breeding'],['Dr. Khilendra Singh','Associate Professor and Head, Plant Pathology']],s,'The school’s public roster names its dean and subject heads across agronomy, horticulture, plant protection and supporting agricultural sciences. This is an undated website snapshot checked31October2026.');changed(id,'Expanded agriculture academic leadership with eight source-backed entries.');
}
// VIT: fill the exact portal uploads rather than a short generic checklist.
{
  const id=32,p=row(id).profile,s=source(id,'portal','VIT B.Sc. Agriculture 2026-27 application portal','https://admissions.vit.ac.in/bsc-hons-agri-2026-applications/login','Course-specific2026-27 portal; upload requirements are subject to their stated availability/time window.');
  p.admissions.documents=['Birth certificate or passport copy as age proof.','Class XII hall ticket.','Class XII mark statements for all attempts.','SC/ST community certificate where applicable.','Nativity certificate for the specified North-Eastern states or Jammu and Kashmir/Ladakh categories.','JPG/JPEG photograph of20–300kB and scanned signature of5–150kB, following the portal dimensions.'];references(p.admissions,[s]);resolve(id,'admissions.documents','The course-specific2026-27 portal provides the exact upload list and image requirements.');changed(id,'Expanded the programme-specific application document list and retained portal age/nationality rules.');
}
// GIET: actual category outcomes and an explicit distinction from engineering-only awards.
{
  const id=35,p=row(id).profile,n=source(id,'nirf2026','GIET NIRF 2026 Agriculture and Allied Sectors submission','https://www.giet.edu/wp-content/uploads/2026/03/NIRF-India-Ranking-2026-AGRICULTURE-AND-ALLIED-SECTORS.pdf','Institution-submitted UGfour-year agriculture-category outcomes, not Engineering/Overall data.');outcomes(id,n,[['UG four-year programme category','2024-25',178,144,475000,32]]);
  const ss=source(id,'scholarship','GIET official scholarship descriptions','https://www.giet.edu/admissions/scholarships/','Several displayed GIETEE awards are explicitlyB.Tech-only; no blanket agriculture entitlement is inferred.');
  p.scholarships.text='GIET’s general scholarship page contains schemes with different programme scopes, including GIETEE/Board-of-Governance categories explicitly marked B.Tech-only. Agriculture applicants should ask which government reimbursement or institutional assistance actually applies to their course and entry year. Engineering award limits should not be transferred to agriculture.';p.scholarships.source_ids=[ss];partial(id,'scholarships','Official policy scope is now documented, including B.Tech-only exclusions; dated agriculture award conditions remain unverified.');
}
// Amrita: the programme page supports counselling presence/originals, not a full new checklist.
{
  const id=37,p=row(id).profile,s=source(id,'programme','Amrita B.Sc. Agriculture eligibility and counselling FAQs','https://www.amrita.edu/program/bsc-hons-agriculture/','Page mixes a historical2025 deadline/tuition table with2026 material; do not promote those older details to a current application calendar.');
  p.admissions.documents=['Original academic certificates are required at counselling under the programme FAQ; photocopies alone are not sufficient.','The programme FAQ asks the candidate and a parent/guardian to attend the counselling desk.'];references(p.admissions,[s]);partial(id,'admissions.documents','Original-certificate and candidate/guardian counselling requirements are now sourced; a complete currentAEEL document checklist is still not established.');changed(id,'Added counselling verification requirements while preserving the published subject-eligibility contradiction.');
}
// Tantia: recover the missing PG rows from the already dated historical schedule.
{
  const id=38,s=source(id,'fee2025','Tantia revised fee structure2025-26,1May2025','https://tantiauniversity.com/public/uploads/brochure.pdf','Historical2025-26 evidence only; not a2026-27 quotation.');
  quoteFee(id,1,70000,'year','2025-26','Historical tuition for MScAgronomy; INR4,650 admission plus INR10,000 processing are separate. Published two-year total INR154,650. Current2026-27 applicability remains unverified.',s);
  quoteFee(id,2,70000,'year','2025-26','Historical tuition for MScAgriculture Genetics and Plant Breeding; INR4,650 admission plus INR10,000 processing separate. Published two-year total INR154,650. Not a2026-27 quotation.',s);
  partial(id,'programmes.fees','Both missing PG amounts are now sourced to2025-26; a dated2026-27 schedule remains unavailable.');
}

// Recovered programme leaves: amounts have no intake year, so current-year gaps stay open.
{
  const id=22,p=row(id).profile;
  for(const [i,url,amount] of [[0,'https://srisriuniversity.edu.in/bsc-honsagriculture/',85000],[1,'https://srisriuniversity.edu.in/bsc-hons-horticulture/',68000],[2,'https://srisriuniversity.edu.in/b-sc-hons-agribusiness-management/',63000]]) {
    const s=source(id,'course'+i,'SSU '+p.programmes[i].name+' official fact sheet',url,'Undated programme fact sheet: four years, eight semesters, full time; fee applicability to a particular intake is not stated.');
    p.programmes[i].mode='Full time';
    p.programmes[i].duration='4 years (8 semesters)';
    p.programmes[i].eligibility=i===2?'The undated official course fact sheet requires 10+2 science with PCB or PCM and at least 50%. This differs from the NTA 2025 listing, which accepted any 10+2 stream with 50%; obtain the intended intake rule.':'Undated official course fact sheet: 10+2 science with PCB or PCM and at least 50%; confirm the intended intake rule.';
    quoteFee(id,i,amount,'semester',null,'Undated official tuition amount per semester. Intake-year applicability is not established; this is not a confirmed current 2026/2027 quotation. Other charges must be checked separately.',s,'Tuition per semester.');
  }
  for(const field of ['programmes.fees','programmes.fees.2026-27'])partial(id,field,'All three programme leaves now supply undated semester tuition and full-time duration; no current 2026-27 fee schedule was established.');
  p.admissions.eligibility_points=['The undated Agriculture and Horticulture fact sheets specify PCB/PCM science with at least 50%.','Agribusiness has a source conflict: its official course fact sheet specifies PCB/PCM science, while NTA’s 2025 listing accepted any 10+2 stream. Confirm the intended intake before applying.'];
  p.faqs[2].answer='The NTA 2025 listing accepted any 10+2 stream with at least 50%, but SSU’s undated Agribusiness course fact sheet specifies science with PCB/PCM. Because those sources differ, a non-science applicant should obtain the intended intake rule directly.';references(p.faqs[2],[p.programmes[2].fees.source_ids[0]]);
  p.faqs[4].answer='The programme fact sheets quote INR85,000 for Agriculture, INR68,000 for Horticulture and INR63,000 for Agribusiness per semester, but do not identify an intake year. These are undated official amounts rather than confirmed 2026/2027 prices.';p.faqs[4].source_ids=p.programmes.flatMap(x=>x.fees.source_ids);
  p.verification_gaps.push({field:'programmes.eligibility.agribusiness',reason:'The undated official Agribusiness fact sheet requires science PCB/PCM with 50%, while the NTA 2025 listing accepts any 10+2 stream with 50%. The intended intake rule remains unresolved.',next_source:'https://srisriuniversity.edu.in/b-sc-hons-agribusiness-management/'});
  const ss=source(id,'scholarship_support','SSU Scholarship Support Division','https://srisriuniversity.edu.in/scholarship-support-division/','The page describes assistance to bona fide students, not a dated agriculture-specific award schedule.');
  p.scholarships.text='SSU’s Scholarship Support Division helps its enrolled students find scholarship information and complete applications. Its published scope covers bona fide students across faculties. The checked page does not establish a dated agriculture-specific award amount or renewal entitlement.';
  p.scholarships.schemes=[{name:'Scholarship application support',details:'The division disseminates available scheme information and helps students complete scholarship processes. A support service does not itself guarantee an award.',source_ids:[ss]}];p.scholarships.source_ids=[ss];partial(id,'scholarships','Official university-wide scholarship support is now described; dated agriculture-specific award rules remain unverified.');
  changed(id,'Recovered all three original programme fact sheets, including full-time mode, exact undated semester tuition and an explicit Agribusiness eligibility conflict.');
}
// BNU: category-specific NIRF data supplies actual agriculture outcomes and a dated staff table.
{
  const id=27,n=source(id,'nirf2026','Bhupal Nobles NIRF 2026 Agriculture and Allied Sectors submission',"https://www.bnuniversity.ac.in/NIRF/agriculture%20BHUPAL%20NOBLES'%20UNIVERSITY20260219--5.pdf",'Institution-submitted duration-category outcomes and currently-working faculty table. PG category outcomes cannot be attributed to a specific specialisation.');
  outcomes(id,n,[['UG four-year programme category','2024-25',54,12,300000,15],['PG two-year programme category','2024-25',5,2,250000,1]]);
  roster(id,[['Dr. Dilip Singh','Dean / Principal / Director category in the NIRF 2026 agriculture filing'],['Dr. Garima Babel','Associate Dean'],['Dr. Jaipal Singh','Assistant Professor'],['Dr. Fateh Lal Sharma','Professor'],['Dr. Pratap Singh Rao','Professor'],['Dr. Shilpa Rathore','Associate Professor']],n,'Selected staff listed as currently working in the NIRF 2026 Agriculture and Allied Sectors submission are shown here. The dated filing is a staffing snapshot rather than a guarantee of unchanged appointments.');
}
// SGRRU publishes dated image schedules. Values below are whole-course totals, not annual tuition.
{
  const id=31;
  for(const [i,url,amount,other] of [[0,'https://www.sgrru.ac.in/uploads/prospectus/88crsfile_BSC-AGRICULTURE.jpg',475000,552000],[1,'https://www.sgrru.ac.in/uploads/prospectus/33crsfile_MSC-AGRICULTURE-AGRONOMY.jpg',198474,249600],[2,'https://www.sgrru.ac.in/uploads/prospectus/34crsfile_MSC-AGRICULTURE-HOLTICULTURE.jpg',198474,249600]]) {
    const s=source(id,'fee2026_'+i,'SGRRU '+row(id).profile.programmes[i].name+' fee schedule 2026-2027',url,'Original official image visually read in full; header explicitly states Session 2026-2027. Domicile columns and whole-course totals are preserved.');
    quoteFee(id,i,amount,'total','2026-27','Published whole-course total for the Uttarakhand-domicile column: '+(i===0?'four years/eight semesters.':'two years/four semesters.')+' The other-state column totals INR '+new Intl.NumberFormat('en-IN').format(other)+'. These are category-specific published totals, not annual tuition. Confirm domicile and any concession conditions; the B.Sc. other-state table explicitly includes a Special Concession line.',s,'The published TOTAL includes listed tuition and academic/one-time charges, including refundable security; living costs are not established by this schedule.');
  }
  resolve(id,'programmes.fees','All three listed programmes now have directly read, session-labelled 2026-2027 official schedules. Whole-course totals and Uttarakhand/other-state categories are distinguished.');
}
// GIET: historical fees remain historical; staff entries marked No/left are excluded.
{
  const id=35,p=row(id).profile,s=source(id,'fee2024','GIET fee structure for academic year 2024-2025','https://www.giet.edu/wp-content/uploads/2025/05/FEES-STRUCTRUCTURE-FOR-2024-OF-GIETU-GUNUPUR.pdf','The official fee index labels this file 2024-2025. The PDF gives B.Sc. Agriculture and M.Sc. Agriculture rows; it is not a 2026-27 quotation.');
  quoteFee(id,0,160000,'year','2024-25','Historical B.Sc. Agriculture annual fee, also shown as INR80,000 per semester. Other charges separate; current applicability not established.',s);
  quoteFee(id,1,120000,'year','2024-25','Historical combined M.Sc. Agriculture row, also INR60,000 per semester. Confirm Agronomy-specific current offer. It is not assigned to the separately named Horticulture course.',s);
  partial(id,'programmes.fees','Historical 2024-25 B.Sc. and combined M.Sc. Agriculture amounts are now recorded; the current schedule and Horticulture-specific price remain unverified.');
  p.faqs[4].answer='A historical official 2024-25 schedule gives B.Sc. Agriculture at INR1,60,000 per year and a combined M.Sc. Agriculture row at INR1,20,000 per year. These do not establish current 2026-27 charges or a Horticulture-specific amount.';p.faqs[4].source_ids=[s];
  const n=p.sources.find(s=>s.url.includes('NIRF-India-Ranking-2026-AGRICULTURE')).id;
  roster(id,[['Dr. Rinny Swain','Associate Professor'],['Ms. Mita Meher','Assistant Professor'],['Dr. Rajeswari Das','Associate Professor'],['Dr. Deepak Kumar','Assistant Professor'],['Dr. Mamata Behera','Associate Professor'],['Dr. Anmol Panda','Associate Professor']],n,'These selected teachers are marked currently working in GIET’s NIRF 2026 Agriculture and Allied Sectors submission. Staff marked as having left in that filing are excluded. The filing is dated evidence, not a continuing appointment guarantee.');
  resolve(id,'faculty.people','Added selected named currently-working faculty from the dated NIRF 2026 Agriculture and Allied Sectors table.');
}
// Raffles: actual agriculture faculty, with the absence of a publication date made clear.
{
  const id=39,s=source(id,'faculty','Raffles University agricultural sciences faculty','https://rafflesuniversity.edu.in/faculty-agricultural','Public professional roster is undated; read on 31 October 2026.');
  roster(id,[['Dr. Amit Yadav','Associate Professor and officiating Dean; Agricultural Entomology'],['Dr. Pradeep Kumar','Assistant Professor, Agronomy'],['Dr. Sudhir Pratap','Assistant Professor, Fruit Science'],['Dr. Awaneesh Kumar','Assistant Professor, Agronomy'],['Dr. Suwa Lal Yadav','Assistant Professor, Soil Science and Agricultural Chemistry'],['Mr. Mukesh Choudhary','Assistant Professor, Vegetable Science']],s,'Raffles’ public agricultural-sciences page lists its officiating dean and subject teachers. These selected professional entries are an undated website snapshot checked on 31 October 2026.');
  partial(id,'faculty.people','Named agriculture roster entries and subject roles are now verified on the official page; a separately dated current staffing publication is not established.');
}
// MM(DU): the 2026-uploaded report contains older academic context, so it cannot certify current appointments.
{
  const id=40,p=row(id).profile,s=source(id,'ssr','MM(DU) Faculty of Agriculture self-study report','https://www.mmumullana.org/wp-content/uploads/2026/05/SSR-Agriculture-MMDU.pdf','2026 upload path; the report includes a 2023 academic calendar. Faculty and career-support references are report snapshots, not certified October 2026 staffing or outcomes.');
  roster(id,[['Dr. Ishwar Singh','Professor, Agronomy'],['Dr. Vikas Tomar','Assistant Professor, Agronomy'],['Dr. R. P. Saharan','Professor, Genetics and Plant Breeding'],['Dr. Kuldeep Kumar','Associate Professor, Genetics and Plant Breeding'],['Dr. Devi Singh','Professor, Horticulture'],['Dr. Mahesh Kumar Rana','Professor, Horticulture'],['Dr. Ram Singh','Professor, Plant Pathology'],['Dr. Lokender Kashyap','Associate Professor, Entomology'],['Dr. Satish Kumar','Associate Professor, Biochemistry and Physiology; report identifies agriculture placement coordination']],s,'The faculty self-study report identifies subject teachers across crop production, crop improvement, horticulture and plant protection. Although its file was uploaded in 2026, it contains older academic-year context; this selected report roster does not certify current appointments.');
  partial(id,'faculty.people','The official self-study report now supplies named subject faculty; its mixed/older academic context does not establish a dated current roster.');
  p.placements.text='The agriculture self-study report describes a university-level Training and Placement Cell, with agriculture coordination assigned to Dr. Satish Kumar. This is source-specific support information from a report containing older academic context. It does not establish current agriculture placement totals, median pay or a placement guarantee.';references(p.placements,[s]);
  partial(id,'placements.statistics','Agriculture-specific placement coordination is now described from the official report; no dated cohort/denominator/salary outcome was established.');changed(id,'Added report-scoped agriculture faculty and career-support coordination without relabelling older report context as current outcomes.');
}
// SRM 2026 leaf explicitly names both UG degrees in its eligibility text; the 2024 form stays historical.
{
  const id=33,p=row(id).profile,s=source(id,'application2026','SRM Agricultural Sciences Application Form 2026','https://applications.srmist.edu.in/agricultural-sciences-form','Current landing page read directly. Both Agriculture and Horticulture are explicitly named in the qualifying-subject text; no numerical fee or current selection method was inferred from the older 2024 portal.');
  p.programmes[0].eligibility='2026 agriculture application page: recognised 10+2 with at least 50% aggregate. Accepted academic groups are Physics-Chemistry with Biology and/or Mathematics, Botany-Zoology, Forestry, Biology-Agriculture or Agriculture; the vocational route is Biology with Agricultural Practices, including theory and practicals.';references(p.programmes[0],[s]);
  resolve(id,'programmes.eligibility','The recovered 2026 page explicitly applies its 50% aggregate and seven academic subject groups/vocational route to both Agriculture and Horticulture. The earlier apparent accordion ambiguity is resolved by the full text.');
  p.admissions.eligibility_points=[p.programmes[0].eligibility];
  const old=source(id,'application2024','SRM agriculture application instructions labelled 2024','https://admissions.srmist.edu.in/srmistonline/agriapplication','The page explicitly says Agricultural Sciences Application Form 2024. INR1,200, merit-only selection, process and upload limits belong to that historical page and do not establish the 2026 rules.');
  p.admissions.intro='SRM has a dedicated Agricultural Sciences Application Form 2026, which gives programme-specific qualifying subjects and the 50% threshold. Its separately accessible older form is labelled 2024; the INR1,200 charge, selection wording and upload limits on that older page should not be treated as current rules.';
  references(p.admissions,[s,old]);
  partial(id,'admissions','Current 2026 course-specific qualification requirements and application link are now read directly; the historical 2024 form does not establish current selection, documents or deadlines.');
  changed(id,'Resolved the 2026 undergraduate eligibility ambiguity by reading the complete degree-specific text; retained historical portal limits as historical evidence only.');
}
// SGVU: add concrete units from the official brochure without reproducing its old ranking/superlative claims.
{
  const id=29,p=row(id).profile,s=source(id,'brochure','SGVU School of Agriculture official brochure','https://www.gyanvihar.org/uploads/Agriculture_Broucher_3_5319523b60.pdf','Undated brochure contains NIRF 2021/2022 context. Its units and training descriptions are brochure-listed facilities, not a current operational audit or guaranteed placement.');
  p.campus.facilities.push({name:'Enterprise and production units in the school brochure',description:'The undated brochure lists mushroom production, seed processing, vermicompost, azolla, a greenhouse/nursery and a poly-pond/fisheries unit. Ask the school which units are available for the intended cohort.',source_ids:[s]});
  p.campus.practical_learning.push('The official school brochure describes summer/winter internships, field training and educational visits to ICAR research institutes, agricultural universities and KVKs. These are described learning activities, not guaranteed placement offers.');references(p.campus,[s]);changed(id,'Added concrete enterprise units and brochure-scoped field-learning activities while excluding old ranking and market-leadership claims.');
}

const attemptIndexes=['index.json','index-extra.json','index-targeted.json'].flatMap(file=>{const f=path.join(__dirname,'batch-02-sources',file);return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):[];});
function supportFor(p,field) {
  let ids=[];
  if(field.startsWith('programmes.fees'))ids=p.programmes.flatMap(x=>x.fees.source_ids||[]);
  else if(field.startsWith('programmes.eligibility'))ids=p.programmes.flatMap(x=>x.source_ids||[]);
  else if(field.startsWith('faculty'))ids=p.faculty.source_ids||[];
  else if(field.startsWith('placements'))ids=p.placements.source_ids||[];
  else if(field.startsWith('scholarships'))ids=p.scholarships.source_ids||[];
  else if(field.startsWith('admissions'))ids=p.admissions.source_ids||[];
  else if(field==='sources.official_page_read')ids=p.sources.filter(x=>x.checked_on==='2026-10-31'&&x.access==='page_read').map(x=>x.id);
  return [...new Set(p.sources.filter(x=>ids.includes(x.id)).map(x=>x.url))];
}
const report = { checked_on: '2026-10-31', institutions: [], source_access_note: 'All original gaps for all 20 institutions were re-reviewed. Download attempts, successful source reads and unresolved claims are separate. HTTP success alone is not proof of a fact; not finding evidence in the checked material is not proof that no such report or roster exists. Raw requests/results are preserved in source indexes.' };
for (const [id, r] of profiles) {
  const original=baseline.find(item=>item.profile.id===id).profile;
  const attempts=attemptIndexes.filter(x=>x.id===id).map(x=>({url:x.requested_url||x.url,http_status:x.status||null,evidence_file:x.file||null,error:x.error||null}));
  const flags=original.verification_gaps.map(gap=>{const status=r.resolutions.has(gap.field)?'resolved':r.partials.has(gap.field)?'partial':'not_verified';return { field:gap.field, original_reason:gap.reason, original_next_source:gap.next_source, status, finding:r.resolutions.get(gap.field)||r.partials.get(gap.field)||'The checked material did not establish this requested dated/programme-specific fact. Existing uncertainty is retained; this is not proof that no suitable source exists.', supporting_urls:status==='not_verified'?[]:supportFor(r.profile,gap.field), checked_pages_note:'Institution-level attempt log below records pages requested, not supporting evidence for an absent claim.' };});
  const newGaps=r.profile.verification_gaps.filter(g=>!original.verification_gaps.some(o=>o.field===g.field));
  r.profile.verification_gaps=[...original.verification_gaps.filter(gap=>!r.resolutions.has(gap.field)).map(gap=>r.partials.has(gap.field)?{...gap,reason:r.partials.get(gap.field)}:gap),...newGaps];
  r.profile.content_review={ checked_on:'2026-10-31', evidence_note:'Only newly verified source-specific facts were added. Unknown current amounts, dates, placement guarantees and unsupported accreditation scope remain unquoted.', change_summary:r.changes };
  fs.writeFileSync(path.join(directory,r.file),JSON.stringify(r.profile,null,2)+'\n');
  report.institutions.push({ id,name:r.profile.name,file:'batch-02/'+r.file,checked_on:'2026-10-31',changes:r.changes,gap_reviews:flags,checked_pages:attempts,new_source_urls:[...new Set(r.evidence)],newly_identified_gaps:newGaps,original_gaps:original.verification_gaps.length,remaining_gaps:r.profile.verification_gaps.length });
}
report.summary={ institutions:report.institutions.length, profiles_enriched:report.institutions.filter(p=>p.changes.length).length, original_gaps:report.institutions.reduce((sum,p)=>sum+p.original_gaps,0), resolved:report.institutions.flatMap(p=>p.gap_reviews).filter(g=>g.status==='resolved').length, partial:report.institutions.flatMap(p=>p.gap_reviews).filter(g=>g.status==='partial').length, not_verified:report.institutions.flatMap(p=>p.gap_reviews).filter(g=>g.status==='not_verified').length };
fs.writeFileSync(path.join(__dirname,'batch-02-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary,null,2));
