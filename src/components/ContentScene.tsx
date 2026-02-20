import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { SceneLayout } from "./SceneLayout";
import { StaggeredTitle, KeywordBadge } from "./AnimatedText";
import { fontFamily } from "../Root";
import type { Scene } from "../schemas";

import { Question } from "./visuals/Question";
import { Hierarchy } from "./visuals/Hierarchy";
import { TextFocus } from "./visuals/TextFocus";
import { ProcessFlow } from "./visuals/ProcessFlow";
import { ChartComparison } from "./visuals/ChartComparison";
import { Highlight } from "./visuals/Highlight";
import { Checklist } from "./visuals/Checklist";
import { Venn } from "./visuals/Venn";
import { BeforeAfter } from "./visuals/BeforeAfter";
import { IconGrid } from "./visuals/IconGrid";
import { Alert } from "./visuals/Alert";
import { FeatureCards } from "./visuals/FeatureCards";
import { ImageFeature } from "./visuals/ImageFeature";
import { VideoPlayer } from "./visuals/VideoPlayer";

interface ContentSceneProps {
  scene: Scene;
  sceneIndex: number;
  totalScenes: number;
}

const LAYOUT_B_VISUALS = [
  "text-focus",
  "highlight",
  "before-after",
  "question",
  "venn",
  "alert",
  "hierarchy",
  "process-flow",
  "chart-comparison",
  "checklist",
  "icon-grid",
  "feature-cards",
  "image-feature",
  "video-player",
];

function VisualRenderer({
  visual,
  visualData,
  accentColor,
}: {
  visual: string;
  visualData: any;
  accentColor: string;
}) {
  switch (visual) {
    case "question":
      return <Question visualData={visualData} accentColor={accentColor} />;
    case "hierarchy":
      return <Hierarchy visualData={visualData} accentColor={accentColor} />;
    case "text-focus":
      return <TextFocus visualData={visualData} accentColor={accentColor} />;
    case "process-flow":
      return <ProcessFlow visualData={visualData} accentColor={accentColor} />;
    case "chart-comparison":
      return <ChartComparison visualData={visualData} accentColor={accentColor} />;
    case "highlight":
      return <Highlight visualData={visualData} accentColor={accentColor} />;
    case "checklist":
      return <Checklist visualData={visualData} accentColor={accentColor} />;
    case "venn":
      return <Venn visualData={visualData} accentColor={accentColor} />;
    case "before-after":
      return <BeforeAfter visualData={visualData} accentColor={accentColor} />;
    case "icon-grid":
      return <IconGrid visualData={visualData} accentColor={accentColor} />;
    case "alert":
      return <Alert visualData={visualData} accentColor={accentColor} />;
    case "feature-cards":
      return <FeatureCards visualData={visualData} accentColor={accentColor} />;
    case "image-feature":
      return <ImageFeature visualData={visualData} accentColor={accentColor} />;
    case "video-player":
      return <VideoPlayer visualData={visualData} accentColor={accentColor} />;
    default:
      return null;
  }
}

export const ContentScene: React.FC<ContentSceneProps> = ({
  scene,
  sceneIndex,
  totalScenes,
}) => {
  const { fps } = useVideoConfig();
  const isLayoutB = LAYOUT_B_VISUALS.includes(scene.visual);

  return (
    <SceneLayout
      backgroundColor={scene.backgroundColor}
      accentColor={scene.accentColor}
      sceneIndex={sceneIndex}
      totalScenes={totalScenes}
    >
      {scene.audioDuration && (
        <Audio src={staticFile(`audio/scene_${scene.id}.wav`)} playbackRate={1.1} />
      )}

      {isLayoutB ? (
        <LayoutB scene={scene} fps={fps} />
      ) : (
        <LayoutA scene={scene} fps={fps} />
      )}
    </SceneLayout>
  );
};

function LayoutA({ scene, fps }: { scene: Scene; fps: number }) {
  return (
    <AbsoluteFill style={{ flexDirection: "row" }}>
      {/* Left 38% - Title + Keywords */}
      <div
        style={{
          width: "38%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "120px 50px 60px 100px",
          gap: 30,
        }}
      >
        <Sequence from={5}>
          <StaggeredTitle
            text={scene.title}
            fontSize={56}
            delay={0}
          />
        </Sequence>

        {scene.keywords.length > 0 && (
          <Sequence from={Math.round(1.5 * fps)}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: 320 }}>
              {scene.keywords.map((kw, i) => (
                <KeywordBadge
                  key={i}
                  text={kw}
                  accentColor={scene.accentColor}
                  delay={i * 6}
                />
              ))}
            </div>
          </Sequence>
        )}
      </div>

      {/* Right 62% - Visual */}
      <div
        style={{
          width: "62%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 40px 40px 20px",
        }}
      >
        <Sequence from={8}>
          <VisualRenderer
            visual={scene.visual}
            visualData={scene.visualData}
            accentColor={scene.accentColor}
          />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
}

function FadeInTitle({ title, subtitle, accentColor }: { title: string; subtitle?: string; accentColor: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [10, 10 + fps * 1.2], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [10, 10 + fps * 1.2], [18, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "24%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 100px 10px 100px",
        opacity,
        transform: `translateY(${translateY}px)`,
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 58,
          fontWeight: 700,
          color: "white",
          textAlign: "center",
          letterSpacing: "-0.02em",
          textShadow: `0 0 40px ${accentColor}44`,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily,
            fontSize: 44,
            fontWeight: 500,
            color: accentColor,
            textAlign: "center",
            opacity: 0.85,
            marginTop: 8,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

function LayoutB({ scene, fps }: { scene: Scene; fps: number }) {
  return (
    <AbsoluteFill>
      {/* Top title bar - centered fade in */}
      {scene.title && (
        <FadeInTitle title={scene.title} subtitle={(scene as any).subtitle} accentColor={scene.accentColor} />
      )}

      {/* Center visual */}
      <div
        style={{
          position: "absolute",
          top: scene.title ? "20%" : "5%",
          left: 0,
          right: 0,
          bottom: "12%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 60px",
        }}
      >
        <Sequence from={8}>
          <VisualRenderer
            visual={scene.visual}
            visualData={scene.visualData}
            accentColor={scene.accentColor}
          />
        </Sequence>
      </div>

      {/* Bottom keywords */}
      {scene.keywords.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "12%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            gap: 12,
          }}
        >
          <Sequence from={Math.round(2 * fps)}>
            {scene.keywords.map((kw, i) => (
              <KeywordBadge
                key={i}
                text={kw}
                accentColor={scene.accentColor}
                delay={i * 6}
              />
            ))}
          </Sequence>
        </div>
      )}
    </AbsoluteFill>
  );
}
