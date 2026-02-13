import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface HighlightProps {
  visualData: {
    text: string;
    highlightColor: string;
  };
  accentColor: string;
}

export const Highlight: React.FC<HighlightProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 10, stiffness: 80, mass: 1.2 },
  });
  const textScale = interpolate(textProgress, [0, 1], [0.8, 1]);
  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);

  const underlineWidth = interpolate(frame, [20, 50], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lines = visualData.text.split("\n");
  const color = visualData.highlightColor || accentColor;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 16,
        padding: "0 80px",
      }}
    >
      <div
        style={{
          transform: `scale(${textScale})`,
          opacity: textOpacity,
          textAlign: "center",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily,
              fontSize: 64,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            {line}
          </div>
        ))}
      </div>

      <div
        style={{
          width: `${underlineWidth}%`,
          maxWidth: 600,
          height: 6,
          background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)`,
          borderRadius: 3,
          marginTop: 10,
        }}
      />
    </div>
  );
};
