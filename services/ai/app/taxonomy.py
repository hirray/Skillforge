"""Stateless canonical skill matching, shared by extraction and requirements."""
import re
from rapidfuzz.fuzz import ratio


def normalize(value: str) -> str:
    return re.sub(r'[^a-z0-9+#]', '', value.casefold())


def resolve(value: str, taxonomy: list[dict]) -> dict | None:
    key = normalize(value)
    for skill in taxonomy:
        names = [skill['name'], *skill.get('aliases', [])]
        if any(normalize(name) == key for name in names):
            return skill
    if len(key) >= 5:
        scored = [(max(ratio(key, normalize(n)) for n in [s['name'], *s.get('aliases', [])]), s) for s in taxonomy]
        if scored and max(scored, key=lambda x: x[0])[0] >= 90:
            return max(scored, key=lambda x: x[0])[1]
    return None


def find_skills(text: str, taxonomy: list[dict]) -> list[dict]:
    found = []
    for skill in taxonomy:
        for name in [skill['name'], *skill.get('aliases', [])]:
            pattern = r'(?<![\w])' + re.escape(name).replace(r'\ ', r'\s+') + r'(?![\w+#])'
            match = re.search(pattern, text, re.I)
            if match:
                start, end = max(0, match.start() - 55), min(len(text), match.end() + 65)
                found.append({'name': skill['name'], 'canonicalSkillId': skill['id'], 'evidence': text[start:end].strip()})
                break
    return found
