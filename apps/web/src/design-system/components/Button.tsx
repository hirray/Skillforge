import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-full';
    
    const variants = {
      primary: 'bg-primary text-white font-semibold hover:bg-primary/90 shadow-sm',
      secondary: 'bg-accent text-primary font-semibold hover:bg-accent/90 shadow-sm',
      outline: 'border border-uiBorder text-mainText hover:bg-gray-50',
      icon: 'bg-accent text-primary hover:bg-accent/90 p-2',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
    };

    const isIcon = variant === 'icon';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${isIcon ? '' : sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
