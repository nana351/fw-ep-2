import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "./Background";

interface SceneLayoutProps {
  backgroundColor: string;
  accentColor: string;
  sceneIndex?: number;
  totalScenes?: number;
  children: React.ReactNode;
}

export const SceneLayout: React.FC<SceneLayoutProps> = ({
  backgroundColor,
  accentColor,
  sceneIndex,
  totalScenes,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <Background backgroundColor={backgroundColor} accentColor={accentColor} />
      <AbsoluteFill>{children}</AbsoluteFill>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: `${progress}%`,
          height: 4,
          backgroundColor: accentColor,
          opacity: 0.8,
        }}
      />

      {/* Scene counter pill */}
      {sceneIndex !== undefined && totalScenes !== undefined && (
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 30,
            padding: "6px 16px",
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          {sceneIndex} / {totalScenes}
        </div>
      )}
    </AbsoluteFill>
  );
};
