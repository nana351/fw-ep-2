import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
} from "remotion";
import type { Scene } from "../schemas";

interface OpeningSceneProps {
  scene: Scene;
}

export const OpeningScene: React.FC<OpeningSceneProps> = ({ scene }) => {
  const videoSrc = (scene as any).visualData?.videoSrc || "";

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile(videoSrc)}
        volume={1}
        pauseWhenBuffering
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </AbsoluteFill>
  );
};
