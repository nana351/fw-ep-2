import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface TextFocusProps {
  visualData: {
    mainText: string;
    subText: string;
    highlightWords?: string[];
    revealText?: string;
    revealDelaySec?: number;
    mainFontSize?: number;
  };
  accentColor: string;
}

export const TextFocus: React.FC<TextFocusProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Reveal logic
  const revealDelay = (visualData.revealDelaySec ?? 3) * fps;
  const hasReveal = !!visualData.revealText;

  const mainProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 10, stiffness: 80, mass: 1.2 },
  });
  const mainScale = interpolate(mainProgress, [0, 1], [0.3, 1]);
  const mainOpacity = interpolate(mainProgress, [0, 1], [0, 1]);

  const subStartFrame = hasReveal ? revealDelay + Math.round(fps * 0.2) : 25;
  const subProgress = spring({
    frame: frame - subStartFrame,
    fps,
    config: { damping: 15, stiffness: 100, mass: 1 },
  });
  const subY = interpolate(subProgress, [0, 1], [30, 0]);
  const subOpacity = interpolate(subProgress, [0, 1], [0, 1]);

  const underlineStart = hasReveal ? revealDelay + Math.round(fps * 0.2) : 30;
  const underlineWidth = interpolate(frame, [underlineStart, underlineStart + 20], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const questionFadeOut = hasReveal
    ? interpolate(frame, [revealDelay, revealDelay + fps * 0.3], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const revealProgress = hasReveal
    ? spring({
        frame: frame - revealDelay - Math.round(fps * 0.2),
        fps,
        config: { damping: 10, stiffness: 120, mass: 0.8 },
      })
    : 0;

  // Split mainText to separate the "?" at the end
  const baseText = hasReveal ? visualData.mainText.replace(/\?$/, "").trimEnd() : visualData.mainText;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: visualData.mainFontSize ?? 130,
          fontWeight: 800,
          color: accentColor,
          transform: `scale(${mainScale})`,
          opacity: mainOpacity,
          letterSpacing: "-0.03em",
          textAlign: "center",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
        }}
      >
        <span>{baseText}</span>
        {hasReveal ? (
          <span style={{ position: "relative", display: "inline-block", minWidth: "1.5em" }}>
            <span style={{ opacity: questionFadeOut }}>?</span>
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: "-0.1em",
                opacity: revealProgress,
                transform: `scale(${interpolate(revealProgress, [0, 1], [0.5, 1])})`,
                transformOrigin: "left bottom",
                whiteSpace: "nowrap",
                color: "#f59e0b",
                fontSize: "1.3em",
                paddingLeft: "0.15em",
              }}
            >
              {visualData.revealText}
            </span>
          </span>
        ) : null}
      </div>

      <div
        style={{
          width: `${underlineWidth}%`,
          maxWidth: 400,
          height: 4,
          backgroundColor: accentColor,
          borderRadius: 2,
          opacity: 0.6,
        }}
      />

      <div
        style={{
          fontFamily,
          fontSize: 44,
          fontWeight: 400,
          color: "rgba(255,255,255,0.7)",
          transform: `translateY(${subY}px)`,
          opacity: subOpacity,
          textAlign: "center",
        }}
      >
        {visualData.subText}
      </div>
    </div>
  );
};
