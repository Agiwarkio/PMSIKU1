import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="pms-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Shield background representing institution and reliability */}
    <path 
      d="M12 2L4 5v6.09c0 4.97 3.58 9.38 8 10.91c4.42-1.53 8-5.94 8-10.91V5l-8-3z"
      fill="url(#pms-logo-grad)"
    />
    {/* Inner elements: chain/link for partnership */}
    <path 
      d="M15.5 12.25a2.25 2.25 0 0 0 0-4.5h-.75a2.25 2.25 0 0 0-4.5 0H9.5a2.25 2.25 0 0 0 0 4.5h.75a2.25 2.25 0 0 0 4.5 0h.75z" 
      fill="white"
      fillOpacity="0.9"
    />
     {/* Sparkle for AI/Intelligence */}
    <path 
      d="M12 6.5l.38.78.8.14-.58.56.14.8-.72-.38-.72.38.14-.8-.58-.56.8-.14L12 6.5z"
      fill="white"
    />
  </svg>
);

export default Logo;
