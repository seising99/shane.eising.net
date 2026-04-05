export const IDLE_VISUALIZER_HEIGHTS = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10] as const;

export const PLAYING_VISUALIZER_HEIGHTS = [34, 48, 56, 52, 40, 28, 22, 18, 16, 18, 20, 24, 28, 32, 26, 20] as const;

export const EQ_BANDS = [
  { label: "60", level: 72 },
  { label: "170", level: 56 },
  { label: "310", level: 44 },
  { label: "600", level: 58 },
  { label: "1K", level: 66 },
  { label: "3K", level: 74 },
  { label: "6K", level: 62 },
  { label: "12K", level: 50 },
  { label: "14K", level: 68 },
  { label: "16K", level: 78 },
] as const;
