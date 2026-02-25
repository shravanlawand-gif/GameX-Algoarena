import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type RobotMood = "idle" | "happy" | "thinking" | "excited" | "confused" | "celebrating" | "worried" | "encouraging";

interface AnimatedRobotProps {
  mood?: RobotMood;
  size?: number;
  variant?: "player" | "ai";
  className?: string;
}

const AnimatedRobot = ({ mood = "idle", size = 160, variant = "player", className = "" }: AnimatedRobotProps) => {
  const [blinkState, setBlinkState] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const robotRef = useRef<HTMLDivElement>(null);

  // Blinking
  useEffect(() => {
    const blink = () => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Eye tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!robotRef.current) return;
      const rect = robotRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 300));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 300));
      setMousePos({ x: dx, y: dy });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const isPlayer = variant === "player";
  const baseHue = isPlayer ? 195 : 25;
  const baseColor = isPlayer ? "hsl(195 100% 50%)" : "hsl(25 95% 55%)";
  const baseDimColor = isPlayer ? "hsl(195 100% 30%)" : "hsl(25 95% 35%)";

  // Mood-based animation params
  const moodConfig = useMemo(() => ({
    idle: { glowIntensity: 0.4, bobSpeed: 3, bobAmount: 6, headTilt: 0, coreSpeed: 2 },
    happy: { glowIntensity: 0.7, bobSpeed: 2, bobAmount: 8, headTilt: 3, coreSpeed: 1.5 },
    thinking: { glowIntensity: 0.3, bobSpeed: 4, bobAmount: 3, headTilt: -8, coreSpeed: 3 },
    excited: { glowIntensity: 1, bobSpeed: 1.2, bobAmount: 12, headTilt: 0, coreSpeed: 0.8 },
    confused: { glowIntensity: 0.2, bobSpeed: 5, bobAmount: 4, headTilt: 12, coreSpeed: 4 },
    celebrating: { glowIntensity: 1, bobSpeed: 0.8, bobAmount: 14, headTilt: 0, coreSpeed: 0.6 },
    worried: { glowIntensity: 0.25, bobSpeed: 4, bobAmount: 3, headTilt: -4, coreSpeed: 3.5 },
    encouraging: { glowIntensity: 0.6, bobSpeed: 2.5, bobAmount: 7, headTilt: 5, coreSpeed: 1.8 },
  }), []);

  const config = moodConfig[mood];
  const eyeScaleY = blinkState ? 0.1 : 1;

  // LED expression based on mood
  const ledExpression = {
    idle: "M 35 58 Q 50 62 65 58",       // slight smile
    happy: "M 32 55 Q 50 68 68 55",       // big smile
    thinking: "M 35 60 L 65 58",          // flat/focused
    excited: "M 30 54 Q 50 70 70 54",     // wide grin
    confused: "M 35 62 Q 50 55 65 62",    // wavy confused
    celebrating: "M 28 52 Q 50 72 72 52", // huge grin
    worried: "M 35 62 Q 50 58 65 62",     // slight frown
    encouraging: "M 33 56 Q 50 65 67 56", // warm smile
  }[mood];

  return (
    <div ref={robotRef} className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${baseColor}, transparent 65%)` }}
        animate={{
          opacity: [config.glowIntensity * 0.3, config.glowIntensity * 0.6, config.glowIntensity * 0.3],
          scale: [1, 1.15, 1],
        }}
        transition={{ repeat: Infinity, duration: config.coreSpeed, ease: "easeInOut" }}
      />

      {/* Holographic rings (thinking mode) */}
      <AnimatePresence>
        {mood === "thinking" && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div
                key={`holo-${i}`}
                className="absolute rounded-full border pointer-events-none"
                style={{
                  borderColor: `${baseColor}`,
                  opacity: 0.2,
                  top: "10%",
                  left: "10%",
                  right: "10%",
                  bottom: "10%",
                }}
                initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.3, 0],
                  rotate: [i * 120, i * 120 + 360],
                  scale: [0.9 + i * 0.15, 1.1 + i * 0.15],
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ repeat: Infinity, duration: 3, delay: i * 0.4, ease: "linear" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main robot body */}
      <motion.div
        className="w-full h-full"
        animate={{
          y: [-config.bobAmount / 2, config.bobAmount / 2, -config.bobAmount / 2],
          rotate: [0, config.headTilt * 0.3, 0],
        }}
        transition={{ repeat: Infinity, duration: config.bobSpeed, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: `drop-shadow(0 0 12px ${baseColor})` }}>
          <defs>
            <radialGradient id={`core-${variant}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={baseColor} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id={`body-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(220 40% 18%)" />
              <stop offset="100%" stopColor="hsl(220 45% 10%)" />
            </linearGradient>
          </defs>

          {/* Antenna */}
          <motion.g
            animate={{ rotate: mood === "excited" ? [-5, 5, -5] : [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: mood === "excited" ? 0.4 : 2 }}
            style={{ transformOrigin: "50px 18px" }}
          >
            <line x1="50" y1="18" x2="50" y2="8" stroke={baseDimColor} strokeWidth="1.5" />
            <motion.circle
              cx="50" cy="6" r="2.5"
              fill={baseColor}
              animate={{ opacity: [0.5, 1, 0.5], r: [2, 3, 2] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.g>

          {/* Head */}
          <motion.g
            animate={{
              rotate: config.headTilt + mousePos.x * 4,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{ transformOrigin: "50px 35px" }}
          >
            <rect x="28" y="18" width="44" height="32" rx="8" fill={`url(#body-${variant})`}
              stroke={baseDimColor} strokeWidth="1" />

            {/* Visor */}
            <rect x="32" y="24" width="36" height="16" rx="4" fill="hsl(220 50% 6%)"
              stroke={baseDimColor} strokeWidth="0.5" />

            {/* Eyes */}
            <motion.g
              animate={{ x: mousePos.x * 3, y: mousePos.y * 2 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.ellipse
                cx="40" cy="32" rx="4" ry={4 * eyeScaleY}
                fill={baseColor}
                animate={{
                  opacity: mood === "confused" ? [0.4, 1, 0.4] : [0.8, 1, 0.8],
                }}
                transition={{ repeat: Infinity, duration: mood === "confused" ? 0.3 : 2 }}
              />
              <motion.ellipse
                cx="60" cy="32" rx="4" ry={4 * eyeScaleY}
                fill={baseColor}
                animate={{
                  opacity: mood === "confused" ? [1, 0.4, 1] : [0.8, 1, 0.8],
                }}
                transition={{ repeat: Infinity, duration: mood === "confused" ? 0.3 : 2 }}
              />
              {/* Eye highlight */}
              <circle cx="42" cy="30" r="1.2" fill="hsl(0 0% 100% / 0.6)" />
              <circle cx="62" cy="30" r="1.2" fill="hsl(0 0% 100% / 0.6)" />
            </motion.g>

            {/* LED Mouth */}
            <motion.path
              d={ledExpression}
              fill="none"
              stroke={baseColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={false}
              animate={{ d: ledExpression, opacity: [0.6, 1, 0.6] }}
              transition={{ d: { duration: 0.4 }, opacity: { repeat: Infinity, duration: 2 } }}
            />
          </motion.g>

          {/* Neck */}
          <rect x="44" y="50" width="12" height="6" rx="2" fill="hsl(220 40% 14%)" />

          {/* Body / Torso */}
          <rect x="25" y="54" width="50" height="28" rx="6" fill={`url(#body-${variant})`}
            stroke={baseDimColor} strokeWidth="1" />

          {/* Energy Core (chest) */}
          <motion.circle
            cx="50" cy="68" r="6"
            fill={`url(#core-${variant})`}
            animate={{
              r: mood === "excited" || mood === "celebrating" ? [5, 8, 5] : [5, 6.5, 5],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ repeat: Infinity, duration: config.coreSpeed, ease: "easeInOut" }}
          />
          <motion.circle
            cx="50" cy="68" r="3"
            fill={baseColor}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: config.coreSpeed * 0.5 }}
          />

          {/* Chest lines */}
          <line x1="35" y1="60" x2="45" y2="60" stroke={baseDimColor} strokeWidth="0.5" opacity="0.5" />
          <line x1="55" y1="60" x2="65" y2="60" stroke={baseDimColor} strokeWidth="0.5" opacity="0.5" />

          {/* Left Arm */}
          <motion.g
            animate={{
              rotate: mood === "celebrating" ? [-15, 30, -15] :
                mood === "excited" ? [-10, 20, -10] :
                  mood === "encouraging" ? [0, 15, 0] :
                    [-3, 3, -3],
            }}
            transition={{
              repeat: Infinity,
              duration: mood === "celebrating" || mood === "excited" ? 0.5 : 2,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "25px 58px" }}
          >
            <rect x="12" y="56" width="14" height="5" rx="2.5" fill="hsl(220 40% 15%)"
              stroke={baseDimColor} strokeWidth="0.5" />
            {/* Hand */}
            <circle cx="12" cy="58.5" r="3.5" fill="hsl(220 40% 14%)"
              stroke={baseDimColor} strokeWidth="0.5" />
            {/* Holographic projection from hand */}
            <AnimatePresence>
              {(mood === "thinking" || mood === "celebrating") && (
                <motion.rect
                  x="4" y="52" width="10" height="7" rx="1"
                  fill="none" stroke={baseColor} strokeWidth="0.5"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0.2, 0.5, 0.2], scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ transformOrigin: "12px 58px" }}
                />
              )}
            </AnimatePresence>
          </motion.g>

          {/* Right Arm */}
          <motion.g
            animate={{
              rotate: mood === "celebrating" ? [15, -30, 15] :
                mood === "excited" ? [10, -20, 10] :
                  mood === "happy" ? [0, -10, 0] :
                    [3, -3, 3],
            }}
            transition={{
              repeat: Infinity,
              duration: mood === "celebrating" || mood === "excited" ? 0.5 : 2.3,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "75px 58px" }}
          >
            <rect x="74" y="56" width="14" height="5" rx="2.5" fill="hsl(220 40% 15%)"
              stroke={baseDimColor} strokeWidth="0.5" />
            <circle cx="88" cy="58.5" r="3.5" fill="hsl(220 40% 14%)"
              stroke={baseDimColor} strokeWidth="0.5" />
          </motion.g>

          {/* Legs */}
          <rect x="33" y="82" width="10" height="10" rx="3" fill="hsl(220 40% 13%)"
            stroke={baseDimColor} strokeWidth="0.5" />
          <rect x="57" y="82" width="10" height="10" rx="3" fill="hsl(220 40% 13%)"
            stroke={baseDimColor} strokeWidth="0.5" />

          {/* Thruster glow under feet */}
          <motion.ellipse
            cx="38" cy="94" rx="6" ry="2"
            fill={baseColor}
            animate={{ opacity: [0.2, 0.5, 0.2], ry: [1.5, 3, 1.5] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
          <motion.ellipse
            cx="62" cy="94" rx="6" ry="2"
            fill={baseColor}
            animate={{ opacity: [0.2, 0.5, 0.2], ry: [1.5, 3, 1.5] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
          />
        </svg>
      </motion.div>

      {/* Energy particles when moving/excited */}
      <AnimatePresence>
        {(mood === "excited" || mood === "celebrating") && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 3,
                  height: 3,
                  background: baseColor,
                  boxShadow: `0 0 6px ${baseColor}`,
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * size,
                  y: (Math.random() - 0.5) * size,
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1 + Math.random(),
                  delay: i * 0.15,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRobot;
