import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SceneLayout } from "./SceneLayout";
import { fontFamily } from "../Root";
import type { Scene } from "../schemas";

interface OutroSceneProps {
  scene: Scene;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 80, mass: 1.5 },
  });

  const subtitleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 20, stiffness: 100, mass: 1 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [20, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  return (
    <SceneLayout
      backgroundColor={scene.backgroundColor}
      accentColor={scene.accentColor}
    >
      {scene.audioDuration && (
        <Audio src={staticFile(`audio/scene_${scene.id}.wav`)} playbackRate={1.1} />
      )}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Img
          src={staticFile("img/jake.png")}
          style={{
            width: 260,
            height: 260,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 30,
            border: "4px solid #60a5fa",
            boxShadow: "0 0 30px rgba(59,130,246,0.3)",
            opacity: interpolate(
              spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 100, mass: 0.8 } }),
              [0, 1], [0, 1]
            ),
            transform: `scale(${interpolate(
              spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 100, mass: 0.8 } }),
              [0, 1], [0.5, 1]
            )})`,
          }}
        />
        <div
          style={{
            fontFamily,
            fontSize: 110,
            fontWeight: 800,
            color: "#ffffff",
            transform: `scale(${titleScale})`,
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          {scene.title}
        </div>

      </AbsoluteFill>
    </SceneLayout>
  );
};
