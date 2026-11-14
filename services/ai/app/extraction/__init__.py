"""Explainable PDF extraction. No remote model and no automatic profile writes."""
import io
import re
from pypdf import PdfReader
from ..taxonomy import find_skills, resolve

HEADINGS = {'skills': ['skills', 'technical skills', 'technologies'], 'experience': ['experience', 'work experience', 'employment'], 'education': ['education', 'academic background'], 'certifications': ['certifications', 'certificates'], 'projects': ['projects', 'personal projects']}


def item(kind: str, index: int, value: dict, evidence: str, confidence: float, reason: str) -> dict:
    return {'id': f'{kind}-{index}', 'section': kind, 'value': value, 'evidence': evidence[:500], 'confidence': confidence, 'confidenceLabel': 'High' if confidence >= .85 else 'Medium' if confidence >= .6 else 'Low', 'reason': reason}


def extract_text(text: str, taxonomy: list[dict]) -> dict:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    result = {'contact': {}, 'skills': [], 'experience': [], 'education': [], 'certifications': [], 'links': [], 'projects': [], 'proposals': [], 'warnings': [], 'reasons': ['Extracted from the document text layer; review every field before saving.']}
    if not lines:
        result['warnings'].append('No text layer found. This may be a scanned PDF. Continue with manual entry.')
        return result
    result['contact']['name'] = lines[0][:120]
    email = re.search(r'[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}', text)
    if email:
        result['contact']['email'] = email.group()
    for index, skill in enumerate(find_skills(text, taxonomy)):
        result['skills'].append(item('skills', index, {'name': skill['name'], 'canonicalSkillId': skill['canonicalSkillId'], 'level': 'intermediate'}, skill['evidence'], .94, 'Matched a canonical skill or alias in the resume text.'))
    for index, url in enumerate(dict.fromkeys(re.findall(r'https?://[^\s<>]+', text))):
        result['links'].append(item('links', index, {'url': url.rstrip('.,)')}, url, .95, 'A URL appears explicitly in the document.'))
    section = None
    for line in lines:
        label = line.casefold().rstrip(':')
        heading = next((kind for kind, titles in HEADINGS.items() if label in titles), None)
        if heading:
            section = heading
            continue
        if section == 'skills':
            for phrase in re.split(r'[,;|•]', line):
                phrase = phrase.strip()
                canonical = resolve(phrase, taxonomy)
                if canonical and not any(s['value']['canonicalSkillId'] == canonical['id'] for s in result['skills']):
                    result['skills'].append(item('skills', len(result['skills']), {'name': canonical['name'], 'canonicalSkillId': canonical['id'], 'level': 'intermediate'}, line, .72, f'Near-match between “{phrase}” and the canonical skill; review the spelling.'))
                if 1 < len(phrase) < 55 and not canonical:
                    result['proposals'].append({'name': phrase, 'evidence': line[:300], 'reason': 'Not in the supplied taxonomy; review as a proposal.'})
        if section in ('experience', 'education', 'certifications', 'projects'):
            parts = re.split(r'\s*[|;]\s*', line)
            dates = re.findall(r'(?:19|20)\d{2}|present|current', line, re.I)
            value = {'text': line, 'start': dates[0] if dates else '', 'end': dates[1] if len(dates) > 1 else ''}
            if section == 'experience':
                value.update({'company': parts[0], 'role': parts[1] if len(parts) > 1 else line})
            elif section == 'education':
                value.update({'institution': parts[0], 'degree': parts[1] if len(parts) > 1 else line})
            else:
                value['name'] = parts[0]
            confidence = .76 if len(parts) > 1 else .48
            result[section].append(item(section, len(result[section]), value, line, confidence, 'Found under the document section heading; dates and field boundaries use heuristics.'))
            if section in ('experience', 'education') and len(dates) < 2:
                result['warnings'].append(f'Dates ambiguous: {line[:90]}. Review manually.')
    if sum(c.isascii() for c in text) / max(len(text), 1) < .8:
        result['warnings'].append('Language may not be supported. Confidence is reduced; review manually.')
        for kind in ('skills', 'experience', 'education', 'certifications'):
            for value in result[kind]:
                value.update(confidence=min(value['confidence'], .55), confidenceLabel='Low')
    result['warnings'] = list(dict.fromkeys(result['warnings']))
    return result


def extract_pdf(data: bytes, taxonomy: list[dict]) -> dict:
    reader = PdfReader(io.BytesIO(data))
    if reader.is_encrypted:
        raise ValueError('Password-protected PDFs are not supported. Upload an unlocked PDF.')
    if len(reader.pages) > 100:
        raise ValueError('Resume exceeds the 100-page processing limit.')
    return extract_text('\n'.join((p.extract_text() or '')[:40000] for p in reader.pages)[:250000], taxonomy)
