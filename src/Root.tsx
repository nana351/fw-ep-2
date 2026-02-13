import React from "react";
import { Composition } from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansKR";
import { MainComposition } from "./MainComposition";
import { CompositionSchema } from "./schemas";
import scenesData from "./data/scenes.json";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "800"],
  ignoreTooManyRequestsWarning: true,
});

export { fontFamily };

const FPS = 30;
const TRANSITION_FRAMES = 18;

export const RemotionRoot: React.FC = () => {
  const scenes = scenesData.scenes;

  const totalFrames = scenes.reduce((acc, scene) => {
    const duration = Math.ceil(((scene.audioDuration || 4) + 0.3) * FPS / 1.1);
    return acc + duration;
  }, 0) - (scenes.length - 1) * TRANSITION_FRAMES;

  return (
    <Composition
      id="MainComposition"
      component={MainComposition}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1920}
      height={1080}
      schema={CompositionSchema}
      defaultProps={{
        scenes: scenes as any,
      }}
    />
  );
};
