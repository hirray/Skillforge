import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-semibold text-mainText">{label}</label>}
        <input
          ref={ref}
          className={`h-10 px-3 py-2 bg-surface border rounded-lg text-mainText placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow ${
            error ? 'border-warning' : 'border-uiBorder'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-warning">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
