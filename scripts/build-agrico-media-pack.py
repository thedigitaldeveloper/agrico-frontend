"""Validate downloaded assets and assemble a local gallery and future CMS upload map."""
import argparse
import importlib.util
import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'docs/content/universities-2026-10-30'
spec = importlib.util.spec_from_file_location('agrico_media', Path(__file__).with_name('agrico-media.py'))
media_helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(media_helper)


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def write(name, value):
    (BASE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def assemble(complete=False, attach=False):
    profiles = read(BASE / 'institutions.json')['institutions']
    records, issues, warnings, uploads, relations = [], [], [], [], []
    hashes = defaultdict(list)
    roles = {'logo': 'logo', 'card_logo': 'card_logo', 'campus_primary': 'image', 'campus_secondary': 'gallery_candidate'}
    for profile in profiles:
        file = BASE / 'media' / profile['slug'] / 'assets.json'
        if not file.exists():
            records.append({'id': profile['id'], 'name': profile['name'], 'slug': profile['slug'], 'status': 'not_collected', 'assets': [], 'gaps': [{'role': 'logo_and_campus', 'reason': 'Collection not yet completed.'}]})
            continue
        record = read(file)
        record['assets'] = record.get('assets', [])
        if record.get('id') != profile['id'] or record.get('slug') != profile['slug']:
            issues.append({'id': profile['id'], 'message': 'Manifest institution id/slug mismatch'})
        accepted, seen_roles, ref = [], set(), {'id': profile['id'], 'slug': profile['slug'], 'content_profile': profile.get('editorial_file'), 'fields': {}, 'gallery_candidates': [], 'display_hints': {}}
        for source in record['assets']:
            asset = dict(source)
            role = asset.get('role')
            if role not in roles:
                issues.append({'id': profile['id'], 'message': 'Unknown media role: ' + str(role)})
                continue
            if role in seen_roles:
                issues.append({'id': profile['id'], 'message': 'Duplicate role: ' + role})
                continue
            seen_roles.add(role)
            asset_path = Path(asset.get('file', ''))
            if not asset_path.is_absolute():
                asset_path = BASE / asset_path
            asset_path = asset_path.resolve()
            expected_directory = (BASE / 'media' / profile['slug']).resolve()
            if not asset_path.is_relative_to(expected_directory) or not asset_path.is_file():
                issues.append({'id': profile['id'], 'role': role, 'message': 'Missing file or file outside this institution directory: ' + str(asset_path)})
                continue
            try:
                metadata = media_helper.inspect_image(asset_path)
            except Exception as error:
                issues.append({'id': profile['id'], 'role': role, 'message': 'Image decoding failed: ' + str(error)})
                continue
            if metadata.get('safe_static_svg') is False:
                issues.append({'id': profile['id'], 'role': role, 'message': 'SVG has script/event/external reference content; choose a safe source variant.'})
                continue
            for key in ['source_page', 'download_url', 'identity_evidence', 'alt']:
                if not asset.get(key):
                    issues.append({'id': profile['id'], 'role': role, 'message': 'Missing provenance field: ' + key})
            asset.update(metadata)
            asset['file'] = asset_path.relative_to(BASE).as_posix()
            asset['cms_field'] = roles[role]
            asset['upload_key'] = profile['slug'] + ':' + role
            asset['name'] = profile['name'] + (' — institution logo' if role == 'logo' else ' — ' + role.replace('_', ' '))
            if asset.get('review_status') != 'verified_source':
                warnings.append({'id': profile['id'], 'role': role, 'message': 'Visual/source identity review remains pending.'})
            if role.startswith('campus') and (metadata.get('width') or 0) < 600:
                warnings.append({'id': profile['id'], 'role': role, 'message': 'Authentic image is below 600px wide; prefer a larger original when available.'})
            accepted.append(asset)
            hashes[asset['sha256']].append({'id': profile['id'], 'role': role, 'file': asset['file']})
            uploads.append({'key': asset['upload_key'], 'file': asset['file'], 'name': asset['name'], 'mime': asset['mime'], 'bytes': asset['bytes'], 'sha256': asset['sha256'], 'alternativeText': asset['alt'], 'caption': asset.get('description') or asset['alt'], 'source_page': asset['source_page'], 'download_url': asset['download_url']})
            if role == 'campus_secondary':
                ref['gallery_candidates'].append({'$upload': asset['upload_key']})
            else:
                ref['fields'][roles[role]] = {'$upload': asset['upload_key']}
            if asset.get('display_background'):
                ref['display_hints'][roles[role]] = {'background': asset['display_background'], 'note': 'Preserve original logo colours and use a contrasting container.'}
        record['assets'] = accepted
        present = {asset['role'] for asset in accepted}
        record['status'] = 'complete' if {'logo', 'campus_primary'}.issubset(present) else 'partial'
        record['gaps'] = record.get('gaps', [])
        records.append(record)
        relations.append(ref)
    duplicate_groups = [items for items in hashes.values() if len({item['id'] for item in items}) > 1]
    missing = [{'id': row['id'], 'name': row['name'], 'roles': [role for role in ['logo', 'campus_primary'] if role not in {asset['role'] for asset in row['assets']}]} for row in records if row['status'] != 'complete']
    if complete and missing:
        issues.append({'message': 'Required institution media is missing', 'institutions': missing})
    report = {'checked_on': '2026-10-30', 'institutions': 58, 'complete': sum(row['status'] == 'complete' for row in records), 'asset_records': len(uploads), 'unique_files': len({asset['file'] for asset in uploads}), 'logos': sum(asset['cms_field'] == 'logo' for row in records for asset in row['assets']), 'card_logos': sum(asset['cms_field'] == 'card_logo' for row in records for asset in row['assets']), 'campus_photos': sum(asset['role'].startswith('campus') for row in records for asset in row['assets']), 'total_bytes': sum(asset['bytes'] for asset in uploads), 'missing': missing, 'cross_institution_duplicate_files': duplicate_groups, 'warnings': warnings, 'issues': issues}
    write('media-manifest.json', {'checked_on': '2026-10-30', 'records': records})
    write('media-coverage.json', report)
    write('cms-media-import-plan.json', {'version': '1.0', 'status': 'prepared_not_executed', 'target': 'api::university.university', 'matching_key': 'slug', 'instructions': ['Upload local files through the configured CMS upload provider.', 'Resolve $upload keys to returned upload ids, then attach the named university fields.', 'Match university records by the prepared content slug; do not create duplicate institutions.', 'Secondary photos are gallery candidates; upload them for future use without replacing the primary campus image.', 'Preserve original source provenance and recorded rights status.'], 'uploads': uploads, 'universities': relations})
    template = (BASE / 'media-review-template.html').read_text(encoding='utf-8')
    payload = json.dumps({'report': report, 'records': records}, ensure_ascii=False).replace('<', '\\u003c')
    (BASE / 'media-review.html').write_text(template.replace('/*MEDIA_DATA*/', 'const DATA=' + payload + ';'), encoding='utf-8')
    if attach:
        by_slug = {row['slug']: row for row in records}
        for batch in ['batch-01', 'batch-02', 'batch-03']:
            for path in (BASE / batch).glob('*.json'):
                value = read(path)
                if not isinstance(value, dict) or not value.get('hero'):
                    continue
                row = by_slug.get(value.get('slug'))
                if not row:
                    continue
                assets = {asset['role']: asset for asset in row['assets']}
                media = value['media']
                if assets.get('logo'):
                    media['logo_url'] = assets['logo']['download_url']
                    media['local_logo'] = assets['logo']['file']
                if assets.get('card_logo'):
                    media['local_card_logo'] = assets['card_logo']['file']
                if assets.get('campus_primary'):
                    photo = assets['campus_primary']
                    media.update({'campus_image_url': photo['download_url'], 'local_campus_image': photo['file'], 'campus_alt': photo['alt'], 'caption': photo.get('description') or photo['alt']})
                media['local_gallery'] = [asset['file'] for asset in row['assets'] if asset['role'].startswith('campus')]
                media['collection_status'] = row['status']
                if row['assets']:
                    media['rights_status'] = 'downloaded_public_source_no_explicit_license'
                    value['verification_gaps'] = [gap for gap in value['verification_gaps'] if not (gap.get('field') == 'media' and ('acquired' in gap.get('reason', '') or 'Licensed' in gap.get('reason', '')))]
                for asset in row['assets']:
                    source_id = 'media_' + asset['role']
                    value['sources'] = [source for source in value['sources'] if source['id'] != source_id]
                    value['sources'].append({'id': source_id, 'url': asset['source_page'], 'title': value['name'] + ' — ' + asset['role'].replace('_', ' ') + ' source', 'kind': 'secondary' if asset.get('source_kind') == 'secondary' else 'official', 'access': 'page_read', 'checked_on': '2026-10-30', 'supports': ['media'], 'notes': 'Unchanged image saved locally: ' + asset['file'] + '. ' + asset['identity_evidence']})
                    media['source_ids'] = list(dict.fromkeys(media.get('source_ids', []) + [source_id]))
                path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({key: value for key, value in report.items() if key not in ['missing', 'warnings', 'issues', 'cross_institution_duplicate_files']}, indent=2))
    print('issues=' + str(len(issues)) + ' warnings=' + str(len(warnings)) + ' cross-institution duplicate groups=' + str(len(duplicate_groups)))
    if issues:
        print(json.dumps(issues[:15], ensure_ascii=False, indent=2))
        return 1
    return 0


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--complete', action='store_true')
    parser.add_argument('--attach', action='store_true')
    args = parser.parse_args()
    sys.exit(assemble(args.complete, args.attach))
