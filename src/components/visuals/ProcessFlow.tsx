import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../Root";

interface ProcessFlowProps {
  visualData: {
    steps: (string | { text: string; color: string })[];
  };
  accentColor: string;
}

export const ProcessFlow: React.FC<ProcessFlowProps> = ({ visualData, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps = visualData.steps;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 28,
        padding: "0 30px",
      }}
    >
      {steps.map((step, i) => {
        const stepText = typeof step === "string" ? step : step.text;
        const stepColor = typeof step === "string" ? accentColor : step.color;

        const delay = 10 + i * 10;
        const boxProgress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12, stiffness: 100, mass: 0.8 },
        });
        const scale = interpolate(boxProgress, [0, 1], [0.5, 1]);
        const opacity = interpolate(boxProgress, [0, 1], [0, 1]);

        const arrowDelay = delay + 5;
        const arrowProgress = spring({
          frame: frame - arrowDelay,
          fps,
          config: { damping: 15, stiffness: 120, mass: 0.8 },
        });
        const arrowOpacity = interpolate(arrowProgress, [0, 1], [0, 1]);
        const arrowX = interpolate(arrowProgress, [0, 1], [-10, 0]);

        const lines = stepText.split("\n");

        return (
          <React.Fragment key={i}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 270,
                maxWidth: 340,
                padding: "38px 34px",
                borderRadius: 16,
                backgroundColor: `${stepColor}18`,
                border: `2px solid ${stepColor}50`,
                transform: `scale(${scale})`,
                opacity,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily,
                  fontSize: 38,
                  fontWeight: 800,
                  color: stepColor,
                  marginBottom: lines.length > 1 ? 8 : 0,
                }}
              >
                {lines[0]}
              </div>
              {lines.length > 1 && (
                <div
                  style={{
                    fontFamily,
                    fontSize: 30,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.3,
                  }}
                >
                  {lines.slice(1).join("\n")}
                </div>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  opacity: arrowOpacity,
                  transform: `translateX(${arrowX}px)`,
                }}
              >
                <svg width="32" height="24" viewBox="0 0 32 24">
                  <path
                    d="M2 12h24M20 4l8 8-8 8"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
