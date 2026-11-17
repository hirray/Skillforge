import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-xs font-semibold text-[#f5f3f9] tracking-wide">{label}</label>}
        <input
          ref={ref}
          className={`h-9 px-3 py-1.5 bg-[#0e0e12] border rounded-lg text-xs text-white placeholder-[#8f8a9a] focus:outline-none focus:border-[#b29af5] focus:ring-1 focus:ring-[#b29af5]/40 transition-all ${
            error ? 'border-amber-400 text-amber-200' : 'border-[#3a3a46]'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-[11px] text-amber-300">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
