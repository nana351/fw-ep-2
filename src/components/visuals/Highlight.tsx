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

interface HighlightProps {
  visualData: {
    text: string;
    highlightColor: string;
    leftImage?: string;
    rightImage?: string;
    icons?: string[];
  };
  accentColor: string;
}

export const Highlight: React.FC<HighlightProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 10, stiffness: 80, mass: 1.2 },
  });
  const textScale = interpolate(textProgress, [0, 1], [0.8, 1]);
  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);

  const underlineWidth = interpolate(frame, [20, 50], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const color = visualData.highlightColor || accentColor;
  const hasImages = visualData.leftImage && visualData.rightImage;

  // Image animations
  const leftImgProgress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 12, stiffness: 100, mass: 1 },
  });
  const rightImgProgress = spring({
    frame: frame - 18,
    fps,
    config: { damping: 12, stiffness: 100, mass: 1 },
  });
  const equalsProgress = spring({
    frame: frame - 14,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.8 },
  });
  const questionProgress = spring({
    frame: frame - 24,
    fps,
    config: { damping: 8, stiffness: 150, mass: 0.6 },
  });

  if (hasImages) {
    const lines = visualData.text.split("\n");

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: 30,
          padding: "0 80px",
        }}
      >
        {/* Images row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 60,
          }}
        >
          <Img
            src={staticFile(visualData.leftImage!)}
            style={{
              width: 220,
              height: 220,
              objectFit: "contain",
              transform: `scale(${interpolate(leftImgProgress, [0, 1], [0.3, 1])})`,
              opacity: interpolate(leftImgProgress, [0, 1], [0, 1]),
            }}
          />

          <Img
            src={staticFile(visualData.rightImage!)}
            style={{
              width: 220,
              height: 220,
              objectFit: "contain",
              transform: `scale(${interpolate(rightImgProgress, [0, 1], [0.3, 1])})`,
              opacity: interpolate(rightImgProgress, [0, 1], [0, 1]),
            }}
          />
        </div>

        {/* Text */}
        <div
          style={{
            transform: `scale(${textScale})`,
            opacity: textOpacity,
            textAlign: "center",
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily,
                fontSize: 96,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Underline */}
        <div
          style={{
            width: `${underlineWidth}%`,
            maxWidth: 700,
            height: 6,
            background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)`,
            borderRadius: 3,
          }}
        />
      </div>
    );
  }

  // Default: text-only highlight
  const lines = visualData.text.split("\n");
  const icons = visualData.icons;

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
        padding: "0 80px",
      }}
    >
      {/* Icons row - spread to sides */}
      {icons && icons.length >= 2 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 750,
            marginBottom: 10,
          }}
        >
          {icons.map((icon, i) => {
            const iconDelay = 5 + i * 12;
            const iconProgress = spring({
              frame: frame - iconDelay,
              fps,
              config: { damping: 10, stiffness: 120, mass: 0.8 },
            });
            const iconLines = icon.split("\n");
            const isMultiLine = iconLines.length > 1;

            return (
              <div
                key={i}
                style={{
                  transform: `scale(${interpolate(iconProgress, [0, 1], [0, 1])})`,
                  opacity: interpolate(iconProgress, [0, 1], [0, 1]),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  fontSize: isMultiLine ? 60 : 110,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: "50%",
                  width: 230,
                  height: 230,
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                {iconLines.map((line, j) => (
                  <div key={j} style={{ lineHeight: 1.1, textAlign: "center" }}>
                    {line}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          transform: `scale(${textScale})`,
          opacity: textOpacity,
          textAlign: "center",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily,
              fontSize: 96,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            {line}
          </div>
        ))}
      </div>

      <div
        style={{
          width: `${underlineWidth}%`,
          maxWidth: 600,
          height: 6,
          background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)`,
          borderRadius: 3,
          marginTop: 10,
        }}
      />
    </div>
  );
};
