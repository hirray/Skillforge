from pathlib import Path
import re
import yaml
from ..taxonomy import resolve, find_skills

DOMAINS = yaml.safe_load((Path(__file__).parents[1] / 'knowledge/domains.yaml').read_text())['domains']
LEVELS = {'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4}


def analyze(description: str, taxonomy: list[dict], team: list[dict] | None = None, team_size: int | None = None, timeline: int | None = None) -> dict:
    warnings = ['Description truncated to 5000 characters.'] if len(description) > 5000 else []
    text = description[:5000]
    result = {'skills': [], 'roles': [], 'modules': [], 'dependencies': [], 'warnings': warnings, 'questions': [], 'needsClarification': False, 'gap': {'covered': [], 'partial': [], 'missing': []}, 'reasons': []}
    if len(text.split()) < 15:
        result.update(needsClarification=True, questions=['Who will use this project, and what should they accomplish?', 'What are the main workflows and any technology constraints?', 'How many people and weeks do you have?'])
        return result
    matches = []
    for domain in DOMAINS:
        trigger = next((p for p in domain['phrases'] if re.search(r'(?<!\w)' + re.escape(p) + r'(?!\w)', text, re.I)), None)
        if trigger:
            matches.append(domain)
            for name in domain['skills']:
                if any(s['name'] == name for s in result['skills']):
                    continue
                skill = resolve(name, taxonomy)
                result['skills'].append({'name': name, 'canonicalSkillId': skill['id'] if skill else None, 'unmatched': skill is None, 'type': 'required', 'proficiency': 'intermediate', 'trigger': trigger, 'rationale': f'“{trigger}” suggests {domain["name"]}, where {name} is commonly useful.', 'source': 'ai_accepted'})
            if not any(r['title'] == domain['role'] for r in result['roles']):
                result['roles'].append({'title': domain['role'], 'skills': domain['skills'], 'rationale': f'Supports the {domain["name"]} work triggered by “{trigger}”.'})
            result['modules'].extend(domain['modules'])
    for skill in find_skills(text, taxonomy):
        if not any(s['name'] == skill['name'] for s in result['skills']):
            result['skills'].append({**skill, 'type': 'required', 'proficiency': 'intermediate', 'unmatched': False, 'rationale': f'{skill["name"]} is explicitly mentioned in the description.', 'source': 'ai_accepted'})
    result['modules'] = list(dict.fromkeys(result['modules']))
    dependency_rules = {'computer vision': 'A consented image dataset and a model-evaluation workflow are needed before reliable recognition.', 'web applications': 'The web interface depends on a defined API and shared data model.', 'cloud': 'Deployment depends on a build pipeline, runtime configuration, and monitoring.', 'ecommerce': 'Checkout depends on catalog, inventory, and order-state definitions.', 'payments': 'Billing depends on a payment-provider adapter and a reconciled transaction ledger.'}
    result['dependencies'] = [dependency_rules[d['name']] for d in matches if d['name'] in dependency_rules]
    if not result['skills']:
        result.update(needsClarification=True, questions=['Which capabilities or technologies does this project need?', 'Could you describe one concrete user workflow?'])
    if len(matches) >= 4:
        warnings.append('Several domains are combined. Consider splitting the project into separate phases or projects.')
    if team_size and len(result['roles']) > team_size:
        warnings.append(f'{len(result["roles"])} roles exceed the stated team of {team_size}. Reduce the first release scope.')
    if timeline and timeline <= 4 and len(result['skills']) > 6:
        warnings.append('This scope may be large for four weeks or less. Split it into a focused first release.')
    for requirement in result['skills']:
        people, partial, evidence_types = [], [], []
        for member in team or []:
            for skill in member.get('skills', []):
                if skill['name'].casefold() == requirement['name'].casefold():
                    evidence_types.extend(skill.get('evidence', []) or ['self_declared'])
                    (people if LEVELS.get(skill.get('level', 'beginner').casefold(), 1) >= LEVELS[requirement['proficiency']] else partial).append(member['name'])
        bucket = 'covered' if people else 'partial' if partial else 'missing'
        strongest = next((e for e in ['verified_project','github_contribution','certification','resume_extracted','self_declared'] if e in evidence_types), None)
        result['gap'][bucket].append({'skill': requirement['name'], 'people': people or partial, 'evidenceStrength': strongest, 'reason': f'Meets suggested proficiency; strongest available evidence: {strongest}.' if people else 'Below suggested proficiency.' if partial else 'No confirmed team member covers this skill.'})
    result['reasons'] = [f'Analyzed {len(matches)} domain signals; suggestions remain editable.']
    return result
