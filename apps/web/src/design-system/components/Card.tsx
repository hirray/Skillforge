import React from 'react';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-surface rounded-2xl border border-uiBorder p-6 shadow-sm ${className}`}
      {...props}
    />
  )
);
Card.displayName = 'Card';
