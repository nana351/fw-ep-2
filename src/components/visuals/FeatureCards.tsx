import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface FeatureCardsProps {
  visualData: {
    items: Array<{
      title: string;
      description: string;
      color?: string;
    }>;
  };
  accentColor: string;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  visualData,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 24,
        padding: "20px 30px",
      }}
    >
      {visualData.items.map((item, i) => {
        const itemColor = item.color || accentColor;
        const delay = 10 + i * 10;
        const flipProgress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12, stiffness: 80, mass: 1 },
        });
        const rotateY = interpolate(flipProgress, [0, 1], [90, 0]);
        const opacity = interpolate(flipProgress, [0, 1], [0, 1]);
        const scale = interpolate(flipProgress, [0, 1], [0.8, 1]);

        return (
          <div
            key={i}
            style={{
              width: 360,
              minHeight: 300,
              padding: "44px 36px",
              borderRadius: 20,
              backgroundColor: `${itemColor}12`,
              border: `2px solid ${itemColor}35`,
              transform: `perspective(800px) rotateY(${rotateY}deg) scale(${scale})`,
              opacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                backgroundColor: `${itemColor}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily,
                fontSize: 36,
                fontWeight: 800,
                color: itemColor,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                fontFamily,
                fontSize: 42,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontFamily,
                fontSize: 32,
                fontWeight: 400,
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              {item.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};
