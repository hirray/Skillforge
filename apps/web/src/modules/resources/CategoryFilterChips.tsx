import React from 'react';

export interface CategoryFilterChipsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  counts?: Record<string, number>;
}

const CATEGORIES = [
  { id: 'all', label: 'All Resources' },
  { id: 'link', label: 'Links' },
  { id: 'file', label: 'Files' },
  { id: 'Repository', label: 'Repository' },
  { id: 'Design', label: 'Design' },
  { id: 'Docs', label: 'Docs' },
  { id: 'Demo', label: 'Demo' },
  { id: 'Dataset', label: 'Dataset' },
];

export const CategoryFilterChips: React.FC<CategoryFilterChipsProps> = ({
  activeCategory,
  onSelectCategory,
  counts = {},
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
        const count = counts[cat.id.toLowerCase()];

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
              isActive
                ? 'bg-primary text-white shadow-elevation-1'
                : 'bg-surface text-muted border border-uiBorder hover:border-accent hover:text-mainText'
            }`}
          >
            <span>{cat.label}</span>
            {typeof count === 'number' && count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-bg text-muted'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
