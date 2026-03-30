import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";

const { fontFamily } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin"] });

export const Scene4Destroy = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const starsBurst = spring({ frame: frame - 20, fps, config: { damping: 15 } });
  const rewardSlide = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 150 } });

  // Explosion particles
  const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const speed = 80 + Math.random() * 200;
    const progress = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return {
      x: Math.cos(angle) * speed * progress,
      y: Math.sin(angle) * speed * progress,
      opacity: interpolate(progress, [0, 0.3, 1], [0, 1, 0]),
      size: 3 + Math.random() * 5,
      hue: [195, 25, 0, 45][i % 4],
    };
  });

  return (
    <AbsoluteFill
      style={{ background: "radial-gradient(circle at 50% 40%, hsl(25, 40%, 12%), hsl(220, 20%, 3%))" }}
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
          color: "hsl(45, 90%, 55%)",
          letterSpacing: "0.3em",
          opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
          textShadow: "0 0 15px hsla(45, 90%, 55%, 0.5)",
        }}
      >
        STEP 03
      </div>

      {/* Explosion center */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: `hsl(${p.hue}, 90%, 60%)`,
            boxShadow: `0 0 10px hsl(${p.hue}, 90%, 60%)`,
            transform: `translate(${p.x}px, ${p.y}px)`,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* DEFEATED title */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontSize: 90,
          fontWeight: 900,
          color: "hsl(25, 95%, 55%)",
          opacity: titleSpring,
          transform: `scale(${interpolate(titleSpring, [0, 1], [2.5, 1])})`,
          textShadow: "0 0 60px hsla(25, 95%, 55%, 0.6), 0 0 120px hsla(25, 95%, 55%, 0.2)",
        }}
      >
        DEFEATED
      </div>

      {/* Stars */}
      <div
        style={{
          position: "absolute",
          top: "53%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 24,
          opacity: starsBurst,
        }}
      >
        {[0, 1, 2].map((i) => {
          const starScale = spring({ frame: frame - 22 - i * 5, fps, config: { damping: 8, stiffness: 200 } });
          return (
            <div
              key={i}
              style={{
                fontSize: 64,
                transform: `scale(${starScale}) rotate(${interpolate(starScale, [0, 1], [180, 0])}deg)`,
                filter: `drop-shadow(0 0 15px hsl(45, 90%, 50%))`,
              }}
            >
              ⭐
            </div>
          );
        })}
      </div>

      {/* Reward card */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: "50%",
          transform: `translateX(-50%) translateY(${interpolate(rewardSlide, [0, 1], [60, 0])}px)`,
          opacity: rewardSlide,
          background: "linear-gradient(135deg, hsla(195, 60%, 15%, 0.9), hsla(220, 40%, 10%, 0.9))",
          border: "1px solid hsla(195, 80%, 50%, 0.4)",
          borderRadius: 16,
          padding: "24px 48px",
          textAlign: "center",
          boxShadow: "0 0 40px hsla(195, 100%, 50%, 0.15)",
        }}
      >
        <div style={{ fontFamily, fontSize: 14, color: "hsl(195, 80%, 60%)", letterSpacing: "0.3em", marginBottom: 8 }}>
          REWARD UNLOCKED
        </div>
        <div style={{ fontFamily, fontSize: 28, fontWeight: 700, color: "white" }}>
          +500 XP · LEVEL 2
        </div>
      </div>
    </AbsoluteFill>
  );
};
