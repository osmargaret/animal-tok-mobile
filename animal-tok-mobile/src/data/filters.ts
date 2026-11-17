export interface VideoFilter {
  id: string;
  name: string;
  emoji: string;
  css: string;
  tintColor?: string;
  tintOpacity?: number;
}

export const VIDEO_FILTERS: VideoFilter[] = [
  { id: "normal", name: "Normal", emoji: "✨", css: "none" },
  {
    id: "warm",
    name: "Warm Sunset",
    emoji: "🌅",
    css: "sepia(0.35) saturate(1.4) contrast(1.05)",
    tintColor: "#f59e0b",
    tintOpacity: 0.18,
  },
  {
    id: "bw",
    name: "B&W Noir",
    emoji: "🎬",
    css: "grayscale(1) contrast(1.2)",
    tintColor: "#000000",
    tintOpacity: 0.28,
  },
  {
    id: "vintage",
    name: "Vintage 90s",
    emoji: "📼",
    css: "sepia(0.65) contrast(1.1) brightness(0.95)",
    tintColor: "#78350f",
    tintOpacity: 0.24,
  },
  {
    id: "vivid",
    name: "Vivid Pop",
    emoji: "🌈",
    css: "contrast(1.25) saturate(1.6) brightness(1.05)",
    tintColor: "#06b6d4",
    tintOpacity: 0.15,
  },
  {
    id: "dreamy",
    name: "Dreamy Glow",
    emoji: "🌸",
    css: "brightness(1.08) contrast(0.95) saturate(1.3)",
    tintColor: "#c084fc",
    tintOpacity: 0.18,
  },
  {
    id: "cyber",
    name: "Cool Cyber",
    emoji: "❄️",
    css: "hue-rotate(180deg) saturate(1.3)",
    tintColor: "#3b82f6",
    tintOpacity: 0.16,
  },
];

export function getFilterById(id?: string): VideoFilter {
  if (!id || id === "normal") return VIDEO_FILTERS[0];
  return VIDEO_FILTERS.find((f) => f.id === id) || VIDEO_FILTERS[0];
}

