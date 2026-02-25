import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BattleArena from "@/components/game/BattleArena";
import GlowButton from "@/components/game/GlowButton";
import ParticleField from "@/components/game/ParticleField";

type GameScreen = "language" | "difficulty" | "battle" | "victory" | "defeat";
type Language = "python" | "sql" | "cpp";
type Difficulty = "easy" | "medium" | "hard";

const languages = [
  { id: "python" as const, label: "Python", icon: "🐍", desc: "Versatile & beginner-friendly" },
  { id: "sql" as const, label: "SQL", icon: "🗄️", desc: "Database query power" },
  { id: "cpp" as const, label: "C++", icon: "⚡", desc: "Raw performance" },
];

const difficulties = [
  { id: "easy" as const, label: "Easy", stars: 1, color: "text-accent" },
  { id: "medium" as const, label: "Intermediate", stars: 2, color: "text-secondary" },
  { id: "hard" as const, label: "Hard", stars: 3, color: "text-destructive" },
];

const pageTransition = {
  initial: { opacity: 0, y: 40, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.98 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const Game = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<GameScreen>("language");
  const [language, setLanguage] = useState<Language>("python");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [level, setLevel] = useState(1);
  const [stolenCodes, setStolenCodes] = useState<string[]>([]);
  const [lastReward, setLastReward] = useState("");

  if (screen === "battle") {
    return (
      <BattleArena
        language={language}
        difficulty={difficulty}
        level={level}
        onVictory={(code) => {
          setLastReward(code);
          setStolenCodes(prev => [...prev, code]);
          setScreen("victory");
        }}
        onDefeat={() => setScreen("defeat")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleField variant="ambient" />

      <AnimatePresence mode="wait">
        {/* Language Select */}
        {screen === "language" && (
          <motion.div key="lang" {...pageTransition} className="text-center max-w-lg w-full relative z-10">
            <motion.h2
              className="font-display text-2xl md:text-3xl text-primary mb-2 tracking-widest"
              style={{ textShadow: "0 0 30px hsl(195 100% 50% / 0.4)" }}
            >
              SELECT LANGUAGE
            </motion.h2>
            <p className="text-muted-foreground text-sm mb-8 font-body">Choose your weapon</p>
            <div className="grid gap-4">
              {languages.map((lang, i) => (
                <motion.button
                  key={lang.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  onClick={() => { setLanguage(lang.id); setScreen("difficulty"); }}
                  className="arena-panel p-5 flex items-center gap-4 hover:neon-border transition-all duration-300 group cursor-pointer"
                  whileHover={{ x: 8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    className="text-4xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  >
                    {lang.icon}
                  </motion.span>
                  <div className="text-left">
                    <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
                      {lang.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{lang.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => navigate("/")}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
            >
              ← Back to menu
            </button>
          </motion.div>
        )}

        {/* Difficulty Select */}
        {screen === "difficulty" && (
          <motion.div key="diff" {...pageTransition} className="text-center max-w-lg w-full relative z-10">
            <motion.h2
              className="font-display text-2xl md:text-3xl text-primary mb-2 tracking-widest"
              style={{ textShadow: "0 0 30px hsl(195 100% 50% / 0.4)" }}
            >
              CHOOSE DIFFICULTY
            </motion.h2>
            <p className="text-muted-foreground text-sm mb-8 font-body">How brave are you?</p>
            <div className="grid gap-4">
              {difficulties.map((diff, i) => (
                <motion.button
                  key={diff.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  onClick={() => { setDifficulty(diff.id); setScreen("battle"); }}
                  className="arena-panel p-5 flex items-center justify-between hover:neon-border transition-all duration-300 cursor-pointer"
                  whileHover={{ x: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={`font-display text-lg ${diff.color}`}>{diff.label}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: diff.stars }).map((_, j) => (
                      <motion.span
                        key={j}
                        className="text-xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3, delay: j * 0.2 }}
                      >
                        ⭐
                      </motion.span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => setScreen("language")}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
            >
              ← Change language
            </button>
          </motion.div>
        )}

        {/* Victory */}
        {screen === "victory" && (
          <motion.div key="victory" {...pageTransition} className="text-center max-w-md w-full relative z-10">
            <ParticleField variant="victory" />
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
            <h2 className="font-display text-3xl text-secondary mb-2 tracking-widest"
              style={{ textShadow: "0 0 30px hsl(25 95% 55% / 0.5)" }}>
              VICTORY!
            </h2>
            <p className="text-foreground font-body mb-4">Level {level} Complete!</p>
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.span key={i} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.2, type: "spring" }} className="text-3xl">⭐</motion.span>
              ))}
            </div>
            <motion.div
              className="arena-panel p-4 mb-6 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="font-display text-sm text-accent mb-2"
                style={{ textShadow: "0 0 15px hsl(150 80% 45% / 0.4)" }}>
                🔓 CODE STOLEN!
              </h3>
              <pre className="font-mono text-sm text-foreground bg-muted/50 p-2 rounded">{lastReward}</pre>
            </motion.div>
            <div className="flex gap-3 justify-center">
              <GlowButton variant="primary" onClick={() => { setLevel(prev => prev + 1); setScreen("battle"); }}>
                Next Level →
              </GlowButton>
              <GlowButton variant="ghost" onClick={() => navigate("/")}>Menu</GlowButton>
            </div>
          </motion.div>
        )}

        {/* Defeat */}
        {screen === "defeat" && (
          <motion.div key="defeat" {...pageTransition} className="text-center max-w-md w-full relative z-10">
            <motion.div className="text-6xl mb-4" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              💀
            </motion.div>
            <h2 className="font-display text-3xl text-destructive mb-2 tracking-widest"
              style={{ textShadow: "0 0 30px hsl(0 80% 55% / 0.5)" }}>
              DEFEATED
            </h2>
            <p className="text-muted-foreground font-body mb-6">The AI was too strong this time...</p>
            <div className="flex gap-3 justify-center">
              <GlowButton variant="secondary" onClick={() => setScreen("battle")}>Retry</GlowButton>
              <GlowButton variant="ghost" onClick={() => navigate("/")}>Menu</GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
