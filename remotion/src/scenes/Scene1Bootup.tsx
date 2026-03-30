import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";
import { RobotSVG } from "../components/RobotSVG";

const { fontFamily } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin"] });

export const Scene1Bootup = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flashOpacity = interpolate(frame, [0, 4, 8], [1, 0, 0], { extrapolateRight: "clamp" });
  const textReveal = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 200 } });
  const robotScale = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 100 } });
  const glowPulse = interpolate(frame, [0, 35, 70], [0, 0.8, 0.3]);
  const cameraZoom = interpolate(frame, [0, 70], [1.15, 1], { extrapolateRight: "clamp" });

  const lines = [
    { text: "> SYSTEM BOOT...", delay: 8 },
    { text: "> LOADING COMBAT AI...", delay: 18 },
    { text: "> WEAPONS ONLINE ✓", delay: 28 },
    { text: "> ARENA READY", delay: 38 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 60%, hsl(200, 30%, 8%), hsl(220, 20%, 3%))",
        transform: `scale(${cameraZoom})`,
      }}
    >
      {/* Initial flash */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0, 200, 255, ${flashOpacity})` }} />

      {/* Center glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, hsla(195, 100%, 50%, ${glowPulse * 0.3}), transparent 70%)`,
        }}
      />

      {/* Robot silhouette */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${robotScale * 1.2})`,
          opacity: interpolate(robotScale, [0, 1], [0, 1]),
        }}
      >
        <RobotSVG size={400} glow={glowPulse} variant="hero" />
      </div>

      {/* Boot text */}
      <div style={{ position: "absolute", top: 80, left: 80, fontFamily, zIndex: 10 }}>
        {lines.map((line, i) => {
          const lineOpacity = interpolate(frame, [line.delay, line.delay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const lineX = interpolate(frame, [line.delay, line.delay + 8], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                color: line.text.includes("✓") ? "hsl(150, 90%, 50%)" : "hsl(195, 100%, 60%)",
                fontSize: 22,
                fontFamily: "monospace",
                opacity: lineOpacity,
                transform: `translateX(${lineX}px)`,
                marginBottom: 8,
                textShadow: "0 0 10px hsla(195, 100%, 50%, 0.5)",
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      {/* Title flash */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontSize: 28,
          fontWeight: 700,
          color: "hsla(195, 100%, 70%, 0.8)",
          letterSpacing: "0.5em",
          opacity: interpolate(textReveal, [0, 1], [0, 0.7]),
          transform: `translateY(${interpolate(textReveal, [0, 1], [30, 0])}px)`,
          textShadow: "0 0 20px hsla(195, 100%, 50%, 0.4)",
        }}
      >
        HOW TO PLAY
      </div>
    </AbsoluteFill>
  );
};
