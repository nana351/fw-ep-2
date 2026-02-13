import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SceneLayout } from "./SceneLayout";
import { StaggeredTitle } from "./AnimatedText";
import { fontFamily } from "../Root";
import type { Scene } from "../schemas";

interface IntroSceneProps {
  scene: Scene;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1.2 },
  });

  const lineWidth = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 100, mass: 1 },
  });

  const subtitleProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 20, stiffness: 100, mass: 1 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [30, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  const titleLines = scene.title.split("\n");

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
          padding: "0 120px",
        }}
      >
        <div
          style={{
            transform: `scale(${titleScale})`,
            textAlign: "center",
          }}
        >
          {titleLines.map((line, i) => (
            <div key={i} style={{ marginBottom: i < titleLines.length - 1 ? 10 : 0 }}>
              <StaggeredTitle
                text={line}
                fontSize={78}
                delay={i * 15}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            width: interpolate(lineWidth, [0, 1], [0, 300]),
            height: 3,
            backgroundColor: scene.accentColor,
            marginTop: 30,
            marginBottom: 30,
            borderRadius: 2,
          }}
        />

        {scene.subtitle && (
          <div
            style={{
              fontFamily,
              fontSize: 36,
              fontWeight: 400,
              color: `${scene.accentColor}cc`,
              transform: `translateY(${subtitleY}px)`,
              opacity: subtitleOpacity,
              textAlign: "center",
            }}
          >
            {scene.subtitle}
          </div>
        )}
      </AbsoluteFill>
    </SceneLayout>
  );
};
