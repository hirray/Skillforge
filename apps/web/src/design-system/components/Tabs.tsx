

export interface TabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className = '' }: TabsProps) => {
  return (
    <div className={`flex border-b border-uiBorder ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-mainText hover:border-uiBorder'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};
