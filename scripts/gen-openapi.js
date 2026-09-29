const fs = require('fs');
const path = require('path');

const endpoints = [
  'POST /auth/register', 'POST /auth/login', 'POST /auth/dev-login/{userId}', 'POST /auth/refresh', 'POST /auth/logout', 'GET /auth/me',
  'GET /users/me', 'PATCH /users/me', 'GET /users/{id}', 'PUT /users/me/availability', 'PUT /users/me/visibility',
  'POST /users/me/skills', 'DELETE /users/me/skills', 'POST /users/me/education', 'DELETE /users/me/education',
  'POST /users/me/experience', 'DELETE /users/me/experience', 'POST /users/me/certifications', 'DELETE /users/me/certifications', 'PUT /users/me/learning-goals',
  'GET /skills', 'POST /skills/proposals', 'GET /skills/{id}',
  'POST /resumes', 'GET /resumes/{id}', 'GET /resumes/{id}/extraction', 'POST /resumes/{id}/confirm',
  'GET /projects', 'POST /projects', 'GET /projects/{id}', 'PATCH /projects/{id}', 'POST /projects/{id}/transition',
  'GET /projects/{id}/requirements', 'PUT /projects/{id}/requirements', 'GET /projects/{id}/roles',
  'POST /projects/{id}/invitations', 'POST /invitations/{id}/respond', 'GET /users/me/invitations',
  'POST /projects/{id}/join-requests', 'PATCH /join-requests/{id}', 'GET /projects/{id}/members',
  'PATCH /projects/{id}/members/{userId}', 'DELETE /projects/{id}/members/{userId}', 'POST /projects/{id}/transfer-ownership',
  'GET /projects/{id}/tasks', 'POST /projects/{id}/tasks', 'GET /projects/{id}/tasks/{taskId}', 'PATCH /projects/{id}/tasks/{taskId}', 'DELETE /projects/{id}/tasks/{taskId}',
  'GET /projects/{id}/milestones', 'POST /projects/{id}/milestones', 'GET /projects/{id}/milestones/{milestoneId}', 'PATCH /projects/{id}/milestones/{milestoneId}', 'DELETE /projects/{id}/milestones/{milestoneId}',
  'GET /tasks/{id}/history',
  'GET /projects/{id}/messages', 'POST /projects/{id}/messages', 'GET /chats', 'POST /chats',
  'GET /projects/{id}/resources', 'POST /projects/{id}/resources', 'GET /projects/{id}/resources/{resourceId}', 'PATCH /projects/{id}/resources/{resourceId}', 'DELETE /projects/{id}/resources/{resourceId}',
  'GET /projects/{id}/meeting-notes', 'POST /projects/{id}/meeting-notes', 'GET /projects/{id}/meeting-notes/{noteId}', 'PATCH /projects/{id}/meeting-notes/{noteId}', 'DELETE /projects/{id}/meeting-notes/{noteId}',
  'GET /notifications', 'PATCH /notifications/{id}/read', 'POST /notifications/read-all', 'GET /notifications/preferences', 'PUT /notifications/preferences',
  'GET /search',
  'POST /ai/resume/parse', 'POST /ai/requirements', 'POST /ai/match', 'POST /ai/job-match', 'GET /projects/{id}/health',
  'GET /integrations/github/connect', 'GET /integrations/github/callback', 'DELETE /integrations/github', 'GET /projects/{id}/repos', 'POST /projects/{id}/repos',
  'GET /projects/{id}/contributions', 'GET /projects/{id}/contributions/{userId}', 'POST /contributions/{id}/dispute',
  'POST /projects/{id}/completion', 'POST /projects/{id}/completion/confirm', 'POST /projects/{id}/verify', 'GET /projects/{id}/verification',
  'GET /users/me/certificates', 'GET /verify/{certId}', 'POST /certificates/{id}/revoke',
  'GET /portfolio/{username}', 'GET /users/me/portfolio', 'PUT /users/me/portfolio', 'GET /users/me/verified-experience',
  'POST /companies', 'GET /companies/{id}', 'PATCH /companies/{id}', 'POST /companies/{id}/recruiters',
  'GET /jobs', 'POST /jobs', 'GET /jobs/{id}', 'PATCH /jobs/{id}', 'DELETE /jobs/{id}', 'POST /jobs/{id}/interest',
  'POST /talent/search', 'GET /talent/saved-searches', 'POST /talent/saved-searches',
  'GET /pipeline', 'POST /pipeline', 'PATCH /pipeline/{id}', 'POST /pipeline/compare',
  'GET /admin/reports', 'PATCH /admin/reports/{id}', 'GET /admin/audit-logs', 'GET /admin/verification-queue', 'GET /admin/skills', 'POST /admin/skills', 'PATCH /admin/skills',
  'GET /analytics/summary',
  'GET /mentors', 'POST /mentors', 'GET /hackathons', 'POST /hackathons'
];

let yaml = "openapi: 3.0.0\ninfo:\n  title: SkillForge API\n  version: 1.0.0\nservers:\n  - url: /api/v1\ncomponents:\n  securitySchemes:\n    bearerAuth:\n      type: http\n      scheme: bearer\n      bearerFormat: JWT\nsecurity:\n  - bearerAuth: []\npaths:\n";

const paths = {};

endpoints.forEach(ep => {
  const parts = ep.split(' ');
  const method = parts[0];
  const route = parts[1];
  const normalizedRoute = route.split('?')[0];
  if (!paths[normalizedRoute]) {
    paths[normalizedRoute] = {};
  }
  
  paths[normalizedRoute][method.toLowerCase()] = {
    summary: method + " " + normalizedRoute,
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object'
            }
          }
        }
      }
    }
  };
});

for (const p in paths) {
  yaml += "  " + p + ":\n";
  for (const m in paths[p]) {
    yaml += "    " + m + ":\n";
    yaml += "      summary: " + paths[p][m].summary + "\n";
    yaml += "      responses:\n";
    yaml += "        '200':\n";
    yaml += "          description: Successful response\n";
  }
}

const outPath = path.join(__dirname, '..', 'packages', 'contract', 'openapi.yaml');
fs.writeFileSync(outPath, yaml);
console.log('openapi.yaml generated.');
