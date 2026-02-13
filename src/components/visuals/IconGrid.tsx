import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface IconGridProps {
  visualData: {
    items: Array<{
      icon: string;
      label: string;
    }>;
  };
  accentColor: string;
}

export const IconGrid: React.FC<IconGridProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = visualData.items;
  const cols = items.length <= 3 ? items.length : 2;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 50,
        padding: "80px 500px 20px",
      }}
    >
      {items.map((item, i) => {
        const delay = 10 + i * 8;
        const scaleProgress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 10, stiffness: 120, mass: 0.8 },
        });
        const scale = interpolate(scaleProgress, [0, 1], [0.3, 1]);
        const opacity = interpolate(scaleProgress, [0, 1], [0, 1]);

        return (
          <div
            key={i}
            style={{
              width: cols === 2 ? "46%" : `${90 / cols}%`,
              padding: "60px 20px",
              borderRadius: 20,
              backgroundColor: `${accentColor}12`,
              border: `1.5px solid ${accentColor}30`,
              transform: `scale(${scale})`,
              opacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ fontSize: 52 }}>{item.icon}</div>
            <div
              style={{
                fontFamily,
                fontSize: 34,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
