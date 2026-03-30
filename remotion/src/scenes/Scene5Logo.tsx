import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";
import { RobotSVG } from "../components/RobotSVG";

const { fontFamily } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin"] });

export const Scene5Logo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 100 } });
  const subtitleSpring = spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 150 } });
  const ctaSpring = spring({ frame: frame - 35, fps, config: { damping: 12, stiffness: 180 } });
  const robotFloat = Math.sin(frame * 0.08) * 8;
  const glowPulse = interpolate(frame, [0, 55, 110], [0.3, 0.8, 0.3]);

  return (
    <AbsoluteFill
      style={{ background: "radial-gradient(circle at 50% 50%, hsl(210, 30%, 8%), hsl(230, 25%, 3%))" }}
    >
      {/* Large center glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 800,
          height: 800,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, hsla(195, 100%, 50%, ${glowPulse * 0.12}), transparent 60%)`,
        }}
      />

      {/* Robot */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: `translate(-50%, ${robotFloat}px) scale(${logoSpring})`,
          opacity: logoSpring,
        }}
      >
        <RobotSVG size={180} glow={glowPulse} variant="hero" />
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          opacity: logoSpring,
          transform: `scale(${interpolate(logoSpring, [0, 1], [0.5, 1])})`,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "hsl(195, 100%, 60%)",
            letterSpacing: "0.15em",
            textShadow: "0 0 50px hsla(195, 100%, 50%, 0.5), 0 0 100px hsla(195, 100%, 50%, 0.2)",
          }}
        >
          CODE ARENA
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "hsl(25, 95%, 55%)",
            letterSpacing: "0.5em",
            marginTop: -8,
            opacity: interpolate(subtitleSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(subtitleSpring, [0, 1], [20, 0])}px)`,
            textShadow: "0 0 30px hsla(25, 95%, 55%, 0.5)",
          }}
        >
          BATTLES
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontSize: 24,
          fontWeight: 700,
          color: "white",
          letterSpacing: "0.4em",
          opacity: interpolate(ctaSpring, [0, 1], [0, interpolate(frame, [60, 70, 80, 90, 100, 110], [1, 0.3, 1, 0.3, 1, 1], { extrapolateRight: "clamp" })]),
          transform: `translateY(${interpolate(ctaSpring, [0, 1], [30, 0])}px)`,
          textShadow: "0 0 20px hsla(195, 100%, 50%, 0.4)",
        }}
      >
        PLAY NOW
      </div>

      {/* Corner decorations */}
      {[
        { top: 40, left: 40, borderTop: "2px solid", borderLeft: "2px solid" },
        { top: 40, right: 40, borderTop: "2px solid", borderRight: "2px solid" },
        { bottom: 40, left: 40, borderBottom: "2px solid", borderLeft: "2px solid" },
        { bottom: 40, right: 40, borderBottom: "2px solid", borderRight: "2px solid" },
      ].map((style, i) => {
        const cornerOpacity = interpolate(frame, [50 + i * 3, 58 + i * 3], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              ...style,
              borderColor: "hsl(195, 80%, 40%)",
              opacity: cornerOpacity,
            } as any}
          />
        );
      })}
    </AbsoluteFill>
  );
};
