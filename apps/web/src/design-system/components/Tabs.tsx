export interface TabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className = '' }: TabsProps) => {
  return (
    <div className={`flex flex-wrap border-b border-[#2c2c36] gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
              isActive
                ? 'border-[#b29af5] text-[#b29af5] bg-[#221a36]/40 rounded-t'
                : 'border-transparent text-[#aba6b6] hover:text-white hover:border-[#3a3a46]'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};
