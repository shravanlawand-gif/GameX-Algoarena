import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Debris Particles ---------- */
export const DebrisField = ({ active, side, intensity = 1 }: { active: boolean; side: "left" | "right"; intensity?: number }) => {
  const debris = useMemo(() => Array.from({ length: Math.floor(20 * intensity) }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 250 * intensity,
    y: -Math.random() * 200 - 20,
    size: Math.random() * 8 + 2,
    rotation: Math.random() * 720 - 360,
    delay: Math.random() * 0.3,
    type: Math.random() > 0.6 ? "metal" : "spark",
  })), [intensity]);

  return (
    <AnimatePresence>
      {active && (
        <div className={`absolute z-40 ${side === "left" ? "left-[20%]" : "right-[20%]"} top-1/2`}>
          {debris.map(d => (
            <motion.div
              key={d.id}
              className="absolute"
              style={{
                width: d.size,
                height: d.type === "metal" ? d.size * 0.5 : d.size,
                background: d.type === "metal"
                  ? "linear-gradient(135deg, hsl(220 20% 40%), hsl(220 15% 60%))"
                  : side === "left"
                    ? "hsl(25 95% 55%)"
                    : "hsl(195 100% 50%)",
                borderRadius: d.type === "metal" ? "1px" : "50%",
                boxShadow: d.type === "spark"
                  ? `0 0 ${d.size}px ${side === "left" ? "hsl(25 95% 55%)" : "hsl(195 100% 50%)"}`
                  : "none",
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
              animate={{
                x: d.x,
                y: d.y + 300,
                opacity: [1, 1, 0],
                scale: [1, 0.8, 0.3],
                rotate: d.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: d.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

/* ---------- Shockwave Ring ---------- */
export const ShockwaveRing = ({ active, side, color }: { active: boolean; side: "left" | "right"; color: "cyan" | "orange" }) => (
  <AnimatePresence>
    {active && (
      <>
        {[0, 1, 2].map(i => (
          <motion.div
            key={`shock-${i}`}
            className={`absolute z-30 rounded-full ${side === "left" ? "left-[18%]" : "right-[18%]"} top-1/2 -translate-y-1/2 -translate-x-1/2`}
            style={{
              width: 40,
              height: 40,
              border: `2px solid ${color === "cyan" ? "hsl(195 100% 50%)" : "hsl(25 95% 55%)"}`,
              boxShadow: `0 0 20px ${color === "cyan" ? "hsl(195 100% 50% / 0.4)" : "hsl(25 95% 55% / 0.4)"}`,
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4 + i, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
          />
        ))}
      </>
    )}
  </AnimatePresence>
);

/* ---------- Ground Crack Effect ---------- */
export const GroundCrack = ({ active, side }: { active: boolean; side: "left" | "right" }) => (
  <AnimatePresence>
    {active && (
      <motion.svg
        className={`absolute bottom-0 z-20 ${side === "left" ? "left-[10%]" : "right-[10%]"}`}
        width="120" height="40" viewBox="0 0 120 40"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: [0, 0.7, 0.4], scaleX: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{ transformOrigin: side === "left" ? "left center" : "right center" }}
      >
        <path d="M60 0 L55 12 L45 15 L50 25 L40 35 L35 40" stroke="hsl(195 100% 50% / 0.4)" strokeWidth="1.5" fill="none" />
        <path d="M60 0 L65 10 L70 18 L80 22 L75 32 L85 40" stroke="hsl(195 100% 50% / 0.3)" strokeWidth="1" fill="none" />
        <path d="M60 0 L58 8 L52 20 L60 30 L55 40" stroke="hsl(195 100% 50% / 0.5)" strokeWidth="2" fill="none" />
      </motion.svg>
    )}
  </AnimatePresence>
);

/* ---------- Smoke Cloud ---------- */
export const SmokeCloud = ({ active, side }: { active: boolean; side: "left" | "right" }) => {
  const clouds = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 80,
    y: -(Math.random() * 60 + 10),
    size: Math.random() * 40 + 20,
    delay: Math.random() * 0.2,
  })), []);

  return (
    <AnimatePresence>
      {active && (
        <div className={`absolute z-25 ${side === "left" ? "left-[18%]" : "right-[18%]"} top-1/2`}>
          {clouds.map(c => (
            <motion.div
              key={c.id}
              className="absolute rounded-full"
              style={{
                width: c.size,
                height: c.size,
                background: "radial-gradient(circle, hsl(220 20% 30% / 0.6), transparent)",
                filter: "blur(8px)",
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
              animate={{ x: c.x, y: c.y, opacity: [0, 0.5, 0], scale: [0.3, 1.5, 2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: c.delay }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

/* ---------- Energy Shield ---------- */
export const EnergyShield = ({ active, variant }: { active: boolean; variant: "player" | "ai" }) => {
  const color = variant === "player" ? "hsl(195 100% 50%)" : "hsl(25 95% 55%)";
  const side = variant === "player" ? "left-[15%]" : "right-[15%]";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className={`absolute ${side} top-1/2 -translate-y-1/2 z-25 pointer-events-none`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ opacity: { repeat: Infinity, duration: 1.5 }, scale: { duration: 0.3 } }}
        >
          <svg width="100" height="160" viewBox="0 0 100 160">
            <defs>
              <radialGradient id={`shield-${variant}`} cx="50%" cy="50%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="70%" stopColor={`${color}`} stopOpacity="0.05" />
                <stop offset="90%" stopColor={`${color}`} stopOpacity="0.2" />
                <stop offset="100%" stopColor={`${color}`} stopOpacity="0.4" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="80" rx="45" ry="75" fill={`url(#shield-${variant})`}
              stroke={color} strokeWidth="1.5" strokeDasharray="8 4" opacity="0.6" />
            {/* Hex grid pattern */}
            {[0, 1, 2, 3, 4].map(i => (
              <motion.polygon
                key={i}
                points="50,20 60,30 60,42 50,52 40,42 40,30"
                fill="none" stroke={color} strokeWidth="0.5" opacity="0.2"
                style={{ transform: `translate(${(i - 2) * 18}px, ${Math.abs(i - 2) * 15 + 20}px)` }}
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              />
            ))}
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ---------- Weapon Charge Effect ---------- */
export const WeaponCharge = ({ active, side }: { active: boolean; side: "left" | "right" }) => {
  const color = side === "left" ? "hsl(195 100% 50%)" : "hsl(25 95% 55%)";
  const position = side === "left" ? "left-[20%]" : "right-[20%]";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className={`absolute ${position} top-1/2 -translate-y-1/2 z-35 pointer-events-none`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Converging energy particles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 50;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 4, height: 4,
                  background: color,
                  boxShadow: `0 0 8px ${color}`,
                }}
                initial={{ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: [0, 1, 0.8] }}
                transition={{ duration: 0.6, delay: i * 0.03, ease: "easeIn" }}
              />
            );
          })}
          {/* Central charge glow */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: 20, height: 20, background: color, filter: "blur(8px)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 0.8, 0.6] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ---------- Explosion Flash ---------- */
export const ExplosionFlash = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        className="absolute inset-0 z-50 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(25 95% 55% / 0.3), transparent 60%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
    )}
  </AnimatePresence>
);

/* ---------- Heat Distortion Overlay ---------- */
export const HeatDistortion = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        className="absolute inset-0 z-45 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, hsl(25 95% 55% / 0.02) 2px, transparent 4px)",
          filter: "blur(0.5px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0], y: [0, -20, -40] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
      />
    )}
  </AnimatePresence>
);

/* ---------- Dust Impact ---------- */
export const DustImpact = ({ active, side }: { active: boolean; side: "left" | "right" }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        className={`absolute bottom-0 z-20 ${side === "left" ? "left-[10%]" : "right-[10%]"}`}
        style={{ width: 140, height: 30 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              width: 60 + i * 20,
              height: 10 + i * 5,
              background: "radial-gradient(ellipse, hsl(30 20% 30% / 0.4), transparent)",
              filter: "blur(4px)",
              left: `${(i - 1) * 15}px`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 2], opacity: [0, 0.6, 0], y: [0, -10, -25] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: i * 0.05 }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);
