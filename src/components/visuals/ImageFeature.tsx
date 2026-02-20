import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface ImageFeatureProps {
  visualData: {
    image: string;
    caption?: string;
    subCaption?: string;
  };
  accentColor: string;
}

export const ImageFeature: React.FC<ImageFeatureProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 100, mass: 1 },
  });
  const imgScale = interpolate(imgProgress, [0, 1], [0.5, 1]);
  const imgOpacity = interpolate(imgProgress, [0, 1], [0, 1]);

  const captionProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 100, mass: 1 },
  });
  const captionY = interpolate(captionProgress, [0, 1], [20, 0]);
  const captionOpacity = interpolate(captionProgress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 24,
      }}
    >
      <Img
        src={staticFile(visualData.image)}
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          objectFit: "cover",
          border: `4px solid ${accentColor}`,
          boxShadow: `0 0 40px ${accentColor}40`,
          transform: `scale(${imgScale})`,
          opacity: imgOpacity,
        }}
      />

      {visualData.caption && (
        <div
          style={{
            fontFamily,
            fontSize: 48,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            transform: `translateY(${captionY}px)`,
            opacity: captionOpacity,
          }}
        >
          {visualData.caption}
        </div>
      )}

      {visualData.subCaption && (
        <div
          style={{
            fontFamily,
            fontSize: 32,
            fontWeight: 400,
            color: `${accentColor}cc`,
            textAlign: "center",
            transform: `translateY(${captionY}px)`,
            opacity: captionOpacity,
          }}
        >
          {visualData.subCaption}
        </div>
      )}
    </div>
  );
};
