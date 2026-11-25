import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { useTour } from '../../components/tour/TourProvider';
import { DEMO_FEATURES, DemoItem } from '../../components/demos/FeatureDemoModal';

export const FeatureDemosPage: React.FC = () => {
  const navigate = useNavigate();
  const { startTour } = useTour();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Engineering', 'Talent & AI', 'Competitions', 'Advisory & Trust', 'Manuals & Architecture'];

  const filteredDemos = DEMO_FEATURES.filter((demo) => {
    if (selectedCategory !== 'All' && demo.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        demo.title.toLowerCase().includes(q) ||
        demo.tagline.toLowerCase().includes(q) ||
        demo.description.toLowerCase().includes(q) ||
        demo.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleLaunch = (demo: DemoItem) => {
    navigate(demo.route);
    if (demo.tourId) {
      setTimeout(() => {
        startTour(demo.tourId);
      }, 350);
    }
  };

  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'cyan':
        return 'bg-[#0284c7]/20 text-[#38bdf8] border-[#0284c7]/40';
      case 'emerald':
        return 'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/40';
      case 'amber':
        return 'bg-[#d97706]/20 text-[#fbbf24] border-[#d97706]/40';
      case 'rose':
        return 'bg-[#e11d48]/20 text-[#fb7185] border-[#e11d48]/40';
      case 'violet':
      default:
        return 'bg-[#7c3aed]/20 text-[#c4b5fd] border-[#7c3aed]/40';
    }
  };

  return (
    <PageShell
      title="Interactive Feature Demos"
      description="One-click live scenarios to test and showcase all 34 SkillForge platform capabilities."
      breadcrumb={[
        { label: 'Workspace', href: '/home' },
        { label: 'Feature Demos' },
      ]}
      maxWidth="max-w-[1440px]"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171629] via-[#131221] to-[#0f0e1a] border border-[#2b2a42] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Interactive Showcase Hub
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7c3aed]/20 text-[#c4b5fd] border border-[#7c3aed]/40">
                14 Live Features
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Present, Test &amp; Inspect Every Feature in Action
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Every scenario below launches into the real, functional interface pre-loaded with production data models, canonical projects, and verifiable credentials.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => startTour('welcome-individual')}
              className="px-4 py-2 rounded-xl bg-[#1c1b2c] hover:bg-[#28273d] text-zinc-300 hover:text-white text-xs font-bold border border-[#2f2e46] transition-all flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
              </svg>
              <span>Welcome Tour</span>
            </button>
            <button
              onClick={() => navigate('/help')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white text-xs font-bold transition-all shadow-md shadow-[#7c3aed]/25 flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10M6 10h10" />
              </svg>
              <span>Open Manuals</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#11101b] border border-[#242336] rounded-xl">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#7c3aed] text-white shadow-sm'
                    : 'bg-[#181726] text-zinc-400 hover:text-white hover:bg-[#201f33]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <input
              type="text"
              placeholder="Search feature demos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181728] border border-[#2c2b42] text-xs text-white rounded-xl pl-8 pr-3 py-1.5 focus:border-[#7c3aed] focus:outline-none placeholder-zinc-500"
            />
            <span className="absolute left-2.5 top-2 text-zinc-500 text-xs">🔍</span>
          </div>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDemos.map((demo) => (
            <div
              key={demo.id}
              className="group relative rounded-xl bg-gradient-to-b from-[#161524] via-[#12111d] to-[#0e0d17] border border-[#29283e] hover:border-[#7c3aed]/70 p-4 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-md hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:-translate-y-0.5"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeStyle(demo.badgeColor)}`}>
                        {demo.badge}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        {demo.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white group-hover:text-[#c4b5fd] transition-colors leading-snug">
                      {demo.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  {demo.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {demo.highlights.map((hl) => (
                    <span
                      key={hl}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#1a192b] border border-[#2b2a40] text-zinc-300 font-medium flex items-center gap-1"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{hl}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#222135] flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-mono">
                  {demo.route}
                </span>
                <button
                  onClick={() => handleLaunch(demo)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white text-xs font-bold transition-all shadow-md shadow-[#7c3aed]/25 flex items-center gap-1.5"
                >
                  <span>Launch Live Demo</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};
