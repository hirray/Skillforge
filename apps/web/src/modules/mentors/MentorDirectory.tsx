import React, { useState, useEffect } from 'react';
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
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'directory' | 'inbox'>('directory');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState<MentorProfile | null>(null);

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

  const handleOpenRequest = (mentor: MentorProfile) => {
    setSelectedMentorForRequest(mentor);
    setRequestModalOpen(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              Expert & Advisory Layer
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#f4f4f5' }}>
            Mentor Network & Technical Advisors
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '6px 0 0 0', maxWidth: '650px' }}>
            Experienced builders supporting project teams without full membership. Connect for async architectural reviews, schema critiques, and milestone guidance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant={activeTab === 'inbox' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(activeTab === 'inbox' ? 'directory' : 'inbox')}
          >
            {activeTab === 'inbox' ? 'Browse Directory' : 'Mentorship Inbox'}
          </Button>

          <Button variant="primary" onClick={() => setProfileModalOpen(true)}>
            Become a Mentor / My Profile
          </Button>
        </div>
      </div>

      {activeTab === 'inbox' ? (
        <MentorInbox onRequestAction={loadMentors} />
      ) : (
        <>
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
        </>
      )}

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
          setActiveTab('inbox');
        }}
      />
    </div>
  );
};
