import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import playerRobotImg from "@/assets/player-robot.png";

interface RobotCompanionProps {
  playerName?: string;
  mood?: "idle" | "happy" | "encouraging" | "celebrating" | "worried" | "thinking";
  message?: string;
  onMessageDone?: () => void;
}

const moodMessages: Record<string, string[]> = {
  idle: [
    "Systems online. Ready for battle! 🤖",
    "Analyzing opponent patterns...",
    "All circuits charged. Let's go!",
  ],
  happy: [
    "Great job! Your code is flawless! ✨",
    "That was incredible! Keep it up!",
    "You're unstoppable today! 🔥",
  ],
  encouraging: [
    "Don't give up! You've got this! 💪",
    "Try a different approach. I believe in you!",
    "Every error is a step closer to the answer!",
  ],
  celebrating: [
    "VICTORY! You absolutely crushed it! 🏆",
    "The AI didn't stand a chance! 🎉",
    "Code stolen! Your power grows! ⚡",
  ],
  worried: [
    "Our shields are weakening... stay focused!",
    "Careful! The AI is getting stronger!",
    "We need to be strategic here... 🤔",
  ],
  thinking: [
    "Processing your code...",
    "Compiling solution...",
    "Running analysis... 🧠",
  ],
};

const RobotCompanion = ({ playerName = "Coder", mood = "idle", message, onMessageDone }: RobotCompanionProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const currentMsg = useRef("");

  // Eye tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setEyePos({ x: dx * 6, y: dy * 4 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Typewriter effect
  const typeMessage = useCallback((text: string) => {
    currentMsg.current = text;
    setDisplayText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length && currentMsg.current === text) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        onMessageDone?.();
      }
    }, 30);
    return () => clearInterval(interval);
  }, [onMessageDone]);

  useEffect(() => {
    const msg = message || moodMessages[mood]?.[Math.floor(Math.random() * moodMessages[mood].length)] || "";
    const finalMsg = msg.replace("{name}", playerName);
    const cleanup = typeMessage(finalMsg);
    return cleanup;
  }, [mood, message, playerName, typeMessage]);

  // Mood-based glow color
  const glowColor = {
    idle: "hsl(195 100% 50%)",
    happy: "hsl(150 80% 45%)",
    encouraging: "hsl(45 90% 55%)",
    celebrating: "hsl(45 100% 60%)",
    worried: "hsl(0 80% 55%)",
    thinking: "hsl(270 70% 60%)",
  }[mood];

  const moodEmoji = {
    idle: "",
    happy: "😊",
    encouraging: "💪",
    celebrating: "🎉",
    worried: "😰",
    thinking: "🤔",
  }[mood];

  return (
    <div ref={containerRef} className="flex items-end gap-3">
      {/* Robot Avatar */}
      <motion.div
        className="relative flex-shrink-0"
        animate={{
          y: [0, -4, 0, -2, 0],
          rotate: mood === "celebrating" ? [0, -5, 5, -3, 0] : [0, -1, 1, 0],
        }}
        transition={{ repeat: Infinity, duration: mood === "celebrating" ? 0.6 : 3, ease: "easeInOut" }}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute -inset-2 rounded-full opacity-30"
          style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* Robot image with eye tracking */}
        <motion.div
          animate={{ x: eyePos.x, y: eyePos.y }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <img
            src={playerRobotImg}
            alt="Robot Companion"
            className="w-14 h-14 object-contain"
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </motion.div>

        {/* Mood indicator */}
        {moodEmoji && (
          <motion.span
            key={mood}
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="absolute -top-2 -right-1 text-sm"
          >
            {moodEmoji}
          </motion.span>
        )}
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayText.slice(0, 10) + mood}
          initial={{ opacity: 0, x: -10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -5, scale: 0.98 }}
          className="relative arena-panel px-3 py-2 rounded-lg max-w-xs"
          style={{
            borderColor: glowColor,
            boxShadow: `0 0 10px ${glowColor}33, inset 0 0 6px ${glowColor}11`,
          }}
        >
          {/* Triangle */}
          <div
            className="absolute left-0 top-3 -translate-x-1 w-2 h-2 rotate-45"
            style={{ background: "hsl(220 40% 10%)", borderLeft: `1px solid ${glowColor}`, borderBottom: `1px solid ${glowColor}` }}
          />
          <p className="font-mono text-xs text-foreground leading-relaxed">
            {displayText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="inline-block w-1.5 h-3 bg-primary ml-0.5 align-middle"
              />
            )}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RobotCompanion;
