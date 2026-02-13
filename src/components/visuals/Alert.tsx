import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface AlertProps {
  visualData: {
    icon: string;
    title: string;
    message: string;
  };
  accentColor: string;
}

export const Alert: React.FC<AlertProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shakeProgress = interpolate(frame, [5, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeX =
    shakeProgress < 1
      ? Math.sin(frame * 2.5) * 8 * (1 - shakeProgress)
      : 0;

  const boxProgress = spring({
    frame: frame - 12,
    fps,
    config: { damping: 10, stiffness: 100, mass: 1 },
  });
  const boxScale = interpolate(boxProgress, [0, 1], [0.7, 1]);
  const boxOpacity = interpolate(boxProgress, [0, 1], [0, 1]);

  const textProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 15, stiffness: 100, mass: 1 },
  });
  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);
  const textY = interpolate(textProgress, [0, 1], [15, 0]);

  const lines = visualData.message.split("\n");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "0 40px",
      }}
    >
      {/* Icon with shake */}
      <div
        style={{
          fontSize: 96,
          transform: `translateX(${shakeX}px)`,
          marginBottom: 24,
        }}
      >
        {visualData.icon}
      </div>

      {/* Alert box */}
      <div
        style={{
          maxWidth: 900,
          width: "100%",
          padding: "48px 60px",
          borderRadius: 20,
          backgroundColor: `${accentColor}15`,
          border: `2px solid ${accentColor}50`,
          transform: `scale(${boxScale})`,
          opacity: boxOpacity,
          boxShadow: `0 0 40px ${accentColor}20`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 38,
            fontWeight: 800,
            color: accentColor,
          }}
        >
          {visualData.title}
        </div>

        <div
          style={{
            transform: `translateY(${textY}px)`,
            opacity: textOpacity,
            textAlign: "center",
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily,
                fontSize: 32,
                fontWeight: 500,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.5,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
