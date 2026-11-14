"""Offline synthetic golden-set evaluation. Never pretends fixtures are live outcomes."""
import json
import sqlite3
import sys
from pathlib import Path
from datetime import datetime, timezone
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.matching import rank, metrics

ROOT=Path(__file__).resolve().parents[3]

def scenarios():
    cases=[]
    for index,skills in enumerate([['Python','Machine Learning'],['AWS','Docker'],['React','TypeScript'],['Figma','UI/UX Design'],['SQL','Node.js'],['Computer Vision','Python']]):
        candidates=[]
        for i in range(8):
            ability=skills if i<3 else [skills[0]] if i<5 else ['Unrelated']
            candidates.append({'id':f'candidate-{i}','name':f'Synthetic Candidate {i}','skills':[{'name':s,'level':'advanced','evidence':'verified_project' if i==0 else 'github_contribution' if i==1 else 'self_declared'} for s in ability],'hoursPerWeek':12,'matchingOptIn':True,'profileText':' '.join(ability),'recruiterVisible':True})
        cases.append({'name':f'golden-{index+1}','project':{'requirements':[{'name':s} for s in skills],'roles':[]},'candidates':candidates,'labels':{f'candidate-{i}':3 if i==0 else 2 if i<3 else 1 if i<5 else 0 for i in range(8)}})
    return cases

def evaluate():
    cases=scenarios(); scores={};details=[]
    for mode in ('baseline','hybrid'):
        values=[]
        for case in cases:
            output=rank(case['project'],case['candidates'],ranker=mode)
            value=metrics([c['userId'] for c in output['candidates']],case['labels'])
            values.append(value);details.append({'case':case['name'],'ranker':mode,**value})
        scores[mode]={key:sum(v[key] or 0 for v in values)/len(values) for key in ('precisionAt5','ndcg')}
    verdict='Retain the baseline. Hybrid did not improve both precision and NDCG on this synthetic set.'
    if all(scores['hybrid'][k]>scores['baseline'][k] for k in scores['baseline']):
        verdict='Hybrid improved this synthetic set; retain baseline until larger, real-outcome evaluation confirms the result.'
    outcomes={'sent':0,'accepted':0,'joined':0,'acceptanceRate':None,'joinRate':None,'suppressed':True}
    database=ROOT/'apps/api/prisma/dev.db'
    if database.exists():
        with sqlite3.connect(database) as db:
            try:
                rows=dict(db.execute('SELECT event, COUNT(*) FROM MatchOutcome WHERE sourceRunId IS NOT NULL GROUP BY event').fetchall())
                sent=rows.get('invitation_sent',0);accepted=rows.get('invitation_accepted',0);joined=rows.get('member_joined',0)
                people=db.execute('SELECT COUNT(DISTINCT userId) FROM MatchOutcome WHERE sourceRunId IS NOT NULL').fetchone()[0]
                outcomes={'sent':sent,'accepted':accepted,'joined':joined,'sampleSize':people,'acceptanceRate':accepted/sent if sent and people>=5 else None,'joinRate':joined/sent if sent and people>=5 else None,'suppressed':people<5}
            except sqlite3.OperationalError: pass
    return {'generatedAt':datetime.now(timezone.utc).isoformat(),'scenarios':len(cases),'synthetic':True,**scores,'outcomes':outcomes,'verdict':verdict,'details':details}

if __name__=='__main__':
    report=evaluate(); docs=ROOT/'docs';docs.mkdir(exist_ok=True)
    (docs/'AI_EVAL_REPORT.json').write_text(json.dumps(report,indent=2)+'\n')
    lines=['# Matching evaluation','',report['verdict'],'',f'Sample: {report["scenarios"]} hand-labelled synthetic scenarios. Not a production-quality estimate.','', '| Ranker | Precision at 5 | NDCG |','| --- | --- | --- |']
    for key in ('baseline','hybrid'):lines.append(f'| {key} | {report[key]["precisionAt5"]:.3f} | {report[key]["ndcg"]:.3f} |')
    lines+=['','Acceptance and join rates use only recommendation-attributed outcomes. Values are suppressed below five people.',f'Observed outcomes: {json.dumps(report["outcomes"])}.','','The optional TF-IDF ranker uses only allow-listed skills and shared profile text. Baseline remains the default.']
    (docs/'AI_EVAL_REPORT.md').write_text('\n'.join(lines)+'\n')
    print(report['verdict'])
