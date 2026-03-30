import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";
import { RobotSVG } from "../components/RobotSVG";

const { fontFamily } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin"] });

export const Scene3Battle = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shakeX = frame > 35 ? Math.sin(frame * 3) * interpolate(frame, [35, 45, 55], [0, 8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const shakeY = frame > 35 ? Math.cos(frame * 4) * interpolate(frame, [35, 45, 55], [0, 5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const playerEntry = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const enemyEntry = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 120 } });
  const vsSpring = spring({ frame: frame - 15, fps, config: { damping: 10, stiffness: 200 } });

  // Attack beam
  const beamProgress = interpolate(frame, [35, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const impactFlash = interpolate(frame, [44, 46, 50], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Code overlay
  const codeOpacity = interpolate(frame, [50, 55], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 50%, hsl(0, 20%, 12%), hsl(220, 20%, 4%))",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Step */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          fontFamily,
          fontSize: 16,
          fontWeight: 700,
          color: "hsl(0, 80%, 55%)",
          letterSpacing: "0.3em",
          opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
          textShadow: "0 0 15px hsla(0, 80%, 55%, 0.5)",
        }}
      >
        STEP 02
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 55,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontSize: 52,
          fontWeight: 900,
          color: "white",
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          textShadow: "0 0 30px hsla(0, 80%, 50%, 0.4)",
        }}
      >
        WRITE CODE. <span style={{ color: "hsl(0, 80%, 55%)" }}>ATTACK.</span>
      </div>

      {/* Player robot - left */}
      <div
        style={{
          position: "absolute",
          left: "15%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${playerEntry}) scaleX(1)`,
          opacity: playerEntry,
        }}
      >
        <RobotSVG size={280} glow={0.6} variant="player" />
      </div>

      {/* Enemy robot - right */}
      <div
        style={{
          position: "absolute",
          right: "15%",
          top: "50%",
          transform: `translate(50%, -50%) scale(${enemyEntry}) scaleX(-1)`,
          opacity: enemyEntry,
        }}
      >
        <RobotSVG size={280} glow={0.4} variant="enemy" />
      </div>

      {/* VS text */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${interpolate(vsSpring, [0, 1], [3, 1])})`,
          fontFamily,
          fontSize: 80,
          fontWeight: 900,
          color: "hsl(25, 95%, 55%)",
          opacity: vsSpring,
          textShadow: "0 0 50px hsla(25, 95%, 55%, 0.6)",
        }}
      >
        VS
      </div>

      {/* Attack beam */}
      {beamProgress > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "25%",
            width: `${beamProgress * 50}%`,
            height: 6,
            background: "linear-gradient(90deg, hsl(195, 100%, 60%), hsl(195, 100%, 80%), transparent)",
            boxShadow: "0 0 20px hsl(195, 100%, 60%), 0 0 60px hsl(195, 100%, 50%)",
            borderRadius: 3,
            transform: "translateY(-50%)",
          }}
        />
      )}

      {/* Impact flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: `rgba(0, 200, 255, ${impactFlash})`,
          pointerEvents: "none",
        }}
      />

      {/* Code overlay bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          fontFamily: "monospace",
          fontSize: 18,
          color: "hsl(150, 90%, 50%)",
          opacity: codeOpacity,
          lineHeight: 1.6,
          textShadow: "0 0 10px hsla(150, 90%, 50%, 0.4)",
        }}
      >
        <div>{"def attack(enemy):"}</div>
        <div style={{ paddingLeft: 24 }}>{"damage = calculate_power()"}</div>
        <div style={{ paddingLeft: 24 }}>{"enemy.hp -= damage"}</div>
        <div style={{ paddingLeft: 24, color: "hsl(195, 100%, 60%)" }}>{"return 'CRITICAL HIT!' ⚡"}</div>
      </div>
    </AbsoluteFill>
  );
};
