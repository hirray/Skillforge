import React from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

const base = (
  size: number = 16,
  color?: string,
  className?: string,
  style?: React.CSSProperties,
  children?: React.ReactNode,
  viewBox: string = '0 0 24 24',
  fill: string = 'none'
) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={fill}
    stroke={fill === 'none' ? (color || 'currentColor') : 'none'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    {children}
  </svg>
);

export const IcoFile: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </>
  ));

export const IcoTarget: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ));

export const IcoUsers: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ));

export const IcoRoles: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="23" y1="11" x2="17" y2="11" />
      <line x1="20" y1="8" x2="20" y2="14" />
    </>
  ));

export const IcoCode: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ));

export const IcoServer: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </>
  ));

export const IcoCpu: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </>
  ));

export const IcoPalette: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </>
  ));

export const IcoMobile: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </>
  ));

export const IcoBox: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </>
  ));

export const IcoCloud: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  ));

export const IcoLayers: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ));

export const IcoClock: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ));

export const IcoCalendar: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ));

export const IcoMap: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </>
  ));

export const IcoBar: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>
  ));

export const IcoFlash: React.FC<IconProps> = ({ size = 16, color = '#F59E0B', className, style }) =>
  base(size, color, className, style, (
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  ));

export const IcoCheck: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <polyline points="20 6 9 17 4 12" />
  ));

export const IcoCheckCircle: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ));

export const IcoAlert: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ));

export const IcoTrash: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ));

export const IcoEdit: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ));

export const IcoCopy: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ));

export const IcoRefresh: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </>
  ));

export const IcoLock: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ));

export const IcoPlus: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ));

export const IcoMsg: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  ));

export const IcoLink: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ));

export const IcoFolder: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  ));

export const IcoSearch: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ));

export const IcoRocket: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ));

export const IcoPause: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </>
  ));

export const IcoPlay: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <polygon points="5 3 19 12 5 21 5 3" />
  ));

export const IcoCrown: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z" />
  ));

export const IcoStar: React.FC<IconProps & { filled?: boolean }> = ({ size = 16, color, filled, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? '#F59E0B' : 'none'}
    stroke={filled ? '#D97706' : (color || 'currentColor')}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IcoMore: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </>
  ));

export const IcoGrid: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ));

export const IcoChevRight: React.FC<IconProps> = ({ size = 14, color, className, style }) =>
  base(size, color, className, style, (
    <polyline points="9 18 15 12 9 6" />
  ));

export const IcoChevDown: React.FC<IconProps> = ({ size = 14, color, className, style }) =>
  base(size, color, className, style, (
    <polyline points="6 9 12 15 18 9" />
  ));

export const IcoClose: React.FC<IconProps> = ({ size = 14, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ));

export const IcoPin: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.77V6a3 3 0 0 0-6 0v4.77a2 2 0 0 1-1.11 1.79l-1.78.89A2 2 0 0 0 5 15.24Z" />
    </>
  ));

export const IcoSpark: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
      <path d="m20 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" />
    </>
  ));

export const IcoMail: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ));

export const IcoUpload: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ));

export const IcoDownload: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ));

export const IcoClipboard: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </>
  ));

export const IcoFlag: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </>
  ));

export const IcoPaperclip: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  ));

export const IcoImage: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ));

export const IcoVideo: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </>
  ));

export const IcoGithub: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  ));

export const IcoFigma: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
      <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
      <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
      <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
      <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
    </>
  ));

export const IcoNotion: React.FC<IconProps> = ({ size = 16, color, className, style }) =>
  base(size, color, className, style, (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 12h8M8 17h5" />
    </>
  ));
