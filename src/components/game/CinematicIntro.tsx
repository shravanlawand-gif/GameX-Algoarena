import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => setPhase(4), 4800),
      setTimeout(() => onComplete(), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Radial pulse background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(195 100% 50% / 0.05), transparent 60%)",
        }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
      />

      {/* Horizontal scan lines */}
      {phase >= 1 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 h-px bg-primary/40"
              style={{ top: `${(i / 20) * 100}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.05, duration: 0.6 }}
            />
          ))}
        </motion.div>
      )}

      {/* Phase 1: System boot */}
      <AnimatePresence>
        {phase >= 1 && phase < 3 && (
          <motion.div
            className="absolute top-8 left-8 font-mono text-xs text-primary/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
              &gt; INITIALIZING NEURAL CORE...
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              &gt; LOADING COMBAT PROTOCOLS...
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              &gt; ARENA SYSTEMS: <span className="text-accent">ONLINE</span>
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Title reveal */}
      <div className="text-center z-10">
        <AnimatePresence>
          {phase >= 2 && (
            <>
              <motion.h1
                initial={{ y: 40, opacity: 0, letterSpacing: "0.5em" }}
                animate={{ y: 0, opacity: 1, letterSpacing: "0.3em" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-5xl md:text-7xl lg:text-8xl text-primary mb-2"
                style={{ textShadow: "0 0 40px hsl(195 100% 50% / 0.6), 0 0 80px hsl(195 100% 50% / 0.3)" }}
              >
                CODE ARENA
              </motion.h1>
              <motion.h2
                initial={{ y: 20, opacity: 0, letterSpacing: "1em" }}
                animate={{ y: 0, opacity: 1, letterSpacing: "0.5em" }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-2xl md:text-4xl text-secondary"
                style={{ textShadow: "0 0 30px hsl(25 95% 55% / 0.5)" }}
              >
                BATTLES
              </motion.h2>
            </>
          )}
        </AnimatePresence>

        {/* Phase 3: Tagline */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="mt-6 text-muted-foreground font-body text-lg tracking-wide"
            >
              Write code. Defeat robots. Steal their skills.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Phase 4: Enter prompt */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-8"
            >
              <span className="font-display text-xs text-primary/60 tracking-[0.4em] uppercase">
                Entering Arena...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corner decorations */}
      {phase >= 2 && (
        <>
          <motion.div
            className="absolute top-6 right-6 w-16 h-16 border-t border-r border-primary/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-6 left-6 w-16 h-16 border-b border-l border-primary/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          />
        </>
      )}
    </motion.div>
  );
};

export default CinematicIntro;
