import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Input } from '../../design-system/components';
import { TeamSection } from './TeamSection';
import { TasksSection } from '../tasks/TasksSection';
import { MilestonesSection } from '../milestones/MilestonesSection';
import { ResourcesHub } from '../resources';
import { GroupChat } from '../chat';

const rolePresets = [
  'Frontend Developer','Backend Developer','Fullstack Engineer',
  'UI/UX Designer','ML Engineer','Mobile Developer','DevOps / Cloud','Product Manager'
];
const skillPresets = ['React','TypeScript','Node.js','Python','Next.js','TailwindCSS','GraphQL','Docker','Figma'];

// ── Mini SVG icons ───────────────────────────────────────────────────────
const IcoChevRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IcoEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcoStar = ({ filled }: { filled?: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#F59E0B' : 'none'} stroke={filled ? '#D97706' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcoMore = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
  </svg>
);
const IcoGrid = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const IcoTeam = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const IcoStar2 = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcoFile = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IcoMsg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcoBar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IcoClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcoTarget = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IcoUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoMap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/>
    <line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);
const IcoCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IcoCode = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const IcoFlash = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IcoRoles = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0A1680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
  </svg>
);
const IcoTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const IcoCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IcoRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const TABS = [
  { id: 'Overview', icon: <IcoGrid /> },
  { id: 'Team', icon: <IcoTeam /> },
  { id: 'Tasks', icon: <IcoCheck /> },
  { id: 'Milestones', icon: <IcoStar2 /> },
  { id: 'Resources', icon: <IcoFile /> },
  { id: 'Discussions', icon: <IcoMsg /> },
  { id: 'Analytics', icon: <IcoBar /> },
];

const SKILL_COLORS = [
  { bg:'#EEF2FF', text:'#4338CA', border:'#C7D2FE' },
  { bg:'#FFF7ED', text:'#C2410C', border:'#FED7AA' },
  { bg:'#F0FDF4', text:'#166534', border:'#BBF7D0' },
  { bg:'#FDF4FF', text:'#86198F', border:'#F0ABFC' },
  { bg:'#FFF1F2', text:'#BE123C', border:'#FECDD3' },
  { bg:'#F0F9FF', text:'#0369A1', border:'#BAE6FD' },
  { bg:'#FFFBEB', text:'#92400E', border:'#FDE68A' },
  { bg:'#F5F3FF', text:'#5B21B6', border:'#DDD6FE' },
  { bg:'#ECFDF5', text:'#065F46', border:'#A7F3D0' },
];
const sc = (i: number) => SKILL_COLORS[i % SKILL_COLORS.length];

const getRoleIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('backend')) return <span style={{fontSize:12}}>⚙️</span>;
  if (t.includes('product')) return <span style={{fontSize:12}}>📦</span>;
  if (t.includes('design') || t.includes('ux')) return <span style={{fontSize:12}}>🎨</span>;
  if (t.includes('mobile')) return <span style={{fontSize:12}}>📱</span>;
  if (t.includes('ml') || t.includes('data')) return <span style={{fontSize:12}}>🤖</span>;
  return <IcoCode />;
};

const S = `
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px);} to { opacity:1; transform:translateY(0); } }
  @keyframes popIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
  .pdtab { display:flex;align-items:center;gap:6px;padding:11px 14px;font-size:13px;font-weight:500;color:#6B7685;
    border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap;background:none; }
  .pdtab:hover { color:#0A1680; }
  .pdtab.on { color:#0A1680; border-bottom-color:#0A1680; font-weight:600; }
  .pdcard { background:white;border-radius:14px;border:1px solid #E7EAF3;padding:20px 22px;animation:fadeUp .2s ease; }
  .pdrow { display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:9px;
    border:1px solid #E7EAF3;background:#F8F9FC;cursor:pointer;transition:all .15s;margin-bottom:7px; }
  .pdrow:hover { border-color:#93B2F8;background:#EEF2FF; }
  .pdchip { display:inline-flex;align-items:center;gap:3px;padding:4px 11px;border-radius:20px;font-size:12px;font-weight:500;border:1px solid; }
  .pdprimary { display:flex;align-items:center;gap:6px;padding:8px 16px;background:#0A1680;color:white;border:none;
    border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s; }
  .pdprimary:hover { background:#0D1FA3; }
  .pdghost { display:flex;align-items:center;gap:6px;padding:8px 13px;background:white;color:#16213A;
    border:1px solid #E7EAF3;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s; }
  .pdghost:hover { background:#F8F9FC; border-color:#CBD5E1; }
  .pdiconbtn { width:36px;height:36px;background:white;border:1px solid #E7EAF3;border-radius:9px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;color:#6B7685;transition:all .15s; }
  .pdiconbtn:hover { background:#F8F9FC; border-color:#CBD5E1; color:#16213A; }
  .pdmeta { display:flex;align-items:center;gap:5px;font-size:12.5px;color:#6B7685; }
  .pdcrumb { background:none;border:none;padding:0;font-size:12px;color:#6B7685;cursor:pointer; }
  .pdcrumb:hover { color:#0A1680;text-decoration:underline; }
  .more-item { display:flex;align-items:center;gap:9px;width:100%;padding:9px 12px;border:none;background:none;
    text-align:left;font-size:13px;color:#16213A;cursor:pointer;border-radius:7px;transition:all .12s; }
  .more-item:hover { background:#EEF2FF;color:#0A1680; }
  .more-item.danger:hover { background:#FFF1F2;color:#BE123C; }
`;

// ── Interactive Project Analytics Tab ───────────────────────────────────────
const ProjectAnalyticsTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [tRes, mRes, memRes, rRes] = await Promise.all([
        fetch(`/api/v1/projects/${projectId}/tasks`, { headers: { Authorization: `Bearer ${currentUserId}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`/api/v1/projects/${projectId}/milestones`, { headers: { Authorization: `Bearer ${currentUserId}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`/api/v1/projects/${projectId}/members`, { headers: { Authorization: `Bearer ${currentUserId}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`/api/v1/projects/${projectId}/resources`, { headers: { Authorization: `Bearer ${currentUserId}` } }).then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      setTasks(tRes.data || []);
      setMilestones(mRes.data || []);
      setMembers(memRes.data || []);
      setResources(rRes.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadStats(); }, [projectId]);

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:240, color:'#6B7685', gap:10, fontSize:13 }}>
        <div style={{ width:24, height:24, border:'2px solid #E7EAF3', borderTopColor:'#0A1680', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
        Calculating project analytics…
      </div>
    );
  }

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'In Review').length;
  const todoTasks = tasks.filter(t => t.status === 'To Do' || !t.status).length;
  const taskCompletionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalMilestones = milestones.length;
  const doneMilestones = milestones.filter(m => m.status === 'Done').length;
  const avgMilestoneProgress = totalMilestones > 0 
    ? Math.round(milestones.reduce((acc, m) => acc + (m.progressPercentage || 0), 0) / totalMilestones)
    : 0;

  const criticalTasks = tasks.filter(t => t.priority === 'Critical' || t.priority === 'High').length;
  const unassignedTasks = tasks.filter(t => !t.assigneeId).length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      {/* Overview Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
        <div className="pdcard" style={{ padding:16 }}>
          <div style={{ fontSize:12, color:'#6B7685', fontWeight:500, marginBottom:6 }}>Task Progress</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
            <span style={{ fontSize:24, fontWeight:700, color:'#16213A' }}>{taskCompletionPct}%</span>
            <span style={{ fontSize:12, color:'#6B7685' }}>({doneTasks}/{totalTasks})</span>
          </div>
          <div style={{ width:'100%', height:6, background:'#F1F3F9', borderRadius:4, marginTop:10, overflow:'hidden' }}>
            <div style={{ width:`${taskCompletionPct}%`, height:'100%', background:'#10B981', borderRadius:4, transition:'width 0.4s' }} />
          </div>
        </div>

        <div className="pdcard" style={{ padding:16 }}>
          <div style={{ fontSize:12, color:'#6B7685', fontWeight:500, marginBottom:6 }}>Milestone Health</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
            <span style={{ fontSize:24, fontWeight:700, color:'#16213A' }}>{avgMilestoneProgress}%</span>
            <span style={{ fontSize:12, color:'#6B7685' }}>({doneMilestones}/{totalMilestones} done)</span>
          </div>
          <div style={{ width:'100%', height:6, background:'#F1F3F9', borderRadius:4, marginTop:10, overflow:'hidden' }}>
            <div style={{ width:`${avgMilestoneProgress}%`, height:'100%', background:'#4338CA', borderRadius:4, transition:'width 0.4s' }} />
          </div>
        </div>

        <div className="pdcard" style={{ padding:16 }}>
          <div style={{ fontSize:12, color:'#6B7685', fontWeight:500, marginBottom:6 }}>Team Capacity</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
            <span style={{ fontSize:24, fontWeight:700, color:'#16213A' }}>{members.length}</span>
            <span style={{ fontSize:12, color:'#6B7685' }}>active members</span>
          </div>
          <div style={{ fontSize:12, color:'#6B7685', marginTop:10 }}>
            {unassignedTasks > 0 ? <span style={{ color:'#D97706' }}>⚠️ {unassignedTasks} unassigned tasks</span> : '✓ All tasks assigned'}
          </div>
        </div>

        <div className="pdcard" style={{ padding:16 }}>
          <div style={{ fontSize:12, color:'#6B7685', fontWeight:500, marginBottom:6 }}>Resources Shared</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
            <span style={{ fontSize:24, fontWeight:700, color:'#16213A' }}>{resources.length}</span>
            <span style={{ fontSize:12, color:'#6B7685' }}>files & links</span>
          </div>
          <div style={{ fontSize:12, color:'#6B7685', marginTop:10 }}>
            <span style={{ color:'#0A1680' }}>📁 Active Knowledge Base</span>
          </div>
        </div>
      </div>

      {/* Task Distribution Breakdown */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="pdcard">
          <h3 style={{ fontSize:14, fontWeight:600, color:'#16213A', margin:'0 0 14px' }}>Task Status Distribution</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { label: 'Completed', count: doneTasks, color: '#10B981', total: totalTasks },
              { label: 'In Progress / Review', count: inProgressTasks, color: '#3B82F6', total: totalTasks },
              { label: 'To Do', count: todoTasks, color: '#9CA3AF', total: totalTasks }
            ].map(row => {
              const pct = row.total > 0 ? Math.round((row.count / row.total) * 100) : 0;
              return (
                <div key={row.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:4 }}>
                    <span style={{ color:'#16213A', fontWeight:500 }}>{row.label}</span>
                    <span style={{ color:'#6B7685' }}>{row.count} ({pct}%)</span>
                  </div>
                  <div style={{ width:'100%', height:7, background:'#F1F3F9', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:row.color, borderRadius:4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pdcard">
          <h3 style={{ fontSize:14, fontWeight:600, color:'#16213A', margin:'0 0 14px' }}>Priority & Risk Assessment</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { label: 'High / Critical Priority', count: criticalTasks, color: '#EF4444', total: totalTasks },
              { label: 'Medium Priority', count: tasks.filter(t => t.priority === 'Medium').length, color: '#F59E0B', total: totalTasks },
              { label: 'Low Priority', count: tasks.filter(t => t.priority === 'Low').length, color: '#10B981', total: totalTasks }
            ].map(row => {
              const pct = row.total > 0 ? Math.round((row.count / row.total) * 100) : 0;
              return (
                <div key={row.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:4 }}>
                    <span style={{ color:'#16213A', fontWeight:500 }}>{row.label}</span>
                    <span style={{ color:'#6B7685' }}>{row.count} ({pct}%)</span>
                  </div>
                  <div style={{ width:'100%', height:7, background:'#F1F3F9', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:row.color, borderRadius:4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPendingInvitation, setMyPendingInvitation] = useState<any>(null);
  const [isRespondingInvite, setIsRespondingInvite] = useState(false);

  // More menu & Star state
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showBreadcrumbMenu, setShowBreadcrumbMenu] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const breadcrumbMenuRef = useRef<HTMLDivElement>(null);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [customRoleOpenings, setCustomRoleOpenings] = useState(1);
  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillType, setCustomSkillType] = useState<'required' | 'preferred'>('required');
  const [customSkillProficiency, setCustomSkillProficiency] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3000);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (breadcrumbMenuRef.current && !breadcrumbMenuRef.current.contains(e.target as Node)) {
        setShowBreadcrumbMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check initial star state
  useEffect(() => {
    if (id) {
      const starred = localStorage.getItem(`sf_starred_${id}`) === 'true';
      setIsStarred(starred);
    }
  }, [id]);

  const toggleStar = () => {
    if (!id) return;
    const next = !isStarred;
    setIsStarred(next);
    localStorage.setItem(`sf_starred_${id}`, String(next));
    showToast(next ? '⭐ Added to favorite projects' : 'Removed from favorite projects');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('📋 Project link copied to clipboard!');
    setShowMoreMenu(false);
  };

  const fetchProject = () => {
    fetch(`/api/v1/projects/${id}`)
      .then(async r => {
        const text = await r.text();
        const d = JSON.parse(text);
        if (!r.ok || d.error) throw new Error(d.error?.message || `HTTP ${r.status}`);
        return d;
      })
      .then(d => { setProject(d.data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });

    fetch('/api/v1/users/me/invitations', { headers: { Authorization: `Bearer ${currentUserId}` } })
      .then(r => r.json())
      .then(d => {
        const inv = (d.data || []).find((i: any) => i.projectId === id && i.status?.toLowerCase() === 'pending');
        setMyPendingInvitation(inv || null);
      })
      .catch(() => {});
  };

  useEffect(() => { fetchProject(); }, [id, currentUserId]);

  const handleRespondInvitation = async (invId: string, response: 'accept' | 'decline') => {
    setIsRespondingInvite(true);
    try {
      const res = await fetch(`/api/v1/invitations/${invId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserId}` },
        body: JSON.stringify({ response })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed');
      setMyPendingInvitation(null); 
      fetchProject();
      showToast(response === 'accept' ? '🎉 Accepted invitation to project!' : 'Declined invitation.');
    } catch (e: any) { alert(e.message); }
    finally { setIsRespondingInvite(false); }
  };

  const handleOpenEditModal = () => {
    if (!project) return;
    setShowMoreMenu(false);
    setEditFormData({
      title: project.title || '',
      description: project.description || '',
      problemStatement: project.problemStatement || '',
      category: project.category || 'Web App',
      stage: project.stage || 'idea',
      duration: project.duration || '',
      targetDate: project.targetDate ? project.targetDate.split('T')[0] : '',
      minTeamSize: project.minTeamSize || 1,
      maxTeamSize: project.maxTeamSize || 5,
      joinMode: project.joinMode || 'both',
      memberApprovalMode: project.memberApprovalMode || 'owner',
      roles: (project.roles || []).map((r: any) => ({ title: r.title, openings: Number(r.openings) || 1, filled: Number(r.filled) || 0 })),
      requirements: (project.requirements || []).map((req: any) => ({
        skill: req.skill || req.skillName || '',
        type: req.type || (req.isOptional ? 'preferred' : 'required'),
        proficiency: req.proficiency || req.level || 'intermediate'
      }))
    });
    setEditError(null); 
    setShowEditModal(true);
  };

  const handleAddEditRole = (title: string, openings = 1) => {
    if (!title.trim() || !editFormData) return;
    if (editFormData.roles.some((r: any) => r.title.toLowerCase() === title.trim().toLowerCase()))
      return setEditError(`Role "${title}" already exists.`);
    setEditError(null);
    setEditFormData({ ...editFormData, roles: [...editFormData.roles, { title: title.trim(), openings: Math.max(1, openings), filled: 0 }] });
    setCustomRoleTitle(''); setCustomRoleOpenings(1);
  };

  const handleRemoveEditRole = (idx: number) => {
    if (!editFormData) return;
    setEditFormData({ ...editFormData, roles: editFormData.roles.filter((_: any, i: number) => i !== idx) });
  };

  const handleAddEditSkill = (skill: string) => {
    if (!skill.trim() || !editFormData) return;
    if (editFormData.requirements.some((s: any) => s.skill.toLowerCase() === skill.trim().toLowerCase()))
      return setEditError(`Skill "${skill}" already exists.`);
    setEditError(null);
    setEditFormData({ ...editFormData, requirements: [...editFormData.requirements, { skill: skill.trim(), type: customSkillType, proficiency: customSkillProficiency }] });
    setCustomSkillName('');
  };

  const handleRemoveEditSkill = (idx: number) => {
    if (!editFormData) return;
    setEditFormData({ ...editFormData, requirements: editFormData.requirements.filter((_: any, i: number) => i !== idx) });
  };

  const handleSaveEdit = async () => {
    if (!editFormData.title.trim()) return setEditError('Title is required.');
    setIsSaving(true); setEditError(null);
    try {
      const payload: any = { ...editFormData };
      if (!payload.targetDate) delete payload.targetDate;
      const res = await fetch(`/api/v1/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserId}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Update failed');
      setShowEditModal(false); 
      fetchProject();
      showToast('✓ Project updated successfully');
    } catch (e: any) { setEditError(e.message); }
    finally { setIsSaving(false); }
  };

  const handleTransition = async (status: string) => {
    setShowMoreMenu(false);
    try {
      const res = await fetch(`/api/v1/projects/${id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserId}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Transition failed');
      fetchProject();
      showToast(`Status updated to ${status}`);
    } catch (e: any) { alert(e.message); }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUserId}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Delete failed');
      navigate('/projects');
    } catch (e: any) {
      alert(e.message);
      setIsDeleting(false);
    }
  };

  // ── Loading / error ────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12, color:'#6B7685', fontSize:13 }}>
      <div style={{ width:36, height:36, border:'3px solid #E7EAF3', borderTopColor:'#0A1680', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      Loading project…
    </div>
  );
  if (error) return <div style={{ padding:32, color:'#BE123C', fontSize:13 }}>Error: {error}</div>;

  const isOwner = project.ownerId === currentUserId;
  const targetLabel = project.targetDate
    ? new Date(project.targetDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Flexible';

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#F8F9FC', position:'relative' }}>
      <style>{S}</style>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position:'fixed', bottom:24, right:24, zIndex:100,
          background:'#0A1680', color:'white', padding:'10px 18px', borderRadius:10,
          fontSize:13, fontWeight:600, boxShadow:'0 10px 30px rgba(10,22,128,0.25)',
          animation:'popIn 0.2s ease', display:'flex', alignItems:'center', gap:8
        }}>
          {toastMessage}
        </div>
      )}

      {/* ── WHITE HEADER ─────────────────────────────────────────── */}
      <div style={{ background:'white', borderBottom:'1px solid #E7EAF3', padding:'0 28px' }}>

        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:6, paddingTop:13, fontSize:12, color:'#6B7685', position:'relative' }}>
          <button className="pdcrumb" onClick={() => navigate('/')}>IITAN Dev Labs</button>
          <IcoChevRight />
          <button className="pdcrumb" onClick={() => navigate('/projects')}>Final Year June 2023</button>
          <IcoChevRight />
          <span style={{ color:'#0A1680', fontWeight:600 }}>{project.title}</span>
          
          <div ref={breadcrumbMenuRef} style={{ position:'relative', display:'inline-block' }}>
            <span 
              onClick={() => setShowBreadcrumbMenu(!showBreadcrumbMenu)}
              style={{ marginLeft:2, color:'#6B7685', fontSize:11, cursor:'pointer', padding:'2px 4px', borderRadius:4 }}>
              ▾
            </span>

            {showBreadcrumbMenu && (
              <div style={{
                position:'absolute', top:'100%', left:0, marginTop:4, width:200, background:'white',
                borderRadius:10, border:'1px solid #E7EAF3', boxShadow:'0 10px 25px rgba(0,0,0,0.08)',
                padding:6, zIndex:30, animation:'fadeUp .15s ease'
              }}>
                <button className="more-item" onClick={() => { setShowBreadcrumbMenu(false); navigate('/projects'); }}>
                  📁 All Projects
                </button>
                <button className="more-item" onClick={() => { setShowBreadcrumbMenu(false); navigate('/projects/new'); }}>
                  ➕ Create New Project
                </button>
                <button className="more-item" onClick={() => { setShowBreadcrumbMenu(false); navigate(`/chat/${id}`); }}>
                  💬 Project Chat Room
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title + actions */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'14px 0 0', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:13 }}>
            {/* Project icon */}
            <div style={{ width:44, height:44, borderRadius:10, background:'#EEF2FF', border:'1.5px solid #C7D2FE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <IcoGrid />
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:5 }}>
                <h1 style={{ fontSize:20, fontWeight:700, color:'#16213A', margin:0 }}>{project.title}</h1>
                <Badge status={project.status?.toLowerCase() as any}>{project.status}</Badge>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
                {project.category && <span className="pdmeta"><IcoCode /> {project.category}</span>}
                <span className="pdmeta"><IcoTeam /> Team Foundation</span>
                <span className="pdmeta"><IcoCalendar /> {targetLabel}</span>
                {project.stage && (
                  <span className="pdmeta">
                    <IcoTarget /> Stage:&nbsp;
                    <strong style={{ color:'#16213A' }}>{project.stage.charAt(0).toUpperCase()+project.stage.slice(1)}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display:'flex', alignItems:'center', gap:7, flexShrink:0, marginTop:2, position:'relative' }}>
            
            {/* Primary Action Button */}
            <button className="pdprimary" onClick={handleOpenEditModal} title="Edit Project Details">
              <IcoEdit /> Edit Project Room
            </button>

            {/* More Menu Dropdown Trigger */}
            <div ref={moreMenuRef} style={{ position:'relative' }}>
              <button className="pdghost" onClick={() => setShowMoreMenu(!showMoreMenu)}>
                <IcoMore /> More
              </button>

              {showMoreMenu && (
                <div style={{
                  position:'absolute', right:0, top:'100%', marginTop:6, width:220, background:'white',
                  borderRadius:12, border:'1px solid #E7EAF3', boxShadow:'0 12px 32px rgba(10,22,128,0.12)',
                  padding:6, zIndex:40, animation:'popIn .15s ease'
                }}>
                  <button className="more-item" onClick={handleOpenEditModal}>
                    <IcoEdit /> Edit Project Details
                  </button>
                  <button className="more-item" onClick={() => { setShowMoreMenu(false); navigate(`/chat/${id}`); }}>
                    <IcoMsg /> Open Collaboration Room
                  </button>
                  <button className="more-item" onClick={handleCopyLink}>
                    <IcoCopy /> Copy Project Link
                  </button>
                  <button className="more-item" onClick={() => { setShowMoreMenu(false); setActiveTab('Team'); }}>
                    <IcoTeam /> Manage Team & Roles
                  </button>
                  <button className="more-item" onClick={() => { setShowMoreMenu(false); setActiveTab('Resources'); }}>
                    <IcoFile /> Browse Resources
                  </button>
                  <button className="more-item" onClick={() => { setShowMoreMenu(false); fetchProject(); showToast('✓ Refreshed project data'); }}>
                    <IcoRefresh /> Refresh Data
                  </button>

                  <div style={{ height:1, background:'#F1F3F9', margin:'4px 0' }} />

                  {isOwner && (
                    <>
                      {project.status === 'Draft' && (
                        <button className="more-item" onClick={() => handleTransition('Recruiting')}>
                          🚀 Start Recruiting
                        </button>
                      )}
                      {project.status === 'Recruiting' && (
                        <button className="more-item" onClick={() => handleTransition('Active')}>
                          ⚡ Activate Project
                        </button>
                      )}
                      {project.status === 'Active' && (
                        <button className="more-item" onClick={() => handleTransition('Paused')}>
                          ⏸️ Pause Project
                        </button>
                      )}
                      {project.status === 'Paused' && (
                        <button className="more-item" onClick={() => handleTransition('Active')}>
                          ▶️ Resume Project
                        </button>
                      )}
                      <button className="more-item danger" onClick={() => { setShowMoreMenu(false); setShowDeleteModal(true); }}>
                        <IcoTrash /> Delete Project
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Favorite Star Button */}
            <button className="pdiconbtn" onClick={toggleStar} title={isStarred ? 'Remove from favorites' : 'Star project'}>
              <IcoStar filled={isStarred} />
            </button>

            {/* Status Quick Action Buttons */}
            {isOwner && project.status === 'Draft' && (
              <button className="pdghost" style={{ color:'#166534', borderColor:'#BBF7D0', background:'#F0FDF4' }} onClick={() => handleTransition('Recruiting')}>
                Start Recruiting
              </button>
            )}
            {isOwner && project.status === 'Recruiting' && (
              <button className="pdghost" style={{ color:'#4338CA', borderColor:'#C7D2FE', background:'#EEF2FF' }} onClick={() => handleTransition('Active')}>
                Activate
              </button>
            )}
            {isOwner && project.status === 'Active' && (
              <button className="pdghost" style={{ color:'#92400E', borderColor:'#FDE68A', background:'#FFFBEB' }} onClick={() => handleTransition('Paused')}>
                Pause
              </button>
            )}
            {isOwner && project.status === 'Paused' && (
              <button className="pdghost" style={{ color:'#166534', borderColor:'#BBF7D0', background:'#F0FDF4' }} onClick={() => handleTransition('Active')}>
                Resume
              </button>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', overflowX:'auto', marginTop:4 }}>
          {TABS.map(t => (
            <button key={t.id} className={`pdtab${activeTab === t.id ? ' on' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.icon}{t.id}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────── */}
      <div style={{ padding:'22px 28px', maxWidth:1100, margin:'0 auto' }}>

        {/* Invitation banner */}
        {myPendingInvitation && (
          <div style={{ background:'linear-gradient(135deg,#EEF2FF,#E0E7FF)', border:'1.5px solid #93B2F8', borderRadius:13, padding:'16px 20px', marginBottom:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                  <span>🎉</span>
                  <strong style={{ color:'#0A1680', fontSize:14 }}>You have been invited to join this project!</strong>
                  <Badge status="active">{myPendingInvitation.role}</Badge>
                </div>
                <p style={{ margin:0, fontSize:13, color:'#16213A' }}>
                  You were invited as <strong>{myPendingInvitation.role}</strong>.
                  {myPendingInvitation.note && <em style={{ color:'#6B7685', marginLeft:6 }}>"{myPendingInvitation.note}"</em>}
                </p>
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <button onClick={() => handleRespondInvitation(myPendingInvitation.id, 'accept')} disabled={isRespondingInvite}
                  style={{ padding:'7px 15px', background:'#0A1680', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {isRespondingInvite ? 'Accepting…' : 'Accept'}
                </button>
                <button onClick={() => handleRespondInvitation(myPendingInvitation.id, 'decline')} disabled={isRespondingInvite}
                  style={{ padding:'7px 15px', background:'white', color:'#6B7685', border:'1px solid #E7EAF3', borderRadius:8, fontSize:13, cursor:'pointer' }}>
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── OVERVIEW ────────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Description card */}
            <div className="pdcard">
              <div style={{ display:'flex', alignItems:'flex-start', gap:13 }}>
                <div style={{ width:36, height:36, borderRadius:9, background:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <IcoFile />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                    <span style={{ fontWeight:600, color:'#16213A', fontSize:13.5 }}>Project Description</span>
                    {isOwner && (
                      <button onClick={handleOpenEditModal}
                        style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 9px', border:'1px solid #E7EAF3', borderRadius:7, background:'transparent', color:'#6B7685', fontSize:12, cursor:'pointer' }}>
                        <IcoEdit /> Edit
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize:13, color:'#6B7685', margin:0, lineHeight:1.65 }}>
                    {project.description || 'No detailed description provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Problem statement card */}
            {project.problemStatement && (
              <div className="pdcard">
                <div style={{ display:'flex', alignItems:'flex-start', gap:13 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:'#FFF7ED', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <IcoTarget />
                  </div>
                  <div style={{ flex:1 }}>
                    <span style={{ fontWeight:600, color:'#16213A', fontSize:13.5, display:'block', marginBottom:5 }}>Problem Statement</span>
                    <p style={{ fontSize:13, color:'#6B7685', margin:0, lineHeight:1.65 }}>{project.problemStatement}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2-col: Roles + Skills */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

              {/* Roles */}
              <div className="pdcard">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:13 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <IcoRoles />
                    <span style={{ fontWeight:600, color:'#16213A', fontSize:13.5 }}>Project Roles</span>
                  </div>
                  <button onClick={() => setActiveTab('Team')} style={{ fontSize:12, color:'#0A1680', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                    View All
                  </button>
                </div>
                {(!project.roles || project.roles.length === 0) ? (
                  <div style={{ textAlign:'center', padding:'18px 0', color:'#6B7685', fontSize:13 }}>
                    <p style={{ margin:'0 0 10px' }}>No roles defined yet.</p>
                    {isOwner && <Button size="sm" variant="outline" onClick={handleOpenEditModal}>Add Roles</Button>}
                  </div>
                ) : (
                  project.roles.map((r: any) => (
                    <div key={r.id || r.title} className="pdrow" onClick={() => setActiveTab('Team')}>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <div style={{ width:28, height:28, borderRadius:7, background:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center', color:'#4338CA' }}>
                          {getRoleIcon(r.title)}
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:'#16213A' }}>{r.title}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <span style={{ fontSize:12, color:'#6B7685' }}>{r.filled || 0} / {r.openings} filled</span>
                        <IcoChevRight />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Skills */}
              <div className="pdcard">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:13 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <IcoFlash />
                    <span style={{ fontWeight:600, color:'#16213A', fontSize:13.5 }}>Required Capabilities & Skills</span>
                  </div>
                  {isOwner && (
                    <button onClick={handleOpenEditModal} style={{ fontSize:12, color:'#0A1680', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                      Manage
                    </button>
                  )}
                </div>
                {(!project.requirements || project.requirements.length === 0) ? (
                  <p style={{ color:'#6B7685', fontSize:13, margin:0 }}>No skills specified.</p>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                    {project.requirements.map((req: any, idx: number) => {
                      const c = sc(idx);
                      return (
                        <span key={idx} className="pdchip" style={{ background:c.bg, color:c.text, borderColor:c.border }}>
                          {req.skill || req.skillName}
                          <span style={{ opacity:.55, fontSize:10, marginLeft:2 }}>({req.type || (req.isOptional ? 'preferred' : 'required')})</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Scope & Logistics */}
            <div className="pdcard">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <IcoBar />
                <span style={{ fontWeight:600, color:'#16213A', fontSize:13.5 }}>Scope & Logistics</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:20 }}>
                {[
                  { ico:<IcoClock />, label:'Duration', value:project.duration || 'Not specified', color:'#10B981' },
                  { ico:<IcoTarget />, label:'Target User', value:project.targetUser || 'Finalists', color:'#3B82F6' },
                  { ico:<IcoUsers />, label:'Team Capacity', value:`${project.minTeamSize || 1} - ${project.maxTeamSize || 5} members`, color:'#8B5CF6' },
                  { ico:<IcoMap />, label:'Work Mode',
                    value:project.joinMode === 'both' ? 'Both (Online/Offline)' : project.joinMode === 'open' ? 'Open / Online' : 'Invite Only',
                    color:'#F59E0B' },
                ].map(item => (
                  <div key={item.label} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:`${item.color}18`, display:'flex', alignItems:'center', justifyContent:'center', color:item.color, flexShrink:0 }}>
                      {item.ico}
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:'#6B7685', marginBottom:2 }}>{item.label}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#16213A' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Team' && <TeamSection projectId={id!} project={project} onProjectUpdated={fetchProject} />}
        {activeTab === 'Tasks' && <TasksSection projectId={id!} project={project} onProjectUpdated={fetchProject} />}
        {activeTab === 'Milestones' && <MilestonesSection projectId={id!} project={project} onProjectUpdated={fetchProject} />}
        {activeTab === 'Resources' && <ResourcesHub projectId={id!} isOwner={isOwner} />}
        {activeTab === 'Discussions' && (
          <div className="pdcard" style={{ padding:0, overflow:'hidden' }}>
            <GroupChat projectId={id!} projectTitle={project.title} isOwner={isOwner} />
          </div>
        )}
        {activeTab === 'Analytics' && <ProjectAnalyticsTab projectId={id!} />}
      </div>

      {/* ── EDIT MODAL ────────────────────────────────────────────── */}
      {showEditModal && editFormData && (
        <div style={{ position:'fixed', inset:0, background:'rgba(10,22,128,0.22)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:50, overflowY:'auto' }}>
          <div style={{ background:'white', borderRadius:16, width:'100%', maxWidth:640, maxHeight:'90vh', overflowY:'auto', padding:'26px', boxShadow:'0 20px 60px rgba(10,22,128,0.15)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h2 style={{ fontSize:17, fontWeight:700, color:'#16213A', margin:0 }}>Edit Project Details</h2>
              <button onClick={() => setShowEditModal(false)}
                style={{ width:30, height:30, borderRadius:8, background:'#F8F9FC', border:'1px solid #E7EAF3', cursor:'pointer', color:'#6B7685', display:'flex', alignItems:'center', justifyContent:'center' }}>
                ✕
              </button>
            </div>

            {editError && (
              <div style={{ marginBottom:14, padding:'9px 13px', background:'#FFF1F2', border:'1px solid #FECDD3', color:'#BE123C', borderRadius:8, fontSize:13 }}>
                {editError}
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:18, fontSize:13 }}>

              {/* 1. Basic */}
              <div>
                <h3 style={{ fontSize:11, fontWeight:700, color:'#6B7685', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10, paddingBottom:7, borderBottom:'1px solid #F1F3F9' }}>1. Basic Information</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                  <Input label="Project Title" value={editFormData.title} onChange={(e: any) => setEditFormData({ ...editFormData, title: e.target.value })} />
                  <Input label="Description" value={editFormData.description} onChange={(e: any) => setEditFormData({ ...editFormData, description: e.target.value })} />
                  <Input label="Problem Statement" value={editFormData.problemStatement} onChange={(e: any) => setEditFormData({ ...editFormData, problemStatement: e.target.value })} />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
                    <div>
                      <label style={{ display:'block', fontWeight:600, color:'#16213A', fontSize:12, marginBottom:4 }}>Category</label>
                      <select style={{ width:'100%', padding:'7px 10px', border:'1px solid #E7EAF3', borderRadius:8, fontSize:13, background:'#F8F9FC' }}
                        value={editFormData.category} onChange={(e: any) => setEditFormData({ ...editFormData, category: e.target.value })}>
                        {['Web App','ML','Mobile','Hardware','Research','Other'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:'block', fontWeight:600, color:'#16213A', fontSize:12, marginBottom:4 }}>Stage</label>
                      <select style={{ width:'100%', padding:'7px 10px', border:'1px solid #E7EAF3', borderRadius:8, fontSize:13, background:'#F8F9FC' }}
                        value={editFormData.stage} onChange={(e: any) => setEditFormData({ ...editFormData, stage: e.target.value })}>
                        {['idea','planning','in progress','near completion'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Scope */}
              <div>
                <h3 style={{ fontSize:11, fontWeight:700, color:'#6B7685', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10, paddingBottom:7, borderBottom:'1px solid #F1F3F9' }}>2. Scope & Team Settings</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
                    <Input label="Expected Duration" value={editFormData.duration} onChange={(e: any) => setEditFormData({ ...editFormData, duration: e.target.value })} placeholder="e.g. 4 weeks" />
                    <Input type="date" label="Target Date" value={editFormData.targetDate} onChange={(e: any) => setEditFormData({ ...editFormData, targetDate: e.target.value })} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:9 }}>
                    <Input type="number" label="Min Team Size" value={editFormData.minTeamSize} onChange={(e: any) => setEditFormData({ ...editFormData, minTeamSize: Number(e.target.value) })} />
                    <Input type="number" label="Max Team Size" value={editFormData.maxTeamSize} onChange={(e: any) => setEditFormData({ ...editFormData, maxTeamSize: Number(e.target.value) })} />
                    <div>
                      <label style={{ display:'block', fontWeight:600, color:'#16213A', fontSize:12, marginBottom:4 }}>Join Mode</label>
                      <select style={{ width:'100%', padding:'7px 10px', border:'1px solid #E7EAF3', borderRadius:8, fontSize:13, background:'#F8F9FC' }}
                        value={editFormData.joinMode} onChange={(e: any) => setEditFormData({ ...editFormData, joinMode: e.target.value })}>
                        <option value="both">Both (Open + Invite)</option>
                        <option value="open">Open</option>
                        <option value="invite">Invite Only</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Roles */}
              <div>
                <h3 style={{ fontSize:11, fontWeight:700, color:'#6B7685', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10, paddingBottom:7, borderBottom:'1px solid #F1F3F9' }}>3. Project Roles</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:9 }}>
                  {rolePresets.map(p => (
                    <button key={p} type="button" onClick={() => handleAddEditRole(p,1)}
                      style={{ padding:'4px 9px', background:'#F8F9FC', border:'1px solid #E7EAF3', borderRadius:20, fontSize:12, cursor:'pointer' }}>+ {p}</button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:7, marginBottom:9 }}>
                  <input placeholder="Custom role…" value={customRoleTitle} onChange={e => setCustomRoleTitle(e.target.value)}
                    style={{ flex:1, padding:'7px 10px', border:'1px solid #E7EAF3', borderRadius:8, fontSize:13, background:'#F8F9FC' }} />
                  <input type="number" min="1" title="Openings" value={customRoleOpenings} onChange={e => setCustomRoleOpenings(Number(e.target.value))}
                    style={{ width:60, padding:'7px 8px', border:'1px solid #E7EAF3', borderRadius:8, fontSize:13, background:'#F8F9FC', textAlign:'center' }} />
                  <Button type="button" size="sm" onClick={() => handleAddEditRole(customRoleTitle, customRoleOpenings)} disabled={!customRoleTitle.trim()}>Add</Button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {editFormData.roles.length === 0
                    ? <p style={{ fontSize:12, color:'#6B7685', margin:0 }}>No roles added.</p>
                    : editFormData.roles.map((r: any, idx: number) => (
                      <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 11px', background:'#F8F9FC', border:'1px solid #E7EAF3', borderRadius:8 }}>
                        <span style={{ fontWeight:600, color:'#16213A' }}>{r.title}
                          <span style={{ color:'#6B7685', fontWeight:400, marginLeft:6 }}>({r.openings} opening{r.openings > 1 ? 's' : ''})</span>
                        </span>
                        <button type="button" onClick={() => handleRemoveEditRole(idx)} style={{ color:'#E05A5A', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}>Remove</button>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* 4. Skills */}
              <div>
                <h3 style={{ fontSize:11, fontWeight:700, color:'#6B7685', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10, paddingBottom:7, borderBottom:'1px solid #F1F3F9' }}>4. Required Skills</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:9 }}>
                  {skillPresets.map(p => (
                    <button key={p} type="button" onClick={() => handleAddEditSkill(p)}
                      style={{ padding:'4px 9px', background:'#F8F9FC', border:'1px solid #E7EAF3', borderRadius:20, fontSize:12, cursor:'pointer' }}>+ {p}</button>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:7, marginBottom:9 }}>
                  <input placeholder="Skill name…" value={customSkillName} onChange={e => setCustomSkillName(e.target.value)}
                    style={{ padding:'7px 10px', border:'1px solid #E7EAF3', borderRadius:8, fontSize:13, background:'#F8F9FC' }} />
                  <select value={customSkillType} onChange={(e: any) => setCustomSkillType(e.target.value)}
                    style={{ padding:'7px 10px', border:'1px solid #E7EAF3', borderRadius:8, fontSize:13, background:'#F8F9FC' }}>
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                  </select>
                  <select value={customSkillProficiency} onChange={(e: any) => setCustomSkillProficiency(e.target.value)}
                    style={{ padding:'7px 10px', border:'1px solid #E7EAF3', borderRadius:8, fontSize:13, background:'#F8F9FC' }}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                  <Button type="button" size="sm" onClick={() => handleAddEditSkill(customSkillName)} disabled={!customSkillName.trim()}>Add</Button>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {editFormData.requirements.map((s: any, idx: number) => {
                    const c = sc(idx);
                    return (
                      <span key={idx} className="pdchip" style={{ background:c.bg, color:c.text, borderColor:c.border }}>
                        {s.skill} <span style={{ opacity:.55, fontSize:10 }}>({s.type})</span>
                        <button type="button" onClick={() => handleRemoveEditSkill(idx)}
                          style={{ marginLeft:4, color:c.text, background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>×</button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:9, marginTop:22, paddingTop:14, borderTop:'1px solid #F1F3F9' }}>
              <button onClick={() => setShowEditModal(false)}
                style={{ padding:'8px 17px', background:'white', border:'1px solid #E7EAF3', borderRadius:9, fontSize:13, cursor:'pointer', color:'#6B7685' }}>
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={isSaving}
                style={{ padding:'8px 20px', background:'#0A1680', color:'white', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:isSaving ? 'not-allowed' : 'pointer', opacity:isSaving ? 0.7 : 1 }}>
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────────── */}
      {showDeleteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(10,22,128,0.25)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:60 }}>
          <div style={{ background:'white', borderRadius:16, width:'100%', maxWidth:440, padding:'24px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin:'0 0 8px', fontSize:17, fontWeight:700, color:'#16213A' }}>Delete Project?</h3>
            <p style={{ margin:'0 0 20px', fontSize:13, color:'#6B7685', lineHeight:1.5 }}>
              Are you sure you want to delete <strong>"{project.title}"</strong>? This will permanently remove all tasks, milestones, and resources. This action cannot be undone.
            </p>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:9 }}>
              <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting}
                style={{ padding:'8px 16px', background:'white', border:'1px solid #E7EAF3', borderRadius:8, fontSize:13, cursor:'pointer', color:'#6B7685' }}>
                Cancel
              </button>
              <button onClick={handleDeleteProject} disabled={isDeleting}
                style={{ padding:'8px 18px', background:'#BE123C', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:isDeleting ? 'not-allowed' : 'pointer' }}>
                {isDeleting ? 'Deleting…' : 'Yes, Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
