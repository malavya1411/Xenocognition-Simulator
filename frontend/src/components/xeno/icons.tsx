// Anatomical architecture icons — no generic shapes.
// Stroke color inherits from `currentColor` so panels can theme each icon.

type IconProps = { size?: number; className?: string };

export const OctopusIcon = ({ size = 32, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Mantle */}
    <ellipse cx="24" cy="17" rx="9" ry="11" fill="currentColor" fillOpacity="0.08" />
    {/* Eye */}
    <circle cx="24" cy="15" r="3" fill="currentColor" fillOpacity="0.18" stroke="none" />
    <circle cx="24" cy="15" r="1.2" fill="currentColor" stroke="none" />
    {/* 8 tentacles, curved */}
    <path d="M16 24 Q11 30 9 38" />
    <path d="M19 26 Q17 34 15 43" />
    <path d="M22 27 Q22 35 21 44" />
    <path d="M26 27 Q26 35 27 44" />
    <path d="M29 26 Q31 34 33 43" />
    <path d="M32 24 Q37 30 39 38" />
    <path d="M17 21 Q10 24 6 27" />
    <path d="M31 21 Q38 24 42 27" />
    {/* Suction cups */}
    <circle cx="10.5" cy="34" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="9.6" cy="38" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="36" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="40" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="21.6" cy="38" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="26.4" cy="38" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="32.5" cy="36" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="37.5" cy="34" r="0.7" fill="currentColor" stroke="none" />
  </svg>
);

export const MyceliumIcon = ({ size = 32, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    className={className}
  >
    {/* Main hyphae rising */}
    <path d="M24 42 Q22 34 18 28" />
    <path d="M24 42 Q26 34 30 28" />
    <path d="M18 28 Q14 22 12 14" />
    <path d="M18 28 Q20 20 22 12" />
    <path d="M30 28 Q28 20 26 12" />
    <path d="M30 28 Q34 22 36 14" />
    {/* Fine sub-hyphae */}
    <path d="M18 28 Q16 26 14 26" strokeWidth="0.7" opacity="0.6" />
    <path d="M30 28 Q32 26 34 26" strokeWidth="0.7" opacity="0.6" />
    {/* Fruiting bodies (mushroom caps) */}
    <ellipse cx="12" cy="13" rx="3" ry="2" fill="currentColor" fillOpacity="0.2" />
    <line x1="12" y1="14" x2="12" y2="17" />
    <ellipse cx="22" cy="11" rx="3" ry="2" fill="currentColor" fillOpacity="0.2" />
    <line x1="22" y1="12" x2="22" y2="15" />
    <ellipse cx="26" cy="11" rx="3" ry="2" fill="currentColor" fillOpacity="0.2" />
    <line x1="26" y1="12" x2="26" y2="15" />
    <ellipse cx="36" cy="13" rx="3" ry="2" fill="currentColor" fillOpacity="0.2" />
    <line x1="36" y1="14" x2="36" y2="17" />
    {/* Spores drifting */}
    <circle cx="10" cy="8" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="24" cy="6" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="38" cy="9" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="30" cy="7" r="0.5" fill="currentColor" stroke="none" opacity="0.7" />
  </svg>
);

export const HiveIcon = ({ size = 32, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinejoin="round"
    className={className}
  >
    {/* 7-hex honeycomb cluster */}
    <polygon points="24,13 31,17 31,25 24,29 17,25 17,17" fill="currentColor" fillOpacity="0.12" />
    <polygon points="24,4 30,7.5 30,14.5 24,18 18,14.5 18,7.5" />
    <polygon points="33,9 39,12.5 39,19.5 33,23 27,19.5 27,12.5" />
    <polygon points="33,23 39,26.5 39,33.5 33,37 27,33.5 27,26.5" />
    <polygon points="24,28 30,31.5 30,38.5 24,42 18,38.5 18,31.5" />
    <polygon points="15,23 21,26.5 21,33.5 15,37 9,33.5 9,26.5" />
    <polygon points="15,9 21,12.5 21,19.5 15,23 9,19.5 9,12.5" />
    {/* Bee in center */}
    <ellipse cx="24" cy="21" rx="2.4" ry="1.6" fill="currentColor" fillOpacity="0.7" stroke="none" />
    <line x1="22.4" y1="20" x2="25.6" y2="20" strokeWidth="0.6" stroke="var(--surface)" />
    <line x1="22.4" y1="22" x2="25.6" y2="22" strokeWidth="0.6" stroke="var(--surface)" />
    {/* Wings */}
    <ellipse cx="22" cy="19" rx="1.4" ry="0.8" fill="currentColor" fillOpacity="0.3" stroke="none" />
    <ellipse cx="26" cy="19" rx="1.4" ry="0.8" fill="currentColor" fillOpacity="0.3" stroke="none" />
  </svg>
);

export const BoltzmannIcon = ({ size = 32, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Brain outline - dashed (half-formed) */}
    <path
      d="M14 30 Q10 22 14 16 Q18 11 24 12 Q30 11 34 16 Q38 22 34 30 Q32 36 24 36 Q16 36 14 30"
      strokeDasharray="3 2"
    />
    {/* Internal folds */}
    <path d="M18 22 Q22 18 24 22 Q26 26 22 28" strokeDasharray="2 2" opacity="0.6" />
    <path d="M28 20 Q32 24 30 30" strokeDasharray="2 2" opacity="0.6" />
    <path d="M24 14 L24 34" strokeDasharray="1 3" opacity="0.4" />
    {/* Lightning bolts */}
    <path d="M34 10 L37 5 L35 9 L39 7" strokeWidth="1.4" />
    <path d="M14 10 L11 5 L13 9 L9 7" strokeWidth="1.4" />
    <path d="M40 30 L43 28 L41 32 L44 31" strokeWidth="1.1" opacity="0.7" />
    {/* Quantum dots */}
    <circle cx="6" cy="18" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="42" cy="22" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="24" cy="3" r="1.1" fill="currentColor" stroke="none" opacity="0.6" />
    <circle cx="44" cy="38" r="0.7" fill="currentColor" stroke="none" opacity="0.6" />
    <circle cx="4" cy="36" r="0.7" fill="currentColor" stroke="none" opacity="0.6" />
  </svg>
);

export const MeshIcon = ({ size = 32, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Three overlapping head profiles (facing right) */}
    <g opacity="0.4">
      <path d="M10 40 L10 26 Q10 14 19 12 Q26 11 27 18 L28 22 L31 23 L29 26 L29 30 L26 31 L26 36 L21 36 L21 40 Z" />
    </g>
    <g opacity="0.65">
      <path d="M16 41 L16 27 Q16 15 25 13 Q32 12 33 19 L34 23 L37 24 L35 27 L35 31 L32 32 L32 37 L27 37 L27 41 Z" />
    </g>
    <g>
      <path d="M22 42 L22 28 Q22 16 31 14 Q38 13 39 20 L40 24 L43 25 L41 28 L41 32 L38 33 L38 38 L33 38 L33 42 Z" />
    </g>
    {/* Neural network inside front head */}
    <circle cx="29" cy="22" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="34" cy="20" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="33" cy="27" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="37" cy="25" r="1" fill="currentColor" stroke="none" />
    <line x1="29" y1="22" x2="34" y2="20" strokeWidth="0.6" opacity="0.6" />
    <line x1="34" y1="20" x2="37" y2="25" strokeWidth="0.6" opacity="0.6" />
    <line x1="29" y1="22" x2="33" y2="27" strokeWidth="0.6" opacity="0.6" />
    <line x1="33" y1="27" x2="37" y2="25" strokeWidth="0.6" opacity="0.6" />
  </svg>
);
