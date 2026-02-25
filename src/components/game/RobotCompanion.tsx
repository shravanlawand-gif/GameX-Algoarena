import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedRobot, { type RobotMood } from "./AnimatedRobot";

interface RobotCompanionProps {
  playerName?: string;
  mood?: RobotMood;
  message?: string;
  onMessageDone?: () => void;
  size?: "sm" | "md" | "lg";
}

const moodMessages: Record<string, string[]> = {
  idle: [
    "Systems online. Ready for battle, {name}! 🤖",
    "Analyzing opponent patterns...",
    "All circuits charged. Let's go, {name}!",
  ],
  happy: [
    "Great job, {name}! Your code is flawless! ✨",
    "That was incredible! Keep it up!",
    "You're unstoppable today, {name}! 🔥",
  ],
  encouraging: [
    "Don't give up, {name}! You've got this! 💪",
    "Try a different approach. I believe in you!",
    "Every error is a step closer to the answer!",
  ],
  celebrating: [
    "VICTORY! {name}, you absolutely crushed it! 🏆",
    "The AI didn't stand a chance! 🎉",
    "Code stolen! Your power grows, {name}! ⚡",
  ],
  worried: [
    "Our shields are weakening... stay focused, {name}!",
    "Careful! The AI is getting stronger!",
    "We need to be strategic here... 🤔",
  ],
  thinking: [
    "Processing your code...",
    "Compiling solution...",
    "Running analysis... 🧠",
  ],
  excited: [
    "Oh {name}, this is going to be EPIC! ⚡",
    "I can feel the energy! Let's GO!",
    "Maximum power levels detected! 🚀",
  ],
  confused: [
    "Hmm, that doesn't compute... 🤔",
    "My circuits are puzzled by this one...",
    "Let me recalculate, {name}...",
  ],
};

const RobotCompanion = ({
  playerName = "Commander",
  mood = "idle",
  message,
  onMessageDone,
  size = "md",
}: RobotCompanionProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const currentMsg = useRef("");

  const robotSize = { sm: 56, md: 72, lg: 96 }[size];

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
    }, 25);
    return () => clearInterval(interval);
  }, [onMessageDone]);

  useEffect(() => {
    const msgs = moodMessages[mood] || moodMessages.idle;
    const msg = message || msgs[Math.floor(Math.random() * msgs.length)];
    const finalMsg = msg.replace(/\{name\}/g, playerName);
    const cleanup = typeMessage(finalMsg);
    return cleanup;
  }, [mood, message, playerName, typeMessage]);

  const glowColor = {
    idle: "hsl(195 100% 50%)",
    happy: "hsl(150 80% 45%)",
    encouraging: "hsl(45 90% 55%)",
    celebrating: "hsl(45 100% 60%)",
    worried: "hsl(0 80% 55%)",
    thinking: "hsl(270 70% 60%)",
    excited: "hsl(195 100% 60%)",
    confused: "hsl(320 80% 55%)",
  }[mood];

  return (
    <div className="flex items-end gap-3">
      {/* Animated SVG Robot */}
      <motion.div
        className="flex-shrink-0"
        layout
        transition={{ duration: 0.3 }}
      >
        <AnimatedRobot mood={mood} size={robotSize} variant="player" />
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMsg.current.slice(0, 20)}
          initial={{ opacity: 0, x: -10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -5, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="relative arena-panel px-3 py-2 rounded-lg max-w-xs"
          style={{
            borderColor: glowColor,
            boxShadow: `0 0 12px ${glowColor}33, inset 0 0 8px ${glowColor}11`,
          }}
        >
          {/* Triangle */}
          <div
            className="absolute left-0 top-4 -translate-x-1 w-2 h-2 rotate-45"
            style={{
              background: "hsl(220 40% 10%)",
              borderLeft: `1px solid ${glowColor}`,
              borderBottom: `1px solid ${glowColor}`,
            }}
          />
          <p className="font-mono text-xs text-foreground leading-relaxed">
            {displayText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 align-middle rounded-sm"
              />
            )}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RobotCompanion;
