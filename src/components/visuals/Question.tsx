import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface QuestionProps {
  visualData: {
    question: string;
    icon?: string;
    subLabel?: string;
    crossDelaySec?: number;
  };
  accentColor: string;
}

export const Question: React.FC<QuestionProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconBounce = spring({
    frame: frame - 5,
    fps,
    config: { damping: 8, stiffness: 120, mass: 1.2 },
  });
  const iconScale = interpolate(iconBounce, [0, 1], [0, 1]);

  const lines = visualData.question.split("\n");

  // subLabel fade in
  const subLabelDelay = Math.round(4.5 * fps);
  const subLabelOpacity = interpolate(frame, [subLabelDelay, subLabelDelay + fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Red X over subLabel
  const crossDelay = subLabelDelay + (visualData.crossDelaySec ?? 1) * fps;
  const crossProgress = spring({
    frame: frame - crossDelay,
    fps,
    config: { damping: 10, stiffness: 150, mass: 0.8 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 30,
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: 140,
          fontWeight: 800,
          color: accentColor,
          transform: `scale(${iconScale})`,
          fontFamily,
          lineHeight: 1,
        }}
      >
        {visualData.icon || "?"}
      </div>

      {lines.map((line, i) => {
        const charCount = lines.slice(0, i).join("").length;
        const visibleChars = Math.max(
          0,
          Math.floor((frame - 20) * 1.2) - charCount
        );
        const displayText = line.slice(0, visibleChars);

        return (
          <div
            key={i}
            style={{
              fontFamily,
              fontSize: 64,
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              letterSpacing: "-0.01em",
              minHeight: 70,
            }}
          >
            {displayText}
            {visibleChars < line.length && visibleChars > 0 && (
              <span
                style={{
                  opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  color: accentColor,
                }}
              >
                |
              </span>
            )}
          </div>
        );
      })}

      {visualData.subLabel && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <div
            style={{
              fontFamily,
              fontSize: 54,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              opacity: subLabelOpacity,
            }}
          >
            {visualData.subLabel}
          </div>

          {/* Red X */}
          {crossProgress > 0 && (
            <svg
              viewBox="0 0 200 60"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "120%",
                height: "120%",
                transform: "translate(-50%, -50%)",
                opacity: crossProgress,
              }}
            >
              <line
                x1="10" y1="8"
                x2={interpolate(crossProgress, [0, 1], [10, 190])}
                y2={interpolate(crossProgress, [0, 1], [8, 52])}
                stroke="#ef4444"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <line
                x1="190" y1="8"
                x2={interpolate(crossProgress, [0, 1], [190, 10])}
                y2={interpolate(crossProgress, [0, 1], [8, 52])}
                stroke="#ef4444"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};
