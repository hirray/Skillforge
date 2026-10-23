import React from 'react';

export interface AvatarProps {
  name?: string;
  email?: string;
  src?: string;
  presence?: 'online' | 'offline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm font-semibold',
  lg: 'w-12 h-12 text-base font-bold',
  xl: 'w-14 h-14 text-lg font-bold',
};

const dotSizeClasses = {
  xs: 'w-2 h-2 -bottom-0.5 -right-0.5 border',
  sm: 'w-2.5 h-2.5 bottom-0 right-0 border-[1.5px]',
  md: 'w-3 h-3 bottom-0 right-0 border-2',
  lg: 'w-3.5 h-3.5 bottom-0.5 right-0.5 border-2',
  xl: 'w-4 h-4 bottom-0.5 right-0.5 border-2',
};

// Deterministic gentle hue from string
const getInitials = (name?: string, email?: string) => {
  const identifier = name || email?.split('@')[0] || '?';
  const parts = identifier.trim().split(/[\s._-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return identifier.slice(0, 2).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  email,
  src,
  presence,
  size = 'md',
  className = '',
  onClick,
}) => {
  const initials = getInitials(name, email);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-shrink-0 items-center justify-center rounded-full bg-[#0A1680]/10 text-primary border border-uiBorder/80 font-medium select-none ${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
    >
      {src ? (
        <img
          src={src}
          alt={name || email || 'Avatar'}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="leading-none">{initials}</span>
      )}

      {presence && (
        <span
          className={`absolute rounded-full border-white ${dotSizeClasses[size]} ${
            presence === 'online' ? 'bg-[#22C55E]' : 'bg-[#9CA3AF]'
          }`}
          title={presence === 'online' ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
