import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Button,
  IcoSpark,
} from '../../design-system/components';
import { api } from '../ai/client';
import { MentorProfile } from '@skillforge/contract';
import { MentorProfileModal } from './MentorProfileModal';
import { MentorshipRequestModal } from './MentorshipRequestModal';
import { MentorInbox } from './MentorInbox';

const SKILL_FILTERS = [
  'All', 'React', 'TypeScript', 'Node.js', 'Python', 'System Design', 'Frontend Architecture', 'PostgreSQL', 'Go', 'Docker', 'UI/UX'
];

const DOMAIN_FILTERS = [
  'All', 'Web Applications', 'SaaS', 'Fintech', 'AI/ML', 'Distributed Systems', 'Cloud Infrastructure'
];

export const MentorDirectory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'requests';

  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState<MentorProfile | null>(null);

  // Feedback State
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedRating, setSelectedRating] = useState('Approved');

  // Availability State
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [isAccepting, setIsAccepting] = useState(true);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['async_review', 'office_hours']);
  const [availabilitySaved, setAvailabilitySaved] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);

  const loadMentors = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (selectedSkill !== 'All') queryParams.set('skill', selectedSkill);
      if (selectedDomain !== 'All') queryParams.set('domain', selectedDomain);
      if (search.trim()) queryParams.set('search', search.trim());

      const url = `/mentors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await api<MentorProfile[]>(url);
      setMentors(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMentors();
  }, [selectedSkill, selectedDomain, search]);

  // Scroll active section smoothly into view when tab changes
  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentTab]);

  const handleOpenRequest = (mentor: MentorProfile) => {
    setSelectedMentorForRequest(mentor);
    setRequestModalOpen(true);
  };

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  const tabLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    requests: {
      label: 'Requests & Inquiries',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    projects: {
      label: 'Mentored Projects',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7V4h6l3 3h9v13H3Z" />
        </svg>
      ),
    },
    feedback: {
      label: 'Architectural Feedback',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    availability: {
      label: 'Availability & Capacity',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    directory: {
      label: 'Browse Mentor Directory',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'rgba(147, 178, 248, 0.15)',
                color: '#93B2F8',
              }}
            >
              <IcoSpark size={16} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#93B2F8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mentor Advisory Hub
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#f4f4f5' }}>
            Mentor Network &amp; Technical Advisory
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '6px 0 0 0', maxWidth: '680px' }}>
            Support collaborative engineering teams with async architectural reviews, PR audits, and milestone guidance without full code commitment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="primary" onClick={() => setProfileModalOpen(true)}>
            Edit My Mentor Profile
          </Button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#242336] pb-3 overflow-x-auto scrollbar-none">
        {Object.entries(tabLabels).map(([key, item]) => {
          const isActive = currentTab === key;
          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#a855f7]/20 text-[#c4b5fd] border border-[#a855f7]/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                  : 'bg-[#151420] text-zinc-400 hover:text-white hover:bg-[#1f1e2f] border border-[#262538]'
              }`}
            >
              <span className={isActive ? 'text-[#c4b5fd]' : 'text-zinc-500'}>{item.icon}</span>
              <span>{item.label}</span>
              {key === 'requests' && (
                <span className="w-2 h-2 rounded-full bg-[#34d399] ml-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SPOTLIGHT WRAPPER: HIGHLIGHTS THE ACTIVE SECTION WITH TOUR-LIKE GLOW
      ========================================================================= */}
      <div
        ref={sectionRef}
        className="relative rounded-2xl p-6 bg-gradient-to-b from-[#141322] via-[#100f1c] to-[#0c0c16] border-2 border-[#a855f7] shadow-[0_0_40px_rgba(168,85,247,0.35),inset_0_0_20px_rgba(168,85,247,0.12)] transition-all duration-300"
      >
        {/* Spotlight Active Section Beacon */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#28273f]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Active Section • {tabLabels[currentTab]?.label || 'Requests'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#a855f7]/25 text-[#c4b5fd] border border-[#a855f7]/40">
              Spotlight Focus
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Live Real-time Sync</span>
          </div>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: REQUESTS & INQUIRIES
        ------------------------------------------------------------- */}
        {currentTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-extrabold text-white">Pending Mentorship Inquiries</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Teams requesting your technical evaluation, schema critique, or milestone commit review.
                </p>
              </div>
            </div>
            <MentorInbox onRequestAction={loadMentors} />
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: MENTORED PROJECTS
        ------------------------------------------------------------- */}
        {currentTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">Active Mentored Projects</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Repositories where you hold advisory status for architecture and code reviews.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 text-xs font-bold">
                2 Active Engagements
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project 1 */}
              <div className="p-5 rounded-xl bg-[#171626] border border-[#2b2a40] space-y-4 hover:border-[#a855f7]/60 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7c3aed]/20 text-[#c4b5fd] border border-[#7c3aed]/40">
                        Systems &amp; Backend
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">Active Sprint</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white">Distributed Consensus &amp; Event Streaming Hub</h3>
                  </div>
                  <span className="text-lg font-black text-[#34d399]">85%</span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  High-throughput event streaming engine with raft-backed consensus and automated failover test suite.
                </p>

                <div className="p-3 rounded-lg bg-[#11101d] border border-[#222136] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Milestone Advisory Focus:</span>
                    <span className="text-white font-semibold">Milestone 4: Commit Proofs</span>
                  </div>
                  <div className="w-full bg-[#242338] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#a855f7] h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#232238]">
                  <span className="text-xs text-zinc-500">3 Collaborators • 14 Signed Commits</span>
                  <Link
                    to="/projects/proj-consensus"
                    className="px-3 py-1.5 rounded-lg bg-[#a855f7]/20 hover:bg-[#a855f7]/35 text-[#c4b5fd] text-xs font-bold transition-colors flex items-center gap-1 border border-[#a855f7]/40"
                  >
                    <span>Enter Project Room</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Project 2 */}
              <div className="p-5 rounded-xl bg-[#171626] border border-[#2b2a40] space-y-4 hover:border-[#a855f7]/60 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40">
                        Frontend &amp; Realtime
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">Active Sprint</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white">High-Throughput Collaborative Canvas Engine</h3>
                  </div>
                  <span className="text-lg font-black text-[#38bdf8]">75%</span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Zero-latency vector drawing and architecture whiteboard powered by WebSockets and CRDT sync.
                </p>

                <div className="p-3 rounded-lg bg-[#11101d] border border-[#222136] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Milestone Advisory Focus:</span>
                    <span className="text-white font-semibold">Milestone 3: CRDT Vector Undo/Redo</span>
                  </div>
                  <div className="w-full bg-[#242338] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#38bdf8] h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#232238]">
                  <span className="text-xs text-zinc-500">2 Collaborators • 12 Signed Commits</span>
                  <Link
                    to="/projects/proj-whiteboard"
                    className="px-3 py-1.5 rounded-lg bg-[#38bdf8]/20 hover:bg-[#38bdf8]/35 text-[#38bdf8] text-xs font-bold transition-colors flex items-center gap-1 border border-[#38bdf8]/40"
                  >
                    <span>Enter Project Room</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: ARCHITECTURAL FEEDBACK
        ------------------------------------------------------------- */}
        {currentTab === 'feedback' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">Architectural Critiques &amp; PR Reviews</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Submit structured milestone sign-offs, evaluate fault tolerance, and advise on schema contracts.
                </p>
              </div>
            </div>

            {/* Submit Feedback Box */}
            <div className="p-5 rounded-xl bg-[#171626] border border-[#2c2b42] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Submit Milestone Architectural Critique</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Target Project
                  </label>
                  <select className="w-full bg-[#11101d] border border-[#2b2a40] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]">
                    <option>Distributed Consensus &amp; Event Streaming Hub (Milestone 4)</option>
                    <option>High-Throughput Collaborative Canvas Engine (Milestone 3)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Advisory Verdict
                  </label>
                  <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(e.target.value)}
                    className="w-full bg-[#11101d] border border-[#2b2a40] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                  >
                    <option>Approved — Meets Architectural Standard</option>
                    <option>Changes Requested — Scale / Concurrency Bottleneck</option>
                    <option>Advisory Note — Recommend Stress Benchmark</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Architectural Findings &amp; Technical Notes
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Detail recommendations regarding consensus stability, database indexes, or network partition tolerance..."
                  className="w-full bg-[#11101d] border border-[#2b2a40] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {feedbackSubmitted ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Feedback published and sealed into project record!</span>
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500">Feedback is cryptographically attributed to your mentor dossier.</span>
                )}
                <button
                  onClick={() => {
                    setFeedbackSubmitted(true);
                    setFeedbackText('');
                    setTimeout(() => setFeedbackSubmitted(false), 4000);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white text-xs font-bold hover:scale-[1.02] transition-all shadow-md shadow-[#7c3aed]/25"
                >
                  Publish Advisory Review
                </button>
              </div>
            </div>

            {/* Historical Feedback Log */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Recent Completed Reviews
              </h3>
              <div className="p-4 rounded-xl bg-[#141322] border border-[#242338] flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">Distributed Consensus Hub</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30">
                      Approved
                    </span>
                    <span className="text-[10px] text-zinc-500">Yesterday</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    &ldquo;Reviewed Raft election timeout randomize jitter. Implementation correctly mitigates split votes during simultaneous node failover. Approved for Milestone 4 sign-off.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: AVAILABILITY & CAPACITY
        ------------------------------------------------------------- */}
        {currentTab === 'availability' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">Mentorship Capacity &amp; Office Hours</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure your weekly advisory hours, accepted formats, and calendar booking window.
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                isAccepting
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}>
                {isAccepting ? 'Accepting Inquiries' : 'At Capacity'}
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#171626] border border-[#2b2a40] space-y-5">
              {/* Accepting Toggle */}
              <div className="flex items-center justify-between pb-4 border-b border-[#232238]">
                <div>
                  <div className="text-sm font-bold text-white">Open to Technical Inquiries</div>
                  <div className="text-xs text-zinc-400 mt-0.5">When disabled, teams will see you are temporarily at capacity.</div>
                </div>
                <button
                  onClick={() => setIsAccepting(!isAccepting)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    isAccepting ? 'bg-[#7c3aed]' : 'bg-[#2b2a3d]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isAccepting ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Weekly Capacity Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">Weekly Mentorship Hours</label>
                  <span className="text-sm font-black text-[#c4b5fd]">{weeklyHours} hrs / week</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                  className="w-full accent-[#7c3aed] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                  <span>1 hr/wk (Async PRs)</span>
                  <span>5 hrs/wk (Standard)</span>
                  <span>20 hrs/wk (Deep Advisory)</span>
                </div>
              </div>

              {/* Advisory Formats */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-zinc-300 block">Accepted Advisory Formats</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'async_review', title: 'Async PR & Schema Review', desc: 'Detailed code & architecture critique within 48h' },
                    { id: 'office_hours', title: '1-on-1 Office Hours', desc: '30-minute interactive Google Meet / Discord calls' },
                    { id: 'milestone_checkin', title: 'Milestone Verification', desc: 'Formal evaluation & cryptographic sign-off' },
                  ].map((fmt) => {
                    const checked = selectedFormats.includes(fmt.id);
                    return (
                      <div
                        key={fmt.id}
                        onClick={() => {
                          setSelectedFormats(prev =>
                            checked ? prev.filter(f => f !== fmt.id) : [...prev, fmt.id]
                          );
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          checked
                            ? 'bg-[#7c3aed]/15 border-[#7c3aed]/50 text-white'
                            : 'bg-[#11101c] border-[#242338] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{fmt.title}</span>
                          {checked && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400">{fmt.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#232238]">
                {availabilitySaved ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Availability saved to your profile!</span>
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500">Your capacity updates live across the mentor directory.</span>
                )}
                <button
                  onClick={() => {
                    setAvailabilitySaved(true);
                    setTimeout(() => setAvailabilitySaved(false), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold transition-all shadow-md shadow-[#7c3aed]/30"
                >
                  Save Availability Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: BROWSE MENTOR DIRECTORY
        ------------------------------------------------------------- */}
        {currentTab === 'directory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-extrabold text-white">All Platform Mentors</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Filter mentors by verified skills, domain architecture, and availability.</p>
              </div>
            </div>

            {/* Controls & Filter Chips */}
            <div
              style={{
                backgroundColor: '#15151a',
                border: '1px solid #282836',
                borderRadius: '16px',
                padding: '20px 24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Search Input */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search mentors by name, skill, domain, or architectural keyword..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1b1b22',
                      border: '1px solid #2c2c3b',
                      borderRadius: '9999px',
                      padding: '10px 18px',
                      fontSize: '13px',
                      color: '#fff',
                    }}
                  />
                </div>
                {(selectedSkill !== 'All' || selectedDomain !== 'All' || search) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedSkill('All');
                      setSelectedDomain('All');
                      setSearch('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Skill Filter Chips */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Filter by Skill:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {SKILL_FILTERS.map((skill) => {
                    const active = selectedSkill === skill;
                    return (
                      <button
                        key={skill}
                        onClick={() => setSelectedSkill(skill)}
                        style={{
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          borderRadius: '9999px',
                          cursor: 'pointer',
                          border: active ? '1px solid #93B2F8' : '1px solid #282836',
                          backgroundColor: active ? 'rgba(147, 178, 248, 0.18)' : '#1b1b22',
                          color: active ? '#93B2F8' : '#d4d4d8',
                          transition: 'all 150ms ease-out',
                        }}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Domain Filter Chips */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Filter by Domain:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {DOMAIN_FILTERS.map((dom) => {
                    const active = selectedDomain === dom;
                    return (
                      <button
                        key={dom}
                        onClick={() => setSelectedDomain(dom)}
                        style={{
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          borderRadius: '9999px',
                          cursor: 'pointer',
                          border: active ? '1px solid #F1B94C' : '1px solid #282836',
                          backgroundColor: active ? 'rgba(241, 185, 76, 0.18)' : '#1b1b22',
                          color: active ? '#F1B94C' : '#d4d4d8',
                          transition: 'all 150ms ease-out',
                        }}
                      >
                        {dom}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mentors Cards Grid */}
            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#a1a1aa' }}>
                Loading mentors directory...
              </div>
            ) : mentors.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#15151a',
                  border: '1px dashed #282836',
                  borderRadius: '16px',
                  padding: '60px 24px',
                  textAlign: 'center',
                  color: '#a1a1aa',
                }}
              >
                <IcoSpark size={32} color="#93B2F8" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '17px', color: '#f4f4f5', margin: '0 0 8px 0' }}>No Mentors Found</h3>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  Try adjusting your skill or domain filters, or become the first mentor in this category!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                  gap: '20px',
                }}
              >
                {mentors.map((m) => {
                  const name = m.user?.name || m.user?.email?.split('@')[0] || 'Expert';
                  const email = m.user?.email || `${m.userId}@example.com`;
                  const initials = name.slice(0, 2).toUpperCase();

                  return (
                    <div
                      key={m.id}
                      style={{
                        backgroundColor: '#15151a',
                        border: '1px solid #282836',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '18px',
                        transition: 'transform 150ms ease-out, border-color 150ms ease-out',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#3c3c52';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = '#282836';
                      }}
                    >
                      <div>
                        {/* Top Header of Card */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #0A1680 0%, #1e3a8a 100%)',
                                border: '1px solid rgba(147, 178, 248, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#93B2F8',
                                fontWeight: 700,
                                fontSize: '15px',
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#f4f4f5' }}>
                                  {name}
                                </h3>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    backgroundColor: 'rgba(147, 178, 248, 0.15)',
                                    color: '#93B2F8',
                                    padding: '2px 6px',
                                    borderRadius: '9999px',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  Verified Mentor
                                </span>
                              </div>
                              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '2px' }}>
                                {email}
                              </div>
                            </div>
                          </div>

                          <span
                            style={{
                              fontSize: '12px',
                              color: '#93B2F8',
                              backgroundColor: 'rgba(147, 178, 248, 0.1)',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontWeight: 500,
                            }}
                          >
                            {m.availability}
                          </span>
                        </div>

                        {/* Bio */}
                        {m.bio && (
                          <p
                            style={{
                              fontSize: '13px',
                              color: '#d4d4d8',
                              lineHeight: 1.5,
                              margin: '0 0 14px 0',
                              fontStyle: 'italic',
                            }}
                          >
                            &ldquo;{m.bio}&rdquo;
                          </p>
                        )}

                        {/* Domains */}
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                            Domains
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {m.domains.map((dom) => (
                              <span
                                key={dom}
                                style={{
                                  fontSize: '11px',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(241, 185, 76, 0.12)',
                                  color: '#F1B94C',
                                  border: '1px solid rgba(241, 185, 76, 0.25)',
                                }}
                              >
                                {dom}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Expertise Skills */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                            Expertise
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {m.expertiseSkillIds.map((sk) => (
                              <span
                                key={sk}
                                style={{
                                  fontSize: '11px',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#1b1b22',
                                  color: '#93B2F8',
                                  border: '1px solid #282836',
                                }}
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Formats */}
                        <div>
                          <div style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                            Formats
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {m.formats.map((fmt) => (
                              <span
                                key={fmt}
                                style={{
                                  fontSize: '11px',
                                  color: '#a1a1aa',
                                  backgroundColor: '#181820',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}
                              >
                                {fmt.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action */}
                      <div style={{ borderTop: '1px solid #22222e', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="primary" size="sm" onClick={() => handleOpenRequest(m)}>
                          Request Mentorship
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <MentorProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSaved={loadMentors}
      />

      <MentorshipRequestModal
        isOpen={requestModalOpen}
        mentor={selectedMentorForRequest}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => {
          handleTabChange('requests');
        }}
      />
    </div>
  );
};
