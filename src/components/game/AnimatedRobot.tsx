import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type RobotMood = "idle" | "happy" | "thinking" | "excited" | "confused" | "celebrating" | "worried" | "encouraging";

interface AnimatedRobotProps {
  mood?: RobotMood;
  size?: number;
  variant?: "player" | "ai";
  className?: string;
  damageLevel?: number; // 0-1, how damaged
  showShield?: boolean;
  recoilDirection?: "left" | "right" | null;
}

const AnimatedRobot = ({
  mood = "idle", size = 160, variant = "player", className = "",
  damageLevel = 0, showShield = false, recoilDirection = null,
}: AnimatedRobotProps) => {
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
      setMousePos({
        x: Math.max(-1, Math.min(1, (e.clientX - cx) / 300)),
        y: Math.max(-1, Math.min(1, (e.clientY - cy) / 300)),
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const isPlayer = variant === "player";
  const baseHue = isPlayer ? 195 : 25;
  const baseColor = isPlayer ? "hsl(195 100% 50%)" : "hsl(25 95% 55%)";
  const baseDimColor = isPlayer ? "hsl(195 100% 30%)" : "hsl(25 95% 35%)";
  const damageColor = "hsl(0 80% 55%)";

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
  const hasDamage = damageLevel > 0.3;
  const heavyDamage = damageLevel > 0.6;

  const ledExpression = {
    idle: "M 35 58 Q 50 62 65 58",
    happy: "M 32 55 Q 50 68 68 55",
    thinking: "M 35 60 L 65 58",
    excited: "M 30 54 Q 50 70 70 54",
    confused: "M 35 62 Q 50 55 65 62",
    celebrating: "M 28 52 Q 50 72 72 52",
    worried: "M 35 62 Q 50 58 65 62",
    encouraging: "M 33 56 Q 50 65 67 56",
  }[mood];

  // Recoil animation
  const recoilX = recoilDirection === "left" ? -15 : recoilDirection === "right" ? 15 : 0;

  return (
    <div ref={robotRef} className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${hasDamage ? damageColor : baseColor}, transparent 65%)` }}
        animate={{
          opacity: [config.glowIntensity * 0.3, config.glowIntensity * 0.6, config.glowIntensity * 0.3],
          scale: [1, 1.15, 1],
        }}
        transition={{ repeat: Infinity, duration: config.coreSpeed, ease: "easeInOut" }}
      />

      {/* Energy shield */}
      <AnimatePresence>
        {showShield && (
          <motion.div
            className="absolute inset-[-15%] rounded-full pointer-events-none z-30"
            style={{
              border: `2px solid ${baseColor}`,
              background: `radial-gradient(circle, transparent 50%, ${baseColor.replace(")", " / 0.1)")})`,
              boxShadow: `0 0 20px ${baseColor.replace(")", " / 0.3)")}, inset 0 0 20px ${baseColor.replace(")", " / 0.1)")}`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ scale: { repeat: Infinity, duration: 1.5 }, opacity: { repeat: Infinity, duration: 1.5 } }}
          />
        )}
      </AnimatePresence>

      {/* Holographic rings (thinking mode) */}
      <AnimatePresence>
        {mood === "thinking" && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div
                key={`holo-${i}`}
                className="absolute rounded-full border pointer-events-none"
                style={{ borderColor: baseColor, opacity: 0.2, top: "10%", left: "10%", right: "10%", bottom: "10%" }}
                initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.3, 0], rotate: [i * 120, i * 120 + 360], scale: [0.9 + i * 0.15, 1.1 + i * 0.15] }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ repeat: Infinity, duration: 3, delay: i * 0.4, ease: "linear" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Smoke from damage */}
      <AnimatePresence>
        {heavyDamage && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div
                key={`smoke-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 12, height: 12,
                  background: "hsl(220 10% 40% / 0.4)",
                  filter: "blur(4px)",
                  left: `${30 + i * 15}%`,
                  top: `${20 + i * 10}%`,
                }}
                animate={{ y: [0, -30, -60], opacity: [0.5, 0.3, 0], scale: [0.5, 1.5, 2] }}
                transition={{ repeat: Infinity, duration: 2 + i * 0.5, delay: i * 0.6 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main robot body with recoil */}
      <motion.div
        className="w-full h-full"
        animate={{
          y: [-config.bobAmount / 2, config.bobAmount / 2, -config.bobAmount / 2],
          rotate: [0, config.headTilt * 0.3, 0],
          x: recoilX,
        }}
        transition={{
          y: { repeat: Infinity, duration: config.bobSpeed, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: config.bobSpeed, ease: "easeInOut" },
          x: { type: "spring", stiffness: 300, damping: 15 },
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full"
          style={{
            filter: `drop-shadow(0 0 12px ${baseColor})${heavyDamage ? " drop-shadow(0 0 6px hsl(0 80% 55%))" : ""}`,
          }}
        >
          <defs>
            <radialGradient id={`core-${variant}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={baseColor} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id={`body-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(220 40% 18%)" />
              <stop offset="100%" stopColor="hsl(220 45% 10%)" />
            </linearGradient>
            <linearGradient id={`armor-${variant}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(220 30% 22%)" />
              <stop offset="50%" stopColor="hsl(220 35% 16%)" />
              <stop offset="100%" stopColor="hsl(220 40% 12%)" />
            </linearGradient>
          </defs>

          {/* Heavy Shoulder Armor */}
          <rect x="18" y="52" width="16" height="10" rx="3" fill={`url(#armor-${variant})`}
            stroke={baseDimColor} strokeWidth="0.8" />
          <rect x="66" y="52" width="16" height="10" rx="3" fill={`url(#armor-${variant})`}
            stroke={baseDimColor} strokeWidth="0.8" />
          {/* Armor detail lines */}
          <line x1="20" y1="55" x2="32" y2="55" stroke={baseDimColor} strokeWidth="0.3" opacity="0.5" />
          <line x1="68" y1="55" x2="80" y2="55" stroke={baseDimColor} strokeWidth="0.3" opacity="0.5" />

          {/* Antenna */}
          <motion.g
            animate={{ rotate: mood === "excited" ? [-5, 5, -5] : [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: mood === "excited" ? 0.4 : 2 }}
            style={{ transformOrigin: "50px 18px" }}
          >
            <line x1="50" y1="18" x2="50" y2="6" stroke={baseDimColor} strokeWidth="1.5" />
            <motion.circle cx="50" cy="4" r="2.5" fill={baseColor}
              animate={{ opacity: [0.5, 1, 0.5], r: [2, 3, 2] }}
              transition={{ repeat: Infinity, duration: 1.5 }} />
            {/* Antenna sparks when damaged */}
            {hasDamage && (
              <motion.line x1="48" y1="10" x2="46" y2="7" stroke={damageColor} strokeWidth="1"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.3, repeatDelay: 1.5 }} />
            )}
          </motion.g>

          {/* Head */}
          <motion.g
            animate={{ rotate: config.headTilt + mousePos.x * 4 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{ transformOrigin: "50px 35px" }}
          >
            <rect x="26" y="16" width="48" height="34" rx="8" fill={`url(#body-${variant})`}
              stroke={baseDimColor} strokeWidth="1" />
            {/* Heavy visor frame */}
            <rect x="30" y="22" width="40" height="18" rx="4" fill="hsl(220 50% 6%)"
              stroke={baseDimColor} strokeWidth="0.8" />
            {/* Visor glow line */}
            <motion.line x1="30" y1="22" x2="70" y2="22" stroke={baseColor} strokeWidth="0.5"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }} />

            {/* Armor crack marks when damaged */}
            {hasDamage && (
              <>
                <motion.path d="M30 20 L33 25 L31 30" stroke={damageColor} strokeWidth="0.8" fill="none"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.8 }} />
                {heavyDamage && (
                  <motion.path d="M68 18 L65 24 L67 28 L64 33" stroke={damageColor} strokeWidth="0.8" fill="none"
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.2 }} />
                )}
              </>
            )}

            {/* Eyes */}
            <motion.g
              animate={{ x: mousePos.x * 3, y: mousePos.y * 2 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.ellipse cx="40" cy="31" rx="4.5" ry={4.5 * eyeScaleY} fill={baseColor}
                animate={{ opacity: mood === "confused" ? [0.4, 1, 0.4] : [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: mood === "confused" ? 0.3 : 2 }} />
              <motion.ellipse cx="60" cy="31" rx="4.5" ry={4.5 * eyeScaleY} fill={baseColor}
                animate={{ opacity: mood === "confused" ? [1, 0.4, 1] : [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: mood === "confused" ? 0.3 : 2 }} />
              {/* Eye flicker when damaged */}
              {heavyDamage && (
                <>
                  <motion.ellipse cx="40" cy="31" rx="4.5" ry={4.5 * eyeScaleY} fill={damageColor}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.15, repeatDelay: 2 }} />
                </>
              )}
              <circle cx="42" cy="29" r="1.4" fill="hsl(0 0% 100% / 0.6)" />
              <circle cx="62" cy="29" r="1.4" fill="hsl(0 0% 100% / 0.6)" />
            </motion.g>

            {/* LED Mouth */}
            <motion.path d={ledExpression} fill="none" stroke={baseColor}
              strokeWidth="1.5" strokeLinecap="round" initial={false}
              animate={{ d: ledExpression, opacity: [0.6, 1, 0.6] }}
              transition={{ d: { duration: 0.4 }, opacity: { repeat: Infinity, duration: 2 } }} />
          </motion.g>

          {/* Neck with hydraulics */}
          <rect x="43" y="50" width="14" height="6" rx="2" fill="hsl(220 40% 14%)" />
          <line x1="46" y1="50" x2="46" y2="56" stroke="hsl(220 30% 25%)" strokeWidth="0.5" />
          <line x1="54" y1="50" x2="54" y2="56" stroke="hsl(220 30% 25%)" strokeWidth="0.5" />

          {/* Body / Torso - heavier, more armored */}
          <rect x="23" y="54" width="54" height="30" rx="6" fill={`url(#body-${variant})`}
            stroke={baseDimColor} strokeWidth="1" />
          {/* Chest armor plates */}
          <path d="M30 56 L50 56 L50 72 L30 68 Z" fill="hsl(220 35% 15%)" stroke={baseDimColor} strokeWidth="0.3" opacity="0.5" />
          <path d="M70 56 L50 56 L50 72 L70 68 Z" fill="hsl(220 35% 15%)" stroke={baseDimColor} strokeWidth="0.3" opacity="0.5" />

          {/* Damage cracks on body */}
          {hasDamage && (
            <motion.path d="M35 58 L38 64 L36 70" stroke={damageColor} strokeWidth="0.6" fill="none"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 1 }} />
          )}
          {heavyDamage && (
            <>
              <motion.path d="M62 56 L60 62 L63 68 L61 73" stroke={damageColor} strokeWidth="0.8" fill="none"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 0.6 }} />
              {/* Exposed sparks */}
              <motion.circle cx="61" cy="65" r="1" fill="hsl(45 100% 60%)"
                animate={{ opacity: [0, 1, 0], r: [0.5, 1.5, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.2, repeatDelay: 1.8 }} />
            </>
          )}

          {/* Energy Core (chest) */}
          <motion.circle cx="50" cy="68" r="7"
            fill={`url(#core-${variant})`}
            animate={{
              r: mood === "excited" || mood === "celebrating" ? [6, 9, 6] : [6, 7.5, 6],
              opacity: heavyDamage ? [0.3, 0.8, 0.3] : [0.5, 1, 0.5],
            }}
            transition={{ repeat: Infinity, duration: config.coreSpeed, ease: "easeInOut" }} />
          <motion.circle cx="50" cy="68" r="3.5" fill={baseColor}
            animate={{ opacity: heavyDamage ? [0.3, 0.9, 0.3] : [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: config.coreSpeed * 0.5 }} />
          {/* Core vulnerability indicator */}
          {heavyDamage && (
            <motion.circle cx="50" cy="68" r="9" fill="none" stroke={damageColor} strokeWidth="0.5"
              strokeDasharray="3 3"
              animate={{ opacity: [0.2, 0.6, 0.2], rotate: [0, 360] }}
              transition={{ opacity: { repeat: Infinity, duration: 1 }, rotate: { repeat: Infinity, duration: 4, ease: "linear" } }}
              style={{ transformOrigin: "50px 68px" }} />
          )}

          {/* Left Arm - heavier with weapon mount */}
          <motion.g
            animate={{
              rotate: mood === "celebrating" ? [-15, 30, -15] :
                mood === "excited" ? [-10, 20, -10] :
                mood === "encouraging" ? [0, 15, 0] : [-3, 3, -3],
            }}
            transition={{ repeat: Infinity, duration: mood === "celebrating" || mood === "excited" ? 0.5 : 2, ease: "easeInOut" }}
            style={{ transformOrigin: "23px 58px" }}
          >
            <rect x="8" y="55" width="16" height="7" rx="3" fill="hsl(220 40% 15%)" stroke={baseDimColor} strokeWidth="0.5" />
            {/* Weapon barrel */}
            <rect x="3" y="56.5" width="6" height="4" rx="1" fill="hsl(220 35% 20%)" stroke={baseDimColor} strokeWidth="0.3" />
            <circle cx="3" cy="58.5" r="1.5" fill="hsl(220 30% 12%)" stroke={baseDimColor} strokeWidth="0.3" />
            {/* Weapon glow */}
            <motion.circle cx="3" cy="58.5" r="1" fill={baseColor}
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 1.5 }} />
            {hasDamage && (
              <motion.line x1="10" y1="55" x2="12" y2="52" stroke={damageColor} strokeWidth="0.5"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ repeat: Infinity, duration: 0.4, repeatDelay: 3 }} />
            )}
          </motion.g>

          {/* Right Arm - heavier with weapon mount */}
          <motion.g
            animate={{
              rotate: mood === "celebrating" ? [15, -30, 15] :
                mood === "excited" ? [10, -20, 10] :
                mood === "happy" ? [0, -10, 0] : [3, -3, 3],
            }}
            transition={{ repeat: Infinity, duration: mood === "celebrating" || mood === "excited" ? 0.5 : 2.3, ease: "easeInOut" }}
            style={{ transformOrigin: "77px 58px" }}
          >
            <rect x="76" y="55" width="16" height="7" rx="3" fill="hsl(220 40% 15%)" stroke={baseDimColor} strokeWidth="0.5" />
            <rect x="91" y="56.5" width="6" height="4" rx="1" fill="hsl(220 35% 20%)" stroke={baseDimColor} strokeWidth="0.3" />
            <circle cx="97" cy="58.5" r="1.5" fill="hsl(220 30% 12%)" stroke={baseDimColor} strokeWidth="0.3" />
            <motion.circle cx="97" cy="58.5" r="1" fill={baseColor}
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.7 }} />
          </motion.g>

          {/* Legs - heavier, more mechanical */}
          <rect x="31" y="84" width="12" height="12" rx="3" fill="hsl(220 40% 13%)" stroke={baseDimColor} strokeWidth="0.5" />
          <rect x="57" y="84" width="12" height="12" rx="3" fill="hsl(220 40% 13%)" stroke={baseDimColor} strokeWidth="0.5" />
          {/* Knee joints */}
          <circle cx="37" cy="84" r="2" fill="hsl(220 35% 18%)" stroke={baseDimColor} strokeWidth="0.3" />
          <circle cx="63" cy="84" r="2" fill="hsl(220 35% 18%)" stroke={baseDimColor} strokeWidth="0.3" />
          {/* Foot armor */}
          <rect x="29" y="94" width="16" height="4" rx="2" fill="hsl(220 35% 16%)" stroke={baseDimColor} strokeWidth="0.3" />
          <rect x="55" y="94" width="16" height="4" rx="2" fill="hsl(220 35% 16%)" stroke={baseDimColor} strokeWidth="0.3" />

          {/* Thruster glow */}
          <motion.ellipse cx="37" cy="98" rx="7" ry="2" fill={baseColor}
            animate={{ opacity: [0.2, 0.5, 0.2], ry: [1.5, 3, 1.5] }}
            transition={{ repeat: Infinity, duration: 0.8 }} />
          <motion.ellipse cx="63" cy="98" rx="7" ry="2" fill={baseColor}
            animate={{ opacity: [0.2, 0.5, 0.2], ry: [1.5, 3, 1.5] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} />
        </svg>
      </motion.div>

      {/* Energy particles */}
      <AnimatePresence>
        {(mood === "excited" || mood === "celebrating") && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 3, height: 3, background: baseColor,
                  boxShadow: `0 0 6px ${baseColor}`, left: "50%", top: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * size,
                  y: (Math.random() - 0.5) * size,
                  opacity: [0, 0.8, 0],
                }}
                transition={{ repeat: Infinity, duration: 1 + Math.random(), delay: i * 0.15 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Damage sparks */}
      <AnimatePresence>
        {heavyDamage && (
          <>
            {[0, 1].map(i => (
              <motion.div
                key={`dmg-spark-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 2, height: 2, background: "hsl(45 100% 60%)",
                  boxShadow: "0 0 4px hsl(45 100% 60%)",
                  left: `${35 + i * 30}%`, top: `${40 + i * 10}%`,
                }}
                animate={{
                  y: [0, -15, 5, -10, 0],
                  x: [0, 5, -3, 4, 0],
                  opacity: [0, 1, 0, 0.8, 0],
                }}
                transition={{ repeat: Infinity, duration: 0.4, repeatDelay: 2 + i * 1.5 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRobot;
