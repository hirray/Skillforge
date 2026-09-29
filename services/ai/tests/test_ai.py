from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_parse_resume():
    response = client.post("/ai/resume/parse", json={"resumeId": "123"})
    assert response.status_code == 200
    assert "reasons" in response.json()

def test_requirements():
    response = client.post("/ai/requirements", json={"projectId": "123"})
    assert response.status_code == 200

def test_match():
    response = client.post("/ai/match", json={"projectId": "123"})
    assert response.status_code == 200

def test_job_match():
    response = client.post("/ai/job-match", json={"jobId": "123"})
    assert response.status_code == 200

def test_project_health():
    response = client.get("/projects/123/health")
    assert response.status_code == 200
