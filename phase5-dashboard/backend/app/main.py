from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open('data_seed.json','r', encoding='utf-8') as f:
    DB = json.load(f)

@app.get('/health')
def health():
    return {"status":"ok"}

@app.get('/learner/{learner_id}')
def get_learner(learner_id: str):
    for l in DB['learners']:
        if l['id'] == learner_id:
            return l
    raise HTTPException(status_code=404, detail='Learner not found')

@app.get('/trainer/{trainer_id}/cohorts')
def get_trainer_cohorts(trainer_id: str):
    for t in DB['trainers']:
        if t['id'] == trainer_id:
            # compute simple aggregates
            cohorts = []
            for c in t['cohorts']:
                learners = [ln for ln in DB['learners'] if ln['id'] in c['learners']]
                avg_progress = 0
                if learners:
                    avg_progress = sum([lp['pathways'][0]['progress'] for lp in learners]) / len(learners)
                cohorts.append({
                    'cohort_id': c['cohort_id'],
                    'title': c['title'],
                    'num_learners': len(learners),
                    'avg_progress': avg_progress
                })
            return {'trainer_id': trainer_id, 'cohorts': cohorts}
    raise HTTPException(status_code=404, detail='Trainer not found')

@app.get('/analytics/skills')
def skills_analytics(region: str = None):
    data = DB['labour_market']
    if region:
        data = [d for d in data if d['region'].lower() == region.lower() or d['region'].lower()=='all india']
    return {'skills': data}

@app.get('/learners')
def list_learners():
    # minimal list for trainer table
    out = []
    for l in DB['learners']:
        out.append({'id': l['id'], 'name': l['name'], 'progress': l['pathways'][0]['progress'], 'aspirations': l['aspirations']})
    return {'learners': out}