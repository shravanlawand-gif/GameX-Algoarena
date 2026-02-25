import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.png";
import ParticleField from "@/components/game/ParticleField";
import CinematicIntro from "@/components/game/CinematicIntro";
import RobotCompanion from "@/components/game/RobotCompanion";
import GlowButton from "@/components/game/GlowButton";

const Index = () => {
  const navigate = useNavigate();
  const [introComplete, setIntroComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (introComplete) {
      const t = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(t);
    }
  }, [introComplete]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center">
      {/* Cinematic Intro */}
      <AnimatePresence>
        {!introComplete && (
          <CinematicIntro onComplete={() => setIntroComplete(true)} />
        )}
      </AnimatePresence>

      {/* Particles */}
      <ParticleField variant="ambient" />

      {/* Background layers */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={showContent ? { opacity: 0.3, scale: 1 } : {}}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />

      {/* Floating light rays */}
      <motion.div
        className="absolute top-0 left-1/4 w-px h-full pointer-events-none"
        style={{ background: "linear-gradient(180deg, hsl(195 100% 50% / 0.15), transparent 60%)" }}
        animate={{ opacity: [0.3, 0.8, 0.3], x: [-20, 20, -20] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 right-1/3 w-px h-full pointer-events-none"
        style={{ background: "linear-gradient(180deg, hsl(25 95% 55% / 0.1), transparent 50%)" }}
        animate={{ opacity: [0.2, 0.6, 0.2], x: [10, -10, 10] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
      />

      {/* Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="relative z-10 text-center px-4 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Title */}
            <motion.h1
              initial={{ y: -30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl md:text-7xl lg:text-8xl tracking-widest text-primary mb-2"
              style={{ textShadow: "0 0 40px hsl(195 100% 50% / 0.5), 0 0 80px hsl(195 100% 50% / 0.2)" }}
            >
              CODE ARENA
            </motion.h1>
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-display text-2xl md:text-4xl tracking-[0.4em] text-secondary mb-4"
              style={{ textShadow: "0 0 30px hsl(25 95% 55% / 0.4)" }}
            >
              BATTLES
            </motion.h2>

            {/* Animated subtitle line */}
            <motion.div
              className="mx-auto mb-8 h-px"
              style={{ background: "linear-gradient(90deg, transparent, hsl(195 100% 50% / 0.6), transparent)" }}
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ delay: 0.6, duration: 1.2 }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-muted-foreground font-body text-lg md:text-xl mb-10 max-w-md mx-auto"
            >
              Write code. Defeat robots. Steal their skills.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <GlowButton variant="primary" size="lg" onClick={() => navigate("/game")}>
                Play Now
              </GlowButton>
              <GlowButton variant="ghost" size="lg" onClick={() => navigate("/game")}>
                Guest Mode
              </GlowButton>
            </motion.div>

            {/* Language Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-10"
            >
              {[
                { id: "python", icon: "🐍", label: "Python" },
                { id: "sql", icon: "🗄️", label: "SQL" },
                { id: "cpp", icon: "⚡", label: "C++" },
              ].map((item, i) => (
                <motion.div
                  key={item.id}
                  className="relative text-center arena-panel p-4 rounded-lg cursor-pointer overflow-hidden"
                  style={{
                    borderColor: hovered === item.id ? "hsl(195 100% 50% / 0.5)" : undefined,
                    boxShadow: hovered === item.id ? "0 0 20px hsl(195 100% 50% / 0.2), inset 0 0 20px hsl(195 100% 50% / 0.05)" : undefined,
                  }}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  whileHover={{ y: -4, scale: 1.03 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + i * 0.1, duration: 0.5 }}
                >
                  <motion.span
                    className="text-3xl block mb-2"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span className="text-xs text-muted-foreground font-display tracking-wider">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Robot Companion */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 }}
              className="flex justify-center"
            >
              <RobotCompanion
                playerName="Commander"
                mood="idle"
                message="Welcome, Commander! Ready to enter the arena? 🤖"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
