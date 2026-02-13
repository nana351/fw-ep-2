import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const SceneSchema = z.object({
  id: z.number().describe("장면 번호"),
  type: z.string().describe("장면 유형: intro, content, outro"),
  title: z.string().describe("장면 제목"),
  subtitle: z.string().optional().describe("부제목"),
  narration: z.string().describe("TTS 나레이션 텍스트"),
  keywords: z.array(z.string()).describe("핵심 키워드 목록"),
  visual: z.string().describe("인포그래픽 타입"),
  visualData: z.any().optional().describe("인포그래픽 데이터"),
  transition: z.string().describe("전환 효과"),
  backgroundColor: zColor().describe("배경 색상"),
  accentColor: zColor().describe("악센트 색상"),
  audioDuration: z.number().optional().describe("음성 재생 시간(초)"),
});

export const CompositionSchema = z.object({
  scenes: z.array(SceneSchema).describe("장면 목록"),
});

export type Scene = z.infer<typeof SceneSchema>;
export type CompositionProps = z.infer<typeof CompositionSchema>;
