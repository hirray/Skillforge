import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '../design-system/components';
import { Card } from '../design-system/components';
import ProjectsModule from '../modules/projects';
import MyInvitations from '../modules/team/MyInvitations';
import TasksModule from '../modules/tasks';
import ChatModule from '../modules/chat';

const modules = ["auth", "users", "skills", "resumes", "projects", "team", "tasks", "milestones", "chat", "resources", "notifications", "search", "ai", "github", "contribution", "verification", "certificates", "portfolio", "companies", "jobs", "talent", "pipeline", "admin", "analytics", "mentors", "hackathons"];

const seededUsers = [
  { id: 'user-001', name: 'Student (Owner)', email: 'student@example.com' },
  { id: 'user-002', name: 'Freelancer', email: 'freelancer@example.com' },
  { id: 'user-003', name: 'Pro Dev', email: 'pro@example.com' },
  { id: 'user-004', name: 'Founder', email: 'founder@example.com' },
  { id: 'user-005', name: 'Designer', email: 'designer@example.com' },
  { id: 'user-006', name: 'ML Engineer', email: 'ml@example.com' },
  { id: 'user-007', name: 'Cloud Arch', email: 'cloud@example.com' },
  { id: 'user-008', name: 'Job Seeker', email: 'seeker@example.com' }
];

const Placeholder = ({ name }: { name: string }) => (
  <div className="p-8 max-w-4xl mx-auto">
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-primary capitalize">{name} Module</h1>
    </div>
    <Card>
      <div className="mb-4">
        <span className="text-sm text-muted">Phase: 1 (Mock)</span>
      </div>
      <div className="p-4 border border-uiBorder rounded bg-bg">
        <h3 className="font-semibold text-mainText">Mock Data:</h3>
        <pre className="text-sm mt-2 text-muted">{JSON.stringify({ status: 'ok', data: 'mock' }, null, 2)}</pre>
      </div>
    </Card>
  </div>
);

const UserSwitcherHeader = () => {
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('token') || 'user-001');

  const handleUserChange = (userId: string) => {
    localStorage.setItem('token', userId);
    setCurrentUser(userId);
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-uiBorder px-8 py-3 flex justify-between items-center z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Active Dev User:</span>
        <select
          value={currentUser}
          onChange={(e) => handleUserChange(e.target.value)}
          className="bg-bg border border-uiBorder rounded-lg px-3 py-1 text-sm font-semibold text-primary focus:outline-none focus:border-accent"
        >
          {seededUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.id} - {u.email})
            </option>
          ))}
        </select>
      </div>

      <div className="text-xs text-muted">
        SkillForge Monorepo • <span className="text-primary font-medium">Team Formation (Phase 1)</span>
      </div>
    </header>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-bg">
        <Sidebar modules={modules} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <UserSwitcherHeader />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<div className="p-8 text-mainText">Welcome to SkillForge. Select a module from the sidebar.</div>} />
              <Route path="/projects/*" element={<ProjectsModule />} />
              <Route path="/team/*" element={<MyInvitations />} />
              <Route path="/tasks/*" element={<TasksModule />} />
              <Route path="/chat/*" element={<ChatModule />} />
              {modules.filter(m => m !== 'projects' && m !== 'team' && m !== 'tasks' && m !== 'chat').map(m => (
                <Route key={m} path={`/${m}/*`} element={<Placeholder name={m} />} />
              ))}
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
