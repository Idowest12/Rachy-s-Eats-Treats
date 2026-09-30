import React from 'react';

interface WhatsAppIconProps {
  className?: string;
  size?: number | string;
}

export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  className = 'w-5 h-5',
  size
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size || 24}
      height={size || 24}
      className={`shrink-0 inline-block align-middle ${className}`}
      aria-hidden="true"
    >
      {/* Solid fallback background (green) that renders reliably on all mobile GPUs without ID collisions */}
      <rect width="48" height="48" rx="12" fill="#25D366" />
      
      {/* Inner speech bubble & telephone receiver handset in crisp white */}
      <path
        fill="#ffffff"
        d="M24 8C15.163 8 8 15.163 8 24c0 2.82.736 5.47 2.023 7.768L8.6 37.88a1.2 1.2 0 0 0 1.52 1.52l6.112-1.423A15.932 15.932 0 0 0 24 40c8.837 0 16-7.163 16-16s-7.163-16-16-16zm-7.62 9.07c.36-.8.74-.82 1.08-.83.28-.01.6-.01.92-.01.32 0 .84.12 1.28 1.08.44.96 1.52 3.71 1.65 3.98.13.27.22.59.04.95-.18.36-.27.59-.54.91-.27.32-.57.71-.81.95-.27.27-.55.56-.24 1.09.31.53 1.38 2.28 2.96 3.69 2.04 1.81 3.75 2.38 4.29 2.64.53.27.84.22 1.15-.13.31-.36 1.33-1.55 1.69-2.08.35-.53.71-.44 1.2-.27.49.18 3.1 1.46 3.63 1.73.53.27.89.4.1.02.13.22.13.84-.23 1.86-.35 1.02-1.77 1.95-2.48 2.04-.67.08-1.52.12-4.94-1.22-4.13-1.62-6.79-5.78-7-6.05-.2-.27-1.78-2.37-1.78-4.52s1.12-3.21 1.52-3.65c.4-.44.87-.55 1.17-.55.15 0 .28.01.4.02z"
      />
    </svg>
  );
};
