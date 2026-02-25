import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ParticleField from "@/components/game/ParticleField";
import AnimatedRobot from "@/components/game/AnimatedRobot";
import GlowButton from "@/components/game/GlowButton";

/* Animated counter hook */
const useAnimatedCounter = (target: number, duration = 1500) => {
  const [val, setVal] = useState(0);
  useState(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
  });
  return val;
};

/* Stat Card */
const StatCard = ({ label, value, icon, delay }: { label: string; value: string; icon: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="arena-panel p-4 rounded-lg relative overflow-hidden group cursor-default"
    whileHover={{ y: -4, scale: 1.02 }}
  >
    <motion.div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{ background: "radial-gradient(circle at 50% 50%, hsl(195 100% 50% / 0.05), transparent 70%)" }}
    />
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-display text-lg text-primary">{value}</p>
        <p className="text-xs text-muted-foreground font-body">{label}</p>
      </div>
    </div>
  </motion.div>
);

/* Achievement Badge */
const AchievementBadge = ({ title, icon, unlocked, delay }: { title: string; icon: string; unlocked: boolean; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
    className={`relative flex flex-col items-center gap-2 p-3 rounded-lg ${unlocked ? "arena-panel" : "arena-panel opacity-40"}`}
    whileHover={unlocked ? { scale: 1.08, y: -2 } : {}}
  >
    {unlocked && (
      <motion.div
        className="absolute -inset-px rounded-lg pointer-events-none"
        style={{
          background: "linear-gradient(135deg, hsl(195 100% 50% / 0.2), transparent, hsl(25 95% 55% / 0.2))",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
      />
    )}
    <motion.span
      className="text-3xl"
      animate={unlocked ? { rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] } : {}}
      transition={{ repeat: Infinity, duration: 4 }}
    >
      {icon}
    </motion.span>
    <span className="text-xs font-display text-foreground tracking-wider text-center">{title}</span>
    {unlocked && (
      <motion.div
        className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-[8px]">✓</span>
      </motion.div>
    )}
  </motion.div>
);

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"stats" | "achievements" | "customize">("stats");

  const battlesWon = useAnimatedCounter(42);
  const totalXP = useAnimatedCounter(12850);
  const winRate = useAnimatedCounter(78);
  const streak = useAnimatedCounter(7);

  const achievements = [
    { title: "First Blood", icon: "🗡️", unlocked: true },
    { title: "Code Master", icon: "💻", unlocked: true },
    { title: "Unbreakable", icon: "🛡️", unlocked: true },
    { title: "Speed Demon", icon: "⚡", unlocked: true },
    { title: "AI Slayer", icon: "🤖", unlocked: false },
    { title: "Legend", icon: "👑", unlocked: false },
    { title: "Perfect Run", icon: "💎", unlocked: false },
    { title: "Hack King", icon: "🔓", unlocked: false },
  ];

  const xpProgress = 65; // percent to next level

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleField variant="ambient" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header with robot */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-6 mb-8"
        >
          {/* Avatar Card */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.03 }}
          >
            {/* Glowing border ring */}
            <motion.div
              className="absolute -inset-1 rounded-2xl pointer-events-none"
              style={{
                background: "linear-gradient(135deg, hsl(195 100% 50% / 0.4), hsl(25 95% 55% / 0.3), hsl(150 80% 45% / 0.3))",
              }}
              animate={{
                background: [
                  "linear-gradient(135deg, hsl(195 100% 50% / 0.4), hsl(25 95% 55% / 0.1), hsl(150 80% 45% / 0.1))",
                  "linear-gradient(135deg, hsl(195 100% 50% / 0.1), hsl(25 95% 55% / 0.4), hsl(150 80% 45% / 0.1))",
                  "linear-gradient(135deg, hsl(195 100% 50% / 0.1), hsl(25 95% 55% / 0.1), hsl(150 80% 45% / 0.4))",
                  "linear-gradient(135deg, hsl(195 100% 50% / 0.4), hsl(25 95% 55% / 0.1), hsl(150 80% 45% / 0.1))",
                ],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />

            <div className="arena-panel p-6 rounded-2xl flex flex-col items-center gap-3 relative overflow-hidden"
              style={{ backdropFilter: "blur(20px)" }}>
              {/* Glass reflection */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, hsl(0 0% 100% / 0.03), transparent 50%)",
                }}
              />

              <AnimatedRobot mood="happy" size={100} variant="player" />

              {/* XP Ring */}
              <div className="relative w-24 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute right-0 top-0 bottom-0 w-1 bg-primary"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  style={{ right: `${100 - xpProgress}%` }}
                />
              </div>
              <p className="font-display text-xs text-muted-foreground tracking-wider">LEVEL 12</p>
            </div>
          </motion.div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center md:text-left"
          >
            <h1 className="font-display text-3xl text-primary tracking-widest mb-1"
              style={{ textShadow: "0 0 20px hsl(195 100% 50% / 0.3)" }}>
              COMMANDER
            </h1>
            <p className="text-muted-foreground font-body text-sm mb-3">Code Arena Veteran • Joined Feb 2026</p>
            <div className="flex gap-3 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full text-xs font-display bg-primary/10 text-primary border border-primary/20">
                ELITE
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-display bg-secondary/10 text-secondary border border-secondary/20">
                TOP 5%
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-6"
        >
          {(["stats", "achievements", "customize"] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-display text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {tab}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="Battles Won" value={String(battlesWon)} icon="⚔️" delay={0.1} />
                <StatCard label="Total XP" value={totalXP.toLocaleString()} icon="✨" delay={0.2} />
                <StatCard label="Win Rate" value={`${winRate}%`} icon="📊" delay={0.3} />
                <StatCard label="Win Streak" value={String(streak)} icon="🔥" delay={0.4} />
              </div>

              {/* Recent History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="arena-panel p-4 rounded-lg"
              >
                <h3 className="font-display text-sm text-primary tracking-wider mb-3"
                  style={{ textShadow: "0 0 15px hsl(195 100% 50% / 0.3)" }}>
                  RECENT BATTLES
                </h3>
                {[
                  { lang: "Python", result: "WIN", dmg: 45, time: "2m 30s" },
                  { lang: "SQL", result: "WIN", dmg: 60, time: "3m 15s" },
                  { lang: "C++", result: "LOSS", dmg: 25, time: "4m 10s" },
                  { lang: "Python", result: "WIN", dmg: 80, time: "1m 45s" },
                ].map((battle, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 group cursor-default"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-display text-xs px-2 py-0.5 rounded ${
                        battle.result === "WIN" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                      }`}>
                        {battle.result}
                      </span>
                      <span className="font-body text-sm text-foreground">{battle.lang}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>💥 {battle.dmg} dmg</span>
                      <span>⏱ {battle.time}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {achievements.map((a, i) => (
                <AchievementBadge key={a.title} {...a} delay={i * 0.08} />
              ))}
            </motion.div>
          )}

          {activeTab === "customize" && (
            <motion.div
              key="customize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="arena-panel p-6 rounded-lg">
                <h3 className="font-display text-sm text-primary tracking-wider mb-4"
                  style={{ textShadow: "0 0 15px hsl(195 100% 50% / 0.3)" }}>
                  ROBOT SKINS
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {[
                    { name: "Default", unlocked: true },
                    { name: "Crimson", unlocked: true },
                    { name: "Emerald", unlocked: false },
                    { name: "Gold", unlocked: false },
                  ].map((skin, i) => (
                    <motion.div
                      key={skin.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, type: "spring" }}
                      className={`arena-panel p-4 rounded-lg flex flex-col items-center gap-2 cursor-pointer ${
                        !skin.unlocked ? "opacity-40" : ""
                      }`}
                      whileHover={skin.unlocked ? { scale: 1.05, y: -4 } : {}}
                    >
                      <AnimatedRobot mood="idle" size={60} variant={i % 2 === 0 ? "player" : "ai"} />
                      <span className="text-xs font-display text-foreground tracking-wider">{skin.name}</span>
                      {!skin.unlocked && (
                        <span className="text-[10px] text-muted-foreground">🔒 Level 15</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="arena-panel p-6 rounded-lg mt-4"
              >
                <h3 className="font-display text-sm text-primary tracking-wider mb-4"
                  style={{ textShadow: "0 0 15px hsl(195 100% 50% / 0.3)" }}>
                  SETTINGS
                </h3>
                {["Particles", "Screen Shake", "Sound Effects"].map((setting, i) => (
                  <motion.div
                    key={setting}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                    whileHover={{ x: 4 }}
                  >
                    <span className="font-body text-sm text-foreground">{setting}</span>
                    <motion.div
                      className="w-10 h-5 rounded-full bg-primary/20 relative cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-primary"
                        animate={{ x: 20 }}
                        style={{ boxShadow: "0 0 8px hsl(195 100% 50% / 0.5)" }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <GlowButton variant="ghost" onClick={() => navigate("/")}>← Back to Arena</GlowButton>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
