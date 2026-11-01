"""Package only selected, validated content/media and the unpublished SEO blueprint."""
import hashlib
import json
import zipfile
from pathlib import Path

BASE = Path(__file__).resolve().parents[1] / 'docs/content/universities-2026-10-30'


def read(name):
    return json.loads((BASE / name).read_text(encoding='utf-8-sig'))


def write(name, value):
    (BASE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


coverage = read('coverage.json')
media = read('media-coverage.json')
records = read('media-manifest.json')['records']
profiles = read('institutions.json')['institutions']
publication = read('publication.json')
publication_report = read('publication-validation.json')
publication_qa = read('publication-browser-verification.json')
audit = read('content-seo-audit.json')
html_plan = read('cms-html-content-import-plan.json')
html_qa = read('html-content-verification.json')
assert not html_qa['errors'] and html_qa['bodies'] == len(html_plan['records']) + len(html_plan['posts'])
assert html_qa['import_sha256'] == hashlib.sha256((BASE / 'cms-html-content-import-plan.json').read_bytes()).hexdigest()
assert not publication_report['issues'] and not publication_report['missing_topics']
assert publication_report['institutions'] == 58 and publication_report['articles'] == len([p for p in publication['posts'] if p['kind'] == 'Articles']) and publication_report['blogs'] == 6
assert not publication_qa['errors'] and publication_qa['documents'] == sum(len(publication[key]) for key in ['institutions', 'university_tabs', 'posts', 'states'])
assert audit['runtime_verification'] and not audit['issues'] and not audit['orphan_documents']
preserved_variants = [asset for row in records for asset in row.get('originals', []) if asset.get('import_selected') is False]
assert coverage['prepared_institutions'] == media['complete'] == 58
assert not coverage['issues'] and not media['issues']
assert not media['missing'] and not media['cross_institution_duplicate_files']
assert all(asset.get('review_status') == 'verified_source' for row in records for asset in row['assets'])
assert read('media-seo-verification.json')['decoded_images'] == media['asset_records']
assert not read('media-seo-verification.json')['errors']
assert not read('review-verification.json')['errors']

manifest = {
    'title': 'Agrico: complete linked agriculture content and media pack',
    'checked_on': coverage['checked_on'],
    'verified_on': publication_qa['checked_on'],
    'status': 'content_written_and_locally_integrated',
    'cms_import_executed': False,
    'seo_implementation_executed': True,
    'implementation_scope': 'local_frontend_and_cms_schema',
    'remote_publication_executed': False,
    'public_image_credit_links': False,
    'scope': {
        'profiles': 58, 'separate_tab_pages': publication_report['university_tab_pages'], 'total_university_pages': publication_report['total_university_pages'], 'private_universities': coverage['private_universities'],
        'private_colleges': coverage['private_colleges'], 'programme_rows': coverage['programme_rows'],
        'faqs': sum(len(row['faqs']) for row in profiles), 'unique_source_urls': coverage['unique_source_urls'],
        'source_records': coverage['source_records'], 'verified_fee_rows': coverage['verified_fee_rows'],
        'fee_rows_explicitly_2026': coverage['fee_rows_explicitly_2026'],
        'institution_logos': media['logos'], 'compact_marks': media['card_logos'],
        'campus_academic_photos': media['campus_photos'], 'selected_original_files': media['unique_files'],
        'media_bytes': media['total_bytes'], 'preserved_non_import_variants': len(preserved_variants), 'seo_university_briefs': 58,
        'written_articles': publication_report['articles'], 'written_blogs': publication_report['blogs'],
        'historical_news_stories': publication_report['news'], 'written_state_collections': publication_report['state_collections'],
        'contextual_internal_links': publication_report['contextual_links'],
        'indexing_deferred_tabs': audit['deferred_for_evidence'], 'recorded_factual_gaps': audit['factual_gaps'],
    },
    'readers': {'complete_content': 'publication-review.html', 'research_provenance': 'review.html', 'media': 'media-review.html', 'seo_audit': 'seo-review.html', 'quality_and_remaining_gaps': 'content-seo-audit.html'},
    'structured_publication': 'publication.json',
    'cms_content_import': 'cms-content-import-plan.json',
    'cms_html_content_import': 'cms-html-content-import-plan.json',
    'html_body_count': html_qa['bodies'],
    'structured_data': 'institutions.json', 'media_manifest': 'media-manifest.json',
    'media_upload_plan': 'cms-media-import-plan.json', 'integration': 'integration-map.json',
    'notes': [
        'Institution pages and supporting editorial content are written and linked in the local frontend. Missing current fees, deadlines and placement figures remain explicit rather than invented.',
        'Selected original image files are stored locally with exact source URLs, alt text, native dimensions, identity evidence and SHA-256 checksums.',
        'Any preserved original variants explicitly marked import_selected:false are included for reference and are not part of the selected upload queue.',
        'Official-source variants are preferred; secondary sources, group/shared marks and native-resolution limits are labelled individually.',
        'Downloaded public images are not represented as having an independently acquired reuse licence.',
        'The media upload plan maps logo/card_logo/image fields by slug and uses symbolic upload keys; it has not been executed.',
        'Secondary photos are displayed in the local content gallery. Their CMS upload mapping is retained separately from the main image field.',
        'Ten Articles, six Blogs and two explicitly historical News stories are written, with official sources and linked institution examples.',
        'Official notice dates are separate from Agrico publication timestamps. CMS drafts must not be backdated to an official announcement.',
        'SEO and internal linking do not guarantee ranking or immediate indexing.',
        'Frontend routes, canonical redirects, structured content views, sitemap data and CMS schema fields were implemented. No CMS data import or remote deployment was executed.',
        'Raw research PDFs, failed downloads, rejected images and QA screenshots are excluded from this package.',
        'No external plagiarism-detection service was used; original prose and local paragraph-duplication checks are not a full external originality audit.'
    ]
}
write('package-manifest.json', manifest)
readme = f'''AGRICO — CONTENT + MEDIA + SEO PLAN
Latest research check: {coverage['checked_on']}

OPEN THESE FILES AFTER EXTRACTING THE WHOLE ZIP:
1. review.html — original researched copy for all 58 institutions; source and factual-gap logs.
2. media-review.html — {media['logos']} institution logos, {media['card_logos']} compact marks and {media['campus_photos']} campus/academic photos.
3. publication-review.html — complete linked copy: 58 overviews + 580 separate tab pages, 10 Articles, 6 Blogs, 2 historical News stories and 8 state collections.
4. seo-review.html — reference audit and implementation status.
5. content-seo-audit.html — technical fixes, {audit['deferred_for_evidence']} deferred-indexing tabs and {audit['factual_gaps']} recorded research flags.
6. cms-html-preview.html — actual editable HTML/CSS bodies: 638 university pages plus18 editorial pages.

institutions.json combines all 58 profiles. Individual editable JSON profiles are in batch-01/02/03.
The selected downloaded originals and per-institution source manifests are in media/<slug>/.
Any preserved variant marked import_selected:false is a reference original, excluded from the upload queue.
media-manifest.json contains dimensions, alt text, exact sources, identity evidence, visual notes and hashes.
cms-media-import-plan.json maps local files to symbolic uploads and University.logo/card_logo/image.
Resolve upload keys to actual upload IDs during a future CMS import; no import was executed.
Secondary photographs are included in the structured campus gallery as well as the media import map.
Public gallery/article image captions have no image-credit or source links. Acquisition details remain in the internal media manifests.
publication.json contains the overview and separate tab documents; each CMS university payload includes all ten tab pages in agriculture_content.tab_pages; editorial/ contains the original complete article/blog/news JSON files.
cms-content-import-plan.json contains slug-matched university/editorial field payloads and relation-resolution instructions.
cms-html-content-import-plan.json adds the existing CMS HTML/CSS editor payloads. Resolve each university relation,
then upsert Content Section by owner+secondary_slug. Position0 is Overview and positions1–10 are the subject tabs.
Each Content Section has one common.html-section with code.html and code.css; the frontend supplies H1, tabs and enquiry.
Keep the data-agrico-document attribute on the HTML root, matching that tab's canonical path. Preserve heading IDs,
and keep the HTML TOC and heading order in sync when making subsequent manual edits. CSS is isolated per component.
For Articles/Blogs/News, import the prepared Blog.body_html component. Structured JSON remains research/metadata fallback.
Import both plans; existing marked CMS HTML takes precedence for the tab body. Media URLs must be resolved for the target host.
Original-gap completion ledgers and before/after counts are under content-completion/. Research source PDFs are not bundled.

The complete written content is integrated locally. It is not a certificate that every changing institution fact is known.
{audit['deferred_for_evidence']} tabs lack enough separate source evidence for indexing. They remain readable with self-canonicals and noindex/follow,
and are excluded from the sitemap. Preserve the agriculture_content.tab_pages[*].indexing decisions on import.
Resolve the facts, regenerate the content and review indexing before enabling those pages. See content-seo-audit.json.
Only {coverage['verified_fee_rows']} fee rows have sourced amounts; {coverage['fee_rows_explicitly_2026']} explicitly cite a 2026 session.
Unknown fees/dates/placement figures remain null or empty. Preserve source year, quota and fee period.
Preserve precise ICAR programme/unit terms; recheck terms before claims beyond their recorded expiry.
Public-source image acquisition and its provenance are recorded; no independent image licence is claimed.
Lower-resolution originals and shared/group logos are labelled. Do not upscale or relabel them as unique campus proofs.

TOCs, body links, honest editorial bylines, university/editorial relations, distinct canonical article/blog/news routes,
frontend content binding, image display and sitemap entries are implemented. Browser QA covers all 664 content routes.
News describes genuine historical official notices; the source notice date is not our own publication date.
No remote deployment, live CMS data import, ranking or immediate-indexing claim is made.

Frontend source and CMS schema were updated. CMS record IDs, media IDs and taxonomy IDs must be resolved during actual import.
Browser validation checks the complete offline reader, all 664 frontend routes, canonical aliases, sitemaps and responsive tables.
Raw source PDFs, rejected candidates and QA screenshots are excluded. See package-manifest.json for counts.
'''
(BASE / 'READ-FIRST.txt').write_text(readme, encoding='utf-8')

root_names = [
    'READ-FIRST.txt', 'package-manifest.json', 'institutions.json', 'content-contract.json',
    'page-content-requirements.json', 'integration-map.json', 'coverage.json', 'source-register.json',
    'verification-gaps.json', 'review.html', 'review-template.html', 'review-verification.json',
    'media-contract.json', 'media-manifest.json', 'media-coverage.json', 'cms-media-import-plan.json',
    'media-review.html', 'media-review-template.html', 'media-seo-verification.json',
    'seo-review.html', 'seo-review-template.html',
    'publication.json', 'publication-runtime.json', 'publication-validation.json', 'publication-link-map.json',
    'publication-browser-verification.json', 'cms-content-import-plan.json',
    'publication-review.html', 'publication-review-template.html'
    , 'content-seo-audit.json', 'content-seo-audit.html', 'seo-release-verification.json'
    , 'cms-html-content-import-plan.json', 'html-content-verification.json', 'cms-html-preview.html', 'cms-html-preview-template.html'
]
files = {BASE / name for name in root_names}
files.update((BASE / 'seo').glob('*.json'))
files.update((BASE / 'editorial').glob('*.json'))
files.update((BASE / 'tab-pages').glob('*.json'))
files.update(file for file in (BASE / 'html-content').rglob('*') if file.is_file())
files.update((BASE / 'content-completion').glob('*-report.json'))
files.add(BASE / 'content-completion/completion-summary.json')
files.add(BASE / 'content-completion/baseline.json')
for profile in profiles:
    files.add(BASE / profile['editorial_file'])
for row in records:
    files.add(BASE / 'media' / row['slug'] / 'assets.json')
    for asset in row['assets']:
        file = (BASE / asset['file']).resolve()
        assert file.is_relative_to(BASE.resolve()) and file.is_file()
        assert hashlib.sha256(file.read_bytes()).hexdigest() == asset['sha256']
        files.add(file)
for asset in preserved_variants:
    file = (BASE / asset['file']).resolve()
    assert file.is_relative_to(BASE.resolve()) and file.is_file()
    assert hashlib.sha256(file.read_bytes()).hexdigest() == asset['sha256']
    files.add(file)
assert all(file.is_file() for file in files)
inventory = [{'file': file.relative_to(BASE).as_posix(), 'bytes': file.stat().st_size, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()} for file in sorted(files)]
write('package-files.json', {'checked_on': '2026-10-30', 'files': inventory})
files.add(BASE / 'package-files.json')
archive = BASE / 'Agrico-58-Institutions-Content-and-Media-2026-10-30.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as output:
    for file in sorted(files):
        output.write(file, file.relative_to(BASE).as_posix())
with zipfile.ZipFile(archive) as output:
    assert output.testzip() is None
    assert len(output.infolist()) == len(files)
    assert sum(name.startswith('media/') and not name.endswith('/assets.json') for name in output.namelist()) == media['unique_files'] + len(preserved_variants)
print(json.dumps({'zip': str(archive), 'entries': len(files), 'bytes': archive.stat().st_size, 'selected_media': media['unique_files'], 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest()}, indent=2))
