import React, { useState, useEffect } from 'react';

export const GlobalSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const token = localStorage.getItem('token') || 'user-001';

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=40`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/v1/search/bookmarks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const set = new Set<string>((data.data || []).map((b: any) => `${b.targetType}:${b.targetId}`));
        setBookmarks(set);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchSearchResults();
    fetchBookmarks();
  }, [type]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSearchResults();
  };

  const toggleBookmark = async (targetType: string, targetId: string) => {
    const key = `${targetType}:${targetId}`;
    const isBookmarked = bookmarks.has(key);

    try {
      if (isBookmarked) {
        await fetch(`/api/v1/search/bookmarks/${targetId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarks((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        await fetch('/api/v1/search/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetType, targetId }),
        });
        setBookmarks((prev) => new Set(prev).add(key));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fadeIn">
      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Universal Search & Knowledge Index</h1>
        <p className="text-xs text-zinc-400">
          Instant multi-faceted discovery across verified engineers, active projects, technical openings, and engineering hackathons.
        </p>

        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search projects, engineers, skills, jobs, companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#15151a] text-sm text-white pl-11 pr-24 py-3.5 rounded-2xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none shadow-xl transition-all"
          />
          <div className="absolute left-4 top-4 text-zinc-400">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button
            type="submit"
            className="absolute right-2 top-2 px-4 py-2 bg-[#93B2F8] hover:bg-[#b0c7fa] text-[#0A1680] font-bold text-xs rounded-xl transition-colors shadow-md shadow-[#93B2F8]/20"
          >
            Search
          </button>
        </form>
      </div>

      {/* Facet Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        {[
          { id: 'all', label: 'All Results' },
          { id: 'projects', label: 'Projects' },
          { id: 'people', label: 'Verified Engineers' },
          { id: 'jobs', label: 'Engineering Jobs' },
          { id: 'companies', label: 'Enterprise Companies' },
          { id: 'challenges', label: 'Hackathons & Challenges' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setType(f.id)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              type === f.id
                ? 'bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40 shadow-sm'
                : 'bg-[#15151a] text-zinc-400 border border-[#282836] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search Results */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 pb-2">
          <span>Found {results.length} result(s)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r, idx) => {
            const isBookmarked = bookmarks.has(`${r.type}:${r.id}`);
            return (
              <div
                key={idx}
                className="p-5 bg-[#15151a] border border-[#282836] hover:border-[#93B2F8]/40 rounded-2xl space-y-3 text-xs transition-all shadow-sm hover:shadow-lg hover:shadow-[#0A1680]/10 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-[#93B2F8]">
                          {r.type}
                        </span>
                        <h3 className="font-bold text-white text-sm hover:text-[#93B2F8] transition-colors">
                          <a href={r.link}>{r.title}</a>
                        </h3>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{r.subtitle}</p>
                    </div>

                    <button
                      onClick={() => toggleBookmark(r.type, r.id)}
                      title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isBookmarked
                          ? 'bg-[#0A1680] border-[#93B2F8] text-[#93B2F8]'
                          : 'border-[#282836] text-zinc-500 hover:text-white'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                    </button>
                  </div>

                  {r.description && (
                    <p className="text-zinc-300 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                  )}

                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {r.tags.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-[#1b1b22] border border-[#282836] text-[10px] text-zinc-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#282836]/60 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">ID: {r.id}</span>
                  <a
                    href={r.link}
                    className="font-bold text-[#93B2F8] hover:underline flex items-center gap-1"
                  >
                    <span>Open Details</span>
                    <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h7v7M13 3 8 8" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {results.length === 0 && !loading && (
          <div className="p-12 text-center text-zinc-500 text-xs bg-[#15151a] rounded-2xl border border-[#282836]">
            No matching documents or records found for query. Try a different keyword or filter.
          </div>
        )}
      </div>
    </div>
  );
};

export const OpportunityFeedPage: React.FC = () => {
  const [feed, setFeed] = useState<any[]>([]);
  const [candidateName, setCandidateName] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token') || 'user-001';

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/search/feed', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFeed(data.feed || []);
          setCandidateName(data.personalizedFor || 'Engineer');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0A1680]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30 text-[10px] font-bold">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="8 1 10 6 15 7 11 11 12 16 8 13 4 16 5 11 1 7 6 6 8 1" />
            </svg>
            <span>Module 26 · Opportunity Discovery Engine</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Tailored Opportunities for {candidateName}
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl">
            Ranked opportunities matching your attested engineering skills, verified proof benchmarks, and active availability status.
          </p>
        </div>
      </div>

      {/* Feed Stream */}
      <div className="space-y-4">
        {feed.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-[#15151a] border border-[#282836] hover:border-[#93B2F8]/40 rounded-2xl space-y-4 text-xs transition-all shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                    {item.type}
                  </span>
                  <h3 className="text-base font-bold text-white hover:text-[#93B2F8] transition-colors">
                    <a href={item.link}>{item.title}</a>
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">{item.subtitle}</p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-[#0A1680] border border-[#93B2F8]/40 text-[#93B2F8] font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-[#0A1680]/30 flex-shrink-0">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.5 8.5l3 3 6-6" />
                </svg>
                <span>{item.badge}</span>
              </div>
            </div>

            {/* Why This Opportunity */}
            <div className="p-3 bg-[#1b1b22] border border-[#282836] rounded-xl space-y-1.5">
              <p className="text-[10px] font-bold text-[#F1B94C] uppercase tracking-wider flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="8 1 10 6 15 7 11 11 12 16 8 13 4 16 5 11 1 7 6 6 8 1" />
                </svg>
                <span>Why This Matches You</span>
              </p>
              <ul className="space-y-1 text-zinc-300 text-[11px]">
                {item.reasons.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#93B2F8] mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-500">Autonomous recommendation</span>
              <a
                href={item.link}
                className="px-4 py-2 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors shadow-md shadow-[#93B2F8]/20 flex items-center gap-1.5"
              >
                <span>{item.actionText}</span>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
            </div>
          </div>
        ))}

        {feed.length === 0 && !loading && (
          <div className="p-12 text-center text-zinc-500 text-xs bg-[#15151a] rounded-2xl border border-[#282836]">
            No personalized opportunities yet. Complete your profile skills to activate tailored recommendations.
          </div>
        )}
      </div>
    </div>
  );
};
