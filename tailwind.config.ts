import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Exo 2", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom arena colors
        neon: {
          cyan: "hsl(var(--neon-cyan))",
          orange: "hsl(var(--neon-orange))",
          green: "hsl(var(--neon-green))",
          red: "hsl(var(--neon-red))",
          magenta: "hsl(var(--neon-magenta))",
        },
        arena: "hsl(var(--arena-bg))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-8px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(8px)" },
        },
        "attack-right": {
          "0%": { transform: "translateX(0)" },
          "40%": { transform: "translateX(80px) scale(1.1)" },
          "60%": { transform: "translateX(80px) scale(1.1)" },
          "100%": { transform: "translateX(0)" },
        },
        "attack-left": {
          "0%": { transform: "translateX(0)" },
          "40%": { transform: "translateX(-80px) scale(1.1)" },
          "60%": { transform: "translateX(-80px) scale(1.1)" },
          "100%": { transform: "translateX(0)" },
        },
        "damage-flash": {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(2) saturate(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        explosion: {
          "0%": { transform: "scale(0)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.8" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "fly-hover": {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "25%": { transform: "translateY(-12px) rotate(1deg)" },
          "50%": { transform: "translateY(-6px) rotate(-1deg)" },
          "75%": { transform: "translateY(-14px) rotate(2deg)" },
        },
        "charge-up": {
          "0%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.08)", filter: "brightness(1.5)" },
          "100%": { transform: "scale(1)", filter: "brightness(1)" },
        },
        "dash-right": {
          "0%": { transform: "translateX(0) rotate(0deg)" },
          "20%": { transform: "translateX(-20px) rotate(-5deg)" },
          "50%": { transform: "translateX(120px) rotate(10deg) scale(1.15)" },
          "70%": { transform: "translateX(100px) rotate(5deg) scale(1.1)" },
          "100%": { transform: "translateX(0) rotate(0deg) scale(1)" },
        },
        "dash-left": {
          "0%": { transform: "translateX(0) rotate(0deg)" },
          "20%": { transform: "translateX(20px) rotate(5deg)" },
          "50%": { transform: "translateX(-120px) rotate(-10deg) scale(1.15)" },
          "70%": { transform: "translateX(-100px) rotate(-5deg) scale(1.1)" },
          "100%": { transform: "translateX(0) rotate(0deg) scale(1)" },
        },
        recoil: {
          "0%": { transform: "translateX(0)" },
          "30%": { transform: "translateX(30px) rotate(8deg)" },
          "60%": { transform: "translateX(20px) rotate(-3deg)" },
          "100%": { transform: "translateX(0) rotate(0deg)" },
        },
        "recoil-left": {
          "0%": { transform: "translateX(0)" },
          "30%": { transform: "translateX(-30px) rotate(-8deg)" },
          "60%": { transform: "translateX(-20px) rotate(3deg)" },
          "100%": { transform: "translateX(0) rotate(0deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        shake: "shake 0.5s ease-in-out",
        "attack-right": "attack-right 0.6s ease-in-out",
        "attack-left": "attack-left 0.6s ease-in-out",
        "damage-flash": "damage-flash 0.3s ease-in-out",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        explosion: "explosion 0.5s ease-out forwards",
        "fly-hover": "fly-hover 3s ease-in-out infinite",
        "charge-up": "charge-up 0.8s ease-in-out",
        "dash-right": "dash-right 0.7s ease-in-out",
        "dash-left": "dash-left 0.7s ease-in-out",
        recoil: "recoil 0.5s ease-out",
        "recoil-left": "recoil-left 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
