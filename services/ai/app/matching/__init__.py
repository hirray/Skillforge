"""Pure evidence-weighted matching. Explicit input allow-list, stable ordering."""
from pathlib import Path
import math
import yaml

WEIGHTS = yaml.safe_load((Path(__file__).parent / 'weights.yaml').read_text())
ALLOWED = {'id', 'name', 'headline', 'skills', 'learningGoals', 'hoursPerWeek', 'workMode', 'duration', 'matchingOptIn', 'recruiterVisible', 'location', 'experienceYears', 'verifiedProjects', 'profileText', 'recentActivity', 'publicSkills'}
SKILL_ALLOWED = {'name', 'level', 'evidence', 'visible'}


def guard(candidate: dict):
    unexpected = set(candidate) - ALLOWED
    if unexpected:
        raise ValueError('Candidate contains fields outside the scoring allow-list: ' + ', '.join(sorted(unexpected)))
    for skill in candidate.get('skills', []):
        if set(skill) - SKILL_ALLOWED:
            raise ValueError('Skill contains fields outside the scoring allow-list.')


def coverage(requirements: list[dict], candidate: dict, evidence: dict) -> tuple[float, list[str], list[str]]:
    matched, public, total = [], [], 0.0
    levels = {'beginner': .5, 'intermediate': .75, 'advanced': .9, 'expert': 1.0}
    for requirement in requirements:
        skill = next((s for s in candidate.get('skills', []) if s['name'].casefold() == requirement['name'].casefold()), None)
        if skill:
            total += evidence.get(skill.get('evidence', 'self_declared'), .5) * levels.get(skill.get('level', 'intermediate').casefold(), .75)
            matched.append(requirement['name'])
            if skill.get('visible', True):
                public.append(requirement['name'])
    return total / max(len(requirements), 1), matched, public


def semantic_scores(project: dict, candidates: list[dict]) -> list[float]:
    # Optional local semantic baseline; never contacts an external provider.
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    query = ' '.join(r['name'] for r in project.get('requirements', [])) + ' ' + project.get('description', '')
    # Free-form biographies can contain protected attributes. Use skill names
    # and taxonomy-linked learning goals rather than arbitrary biography text.
    texts = [query] + [' '.join(s['name'] for s in c.get('skills', [])) + ' ' + ' '.join(c.get('learningGoals', [])) for c in candidates]
    try:
        matrix = TfidfVectorizer(ngram_range=(1, 2)).fit_transform(texts)
        return cosine_similarity(matrix[0], matrix[1:]).ravel().tolist()
    except ValueError:
        return [0.0] * len(candidates)


def rank(project: dict, candidates: list[dict], exclusions: list[str] | None = None, weights: dict | None = None, ranker: str = 'baseline', filters: dict | None = None) -> dict:
    cfg, filters = {**WEIGHTS, **(weights or {})}, filters or {}
    requirements = project.get('requirements', [])
    required = [r for r in requirements if not r.get('isOptional', False)]
    preferred = [r for r in requirements if r.get('isOptional', False)]
    if not required:
        raise ValueError('Add at least one required skill before running matching.')
    excluded = set(exclusions or []) | {project.get('ownerId')} | set(project.get('memberIds', []))
    eligible = []
    for candidate in candidates:
        guard(candidate)
        if candidate['id'] in excluded or not candidate.get('matchingOptIn', False):
            continue
        if candidate.get('hoursPerWeek', 0) < filters.get('minimumAvailability', 0):
            continue
        if filters.get('workMode') and candidate.get('workMode') not in (filters['workMode'], 'flexible'):
            continue
        eligible.append(candidate)
    semantic = semantic_scores(project, eligible) if ranker == 'hybrid' and eligible else [0.0] * len(eligible)
    results = []
    for index, candidate in enumerate(eligible):
        req, matched, public = coverage(required, candidate, cfg['evidence'])
        pref, _, _ = coverage(preferred, candidate, cfg['evidence'])
        # A role is covered only when its configured skills intersect candidate skills.
        roles = [r for r in project.get('roles', []) if r.get('openings', 1) > r.get('filled', 0) and (not filters.get('role') or filters['role'] == r['title'])]
        role = max(roles, key=lambda r: len({s.casefold() for s in r.get('skills', [])} & {s['name'].casefold() for s in candidate.get('skills', [])}), default=None)
        role_coverage = len(set(s.casefold() for s in role.get('skills', [])) & set(s.casefold() for s in matched)) / max(len(role.get('skills', [])), 1) if role else 0
        role_fit = role_coverage >= .5
        if filters.get('role') and not role_fit:
            continue
        goals = {g.casefold() for g in candidate.get('learningGoals', [])}
        growth = [r['name'] for r in required if r['name'].casefold() in goals]
        hours = min(candidate.get('hoursPerWeek', 0), project.get('hoursPerWeek', 10))
        signals = {'required': req, 'preferred': pref, 'role': float(role_fit), 'availability': min(hours / max(project.get('hoursPerWeek', 10), 1), 1), 'duration': float(bool(project.get('duration') and candidate.get('duration') == project['duration'])), 'work_mode': float(bool(project.get('workMode') and candidate.get('workMode') in (project['workMode'], 'flexible'))), 'growth': len(growth) / len(required), 'recency': float(candidate.get('recentActivity', False))}
        score = sum(signals[k] * cfg[k] for k in signals)
        if ranker == 'hybrid':
            score = score * (1 - cfg['hybrid_weight']) + semantic[index] * cfg['hybrid_weight']
        reasons = []
        if public:
            reasons.append('Covers requested skills: ' + ', '.join(public[:3]) + '.')
        elif matched:
            reasons.append('Covers a requested capability; private skill details are not displayed.')
        if role_fit:
            reasons.append(f'Fills the open {role["title"]} role.')
        if hours > 0:
            reasons.append(f'Availability overlaps {hours:g} hours per week.')
        if growth:
            reasons.append('Learning goals overlap requested capabilities; this is a growth fit.')
        if not reasons:
            continue
        if len(reasons) == 1:
            reasons.append(f'Matches {len(matched)} of {len(required)} required capabilities.' if matched else 'No demonstrated required skills yet; review as a learning opportunity.')
        results.append({'userId': candidate['id'], 'name': candidate['name'], 'headline': candidate.get('headline', ''), 'score': round(score, 5), 'reasons': reasons[:4], 'signals': signals, 'weights': {k: cfg[k] for k in signals}, 'matchedSkills': public, 'role': role['title'] if role_fit else 'Contributor', 'matchType': 'Skill match' if matched else 'Growth fit', 'caveats': [] if req >= .5 else ['Some required capabilities are missing or have limited evidence.'], 'verifiedProjects': candidate.get('verifiedProjects', []), '_evidence': req})
    results.sort(key=lambda r: (-r['score'], -r['_evidence'], r['userId']))
    strong = [r for r in results if r['score'] >= cfg['strong_threshold']]
    for pos, result in enumerate(strong, 1):
        result.pop('_evidence')
        result['rank'] = pos
    return {'candidates': strong, 'noStrongMatches': not strong, 'relaxationSuggestions': [] if strong else ['Lower minimum availability.', 'Broaden work-mode preferences.', 'Review the project scope or add opt-in candidate profiles.'], 'ranker': ranker, 'sampleSize': len(eligible)}


def metrics(ranked: list[str], labels: dict[str, int], k: int = 5) -> dict:
    top = ranked[:k]
    precision = sum(labels.get(v, 0) > 0 for v in top) / k
    dcg = sum((2 ** labels.get(v, 0) - 1) / math.log2(i + 2) for i, v in enumerate(top))
    ideal = sum((2 ** v - 1) / math.log2(i + 2) for i, v in enumerate(sorted(labels.values(), reverse=True)[:k]))
    return {'precisionAt5': precision, 'ndcg': dcg / ideal if ideal else None}
