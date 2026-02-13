import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface BackgroundProps {
  backgroundColor: string;
  accentColor: string;
}

export const Background: React.FC<BackgroundProps> = ({
  backgroundColor,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const gradientAngle = interpolate(frame, [0, 10 * fps], [135, 165], {
    extrapolateRight: "clamp",
  });

  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: (i * 137.5) % 100,
      y: (i * 73.3) % 100,
      size: 4 + (i % 5) * 8,
      speed: 0.3 + (i % 4) * 0.15,
      opacity: 0.04 + (i % 6) * 0.02,
      isRect: i % 4 === 0,
      delay: i * 0.5,
    }));
  }, []);

  return (
    <AbsoluteFill>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(${gradientAngle}deg, ${backgroundColor}, ${accentColor}22, ${backgroundColor})`,
        }}
      />
      {particles.map((p) => {
        const time = frame / fps;
        const yOffset = ((time * p.speed * 40 + p.y * 10.8) % 1200) - 100;
        const xOffset =
          p.x * 19.2 + Math.sin((time + p.delay) * 0.6) * 30;
        const rotation = time * (20 + p.id * 5);
        const scale = 0.8 + Math.sin((time + p.delay) * 0.4) * 0.2;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: xOffset,
              top: 1080 - yOffset,
              width: p.size,
              height: p.size,
              borderRadius: p.isRect ? 2 : "50%",
              backgroundColor: accentColor,
              opacity: p.opacity,
              transform: `rotate(${rotation}deg) scale(${scale})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
