import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  modules: string[];
}

export const Sidebar = ({ modules }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside className="w-64 lg:w-[280px] bg-primary text-white overflow-y-auto flex-shrink-0 flex flex-col h-full select-none shadow-elevation-2">
      <div className="p-6 font-black text-2xl border-b border-white/10 text-white tracking-tight flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-accent font-black text-lg border border-white/20">
          S
        </span>
        <span>SkillForge</span>
      </div>
      <nav className="p-4 flex flex-col gap-1 flex-1">
        {modules.map(m => {
          const isActive = location.pathname.startsWith(`/${m}`);
          return (
            <Link 
              key={m} 
              to={`/${m}`} 
              className={`capitalize px-4 py-2.5 rounded-xl flex items-center transition-all duration-150 ${
                isActive 
                  ? 'bg-white/20 border-l-4 border-accent text-white font-bold shadow-sm' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              {m}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
