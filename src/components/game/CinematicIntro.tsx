import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedRobot from "@/components/game/AnimatedRobot";

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [phase, setPhase] = useState(0);

  const complete = useCallback(() => onComplete(), [onComplete]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2600),
      setTimeout(() => setPhase(4), 3800),
      setTimeout(() => complete(), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [complete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Radial zoom background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(195 100% 50% / 0.06), transparent 60%)",
        }}
        animate={{ scale: [1, 2, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />

      {/* Horizontal scan lines */}
      {phase >= 1 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 h-px bg-primary/30"
              style={{ top: `${(i / 30) * 100}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.03, duration: 0.4, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}

      {/* Phase 1: System boot text */}
      <AnimatePresence>
        {phase >= 1 && phase < 3 && (
          <motion.div
            className="absolute top-8 left-8 font-mono text-xs text-primary/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[
              "> INITIALIZING NEURAL CORE...",
              "> LOADING COMBAT PROTOCOLS...",
              "> CALIBRATING AI OPPONENT...",
              "> ARENA SYSTEMS: ONLINE ✓",
            ].map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
              >
                {line.includes("ONLINE") ? (
                  <>{line.replace(" ✓", "")} <span className="text-accent">✓</span></>
                ) : line}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Robot reveal + title */}
      <div className="text-center z-10 flex flex-col items-center">
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6"
            >
              <AnimatedRobot mood={phase >= 4 ? "excited" : "thinking"} size={120} variant="player" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 2 && (
            <>
              <motion.h1
                initial={{ y: 40, opacity: 0, letterSpacing: "0.6em" }}
                animate={{ y: 0, opacity: 1, letterSpacing: "0.3em" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-5xl md:text-7xl lg:text-8xl text-primary mb-2"
                style={{ textShadow: "0 0 40px hsl(195 100% 50% / 0.6), 0 0 80px hsl(195 100% 50% / 0.2)" }}
              >
                CODE ARENA
              </motion.h1>
              <motion.h2
                initial={{ y: 20, opacity: 0, letterSpacing: "1.2em" }}
                animate={{ y: 0, opacity: 1, letterSpacing: "0.5em" }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-2xl md:text-4xl text-secondary"
                style={{ textShadow: "0 0 30px hsl(25 95% 55% / 0.5)" }}
              >
                BATTLES
              </motion.h2>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "60%" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-px my-6 mx-auto"
              style={{ background: "linear-gradient(90deg, transparent, hsl(195 100% 50% / 0.5), transparent)" }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-muted-foreground font-body text-lg tracking-wide"
            >
              Write code. Defeat robots. Steal their skills.
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-6"
            >
              <span className="font-display text-xs text-primary/50 tracking-[0.4em] uppercase">
                Entering Arena...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corner decorations */}
      {phase >= 2 && (
        <>
          <motion.div className="absolute top-6 right-6 w-20 h-20 border-t border-r border-primary/20"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} />
          <motion.div className="absolute bottom-6 left-6 w-20 h-20 border-b border-l border-primary/20"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} />
          <motion.div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-secondary/20"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} />
          <motion.div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-secondary/20"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} />
        </>
      )}

      {/* Skip */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1 }}
        onClick={complete}
        className="absolute bottom-8 right-8 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        whileHover={{ opacity: 1 }}
      >
        SKIP →
      </motion.button>
    </motion.div>
  );
};

export default CinematicIntro;
