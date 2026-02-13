import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface ChartComparisonProps {
  visualData: {
    left: { label: string; value: number; color: string };
    right: { label: string; value: number; color: string };
    vsText: string;
    unit?: string;
  };
  accentColor: string;
}

export const ChartComparison: React.FC<ChartComparisonProps> = ({
  visualData,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const vsProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 8, stiffness: 80, mass: 1.5 },
  });
  const vsScale = interpolate(vsProgress, [0, 1], [0, 1]);

  const leftProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 100, mass: 1 },
  });
  const leftWidth = interpolate(
    leftProgress,
    [0, 1],
    [0, visualData.left.value]
  );

  const rightProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 100, mass: 1 },
  });
  const rightWidth = interpolate(
    rightProgress,
    [0, 1],
    [0, visualData.right.value]
  );

  const leftCount = Math.round(
    interpolate(frame, [15, 45], [0, visualData.left.value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const rightCount = Math.round(
    interpolate(frame, [15, 45], [0, visualData.right.value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

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
        padding: "0 60px",
      }}
    >
      {/* Comparison bars */}
      <div style={{ width: "100%", maxWidth: 700, display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
        {/* Left bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, width: "100%" }}>
          <div
            style={{
              fontFamily,
              fontSize: 36,
              fontWeight: 700,
              color: visualData.left.color,
              minWidth: 120,
              textAlign: "right",
            }}
          >
            {visualData.left.label}
          </div>
          <div
            style={{
              flex: 1,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${leftWidth}%`,
                height: "100%",
                backgroundColor: visualData.left.color,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 16,
              }}
            >
              <span
                style={{
                  fontFamily,
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {leftCount}{visualData.unit}
              </span>
            </div>
          </div>
        </div>

        {/* VS text */}
        <div
          style={{
            fontFamily,
            fontSize: 80,
            fontWeight: 800,
            color: "rgba(255,255,255,0.9)",
            transform: `scale(${vsScale})`,
            letterSpacing: "0.1em",
          }}
        >
          {visualData.vsText}
        </div>

        {/* Right bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, width: "100%" }}>
          <div
            style={{
              fontFamily,
              fontSize: 36,
              fontWeight: 700,
              color: visualData.right.color,
              minWidth: 120,
              textAlign: "right",
            }}
          >
            {visualData.right.label}
          </div>
          <div
            style={{
              flex: 1,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${rightWidth}%`,
                height: "100%",
                backgroundColor: visualData.right.color,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 16,
              }}
            >
              <span
                style={{
                  fontFamily,
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {rightCount}{visualData.unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
