import React from "react";
import { useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { IntroScene } from "./components/IntroScene";
import { ContentScene } from "./components/ContentScene";
import { OutroScene } from "./components/OutroScene";
import type { CompositionProps, Scene } from "./schemas";

const TRANSITION_FRAMES = 18;

function getTransition(type: string) {
  switch (type) {
    case "slideUp":
      return slide({ direction: "from-bottom" });
    case "slideLeft":
      return slide({ direction: "from-left" });
    case "slideRight":
      return slide({ direction: "from-right" });
    case "scaleIn":
      return wipe();
    case "fadeIn":
    default:
      return fade();
  }
}

function renderScene(scene: Scene, totalScenes: number) {
  const sceneIndex = scene.type === "outro"
    ? totalScenes
    : scene.id;

  if (scene.type === "intro") {
    return <IntroScene scene={scene} />;
  }
  if (scene.type === "outro") {
    return <OutroScene scene={scene} />;
  }
  return (
    <ContentScene
      scene={scene}
      sceneIndex={sceneIndex}
      totalScenes={totalScenes}
    />
  );
}

export const MainComposition: React.FC<CompositionProps> = ({ scenes }) => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      {scenes.map((scene, i) => {
        const duration = Math.ceil(((scene.audioDuration || 4) + 0.3) * fps / 1.1);

        return (
          <React.Fragment key={scene.id}>
            <TransitionSeries.Sequence durationInFrames={duration}>
              {renderScene(scene, scenes.length)}
            </TransitionSeries.Sequence>
            {i < scenes.length - 1 && (
              <TransitionSeries.Transition
                presentation={getTransition(scenes[i + 1].transition)}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            )}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  );
};
