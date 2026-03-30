import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";

const { fontFamily } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin"] });

const languages = [
  { icon: "🐍", name: "PYTHON", color: "hsl(50, 90%, 55%)" },
  { icon: "🗄️", name: "SQL", color: "hsl(195, 100%, 55%)" },
  { icon: "⚡", name: "C++", color: "hsl(25, 95%, 55%)" },
];

export const Scene2ChooseWeapon = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });
  const cameraX = interpolate(frame, [0, 65], [40, -40], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 30% 50%, hsl(220, 30%, 10%), hsl(230, 20%, 4%))",
        transform: `translateX(${cameraX * 0.1}px)`,
      }}
    >
      {/* Step label */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          fontFamily,
          fontSize: 16,
          fontWeight: 700,
          color: "hsl(25, 95%, 55%)",
          letterSpacing: "0.3em",
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          textShadow: "0 0 15px hsla(25, 95%, 55%, 0.5)",
        }}
      >
        STEP 01
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontSize: 72,
          fontWeight: 900,
          color: "white",
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `scale(${interpolate(titleSpring, [0, 1], [0.7, 1])})`,
          textShadow: "0 0 40px hsla(195, 100%, 50%, 0.3)",
        }}
      >
        CHOOSE YOUR
        <br />
        <span style={{ color: "hsl(195, 100%, 60%)" }}>WEAPON</span>
      </div>

      {/* Language cards */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 60,
        }}
      >
        {languages.map((lang, i) => {
          const cardSpring = spring({ frame: frame - 15 - i * 6, fps, config: { damping: 15, stiffness: 180 } });
          const selected = i === 0;
          const pulse = selected ? interpolate(frame, [40, 50, 60], [1, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

          return (
            <div
              key={i}
              style={{
                width: 200,
                height: 240,
                borderRadius: 16,
                background: selected
                  ? "linear-gradient(135deg, hsla(195, 80%, 20%, 0.9), hsla(220, 60%, 12%, 0.9))"
                  : "hsla(220, 30%, 10%, 0.7)",
                border: `2px solid ${selected ? lang.color : "hsla(195, 50%, 30%, 0.3)"}`,
                display: "flex",
                flexDirection: "column" as const,
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                opacity: interpolate(cardSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(cardSpring, [0, 1], [80, 0])}px) scale(${pulse})`,
                boxShadow: selected ? `0 0 40px ${lang.color}40, inset 0 0 30px ${lang.color}10` : "none",
              }}
            >
              <span style={{ fontSize: 64 }}>{lang.icon}</span>
              <span
                style={{
                  fontFamily,
                  fontSize: 20,
                  fontWeight: 700,
                  color: lang.color,
                  letterSpacing: "0.15em",
                }}
              >
                {lang.name}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
