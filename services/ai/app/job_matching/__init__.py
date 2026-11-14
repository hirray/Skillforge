from pathlib import Path
import yaml
from ..matching import guard, coverage, WEIGHTS

JOB_WEIGHTS = yaml.safe_load((Path(__file__).parent / 'weights.yaml').read_text())


def rank_jobs(job: dict, candidates: list[dict], constraints: dict | None = None) -> dict:
    required = [r for r in job.get('requirements', []) if not r.get('isOptional', False)]
    preferred = [r for r in job.get('requirements', []) if r.get('isOptional', False)]
    if not required:
        raise ValueError('The job needs at least one required skill.')
    constraints, results, removed = constraints or {}, [], {}
    for candidate in candidates:
        guard(candidate)
        if not candidate.get('recruiterVisible', False):
            continue
        constraint_results, failed, penalty = [], False, 0
        for field in ('location', 'workMode'):
            expected = job.get(field)
            if not expected or expected in ('flexible', 'remote') and field == 'location':
                continue
            actual = candidate.get(field)
            passed = bool(actual and (actual.casefold() == expected.casefold() or field == 'workMode' and actual == 'flexible'))
            mode = constraints.get(field, 'soft')
            constraint_results.append({'field': field, 'mode': mode, 'passed': passed, 'reason': f'{field}: ' + ('compatible' if passed else 'not confirmed compatible')})
            if not passed and mode == 'hard':
                failed = True
                removed[field] = removed.get(field, 0) + 1
            elif not passed:
                penalty += JOB_WEIGHTS['soft_constraint_penalty']
        years = candidate.get('experienceYears', 0)
        if years < job.get('minimumExperience', 0):
            removed['experience'] = removed.get('experience', 0) + 1
            failed = True
        if failed:
            continue
        req, matched, public = coverage(required, candidate, WEIGHTS['evidence'])
        pref, _, _ = coverage(preferred, candidate, WEIGHTS['evidence'])
        if not matched:
            continue
        experience = min(years / max(job.get('minimumExperience', 0), 1), 1)
        signals = {'required': req, 'preferred': pref, 'experience': experience}
        score = max(0, sum(signals[k] * JOB_WEIGHTS[k] for k in signals) - penalty)
        reasons = [('Covers required skills: ' + ', '.join(public[:4]) + '.') if public else 'Covers requested capabilities; private details are not displayed.', f'Matches {len(matched)} of {len(required)} required capabilities.']
        if years:
            reasons.append(f'{years:g} years of declared relevant experience.')
        projects = candidate.get('verifiedProjects', [])
        if projects:
            reasons.append(f'{len(projects)} verified project evidence record(s).')
        results.append({'userId': candidate['id'], 'name': candidate['name'], 'headline': candidate.get('headline', ''), 'score': round(score, 5), 'reasons': reasons[:4], 'matchedSkills': public, 'signals': signals, 'weights': JOB_WEIGHTS, 'constraintResults': constraint_results, 'caveats': [c['reason'] for c in constraint_results if not c['passed']], 'verifiedProjects': projects})
    results.sort(key=lambda r: (-r['score'], r['userId']))
    for i, row in enumerate(results, 1):
        row['rank'] = i
    return {'candidates': results, 'sampleSize': sum(c.get('recruiterVisible', False) for c in candidates), 'noStrongMatches': not results, 'removedByConstraint': removed, 'relaxationSuggestions': [f'Consider making {field} a soft constraint.' if field in ('location', 'workMode') else 'Review the minimum experience required by the job.' for field in removed], 'ranker': 'baseline'}
