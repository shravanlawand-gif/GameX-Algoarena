import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { useSoundEngine } from "@/hooks/useSoundEngine";

interface GlowButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const GlowButton = ({ children, onClick, variant = "primary", className = "", size = "md" }: GlowButtonProps) => {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const { sounds } = useSoundEngine();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 600);
    onClick();
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  }[size];

  const variantClasses = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    ghost: "bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-primary",
  }[variant];

  const glowStyle = {
    primary: "0 0 20px hsl(195 100% 50% / 0.4), 0 0 40px hsl(195 100% 50% / 0.15)",
    secondary: "0 0 20px hsl(25 95% 55% / 0.4), 0 0 40px hsl(25 95% 55% / 0.15)",
    ghost: "none",
  }[variant];

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => sounds.hover()}
      className={`relative overflow-hidden rounded-lg font-display uppercase tracking-widest transition-all duration-300 ${sizeClasses} ${variantClasses} ${className}`}
      style={{ boxShadow: glowStyle }}
      whileHover={{ scale: 1.05, boxShadow: glowStyle.replace("0.4", "0.6").replace("0.15", "0.3") }}
      whileTap={{ scale: 0.97 }}
    >
      {children}

      {ripple && (
        <motion.span
          className="absolute rounded-full bg-foreground/20 pointer-events-none"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.6 }}
          animate={{ width: 300, height: 300, x: -150, y: -150, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {variant !== "ghost" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, hsl(0 0% 100% / 0.08) 45%, hsl(0 0% 100% / 0.12) 50%, hsl(0 0% 100% / 0.08) 55%, transparent 60%)",
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2 }}
        />
      )}
    </motion.button>
  );
};

export default GlowButton;
