import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface VennProps {
  visualData: {
    circles: Array<{ label: string; color: string }>;
    intersection: string;
  };
  accentColor: string;
}

export const Venn: React.FC<VennProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const circle1Progress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1 },
  });

  const circle2Progress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1 },
  });

  const overlapProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 15, stiffness: 100, mass: 1 },
  });

  const c1X = interpolate(circle1Progress, [0, 1], [-300, -120]);
  const c2X = interpolate(circle2Progress, [0, 1], [300, 120]);
  const c1Scale = interpolate(circle1Progress, [0, 1], [0.3, 1]);
  const c2Scale = interpolate(circle2Progress, [0, 1], [0.3, 1]);

  const intersectOpacity = interpolate(overlapProgress, [0, 1], [0, 1]);
  const intersectScale = interpolate(overlapProgress, [0, 1], [0.5, 1]);

  const circles = visualData.circles;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Circle 1 */}
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          backgroundColor: `${circles[0].color}20`,
          border: `3px solid ${circles[0].color}60`,
          transform: `translateX(${c1X}px) scale(${c1Scale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingRight: 120,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 52,
            fontWeight: 700,
            color: circles[0].color,
          }}
        >
          {circles[0].label}
        </div>
      </div>

      {/* Circle 2 */}
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          backgroundColor: `${circles[1].color}20`,
          border: `3px solid ${circles[1].color}60`,
          transform: `translateX(${c2X}px) scale(${c2Scale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 120,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 52,
            fontWeight: 700,
            color: circles[1].color,
          }}
        >
          {circles[1].label}
        </div>
      </div>

      {/* Intersection */}
      <div
        style={{
          position: "absolute",
          opacity: intersectOpacity,
          transform: `scale(${intersectScale})`,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 26,
            fontWeight: 700,
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: 12,
            backgroundColor: `${accentColor}30`,
            backdropFilter: "blur(8px)",
            lineHeight: 1.3,
          }}
        >
          {visualData.intersection.split("\n").map((line: string, i: number) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
