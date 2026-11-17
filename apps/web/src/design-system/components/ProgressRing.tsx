import React, { useEffect, useState } from 'react';
import { IcoCheck } from './Icons';

export interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number; // diameter in px (default 64)
  strokeWidth?: number; // stroke width in px (default 6)
  status?: 'To Do' | 'In Progress' | 'Done' | string;
  isOverdue?: boolean;
  showPercent?: boolean;
  className?: string;
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 64,
  strokeWidth = 6,
  status,
  isOverdue = false,
  showPercent = true,
  className = '',
  label,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(Math.min(100, Math.max(0, progress)));
    }, 50);
    return () => clearTimeout(timer);
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Determine stroke color from locked palette
  let strokeColor = '#93B2F8'; // Bleu ciel (In Progress)
  if (status === 'Done' || animatedProgress === 100) {
    strokeColor = '#b29af5'; // Bleu océan (Done)
  } else if (isOverdue) {
    strokeColor = '#F1B94C'; // Orange pastel (Overdue)
  } else if (status === 'To Do' || animatedProgress === 0) {
    strokeColor = '#26262e'; // Neutral border track
  }

  const isCompleted = status === 'Done' || animatedProgress === 100;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-label={`Progress: ${animatedProgress}%`}
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#26262e"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 500ms cubic-bezier(0.4, 0, 0.2, 1), stroke 300ms ease'
          }}
        />
      </svg>

      {/* Centered Percentage or Checkmark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        {isCompleted ? (
          <IcoCheck size={16} color="#b29af5" />
        ) : showPercent ? (
          <span
            className={`font-bold text-xs tracking-tight ${
              isOverdue ? 'text-[#F1B94C]' : 'text-primary'
            }`}
          >
            {Math.round(animatedProgress)}%
          </span>
        ) : null}
        {label && <span className="text-[10px] text-muted leading-tight mt-0.5">{label}</span>}
      </div>
    </div>
  );
};

export default ProgressRing;
