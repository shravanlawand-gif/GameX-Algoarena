import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { Scene1Bootup } from "./scenes/Scene1Bootup";
import { Scene2ChooseWeapon } from "./scenes/Scene2ChooseWeapon";
import { Scene3Battle } from "./scenes/Scene3Battle";
import { Scene4Destroy } from "./scenes/Scene4Destroy";
import { Scene5Logo } from "./scenes/Scene5Logo";

export const MainVideo = () => {
  const frame = useCurrentFrame();

  // Persistent animated background
  const bgHue = interpolate(frame, [0, 330], [200, 240]);
  const scanY = interpolate(frame, [0, 330], [-200, 1280]);

  return (
    <AbsoluteFill style={{ backgroundColor: `hsl(${bgHue}, 15%, 5%)` }}>
      {/* Scan line effect */}
      <div
        style={{
          position: "absolute",
          top: scanY,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, hsla(195, 100%, 50%, 0.15), transparent)`,
          zIndex: 100,
          pointerEvents: "none",
        }}
      />

      {/* Persistent grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(hsla(195, 80%, 40%, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsla(195, 80%, 40%, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          zIndex: 1,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
          zIndex: 99,
          pointerEvents: "none",
        }}
      />

      {/* Scenes */}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={70}>
          <Scene1Bootup />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={65}>
          <Scene2ChooseWeapon />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence durationInFrames={75}>
          <Scene3Battle />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={70}>
          <Scene4Destroy />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <Scene5Logo />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
