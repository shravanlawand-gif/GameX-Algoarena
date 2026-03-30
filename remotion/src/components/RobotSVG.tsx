import { useCurrentFrame, interpolate } from "remotion";

interface RobotSVGProps {
  size: number;
  glow: number;
  variant: "hero" | "player" | "enemy";
}

export const RobotSVG = ({ size, glow, variant }: RobotSVGProps) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame * 0.06) * 2;
  const eyeBlink = Math.sin(frame * 0.15) > 0.97 ? 0.1 : 1;
  const headTilt = Math.sin(frame * 0.04) * 2;

  const colors = {
    hero: { body: "hsl(210, 30%, 25%)", accent: "hsl(195, 100%, 50%)", eye: "hsl(195, 100%, 70%)" },
    player: { body: "hsl(210, 30%, 25%)", accent: "hsl(195, 100%, 50%)", eye: "hsl(195, 100%, 70%)" },
    enemy: { body: "hsl(0, 20%, 25%)", accent: "hsl(0, 80%, 50%)", eye: "hsl(0, 90%, 60%)" },
  }[variant];

  return (
    <svg width={size} height={size} viewBox="0 0 200 220" fill="none">
      <defs>
        <radialGradient id={`core-${variant}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={colors.accent} stopOpacity={glow * 0.8} />
          <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
        </radialGradient>
        <filter id={`glow-${variant}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`translate(0, ${breathe})`}>
        {/* Antenna */}
        <g transform={`rotate(${headTilt}, 100, 50)`}>
          <line x1="100" y1="30" x2="100" y2="10" stroke={colors.accent} strokeWidth="2" opacity={0.6} />
          <circle cx="100" cy="8" r="4" fill={colors.accent} opacity={glow}>
            <animate attributeName="opacity" values={`${glow};${glow * 0.3};${glow}`} dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Head */}
        <g transform={`rotate(${headTilt}, 100, 55)`}>
          <rect x="65" y="32" width="70" height="50" rx="10" fill={colors.body} stroke={colors.accent} strokeWidth="1.5" strokeOpacity={0.5} />
          {/* Visor */}
          <rect x="72" y="42" width="56" height="22" rx="6" fill="hsl(220, 30%, 10%)" stroke={colors.accent} strokeWidth="0.8" strokeOpacity={0.3} />
          {/* Eyes */}
          <ellipse cx="87" cy="53" rx="8" ry={6 * eyeBlink} fill={colors.eye} filter={`url(#glow-${variant})`} opacity={0.9} />
          <ellipse cx="113" cy="53" rx="8" ry={6 * eyeBlink} fill={colors.eye} filter={`url(#glow-${variant})`} opacity={0.9} />
        </g>

        {/* Neck */}
        <rect x="92" y="82" width="16" height="10" fill={colors.body} opacity={0.7} />

        {/* Torso */}
        <rect x="60" y="90" width="80" height="60" rx="8" fill={colors.body} stroke={colors.accent} strokeWidth="1" strokeOpacity={0.3} />
        {/* Core */}
        <circle cx="100" cy="120" r="14" fill={`url(#core-${variant})`} />
        <circle cx="100" cy="120" r="8" fill={colors.accent} opacity={interpolate(Math.sin(frame * 0.1), [-1, 1], [0.3, 0.8])} />
        {/* Chest plates */}
        <path d="M65 95 L80 95 L78 115 L65 110 Z" fill={colors.body} stroke={colors.accent} strokeWidth="0.5" strokeOpacity={0.3} />
        <path d="M135 95 L120 95 L122 115 L135 110 Z" fill={colors.body} stroke={colors.accent} strokeWidth="0.5" strokeOpacity={0.3} />

        {/* Shoulder plates */}
        <ellipse cx="52" cy="98" rx="14" ry="10" fill={colors.body} stroke={colors.accent} strokeWidth="1" strokeOpacity={0.4} />
        <ellipse cx="148" cy="98" rx="14" ry="10" fill={colors.body} stroke={colors.accent} strokeWidth="1" strokeOpacity={0.4} />

        {/* Arms */}
        <rect x="38" y="100" width="16" height="50" rx="6" fill={colors.body} stroke={colors.accent} strokeWidth="0.5" strokeOpacity={0.3} />
        <rect x="146" y="100" width="16" height="50" rx="6" fill={colors.body} stroke={colors.accent} strokeWidth="0.5" strokeOpacity={0.3} />
        {/* Hands */}
        <circle cx="46" cy="155" r="8" fill={colors.body} stroke={colors.accent} strokeWidth="0.8" strokeOpacity={0.3} />
        <circle cx="154" cy="155" r="8" fill={colors.body} stroke={colors.accent} strokeWidth="0.8" strokeOpacity={0.3} />

        {/* Legs */}
        <rect x="72" y="152" width="20" height="45" rx="6" fill={colors.body} stroke={colors.accent} strokeWidth="0.5" strokeOpacity={0.3} />
        <rect x="108" y="152" width="20" height="45" rx="6" fill={colors.body} stroke={colors.accent} strokeWidth="0.5" strokeOpacity={0.3} />
        {/* Feet */}
        <rect x="68" y="195" width="28" height="10" rx="4" fill={colors.body} stroke={colors.accent} strokeWidth="0.8" strokeOpacity={0.3} />
        <rect x="104" y="195" width="28" height="10" rx="4" fill={colors.body} stroke={colors.accent} strokeWidth="0.8" strokeOpacity={0.3} />

        {/* Knee joints */}
        <circle cx="82" cy="175" r="5" fill="hsl(220, 20%, 15%)" stroke={colors.accent} strokeWidth="0.5" strokeOpacity={0.4} />
        <circle cx="118" cy="175" r="5" fill="hsl(220, 20%, 15%)" stroke={colors.accent} strokeWidth="0.5" strokeOpacity={0.4} />
      </g>
    </svg>
  );
};
