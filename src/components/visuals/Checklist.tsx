import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface ChecklistProps {
  visualData: {
    items: string[];
  };
  accentColor: string;
}

export const Checklist: React.FC<ChecklistProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 40,
        padding: "20px 60px",
      }}
    >
      {visualData.items.map((item, i) => {
        const delay = 15 + i * 15;
        const slideProgress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 15, stiffness: 100, mass: 0.8 },
        });
        const x = interpolate(slideProgress, [0, 1], [-40, 0]);
        const opacity = interpolate(slideProgress, [0, 1], [0, 1]);

        const checkDelay = delay + 10;
        const checkProgress = spring({
          frame: frame - checkDelay,
          fps,
          config: { damping: 8, stiffness: 120, mass: 0.6 },
        });

        const pathLength = interpolate(checkProgress, [0, 1], [0, 24]);

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              transform: `translateX(${x}px)`,
              opacity,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 12,
                backgroundColor: `${accentColor}20`,
                border: `2px solid ${accentColor}60`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M4 12l6 6L20 6"
                  stroke={accentColor}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="24"
                  strokeDashoffset={24 - pathLength}
                />
              </svg>
            </div>
            <div
              style={{
                fontFamily,
                fontSize: 40,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 1.4,
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
};
