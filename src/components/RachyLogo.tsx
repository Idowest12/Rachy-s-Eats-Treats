import React from 'react';

interface RachyLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  className?: string;
  showPhone?: boolean;
}

export const RachyLogo: React.FC<RachyLogoProps> = ({
  variant = 'icon',
  className = 'w-12 h-12',
  showPhone = true,
}) => {
  if (variant === 'full') {
    return (
      <div className={`relative flex flex-col items-center justify-center p-6 bg-[#0e0c0b] rounded-3xl border border-[rgba(245,236,226,0.12)] shadow-2xl ${className}`}>
        <svg
          viewBox="0 0 320 320"
          className="w-full h-auto max-w-[280px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chef Hat on top */}
          <g id="chef-hat" stroke="#e2417e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Hat band */}
            <path d="M 132 54 C 142 56 162 56 172 54 C 172 58 171 61 170 63 C 160 65 144 65 134 63 Z" fill="#e2417e" fillOpacity="0.2" />
            {/* Three Puffs */}
            <path d="M 133 54 C 116 46 118 30 135 28 C 142 18 162 18 169 28 C 186 30 188 46 171 54" />
            {/* Crease lines */}
            <path d="M 143 31 C 144 42 145 50 144 55" />
            <path d="M 161 31 C 160 42 159 50 160 55" />
          </g>

          {/* Fork on Left */}
          <g id="fork" fill="#e2417e">
            <rect x="88" y="74" width="2.6" height="25" rx="1.3" />
            <rect x="93.2" y="74" width="2.6" height="25" rx="1.3" />
            <rect x="98.4" y="74" width="2.6" height="25" rx="1.3" />
            <rect x="103.6" y="74" width="2.6" height="25" rx="1.3" />
            <path d="M 87 97 C 87 108 105 108 105 97 Z" />
            <path d="M 94.6 106 L 94.6 142 C 94.6 147 93.6 152 96 153 C 98.4 152 97.4 147 97.4 142 L 97.4 106 Z" />
          </g>

          {/* Spoon on Right */}
          <g id="spoon" fill="#e2417e">
            <ellipse cx="225" cy="92" rx="9.5" ry="17" />
            <path d="M 223.6 107 L 223.6 142 C 223.6 147 222.6 152 225 153 C 227.4 152 226.4 147 226.4 142 L 226.4 107 Z" />
          </g>

          {/* 3D Gift Box in Center */}
          <g id="gift-box" transform="translate(112, 60)">
            {/* Box Front Face */}
            <polygon points="0,32 46,46 46,90 0,76" fill="#fbb6ce" stroke="#d53f8c" strokeWidth="1.5" />
            {/* Box Right Face */}
            <polygon points="46,46 92,32 92,76 46,90" fill="#f472b6" stroke="#d53f8c" strokeWidth="1.5" />
            {/* Box Lid Front Rim */}
            <polygon points="-3,27 46,42 46,49 -3,34" fill="#f687b3" stroke="#d53f8c" strokeWidth="1" />
            {/* Box Lid Right Rim */}
            <polygon points="46,42 95,27 95,34 46,49" fill="#ec4899" stroke="#d53f8c" strokeWidth="1" />
            {/* Box Lid Top Face */}
            <polygon points="46,12 95,27 46,42 -3,27" fill="#fce7f3" stroke="#d53f8c" strokeWidth="1.5" />

            {/* Vertical Ribbon Front */}
            <polygon points="20,38 27,40 27,84 20,82" fill="#e2417e" />
            {/* Vertical Ribbon Right */}
            <polygon points="65,40 72,38 72,82 65,84" fill="#be185d" />
            {/* Top Ribbons */}
            <polygon points="19,20 27,22 72,33 64,31" fill="#e2417e" />
            <polygon points="42,13 50,13 50,42 42,42" fill="#be185d" />

            {/* Bow on Top */}
            <path d="M 46 18 C 30 4 20 16 42 20 Z" fill="#e2417e" />
            <path d="M 46 18 C 62 4 72 16 50 20 Z" fill="#e2417e" />
            <circle cx="46" cy="18" r="4.5" fill="#be185d" />
          </g>

          {/* Wordmark "Rachy" */}
          <text
            x="160"
            y="214"
            textAnchor="middle"
            fontFamily="'Pacifico', 'Brush Script MT', 'Dancing Script', cursive, sans-serif"
            fontWeight="bold"
            fontSize="56"
            fill="#e2417e"
            letterSpacing="1"
          >
            Rachy
          </text>

          {/* Tagline "Eats & Treats" */}
          <text
            x="160"
            y="244"
            textAnchor="middle"
            fontFamily="'Work Sans', system-ui, sans-serif"
            fontWeight="800"
            fontSize="15"
            fill="#e2417e"
            letterSpacing="3.5"
          >
            Eats &amp; Treats
          </text>

          {/* Phone Number */}
          {showPhone && (
            <text
              x="160"
              y="272"
              textAnchor="middle"
              fontFamily="'Work Sans', system-ui, sans-serif"
              fontWeight="700"
              fontSize="15"
              fill="#e2417e"
              letterSpacing="1"
            >
              07014995254
            </text>
          )}
        </svg>
      </div>
    );
  }

  // Icon / Badge variant (used in headers, navbars, footers)
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#0e0c0b] border border-[rgba(245,236,226,0.15)] overflow-hidden shrink-0 ${className}`}
      title="Rachy's Eats & Treats"
    >
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full p-1.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chef Hat */}
        <g stroke="#e2417e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M 68 34 C 74 35 86 35 92 34 C 92 37 91 39 90 40 C 84 41 76 41 70 40 Z" fill="#e2417e" fillOpacity="0.25" />
          <path d="M 69 34 C 58 29 60 17 71 15 C 76 9 88 9 93 15 C 104 17 106 29 93 34" />
          <path d="M 75 17 C 76 25 77 30 76 34" />
          <path d="M 87 17 C 86 25 85 30 86 34" />
        </g>

        {/* Fork on Left */}
        <g fill="#e2417e">
          <rect x="36" y="52" width="2" height="20" rx="1" />
          <rect x="40.5" y="52" width="2" height="20" rx="1" />
          <rect x="45" y="52" width="2" height="20" rx="1" />
          <rect x="49.5" y="52" width="2" height="20" rx="1" />
          <path d="M 35 70 C 35 80 51 80 51 70 Z" />
          <path d="M 42 77 L 42 110 C 42 114 41 118 43 119 C 45 118 44 114 44 110 L 44 77 Z" />
        </g>

        {/* Spoon on Right */}
        <g fill="#e2417e">
          <ellipse cx="118" cy="65" rx="8.5" ry="16" />
          <path d="M 117 79 L 117 110 C 117 114 116 118 118 119 C 120 118 119 114 119 110 L 119 79 Z" />
        </g>

        {/* 3D Gift Box in Center */}
        <g transform="translate(54, 42)">
          {/* Front Face */}
          <polygon points="0,28 26,38 26,78 0,67" fill="#fbb6ce" stroke="#d53f8c" strokeWidth="1.2" />
          {/* Right Face */}
          <polygon points="26,38 52,28 52,67 26,78" fill="#f472b6" stroke="#d53f8c" strokeWidth="1.2" />
          {/* Lid Front Rim */}
          <polygon points="-2,24 26,35 26,41 -2,30" fill="#f687b3" stroke="#d53f8c" strokeWidth="0.8" />
          {/* Lid Right Rim */}
          <polygon points="26,35 54,24 54,30 26,41" fill="#ec4899" stroke="#d53f8c" strokeWidth="0.8" />
          {/* Lid Top Face */}
          <polygon points="26,11 54,24 26,35 -2,24" fill="#fce7f3" stroke="#d53f8c" strokeWidth="1.2" />

          {/* Ribbons */}
          <polygon points="11,32 16,34 16,72 11,70" fill="#e2417e" />
          <polygon points="36,34 41,32 41,70 36,72" fill="#be185d" />
          <polygon points="10,18 15,20 41,29 36,27" fill="#e2417e" />
          <polygon points="23,12 29,12 29,35 23,35" fill="#be185d" />

          {/* Bow on Top */}
          <path d="M 26 16 C 15 4 7 14 23 18 Z" fill="#e2417e" />
          <path d="M 26 16 C 37 4 45 14 29 18 Z" fill="#e2417e" />
          <circle cx="26" cy="16" r="3.5" fill="#be185d" />
        </g>
      </svg>
    </div>
  );
};
