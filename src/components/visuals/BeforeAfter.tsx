import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface BeforeAfterProps {
  visualData: {
    before: { label: string; items: string[] };
    after: { label: string; items: string[] };
  };
  accentColor: string;
}

export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  visualData,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const beforeProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 100, mass: 1 },
  });
  const beforeX = interpolate(beforeProgress, [0, 1], [-60, 0]);
  const beforeOpacity = interpolate(beforeProgress, [0, 1], [0, 1]);

  const arrowProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.8 },
  });

  const afterProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 15, stiffness: 100, mass: 1 },
  });
  const afterX = interpolate(afterProgress, [0, 1], [60, 0]);
  const afterOpacity = interpolate(afterProgress, [0, 1], [0, 1]);

  const renderPanel = (
    data: { label: string; items: string[] },
    color: string,
    xTransform: number,
    opacity: number,
    itemDelay: number
  ) => (
    <div
      style={{
        flex: 1,
        padding: "28px 24px",
        borderRadius: 20,
        backgroundColor: `${color}12`,
        border: `2px solid ${color}40`,
        transform: `translateX(${xTransform}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 34,
          fontWeight: 800,
          color,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {data.label}
      </div>
      {data.items.map((item, i) => {
        const itemProgress = spring({
          frame: frame - (itemDelay + i * 8),
          fps,
          config: { damping: 15, stiffness: 100, mass: 0.8 },
        });
        const itemY = interpolate(itemProgress, [0, 1], [15, 0]);
        const itemOpacity = interpolate(itemProgress, [0, 1], [0, 1]);

        return (
          <div
            key={i}
            style={{
              fontFamily,
              fontSize: 28,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              padding: "12px 16px",
              borderRadius: 10,
              backgroundColor: `${color}10`,
              transform: `translateY(${itemY}px)`,
              opacity: itemOpacity,
              textAlign: "center",
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );

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
      {renderPanel(visualData.before, "#94a3b8", beforeX, beforeOpacity, 15)}

      {/* Arrow */}
      <div
        style={{
          opacity: interpolate(arrowProgress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(arrowProgress, [0, 1], [0.5, 1])})`,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path
            d="M8 24h28M28 14l10 10-10 10"
            stroke={accentColor}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {renderPanel(visualData.after, "#ef4444", afterX, afterOpacity, 30)}
    </div>
  );
};
