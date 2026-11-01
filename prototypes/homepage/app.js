'use strict';

const courses = [
  { id: 'MBA', name: 'Master of Business Administration', level: 'pg', category: 'Business & management', icon: 'briefcase', tint: '#eef4e4', color: '#698447', description: 'Explore business, leadership and strategy. Compare specialisations, teaching approach and practical learning before choosing your next step.' },
  { id: 'BBA', name: 'Bachelor of Business Administration', level: 'ug', category: 'Business & management', icon: 'briefcase', tint: '#f4eee3', color: '#9c7a44', description: 'Build a foundation in business and management. Look at the curriculum, exposure to practical projects and opportunities to explore different business functions.' },
  { id: 'BCA', name: 'Bachelor of Computer Applications', level: 'ug', category: 'Technology & computing', icon: 'code', tint: '#eaf0f3', color: '#5d8191', description: 'Explore computing and software applications. Compare the technologies taught, practical assignments, lab access and support for building a portfolio.' },
  { id: 'MCA', name: 'Master of Computer Applications', level: 'pg', category: 'Technology & computing', icon: 'code', tint: '#eceef7', color: '#767da3', description: 'Develop your interests in advanced computing and software applications. Check entry requirements and how the programme balances theory with practical work.' },
  { id: 'B.Com', name: 'Bachelor of Commerce', level: 'ug', category: 'Commerce & finance', icon: 'chart', tint: '#f4ede6', color: '#a08161', description: 'Explore commerce, accounting and business fundamentals. Consider subject combinations and how they connect with your longer-term interests.' },
  { id: 'M.Com', name: 'Master of Commerce', level: 'pg', category: 'Commerce & finance', icon: 'chart', tint: '#eaf2eb', color: '#68866b', description: 'Take a closer look at advanced commerce and related specialisations. Compare the curriculum, entry requirements and assessment pattern.' },
  { id: 'BA', name: 'Bachelor of Arts', level: 'ug', category: 'Arts & humanities', icon: 'pen', tint: '#f5eded', color: '#9f7775', description: 'Follow your interests in the arts, humanities or social sciences. Subject choices vary, so start by comparing the actual subjects and combinations offered.' },
  { id: 'MA', name: 'Master of Arts', level: 'pg', category: 'Arts & humanities', icon: 'pen', tint: '#eef0e7', color: '#838e65', description: 'Explore a subject in greater depth. Compare specialisations, research opportunities and the teaching format that suits how you like to learn.' }
];

const universities = [
  { id: 'vgu', name: 'Vivekananda Global University', city: 'Jaipur, Rajasthan', monogram: 'VGU', url: 'https://vgu.ac.in/', tint: '#f6f1e7', color: '#8d774a' },
  { id: 'muj', name: 'Manipal University Jaipur', city: 'Jaipur, Rajasthan', monogram: 'MUJ', url: 'https://jaipur.manipal.edu/', tint: '#f7eee7', color: '#a58259' },
  { id: 'amity', name: 'Amity University Rajasthan', city: 'Jaipur, Rajasthan', monogram: 'AU', url: 'https://www.amity.edu/jaipur/', tint: '#eef0f4', color: '#667891' },
  { id: 'lpu', name: 'Lovely Professional University', city: 'Phagwara, Punjab', monogram: 'LPU', url: 'https://www.lpu.in/', tint: '#f4eee6', color: '#a3855b' }
];

const studyModes = {
  regular: { name: 'Regular', title: 'Learn on campus', description: 'Consider the campus location, attendance expectations, timetable and the kind of learning environment you want.', checks: ['Campus and travel or accommodation needs', 'Attendance, classes and assessment format', 'Admission requirements and total costs'] },
  distance: { name: 'Distance', title: 'Build a routine for independent study', description: 'Check how learning materials, academic support, contact sessions and examinations are arranged for the particular programme.', checks: ['Programme recognition for your admission session', 'Study materials and contact-session arrangements', 'Examination centres and any required travel'] },
  online: { name: 'Online', title: 'Learn through a digital environment', description: 'Look at the combination of live and recorded learning, student support, assessment arrangements and programme entitlement.', checks: ['Programme entitlement for your admission session', 'Live classes, recordings and support availability', 'Technology requirements and examination format'] }
};

const guides = {
  modes: { label: 'STUDY FORMATS', title: 'Which way of studying fits your life?', intro: 'Start with your course, then compare the learning experience available at each institution.', points: ['Regular study: look at the campus, attendance requirements, timetable and living or travel costs.', 'Distance study: understand the materials, academic support, contact sessions and examination locations.', 'Online study: check live sessions, recordings, learning support and examination arrangements.', 'Verify the exact programme, study mode and admission session before applying. A general institution claim is not a substitute for programme-specific information.'] },
  fees: { label: 'PLANNING YOUR BUDGET', title: 'Look at the complete cost.', intro: 'A useful budget includes the costs around your studies as well as the tuition itself.', points: ['Confirm whether the quoted amount is per semester, per year or for the entire programme.', 'Ask about registration, examinations, materials, practical work and any other compulsory charges.', 'Include the travel, accommodation or technology costs relevant to your study format.', 'Read payment schedules and the published refund policy before making a commitment.'] },
  shortlist: { label: 'CHOOSING WELL', title: 'A shortlist built around you.', intro: 'Use the same questions for each institution so your comparison stays meaningful.', points: ['Course fit: compare subjects, specialisations, entry requirements and the learning you want.', 'Practical fit: compare the study format, location, timetable and support available.', 'Cost: note the fee basis and additional expenses so you compare like with like.', 'Evidence: keep links to the current programme and admission information, and ask about anything unclear.'] }
};

const state = { level: 'all', query: '', shortlist: new Set() };
const storageKey = 'rs-education-homepage-prototype-shortlist-v1';
try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) saved.filter(id => universities.some(u => u.id === id)).forEach(id => state.shortlist.add(id)); } catch { /* Storage is optional for this preview. */ }

const $ = selector => document.querySelector(selector);
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const normalize = value => value.toLowerCase().replace(/[.\s]/g, '');
const dialog = $('#detail-dialog');
const dialogBody = $('#dialog-body');
let toastTimer;

function notify(message) {
  const toast = $('#toast'); toast.textContent = message; toast.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

function renderCourses() {
  const query = normalize(state.query);
  const matching = courses.filter(course => (state.level === 'all' || course.level === state.level) && (!query || normalize(`${course.id} ${course.name} ${course.category}`).includes(query)));
  $('#course-grid').innerHTML = matching.map(course => `<button class="course-card" data-course="${course.id}" aria-label="Explore ${course.id}: ${course.name}" style="--course-tint:${course.tint};--course-color:${course.color}"><span class="course-card-top"><span class="course-icon">${icon(course.icon)}</span><span class="course-level">${course.level === 'pg' ? 'Postgraduate' : 'Undergraduate'}</span></span><h3>${course.id}</h3><p class="course-full-name">${course.name}</p><span class="course-card-bottom"><span>Explore ${course.id}</span>${icon('up-right')}</span></button>`).join('');
  $('.course-count').textContent = `${matching.length} ${matching.length === 1 ? 'course' : 'courses'} to explore`;
  $('#no-results').hidden = matching.length > 0;
  $('#active-search').hidden = !state.query;
  $('#active-search>span').textContent = `Showing courses for “${state.query}”`;
  document.querySelectorAll('[data-level]').forEach(button => { const active = button.dataset.level === state.level; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
}

function runSearch(query) {
  state.query = query.trim(); state.level = 'all'; $('#course-query').value = state.query;
  renderCourses(); $('#courses').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

function renderUniversities() {
  $('#institution-list').innerHTML = universities.map(university => `<article class="institution-row"><span class="institution-monogram" style="--university-tint:${university.tint};--university-color:${university.color}" aria-hidden="true">${university.monogram}</span><div class="institution-copy"><h3>${university.name}</h3><p>${icon('pin')}${university.city}</p><a href="${university.url}" target="_blank" rel="noopener noreferrer">Explore official website ${icon('up-right')}</a></div><button class="icon-button save-university" data-save="${university.id}" aria-label="${state.shortlist.has(university.id) ? 'Remove' : 'Save'} ${university.name}${state.shortlist.has(university.id) ? ' from' : ' to'} shortlist" aria-pressed="${state.shortlist.has(university.id)}">${icon('bookmark')}</button></article>`).join('');
  document.querySelectorAll('.shortlist-count').forEach(count => { count.textContent = state.shortlist.size; count.hidden = !state.shortlist.size; });
}

function toggleUniversity(id) {
  const university = universities.find(item => item.id === id); if (!university) return;
  const removed = state.shortlist.delete(id); if (!removed) state.shortlist.add(id);
  try { localStorage.setItem(storageKey, JSON.stringify([...state.shortlist])); } catch { /* Keep the current interaction working without storage. */ }
  renderUniversities(); notify(removed ? 'Removed from your shortlist' : 'Added to your shortlist');
}

function openDialog(title, eyebrow, body) {
  $('#dialog-title').textContent = title; $('#dialog-eyebrow').textContent = eyebrow; dialogBody.innerHTML = body;
  if (!dialog.open) dialog.showModal(); dialog.scrollTop = 0;
}

function modeContent(mode) {
  const item = studyModes[mode];
  return `<div class="dialog-mode-copy"><strong>${item.title}</strong><p>${item.description}</p></div><h3>Questions worth asking</h3><ul class="dialog-checklist">${item.checks.map(check => `<li>${check}</li>`).join('')}</ul>`;
}

function openCourse(id, selectedMode = 'regular') {
  const course = courses.find(item => item.id === id); if (!course) return;
  openDialog(`Explore ${course.id}`, course.name.toUpperCase(), `<p class="dialog-intro">${course.description}</p><h3>Consider your study format</h3><div class="dialog-options" role="group" aria-label="Study format">${Object.entries(studyModes).map(([key, item]) => `<button data-course-mode="${key}" data-for-course="${course.id}" class="${key === selectedMode ? 'active' : ''}" aria-pressed="${key === selectedMode}">${item.name}</button>`).join('')}</div><div id="course-mode-content">${modeContent(selectedMode)}</div><p class="dialog-note">Course overview preview. Available modes, eligibility and fees depend on the institution and admission session.</p><div class="dialog-actions"><button class="button button-dark" data-advisor data-advisor-course="${course.id}">Discuss ${course.id} ${icon('arrow')}</button><button class="button button-outline" data-go-institutions>Explore institutions</button></div>`);
}

function openMode(mode) {
  if (!studyModes[mode]) return;
  openDialog(studyModes[mode].name + ' education', 'FIND A FORMAT THAT FITS', `${modeContent(mode)}<p class="dialog-note">Course and institution choices should be checked for the relevant admission session.</p><div class="dialog-actions"><button class="button button-dark" data-go-courses>Explore courses ${icon('arrow')}</button><button class="button button-outline" data-advisor>Ask an advisor</button></div>`);
}

function openModeComparison() {
  openDialog('Three ways to study.', 'A PRACTICAL COMPARISON', `<p class="dialog-intro">Compare the format alongside the particular course and institution. Requirements vary.</p><div class="mode-table-wrap"><table class="mode-table"><thead><tr><th scope="col">Consider</th><th scope="col">Regular</th><th scope="col">Distance</th><th scope="col">Online</th></tr></thead><tbody><tr><th scope="row">Learning setting</th><td>Campus-led</td><td>Independent study with institutional support</td><td>Digital learning environment</td></tr><tr><th scope="row">Check the routine</th><td>Classes and attendance</td><td>Materials and contact sessions</td><td>Live and recorded sessions</td></tr><tr><th scope="row">Plan for</th><td>Travel or accommodation</td><td>Contact sessions and exam-centre travel</td><td>Technology and exam arrangements</td></tr><tr><th scope="row">Verify</th><td>Programme and admissions requirements</td><td>Programme recognition by session</td><td>Programme entitlement by session</td></tr></tbody></table></div><div class="dialog-actions"><button class="button button-dark" data-go-courses>Start with a course ${icon('arrow')}</button></div>`);
}

function openShortlist() {
  const selected = universities.filter(university => state.shortlist.has(university.id));
  openDialog('Your university shortlist', 'KEEP YOUR OPTIONS TOGETHER', selected.length ? `<p class="dialog-intro">Your saved institutions. Check the exact programme and study format before comparing costs.</p><div>${selected.map(university => `<div class="shortlist-item"><div><h3>${university.name}</h3><p>${university.city}</p></div><button data-remove="${university.id}">Remove</button></div>`).join('')}</div><div class="dialog-actions"><button class="button button-dark" data-advisor>Discuss my options ${icon('arrow')}</button><button class="button button-outline" data-go-institutions>Keep exploring</button></div>` : `<p class="dialog-intro">Save institutions using the bookmark buttons. You can come back to your selection here.</p><button class="button button-dark" data-go-institutions>Explore universities ${icon('arrow')}</button>`);
}

function openAdvisor(selectedCourse = '') {
  openDialog('Find your next step.', 'LET’S TALK ABOUT YOUR OPTIONS', `<p class="dialog-intro">Share a little about what you have in mind.</p><form class="advisor-form" id="advisor-form"><label>Your name<input name="name" autocomplete="off" placeholder="Demo Student" required maxlength="80"></label><label>Phone number<input name="phone" type="tel" inputmode="tel" autocomplete="off" placeholder="Use a sample number" required maxlength="20"></label><label class="full-field">Course you're considering<select name="course"><option value="">I'm still exploring</option>${courses.map(course => `<option${course.id === selectedCourse ? ' selected' : ''}>${course.id}</option>`).join('')}</select></label><label class="full-field">What's on your mind?<textarea name="question" placeholder="Tell us what you'd like to understand…" maxlength="500"></textarea></label><p class="form-preview-note">Prototype form: use sample details. Nothing is sent or stored.</p><button class="button button-dark full-field" type="submit">Preview my request ${icon('arrow')}</button></form>`);
  $('#advisor-form').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return; form.reset(); dialogBody.innerHTML = `<div class="form-success"><h3>That's how your request will look.</h3><p>This is a design preview. No request was sent and no contact details were saved.</p><button class="button button-dark" data-close-dialog>Continue exploring ${icon('arrow')}</button></div>`; });
}

function openGuide(id) {
  const guide = guides[id]; if (!guide) return;
  openDialog(guide.title, guide.label, `<p class="dialog-intro">${guide.intro}</p><ol class="guide-dialog-list">${guide.points.map(point => `<li>${point}</li>`).join('')}</ol><div class="dialog-actions"><button class="button button-dark" data-go-courses>Explore courses ${icon('arrow')}</button><button class="button button-outline" data-advisor>Talk it through</button></div>`);
}

function setMenu(open) { $('#mobile-nav').hidden = !open; $('.menu-trigger').setAttribute('aria-expanded', String(open)); $('.menu-trigger').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); }

$('#course-search').addEventListener('submit', event => { event.preventDefault(); runSearch($('#course-query').value); });
$('.menu-trigger').addEventListener('click', () => setMenu($('#mobile-nav').hidden));
$('#mobile-nav').addEventListener('click', event => { if (event.target.closest('a,button')) setMenu(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
$('#compare-modes').addEventListener('click', openModeComparison);

document.addEventListener('click', event => {
  const target = event.target.closest('button'); if (!target) return;
  if (target.hasAttribute('data-level')) { state.level = target.dataset.level; renderCourses(); }
  else if (target.hasAttribute('data-quick-course')) runSearch(target.dataset.quickCourse);
  else if (target.hasAttribute('data-course')) openCourse(target.dataset.course);
  else if (target.hasAttribute('data-mode')) openMode(target.dataset.mode);
  else if (target.hasAttribute('data-course-mode')) { const mode = target.dataset.courseMode; $('#course-mode-content').innerHTML = modeContent(mode); document.querySelectorAll('[data-course-mode]').forEach(button => { const active = button.dataset.courseMode === mode; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); }); }
  else if (target.hasAttribute('data-save')) toggleUniversity(target.dataset.save);
  else if (target.hasAttribute('data-remove')) { toggleUniversity(target.dataset.remove); openShortlist(); }
  else if (target.classList.contains('shortlist-trigger')) openShortlist();
  else if (target.hasAttribute('data-guide')) openGuide(target.dataset.guide);
  else if (target.hasAttribute('data-advisor')) openAdvisor(target.dataset.advisorCourse);
  else if (target.hasAttribute('data-go-institutions')) { dialog.close(); $('#institutions').scrollIntoView({ behavior: 'smooth' }); }
  else if (target.hasAttribute('data-go-courses')) { dialog.close(); runSearch(''); }
  else if (target.hasAttribute('data-close-dialog')) dialog.close();
  else if (target.id === 'reset-courses' || target.id === 'clear-search') { state.level = 'all'; state.query = ''; $('#course-query').value = ''; renderCourses(); }
});

renderCourses();
renderUniversities();
