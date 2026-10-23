import React from 'react';

export interface SkeletonProps {
  className?: string;
  count?: number;
  type?: 'bubble' | 'card' | 'row' | 'avatar' | 'text';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  count = 1,
  type = 'text',
}) => {
  const items = Array.from({ length: count });

  if (type === 'bubble') {
    return (
      <div className={`space-y-4 py-2 ${className}`}>
        {items.map((_, i) => {
          const isMe = i % 2 === 1;
          return (
            <div
              key={i}
              className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isMe && <div className="w-8 h-8 rounded-full animate-shimmer flex-shrink-0" />}
              <div className="space-y-1.5 max-w-[70%]">
                {!isMe && <div className="w-20 h-3 rounded animate-shimmer" />}
                <div
                  className={`h-12 rounded-2xl animate-shimmer ${
                    isMe ? 'w-48 bg-primary/20' : 'w-56 bg-uiBorder/60'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`grid gap-4 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-uiBorder bg-surface shadow-elevation-1 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full animate-shimmer" />
              <div className="space-y-1.5 flex-1">
                <div className="w-32 h-4 rounded animate-shimmer" />
                <div className="w-24 h-3 rounded animate-shimmer" />
              </div>
            </div>
            <div className="w-full h-3 rounded animate-shimmer" />
            <div className="w-3/4 h-3 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'row') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3.5 rounded-lg border border-uiBorder/60 bg-surface"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full animate-shimmer" />
              <div className="w-36 h-3.5 rounded animate-shimmer" />
            </div>
            <div className="w-16 h-3 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'avatar') {
    return <div className={`w-10 h-10 rounded-full animate-shimmer ${className}`} />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-4 rounded animate-shimmer w-full" />
      ))}
    </div>
  );
};
