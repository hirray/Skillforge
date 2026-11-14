import base64
import importlib.util
import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.extraction import extract_pdf, extract_text
from app.requirements import analyze
from app.matching import rank, guard, metrics, WEIGHTS
from app.job_matching import rank_jobs
from app.health import compute

client = TestClient(app)
FIXTURES = Path(__file__).parent / 'fixtures'
NAMES = ['React','TypeScript','Node.js','Python','Machine Learning','Computer Vision','AWS','Docker','CI/CD','Figma','UI/UX Design']
TAXONOMY = [{'id': str(i), 'name': name, 'aliases': ['ML'] if name == 'Machine Learning' else []} for i, name in enumerate(NAMES)]

@pytest.mark.parametrize('name', ['frontend','ml','cloud','designer','ambiguous'])
def test_golden_resumes(name):
    golden = json.loads((FIXTURES / f'{name}.golden.json').read_text())
    data = extract_pdf((FIXTURES / f'{name}.pdf').read_bytes(), TAXONOMY)
    assert data['contact']['name'] == golden['name']
    assert {item['value']['name'] for item in data['skills']} == set(golden['skills'])
    assert all(item['evidence'] and item['reason'] and item['value']['canonicalSkillId'] for item in data['skills'])
    assert bool(data['warnings']) == golden['ambiguousDates']
    if name == 'frontend':
        assert data['education'][0]['value']['start'] == '2018'
        assert data['experience'][0]['value']['role'] == 'Frontend Engineer'

def test_no_text_warning():
    data = extract_pdf((FIXTURES/'no-text.pdf').read_bytes(), TAXONOMY)
    assert data['warnings'] and not data['skills']

def test_skill_aliases_and_word_boundaries():
    data = extract_text('Maya\nSkills\nML, React\nA reactive personality.', TAXONOMY)
    assert {s['value']['name'] for s in data['skills']} == {'Machine Learning','React'}
    assert not extract_text('Reactive personality', TAXONOMY)['skills']

def test_unknown_skills_are_proposals_only():
    data = extract_text('Alex\nSkills\nPython, UnlistedTool', TAXONOMY)
    assert data['proposals'][0]['name'] == 'UnlistedTool'

def test_fuzzy_skill_match_has_lower_confidence_and_evidence():
    data = extract_text('Alex\nSkills\nTypescriptt', TAXONOMY)
    assert data['skills'][0]['value']['name'] == 'TypeScript'
    assert data['skills'][0]['confidenceLabel'] == 'Medium'
    assert 'Near-match' in data['skills'][0]['reason']

def test_semantic_ranking_does_not_use_arbitrary_biography_text():
    a = candidate('a', profileText='religion gender disability')
    b = candidate('b', profileText='Python professional engineer')
    assert rank(PROJECT, [a, b], ranker='hybrid')['candidates'][0]['userId'] == 'a'

@pytest.mark.parametrize('content', ['notbase64!', base64.b64encode(b'not a pdf').decode()])
def test_invalid_pdf_service(content):
    assert client.post('/ai/resume/parse',json={'dataBase64':content}).status_code == 422

def test_valid_response_schema():
    r=client.post('/ai/resume/parse',json={'resumeId':'x','dataBase64':base64.b64encode((FIXTURES/'ml.pdf').read_bytes()).decode(),'taxonomy':TAXONOMY})
    assert r.status_code == 200 and r.json()['data']['skills']

def test_requirements_short_description_asks_questions():
    result=analyze('a chat app',TAXONOMY)
    assert result['needsClarification'] and not result['skills'] and len(result['questions'])>=2

def test_domain_mapping_gaps_scope_and_reasons():
    description='Build a web application for classroom attendance using face recognition, computer vision and secure cloud deployment, with a React dashboard for teachers.'
    team=[{'name':'Maya','skills':[{'name':'React','level':'advanced'},{'name':'Python','level':'beginner'}]}]
    result=analyze(description,TAXONOMY,team,team_size=1,timeline=2)
    assert any(s['name']=='Computer Vision' for s in result['skills'])
    assert all(s['rationale'] for s in result['skills'])
    assert any(s['skill']=='React' for s in result['gap']['covered'])
    assert any(s['skill']=='Python' for s in result['gap']['partial'])
    assert any(s['skill']=='AWS' for s in result['gap']['missing'])
    assert result['warnings']

def test_long_input_and_mixed_domains():
    result=analyze('web app face recognition online store cloud mobile app security ' * 600,TAXONOMY)
    assert any('truncated' in w for w in result['warnings'])
    assert any('splitting' in w for w in result['warnings'])

def candidate(id='a', **extra):
    return {'id':id,'name':'Synthetic '+id,'skills':[{'name':'Python','level':'advanced','evidence':'self_declared'}],'matchingOptIn':True,'recruiterVisible':True,'hoursPerWeek':12,'location':'Pune','workMode':'remote',**extra}

PROJECT={'ownerId':'owner','memberIds':['member'],'requirements':[{'name':'Python'}],'roles':[{'title':'ML Engineer','skills':['Python']}],'hoursPerWeek':10}

def test_matching_exclusions():
    pool=[candidate('owner'),candidate('member'),candidate('declined'),candidate('optout',matchingOptIn=False),candidate('valid')]
    result=rank(PROJECT,pool,['declined'])
    assert [c['userId'] for c in result['candidates']]==['valid']

def test_evidence_order_and_stable_ties():
    pool=[candidate(str(i),skills=[{'name':'Python','level':'advanced','evidence':e}]) for i,e in enumerate(['self_declared','resume_extracted','certification','github_contribution','verified_project'])]
    assert [r['userId'] for r in rank(PROJECT,pool)['candidates']]==['4','3','2','1','0']
    assert [r['userId'] for r in rank(PROJECT,[candidate('b'),candidate('a')])['candidates']]==['a','b']

def test_weights_change_ordering():
    skilled=candidate('skill',hoursPerWeek=0,skills=[{'name':'Python','level':'expert','evidence':'verified_project'}])
    available=candidate('available')
    assert rank(PROJECT,[skilled,available])['candidates'][0]['userId']=='skill'
    assert rank(PROJECT,[skilled,available],weights={'required':0,'role':0,'availability':1})['candidates'][0]['userId']=='available'

@pytest.mark.parametrize('field', ['gender','religion','caste','disability','age','ethnicity'])
def test_protected_fields_rejected(field):
    with pytest.raises(ValueError,match='allow-list'): guard(candidate(**{field:'never use'}))
    assert client.post('/ai/match',json={'project':PROJECT,'candidates':[candidate(**{field:'never use'})]}).status_code==422

def test_private_skill_names_do_not_leak():
    c=candidate(skills=[{'name':'Python','level':'advanced','visible':False}])
    row=rank(PROJECT,[c])['candidates'][0]
    assert not row['matchedSkills'] and not any('Python' in reason for reason in row['reasons'])
    assert 2 <= len(row['reasons']) <= 4

def test_no_strong_matches_and_empty_requirements():
    assert rank(PROJECT,[candidate(skills=[],hoursPerWeek=0)])['noStrongMatches']
    with pytest.raises(ValueError): rank({'requirements':[]},[])

def test_filtering_and_hybrid():
    assert rank(PROJECT,[candidate()],filters={'minimumAvailability':20})['noStrongMatches']
    result=rank(PROJECT,[candidate()],ranker='hybrid')
    assert result['ranker']=='hybrid' and result['candidates'][0]['reasons']

def test_job_constraints_and_optout():
    job={'requirements':[{'name':'Python'}],'location':'Bengaluru','workMode':'remote'}
    assert rank_jobs(job,[candidate(recruiterVisible=False)])['noStrongMatches']
    assert rank_jobs(job,[candidate()],{'location':'hard'})['noStrongMatches']
    result=rank_jobs(job,[candidate()],{'location':'soft'})
    assert result['candidates'][0]['caveats']
    assert result['candidates'][0]['constraintResults'][0]['mode']=='soft'
    with pytest.raises(ValueError):rank_jobs({'requirements':[]},[])

NOW='2026-11-14T12:00:00Z'
TASK={'id':'t','title':'Backend','status':'In Progress','priority':'Critical','dueDate':'2026-11-10T23:59:00Z','assigneeId':None,'needsReassignment':True,'updatedAt':'2026-11-01T00:00:00Z','dependsOn':[]}

def test_health_explains_risks():
    result=compute({'id':'p','status':'Active'},[TASK],[],[],NOW)
    assert result['status']=='Needs Attention'
    assert any('4 days' in r for r in result['reasons'])
    assert result['recommendedActions']

def test_health_uses_utc_calendar_dates_for_offset_timestamps():
    result=compute({'id':'p','status':'Active'},[{**TASK,'dueDate':'2026-11-14T00:30:00+05:30'}],[],[],NOW)
    assert any('overdue by 1 days' in reason for reason in result['reasons'])

@pytest.mark.parametrize('status',['Paused','Completed','Verified','Archived'])
def test_health_lifecycle_exemptions(status):
    assert compute({'status':status},[TASK],[],[],NOW)['status']=='Not scored'

def test_health_empty_healthy_blocked_milestone():
    assert compute({},[],[],[],NOW)['status']=='Not enough data'
    task={**TASK,'status':'Done'}
    assert compute({'id':'p','status':'Active'},[task],[],[NOW],NOW)['status']=='Healthy'
    result=compute({'id':'p'},[{**TASK,'dependsOn':['unfinished']}],[{'title':'Alpha','dueDate':'2026-11-12','status':'To Do'}],[],NOW)
    assert any(s['code']=='blocked' for s in result['signals'])
    assert any(s['code']=='milestone_delay' for s in result['signals'])

def test_metrics_zero_denominator_and_evaluation():
    assert metrics([],{},5)['ndcg'] is None
    spec=importlib.util.spec_from_file_location('evaluate',Path(__file__).parents[1]/'scripts/evaluate.py')
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    report=mod.evaluate()
    assert report['scenarios']>=5 and report['verdict'] and report['synthetic']
    assert all(0 <= report[m]['precisionAt5'] <= 1 for m in ('baseline','hybrid'))
