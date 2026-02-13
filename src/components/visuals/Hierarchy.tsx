import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface HierarchyProps {
  visualData: {
    levels: Array<{
      label: string;
      description: string;
      color: string;
    }>;
    blinkTimings?: Array<{
      startSec: number;
      endSec: number | null;
    }>;
  };
  accentColor: string;
}

export const Hierarchy: React.FC<HierarchyProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const levels = visualData.levels;
  const blinkTimings = visualData.blinkTimings;

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
        padding: "20px 40px",
      }}
    >
      {levels.map((level, i) => {
        const delay = 10 + i * 12;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12, stiffness: 100, mass: 0.8 },
        });
        const scale = interpolate(progress, [0, 1], [0.6, 1]);
        const baseOpacity = interpolate(progress, [0, 1], [0, 1]);
        const y = interpolate(progress, [0, 1], [20, 0]);

        const widthPercent = 100 - i * 12;
        const isTop = false;

        // Blink logic
        let blinkGlow = 0;
        let isBlinking = false;
        if (blinkTimings && blinkTimings[i]) {
          const timing = blinkTimings[i];
          const startFrame = timing.startSec * fps;
          const endFrame = timing.endSec != null ? timing.endSec * fps : Infinity;

          if (frame >= startFrame && frame < endFrame) {
            isBlinking = true;
            // 3 blinks per second using sine wave
            const blinkPhase = ((frame - startFrame) / fps) * Math.PI * 2;
            blinkGlow = (Math.sin(blinkPhase) + 1) / 2; // 0~1
          } else if (frame >= endFrame) {
            // After blink ends: stay highlighted
            blinkGlow = 1;
          }
        }

        const borderColor = isBlinking || blinkGlow === 1
          ? level.color
          : `${level.color}60`;
        const bgAlpha = isBlinking
          ? Math.round(0x20 + blinkGlow * 0x30).toString(16).padStart(2, "0")
          : blinkGlow === 1
            ? "50"
            : "20";
        const shadow = isBlinking
          ? `0 0 ${20 + blinkGlow * 30}px ${level.color}${Math.round(0x30 + blinkGlow * 0x50).toString(16).padStart(2, "0")}`
          : blinkGlow === 1
            ? `0 0 35px ${level.color}60`
            : isTop
              ? `0 0 30px ${level.color}30`
              : undefined;

        return (
          <div
            key={i}
            style={{
              width: `${widthPercent}%`,
              maxWidth: 800,
              padding: "36px 44px",
              borderRadius: 16,
              backgroundColor: `${level.color}${bgAlpha}`,
              border: `2px solid ${borderColor}`,
              transform: `translateY(${y}px) scale(${scale})`,
              opacity: baseOpacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: shadow,
            }}
          >
            <div
              style={{
                fontFamily,
                fontSize: 42,
                fontWeight: 800,
                color: level.color,
                whiteSpace: "nowrap",
                textAlign: "center" as const,
              }}
            >
              {level.label}
            </div>
            <div
              style={{
                fontFamily,
                fontSize: 34,
                fontWeight: 400,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
                textAlign: "center" as const,
              }}
            >
              {level.description}
            </div>
          </div>
        );
      })}

      {/* Connecting lines */}
      {levels.length > 1 &&
        levels.slice(0, -1).map((_, i) => {
          const lineDelay = 10 + (i + 1) * 12 - 6;
          const lineProgress = spring({
            frame: frame - lineDelay,
            fps,
            config: { damping: 20, stiffness: 100, mass: 1 },
          });

          return (
            <div
              key={`line-${i}`}
              style={{
                position: "absolute",
                top: `${28 + i * (100 / levels.length)}%`,
                left: "50%",
                width: 2,
                height: 20,
                backgroundColor: `${accentColor}40`,
                opacity: lineProgress,
                transform: "translateX(-50%)",
              }}
            />
          );
        })}
    </div>
  );
};
