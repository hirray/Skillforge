import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const modules = ["auth", "users", "skills", "resumes", "projects", "team", "tasks", "milestones", "chat", "resources", "notifications", "search", "ai", "github", "contribution", "verification", "certificates", "portfolio", "companies", "jobs", "talent", "pipeline", "admin", "analytics", "mentors", "hackathons"];

const Placeholder = ({ name }: { name: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">{name} Module</h1>
    <p>Phase: 1</p>
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h3 className="font-semibold">Mock Data:</h3>
      <pre className="text-sm mt-2">{JSON.stringify({ status: 'ok', data: 'mock' }, null, 2)}</pre>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-white">
        <aside className="w-64 bg-[#1F4E79] text-white overflow-y-auto">
          <div className="p-4 font-bold text-xl border-b border-[#2E74B5]">SkillForge</div>
          <nav className="p-4 flex flex-col gap-2">
            {modules.map(m => (
              <Link key={m} to={`/${m}`} className="hover:text-[#EAF1F8] capitalize">
                {m}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<div className="p-8">Welcome to SkillForge. Select a module from the sidebar.</div>} />
            {modules.map(m => (
              <Route key={m} path={`/${m}`} element={<Placeholder name={m} />} />
            ))}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
