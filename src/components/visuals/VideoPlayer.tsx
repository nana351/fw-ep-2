import React from "react";
import {
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface VideoPlayerProps {
  visualData: {
    videoSrc: string;
    videoDuration: number;
    startFromSec?: number;
    playbackRate?: number;
  };
  accentColor: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleProgress = spring({
    frame: frame - 3,
    fps,
    config: { damping: 14, stiffness: 100, mass: 1 },
  });
  const scale = interpolate(scaleProgress, [0, 1], [0.9, 1]);
  const opacity = interpolate(scaleProgress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "40px 60px",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: `0 0 60px ${accentColor}30`,
          border: `2px solid ${accentColor}40`,
        }}
      >
        <OffthreadVideo
          src={staticFile(visualData.videoSrc)}
          muted
          pauseWhenBuffering
          startFrom={Math.round((visualData.startFromSec ?? 0) * fps)}
          playbackRate={visualData.playbackRate ?? 1}
          style={{
            height: 900,
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
};
