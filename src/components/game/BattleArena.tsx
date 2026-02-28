import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HealthBar from "./HealthBar";
import ParticleField from "./ParticleField";
import RobotCompanion from "./RobotCompanion";
import AnimatedRobot from "./AnimatedRobot";
import GlowButton from "./GlowButton";
import {
  DebrisField, ShockwaveRing, GroundCrack, SmokeCloud,
  EnergyShield, WeaponCharge, ExplosionFlash, HeatDistortion, DustImpact,
} from "./BattleEffects";
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
  const sparks = useMemo(() => Array.from({ length: 18 }).map((_, i) => ({
    id: i, x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200,
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
    animate={{ width: "50%", opacity: [0, 1, 1, 0], height: ["3px", "12px", "6px", "3px"] }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  />
);

/* ---------- War Intro Sequence ---------- */
const WarIntro = ({ onComplete, variant }: { onComplete: () => void; variant: "player" | "ai" }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Dark, flickering lights
      setTimeout(() => setPhase(2), 1500),  // Robot activation
      setTimeout(() => setPhase(3), 3000),  // Energy core power up
      setTimeout(() => setPhase(4), 4000),  // FIGHT text
      setTimeout(() => onComplete(), 5000), // Start battle
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      {/* Dark background with flickering */}
      <motion.div className="absolute inset-0 bg-background"
        animate={{ opacity: phase < 2 ? [0.95, 1, 0.9, 1] : 0.7 }}
        transition={{ repeat: phase < 2 ? Infinity : 0, duration: 0.3 }} />

      {/* Sparks falling */}
      {phase >= 1 && Array.from({ length: 12 }).map((_, i) => (
        <motion.div key={`intro-spark-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: "hsl(45 100% 60%)",
            boxShadow: "0 0 4px hsl(45 100% 60%)",
            left: `${10 + Math.random() * 80}%`,
            top: "-5%",
          }}
          animate={{ y: [0, window.innerHeight * 1.2], opacity: [1, 0.8, 0] }}
          transition={{ duration: 1.5 + Math.random(), delay: i * 0.15, ease: "easeIn" }}
        />
      ))}

      {/* Robot silhouette emerging */}
      {phase >= 2 && (
        <motion.div className="relative z-10"
          initial={{ scale: 0.3, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
          <AnimatedRobot mood="excited" size={200} variant="player" />
        </motion.div>
      )}

      {/* Energy core burst */}
      {phase >= 3 && (
        <motion.div className="absolute inset-0 z-5 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, hsl(195 100% 50% / 0.15), transparent 50%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.3], scale: [0.5, 1.5, 1] }}
          transition={{ duration: 1 }} />
      )}

      {/* FIGHT text */}
      {phase >= 4 && (
        <motion.div className="absolute inset-0 z-20 flex items-center justify-center">
          <motion.span className="font-display text-6xl md:text-8xl text-primary"
            style={{ textShadow: "0 0 60px hsl(195 100% 50% / 0.8), 0 0 120px hsl(195 100% 50% / 0.4)" }}
            initial={{ scale: 4, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.8 }}>
            ⚔️ FIGHT! ⚔️
          </motion.span>
        </motion.div>
      )}

      {/* Scan lines */}
      <div className="absolute inset-0 scanline opacity-30 pointer-events-none z-30" />
    </motion.div>
  );
};

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

  // Animation states
  const [showBeam, setShowBeam] = useState<"left-to-right" | "right-to-left" | null>(null);
  const [showSparks, setShowSparks] = useState<{ side: "left" | "right"; color: "cyan" | "orange" } | null>(null);
  const [screenShake, setScreenShake] = useState(false);

  // War effects
  const [showDebris, setShowDebris] = useState<{ side: "left" | "right" } | null>(null);
  const [showShockwave, setShowShockwave] = useState<{ side: "left" | "right"; color: "cyan" | "orange" } | null>(null);
  const [showGroundCrack, setShowGroundCrack] = useState<{ side: "left" | "right" } | null>(null);
  const [showSmoke, setShowSmoke] = useState<{ side: "left" | "right" } | null>(null);
  const [showWeaponCharge, setShowWeaponCharge] = useState<"left" | "right" | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [showHeat, setShowHeat] = useState(false);
  const [showDust, setShowDust] = useState<{ side: "left" | "right" } | null>(null);
  const [playerShield, setPlayerShield] = useState(false);
  const [aiShield, setAiShield] = useState(false);
  const [playerRecoil, setPlayerRecoil] = useState<"left" | "right" | null>(null);
  const [aiRecoil, setAiRecoil] = useState<"left" | "right" | null>(null);

  // Cinematic camera
  const [cameraZoom, setCameraZoom] = useState(1);
  const [cameraX, setCameraX] = useState(0);
  const [slowMo, setSlowMo] = useState(false);

  const playerDamageLevel = 1 - playerHP / maxPlayerHP;
  const aiDamageLevel = 1 - aiHP / maxAiHP;

  const addLog = useCallback((msg: string) => {
    setBattleLog(prev => [...prev.slice(-6), msg]);
  }, []);

  useEffect(() => { startBattleMusic(); return () => stopBattleMusic(); }, []);

  useEffect(() => {
    const hpRatio = playerHP / maxPlayerHP;
    setMusicIntensity(hpRatio < 0.3 ? 1.0 : hpRatio < 0.6 ? 0.7 : 0.4);
  }, [playerHP, maxPlayerHP]);

  // Distant explosions ambient
  useEffect(() => {
    if (phase === "player-turn" || phase === "ai-attack") {
      const interval = setInterval(() => sounds.distantExplosion(), 5000 + Math.random() * 5000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // War intro complete
  const handleIntroComplete = useCallback(() => {
    sounds.fightStart();
    setPhase("ai-attack");
  }, [sounds]);

  // Helper to trigger full impact effects
  const triggerImpact = (side: "left" | "right", color: "cyan" | "orange") => {
    setShowSparks({ side, color });
    setShowDebris({ side });
    setShowShockwave({ side, color });
    setShowGroundCrack({ side });
    setShowSmoke({ side });
    setShowDust({ side });
    setShowFlash(true);
    setShowHeat(true);
    setScreenShake(true);
    if (side === "left") { setPlayerRecoil("left"); } else { setAiRecoil("right"); }

    sounds.heavyImpact(side);

    setTimeout(() => {
      setShowSparks(null); setShowDebris(null); setShowShockwave(null);
      setShowFlash(false); setShowHeat(false); setShowDust(null);
      setScreenShake(false);
      setPlayerRecoil(null); setAiRecoil(null);
    }, 800);
    setTimeout(() => { setShowSmoke(null); setShowGroundCrack(null); }, 2000);
  };

  // AI attacks
  useEffect(() => {
    if (phase !== "ai-attack") return;
    const timer = setTimeout(() => {
      const [min, max] = aiDamageRange[difficulty];
      const dmg = Math.floor(Math.random() * (max - min + 1)) + min;

      setAiRobotMood("excited");
      // Weapon charge
      setShowWeaponCharge("right");
      sounds.weaponCharge(0.6);
      setCameraZoom(1.1);
      setCameraX(15);

      setTimeout(() => {
        setShowWeaponCharge(null);
        setShowBeam("right-to-left");
        sounds.beam("right");
        setCameraZoom(1);
        setCameraX(0);

        setTimeout(() => {
          setShowBeam(null);
          triggerImpact("left", "orange");
          setPlayerRobotMood("worried");

          // Critical hit slow-mo
          const isCritical = dmg >= max - 2;
          if (isCritical) {
            setSlowMo(true);
            sounds.slowMo();
            setTimeout(() => setSlowMo(false), 600);
          }

          setPlayerHP(prev => {
            const newHP = Math.max(0, prev - dmg);
            if (newHP <= 0) {
              setRobotMood("worried");
              setRobotMsg("No... our systems are failing! 💔");
              setPlayerRobotMood("confused");
              sounds.explosion();
              setTimeout(() => setPhase("defeat"), 1200);
            }
            return newHP;
          });
          addLog(`⚔️ AI deals ${dmg} damage!${dmg >= max - 2 ? " 💥 CRITICAL!" : ""}`);
          if (playerHP - dmg <= maxPlayerHP * 0.3 && playerHP - dmg > 0) {
            setRobotMood("worried");
            setRobotMsg("Shields critical! Focus your code! 🛡️");
          }

          setTimeout(() => {
            setAiRobotMood("idle");
            setPlayerRobotMood("idle");
            sounds.coolingVent(0.6);
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
          }, 900);
        }, 400);
      }, 700);
    }, 1200);
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

      // Weapon charge + cinematic zoom
      setShowWeaponCharge("left");
      sounds.weaponCharge(-0.6);
      setCameraZoom(1.15);
      setCameraX(-20);

      setTimeout(() => {
        setShowWeaponCharge(null);
        setShowBeam("left-to-right");
        sounds.beam("left");
        setCameraZoom(1);
        setCameraX(0);

        setTimeout(() => {
          setShowBeam(null);
          triggerImpact("right", "cyan");
          setAiRobotMood("worried");

          // Slow-mo on kill shot
          const isKillShot = aiHP - challenge.damage <= 0;
          if (isKillShot) {
            setSlowMo(true);
            sounds.slowMo();
            setTimeout(() => setSlowMo(false), 800);
          }

          setAiHP(prev => {
            const newHP = Math.max(0, prev - challenge.damage);
            addLog(`💥 You deal ${challenge.damage} damage!`);
            if (newHP <= 0) {
              sounds.explosion();
              setRobotMood("celebrating");
              setRobotMsg("VICTORY! Enemy destroyed! 🏆🎉");
              setPlayerRobotMood("celebrating");
              setAiRobotMood("confused");
              const rewards = stolenCodeRewards[language];
              const reward = rewards[Math.floor(Math.random() * rewards.length)];
              setTimeout(() => onVictory(reward), 1500);
            } else {
              setRobotMood("encouraging");
              setRobotMsg("Great hit! Keep the pressure on! 💪");
              setPlayerRobotMood("happy");
              sounds.coolingVent(-0.6);
              setTimeout(() => {
                setPlayerRobotMood("idle");
                setAiRobotMood("idle");
                setPhase("ai-attack");
              }, 1000);
            }
            return newHP;
          });
        }, 400);
      }, 700);
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
      setFailCount(prev => { if (prev + 1 >= 2) setShowHint(true); return prev + 1; });
      setTimeout(() => { setPlayerRobotMood("idle"); setAiRobotMood("idle"); }, 800);
      setAnswer("");
    }
  };

  const langLabel = { python: "PYBOT", sql: "SQLBOT", cpp: "CPPBOT" }[language];

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col relative">
      <ParticleField variant="battle" />

      {/* Slow-mo overlay */}
      <AnimatePresence>
        {slowMo && (
          <motion.div className="fixed inset-0 z-[100] pointer-events-none"
            style={{ background: "radial-gradient(circle, transparent 30%, hsl(220 50% 5% / 0.5) 100%)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} />
        )}
      </AnimatePresence>

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

          {/* Robot Battle View — Cinematic Camera */}
          <motion.div
            className="flex-1 flex items-center justify-between relative min-h-[300px] rounded-lg bg-arena overflow-hidden arena-grid-floor px-6"
            animate={{
              scale: cameraZoom,
              x: cameraX,
              ...(screenShake ? { x: [cameraX, cameraX - 12, cameraX + 12, cameraX - 8, cameraX + 8, cameraX], y: [0, 6, -6, 4, -4, 0] } : {}),
            }}
            transition={screenShake ? { duration: 0.5 } : { type: "spring", stiffness: 80, damping: 20 }}
          >
            <div className="scanline absolute inset-0 pointer-events-none z-10" />
            <motion.div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 80%, hsl(195 100% 50% / 0.04), transparent 60%)" }}
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }} />

            {/* War Intro */}
            <AnimatePresence>
              {phase === "intro" && <WarIntro onComplete={handleIntroComplete} variant="player" />}
            </AnimatePresence>

            {/* Player Robot */}
            <motion.div className="relative z-20"
              initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}>
              <AnimatedRobot mood={playerRobotMood} size={150} variant="player"
                damageLevel={playerDamageLevel} showShield={playerShield} recoilDirection={playerRecoil} />
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
              <AnimatedRobot mood={aiRobotMood} size={150} variant="ai"
                damageLevel={aiDamageLevel} showShield={aiShield} recoilDirection={aiRecoil} />
            </motion.div>

            {/* All Battle Effects */}
            <AnimatePresence>{showBeam && <EnergyBeam key="beam" direction={showBeam} />}</AnimatePresence>
            <AnimatePresence>{showSparks && <SparkParticles key="sparks" side={showSparks.side} color={showSparks.color} />}</AnimatePresence>
            {showDebris && <DebrisField active side={showDebris.side} intensity={1.2} />}
            {showShockwave && <ShockwaveRing active side={showShockwave.side} color={showShockwave.color} />}
            {showGroundCrack && <GroundCrack active side={showGroundCrack.side} />}
            {showSmoke && <SmokeCloud active side={showSmoke.side} />}
            {showDust && <DustImpact active side={showDust.side} />}
            {showWeaponCharge && <WeaponCharge active side={showWeaponCharge} />}
            <ExplosionFlash active={showFlash} />
            <HeatDistortion active={showHeat} />
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
                <input value={answer}
                  onChange={e => { setAnswer(e.target.value); sounds.type(); }}
                  onKeyDown={e => e.key === "Enter" && submitAnswer()}
                  placeholder="Type your answer..."
                  className="flex-1 px-3 py-2 rounded font-mono text-sm bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  autoFocus />
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
                Initializing war systems...
              </motion.p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            {/* Damage indicators */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-secondary text-lg">🏆</span>
                <span className="font-display text-xs text-secondary tracking-wider">LEVEL {level}</span>
              </div>
              {playerDamageLevel > 0.5 && (
                <motion.span className="text-xs text-destructive font-display tracking-wider"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}>
                  ⚠️ CRITICAL
                </motion.span>
              )}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.span key={i} className={`text-lg ${i < level ? "opacity-100" : "opacity-30"}`}
                  animate={i < level ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}>⭐</motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BattleArena;
