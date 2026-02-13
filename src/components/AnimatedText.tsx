import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../Root";

interface StaggeredTitleProps {
  text: string;
  fontSize?: number;
  color?: string;
  delay?: number;
  align?: "flex-start" | "center" | "flex-end";
}

export const StaggeredTitle: React.FC<StaggeredTitleProps> = ({
  text,
  fontSize = 60,
  color = "#ffffff",
  delay = 0,
  align = "flex-start",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chars = text.split("");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align,
        width: "100%",
        fontFamily,
        fontSize,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color,
      }}
    >
      {chars.map((char, i) => {
        const charDelay = delay + i * 1;
        const progress = spring({
          frame: frame - charDelay,
          fps,
          config: { damping: 12, stiffness: 100, mass: 0.8 },
        });
        const y = interpolate(progress, [0, 1], [30, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity,
              whiteSpace: char === " " ? "pre" : undefined,
            }}
          >
            {char === "\n" ? <br /> : char}
          </span>
        );
      })}
    </div>
  );
};

interface FadeUpTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  delay?: number;
  lineHeight?: number;
}

export const FadeUpText: React.FC<FadeUpTextProps> = ({
  text,
  fontSize = 40,
  color = "rgba(255,255,255,0.85)",
  delay = 0,
  lineHeight = 1.6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100, mass: 1 },
  });
  const y = interpolate(progress, [0, 1], [40, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight: 400,
        lineHeight,
        color,
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      {text}
    </div>
  );
};

interface KeywordBadgeProps {
  text: string;
  accentColor: string;
  delay?: number;
}

export const KeywordBadge: React.FC<KeywordBadgeProps> = ({
  text,
  accentColor,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.8 },
  });
  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "inline-block",
        padding: "5px 14px",
        borderRadius: 14,
        backgroundColor: "transparent",
        border: `1px solid ${accentColor}60`,
        color: accentColor,
        fontSize: 16,
        fontWeight: 600,
        fontFamily,
        transform: `scale(${scale})`,
        opacity,
        marginRight: 12,
        marginBottom: 8,
      }}
    >
      {text}
    </div>
  );
};
