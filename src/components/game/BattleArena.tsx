import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HealthBar from "./HealthBar";
import ParticleField from "./ParticleField";
import RobotCompanion from "./RobotCompanion";
import AnimatedRobot from "./AnimatedRobot";
import GlowButton from "./GlowButton";
import { getAIChallenge, stolenCodeRewards, type Challenge } from "@/data/challenges";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import type { RobotMood } from "./AnimatedRobot";

interface BattleArenaProps {
  language: "python" | "sql" | "cpp";
  difficulty: "easy" | "medium" | "hard";
  level: number;
  onVictory: (stolenCode: string) => void;
  onDefeat: () => void;
}

const difficultyHP = { easy: 60, medium: 80, hard: 100 };
const aiDamageRange = { easy: [5, 10], medium: [8, 15], hard: [12, 20] };

/* ---------- Spark Particles ---------- */
const SparkParticles = ({ side, color }: { side: "left" | "right"; color: "cyan" | "orange" }) => {
  const sparks = useMemo(() => Array.from({ length: 14 }).map((_, i) => ({
    id: i, x: (Math.random() - 0.5) * 160, y: (Math.random() - 0.5) * 160,
    size: Math.random() * 6 + 2, delay: Math.random() * 0.15, rotation: Math.random() * 360,
  })), []);

  return (
    <div className={`absolute z-40 ${side === "left" ? "left-[22%]" : "right-[22%]"} top-1/2 -translate-y-1/2`}>
      {sparks.map(s => (
        <motion.div key={s.id} className={color === "cyan" ? "spark" : "spark-orange"}
          style={{ width: s.size, height: s.size, position: "absolute" }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: s.x, y: s.y, opacity: 0, scale: 0, rotate: s.rotation }}
          transition={{ duration: 0.7, delay: s.delay, ease: "easeOut" }} />
      ))}
    </div>
  );
};

/* ---------- Energy Beam ---------- */
const EnergyBeam = ({ direction }: { direction: "left-to-right" | "right-to-left" }) => (
  <motion.div
    className={`absolute top-1/2 -translate-y-1/2 rounded-full ${direction === "right-to-left" ? "energy-beam-orange" : "energy-beam"}`}
    style={{ [direction === "left-to-right" ? "left" : "right"]: "25%", zIndex: 35, height: "3px" }}
    initial={{ width: 0, opacity: 0 }}
    animate={{ width: "50%", opacity: [0, 1, 1, 0], height: ["3px", "8px", "3px"] }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  />
);

/* ---------- Main Component ---------- */
const BattleArena = ({ language, difficulty, level, onVictory, onDefeat }: BattleArenaProps) => {
  const maxPlayerHP = 100;
  const maxAiHP = difficultyHP[difficulty];
  const { sounds, startBattleMusic, stopBattleMusic, setMusicIntensity } = useSoundEngine();

  const [playerHP, setPlayerHP] = useState(maxPlayerHP);
  const [aiHP, setAiHP] = useState(maxAiHP);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<"intro" | "ai-attack" | "player-turn" | "result" | "victory" | "defeat">("intro");
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [failCount, setFailCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [robotMood, setRobotMood] = useState<RobotMood>("idle");
  const [robotMsg, setRobotMsg] = useState("Systems online. Scanning opponent... 🤖");
  const [playerRobotMood, setPlayerRobotMood] = useState<RobotMood>("idle");
  const [aiRobotMood, setAiRobotMood] = useState<RobotMood>("idle");
  const [showBeam, setShowBeam] = useState<"left-to-right" | "right-to-left" | null>(null);
  const [showSparks, setShowSparks] = useState<{ side: "left" | "right"; color: "cyan" | "orange" } | null>(null);
  const [screenShake, setScreenShake] = useState(false);

  const addLog = useCallback((msg: string) => {
    setBattleLog(prev => [...prev.slice(-6), msg]);
  }, []);

  // Start/stop battle music
  useEffect(() => {
    startBattleMusic();
    return () => stopBattleMusic();
  }, []);

  // Adjust music intensity based on HP
  useEffect(() => {
    const hpRatio = playerHP / maxPlayerHP;
    setMusicIntensity(hpRatio < 0.3 ? 1.0 : hpRatio < 0.6 ? 0.7 : 0.4);
  }, [playerHP, maxPlayerHP]);

  // Battle intro
  useEffect(() => {
    if (phase === "intro") {
      setPlayerRobotMood("thinking");
      setAiRobotMood("idle");
      sounds.fightStart();
      const t = setTimeout(() => {
        setRobotMsg("Enemy detected! Prepare for combat! ⚡");
        setRobotMood("worried");
        setAiRobotMood("excited");
        setTimeout(() => setPhase("ai-attack"), 1500);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // AI attacks first
  useEffect(() => {
    if (phase !== "ai-attack") return;
    const timer = setTimeout(() => {
      const [min, max] = aiDamageRange[difficulty];
      const dmg = Math.floor(Math.random() * (max - min + 1)) + min;

      setAiRobotMood("excited");
      setTimeout(() => {
        setShowBeam("right-to-left");
        sounds.beam("right");
        setTimeout(() => {
          setShowBeam(null);
          setShowSparks({ side: "left", color: "orange" });
          sounds.impact("left");
          setPlayerRobotMood("worried");
          setScreenShake(true);
          setPlayerHP(prev => {
            const newHP = Math.max(0, prev - dmg);
            if (newHP <= 0) {
              setRobotMood("worried");
              setRobotMsg("No... our systems are failing! 💔");
              setPlayerRobotMood("confused");
              setTimeout(() => setPhase("defeat"), 800);
            }
            return newHP;
          });
          addLog(`⚔️ AI deals ${dmg} damage!`);
          if (playerHP - dmg <= maxPlayerHP * 0.3 && playerHP - dmg > 0) {
            setRobotMood("worried");
            setRobotMsg("Shields critical! Focus your code! 🛡️");
          }

          setTimeout(() => {
            setAiRobotMood("idle");
            setPlayerRobotMood("idle");
            setShowSparks(null);
            setScreenShake(false);
            if (playerHP - dmg > 0) {
              setRobotMood("thinking");
              setRobotMsg("Analyzing... Your turn, Commander! 🎯");
              getAIChallenge(language, difficulty).then(c => {
                setChallenge(c);
                setAnswer("");
                setShowHint(false);
                setPhase("player-turn");
              });
            }
          }, 700);
        }, 400);
      }, 600);
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, difficulty, language, addLog, playerHP, maxPlayerHP]);

  const submitAnswer = () => {
    if (!challenge) return;
    const isCorrect = answer.trim().toLowerCase() === challenge.answer.toLowerCase();

    if (isCorrect) {
      sounds.correct();
      setRobotMood("happy");
      setRobotMsg("Perfect code! Firing weapons! 🔥");
      setPlayerRobotMood("excited");
      setTimeout(() => {
        setShowBeam("left-to-right");
        sounds.beam("left");
        setTimeout(() => {
          setShowBeam(null);
          setShowSparks({ side: "right", color: "cyan" });
          sounds.impact("right");
          setAiRobotMood("worried");
          setScreenShake(true);
          setAiHP(prev => {
            const newHP = Math.max(0, prev - challenge.damage);
            addLog(`💥 You deal ${challenge.damage} damage!`);
            if (newHP <= 0) {
              setRobotMood("celebrating");
              setRobotMsg("VICTORY! Enemy destroyed! 🏆🎉");
              setPlayerRobotMood("celebrating");
              setAiRobotMood("confused");
              const rewards = stolenCodeRewards[language];
              const reward = rewards[Math.floor(Math.random() * rewards.length)];
              setTimeout(() => onVictory(reward), 1200);
            } else {
              setRobotMood("encouraging");
              setRobotMsg("Great hit! Keep the pressure on! 💪");
              setPlayerRobotMood("happy");
              setTimeout(() => {
                setPlayerRobotMood("idle");
                setAiRobotMood("idle");
                setPhase("ai-attack");
              }, 800);
            }
            return newHP;
          });
          setTimeout(() => { setShowSparks(null); setScreenShake(false); }, 600);
        }, 400);
      }, 500);
      setFailCount(0);
    } else {
      sounds.wrong();
      sounds.damage();
      addLog("❌ Wrong answer! You take 5 damage.");
      setPlayerRobotMood("confused");
      setAiRobotMood("happy");
      setPlayerHP(prev => Math.max(0, prev - 5));
      setRobotMood("encouraging");
      setRobotMsg(failCount >= 1 ? "Here's a hint to help! Don't give up! 💡" : "Not quite! Try again, you're close! 🤔");
      setFailCount(prev => {
        if (prev + 1 >= 2) setShowHint(true);
        return prev + 1;
      });
      setTimeout(() => { setPlayerRobotMood("idle"); setAiRobotMood("idle"); }, 800);
      setAnswer("");
    }
  };

  const langLabel = { python: "PYBOT", sql: "SQLBOT", cpp: "CPPBOT" }[language];

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col relative">
      <ParticleField variant="battle" />

      {/* Header */}
      <motion.div className="text-center mb-4 relative z-10" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="font-display text-2xl md:text-3xl text-primary tracking-widest"
          style={{ textShadow: "0 0 30px hsl(195 100% 50% / 0.4)" }}>
          CODE ARENA BATTLES
        </h1>
        <p className="text-muted-foreground text-sm font-body">
          Level {level} • {difficulty.toUpperCase()} • {language.toUpperCase()}
        </p>
      </motion.div>

      {/* Battle Area */}
      <div className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
        {/* Arena Panel */}
        <div className="lg:col-span-2 arena-panel p-4 flex flex-col"
          style={{ boxShadow: "0 0 30px hsl(195 100% 50% / 0.05)" }}>
          {/* Health Bars */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <HealthBar current={playerHP} max={maxPlayerHP} label={langLabel} variant="player" />
            <HealthBar current={aiHP} max={maxAiHP} label="AI-BOT" variant="ai" />
          </div>

          {/* Robot Battle View */}
          <motion.div
            className="flex-1 flex items-center justify-between relative min-h-[280px] rounded-lg bg-arena overflow-hidden arena-grid-floor px-6"
            animate={screenShake ? { x: [0, -10, 10, -6, 6, 0], y: [0, 5, -5, 3, -3, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="scanline absolute inset-0 pointer-events-none z-10" />
            <motion.div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 80%, hsl(195 100% 50% / 0.04), transparent 60%)" }}
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }} />

            {/* Battle Intro */}
            <AnimatePresence>
              {phase === "intro" && (
                <motion.div className="absolute inset-0 z-50 flex items-center justify-center"
                  initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.span className="font-display text-4xl md:text-6xl text-primary"
                    style={{ textShadow: "0 0 40px hsl(195 100% 50% / 0.8)" }}
                    initial={{ scale: 3, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.5 }}>
                    FIGHT!
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Player Robot */}
            <motion.div className="relative z-20"
              initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}>
              <AnimatedRobot mood={playerRobotMood} size={140} variant="player" />
            </motion.div>

            {/* Status Badge */}
            <div className="z-20 flex flex-col items-center gap-2">
              <AnimatePresence mode="wait">
                {phase === "ai-attack" && (
                  <motion.div key="atk" initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                    className="px-4 py-2 rounded-lg border border-secondary/50 bg-secondary/10">
                    <span className="font-display text-lg md:text-xl text-secondary tracking-wider"
                      style={{ textShadow: "0 0 20px hsl(25 95% 55% / 0.5)" }}>⚡ ATTACKING!</span>
                  </motion.div>
                )}
                {phase === "player-turn" && (
                  <motion.div key="turn" initial={{ scale: 0, rotate: 10 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                    className="px-4 py-2 rounded-lg border border-primary/50 bg-primary/10">
                    <span className="font-display text-lg md:text-xl text-primary tracking-wider"
                      style={{ textShadow: "0 0 20px hsl(195 100% 50% / 0.5)" }}>🎯 YOUR TURN</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.span className="font-display text-xs text-muted-foreground tracking-[0.3em]"
                animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>VS</motion.span>
            </div>

            {/* AI Robot */}
            <motion.div className="relative z-20"
              initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}>
              <AnimatedRobot mood={aiRobotMood} size={140} variant="ai" />
            </motion.div>

            {/* Effects */}
            <AnimatePresence>
              {showBeam && <EnergyBeam key="beam" direction={showBeam} />}
            </AnimatePresence>
            <AnimatePresence>
              {showSparks && <SparkParticles key="sparks" side={showSparks.side} color={showSparks.color} />}
            </AnimatePresence>
            <AnimatePresence>
              {showSparks && (
                <>
                  <motion.div key="ring1" className={`absolute z-30 w-24 h-24 rounded-full border-2 ${showSparks.color === "cyan" ? "border-primary/60" : "border-secondary/60"} ${showSparks.side === "left" ? "left-[18%]" : "right-[18%]"} top-1/2 -translate-y-1/2`}
                    initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 0.6 }} />
                  <motion.div key="ring2" className={`absolute z-30 w-16 h-16 rounded-full border ${showSparks.color === "cyan" ? "border-primary/40" : "border-secondary/40"} ${showSparks.side === "left" ? "left-[20%]" : "right-[20%]"} top-1/2 -translate-y-1/2`}
                    initial={{ scale: 0, opacity: 1 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.7, delay: 0.1 }} />
                </>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Robot Companion */}
          <motion.div className="mt-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <RobotCompanion mood={robotMood} message={robotMsg} size="sm" />
          </motion.div>

          {/* Code Challenge */}
          {phase === "player-turn" && challenge && (
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="mt-4 p-4 rounded-lg border border-border"
              style={{ background: "hsl(var(--code-bg))", boxShadow: "0 0 20px hsl(195 100% 50% / 0.05)" }}>
              <p className="text-sm text-muted-foreground mb-2 font-body">⚡ {challenge.prompt}</p>
              <pre className="font-mono text-sm md:text-base text-foreground mb-3 whitespace-pre-wrap">
                {challenge.codeTemplate.replace("___", "▯▯▯")}
              </pre>
              {showHint && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-accent mb-2 font-body">💡 Hint: {challenge.hint}</motion.p>
              )}
              <div className="flex gap-2">
                <input
                  value={answer}
                  onChange={e => { setAnswer(e.target.value); sounds.type(); }}
                  onKeyDown={e => e.key === "Enter" && submitAnswer()}
                  placeholder="Type your answer..."
                  className="flex-1 px-3 py-2 rounded font-mono text-sm bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  autoFocus
                />
                <GlowButton variant="primary" size="sm" onClick={submitAnswer}>
                  Execute ⚡
                </GlowButton>
              </div>
            </motion.div>
          )}
        </div>

        {/* Side Panel */}
        <motion.div className="arena-panel p-4 flex flex-col" initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display text-sm text-primary mb-3 tracking-wider"
            style={{ textShadow: "0 0 15px hsl(195 100% 50% / 0.3)" }}>BATTLE LOG</h3>
          <div className="flex-1 space-y-2 overflow-y-auto">
            <AnimatePresence>
              {battleLog.map((log, i) => (
                <motion.div key={`${i}-${log}`} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  className="text-xs font-mono text-muted-foreground border-l-2 border-border pl-2 py-1">{log}</motion.div>
              ))}
            </AnimatePresence>
            {battleLog.length === 0 && (
              <motion.p className="text-xs text-muted-foreground italic"
                animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}>
                Initializing battle systems...
              </motion.p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-secondary text-lg">🏆</span>
              <span className="font-display text-xs text-secondary tracking-wider">LEVEL {level}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.span key={i} className={`text-lg ${i < level ? "opacity-100" : "opacity-30"}`}
                  animate={i < level ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}>⭐</motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BattleArena;
