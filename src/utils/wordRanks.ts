// ---------------------------------------------------------
// Типы
// ---------------------------------------------------------

export type WordRank = "SSS" | "SS" | "S" | "A" | "B" | "C" | "D" | "F";

export interface RankVisual {
  text: string;
  borderColor: string;
  borderGlow?: string;
  badgeBg: string;
}

// ---------------------------------------------------------
// Стили рангов
// ---------------------------------------------------------

export const rankStyles: Record<WordRank, RankVisual> = {
  SSS: {
    text: "linear-gradient(90deg,#f472b6,#e879f9)",
    borderColor: "#f472b6",
    borderGlow: "0 0 12px #f472b6aa",
    badgeBg: "linear-gradient(90deg,#f472b6,#e879f9)",
  },
  SS: {
    text: "#f97316",
    borderColor: "#f97316",
    borderGlow: "0 0 8px #f9731688",
    badgeBg: "#f97316",
  },
  S: {
    text: "#eab308",
    borderColor: "#eab308",
    borderGlow: "0 0 6px #eab30877",
    badgeBg: "#eab308",
  },
  A: {
    text: "#4ade80",
    borderColor: "#4ade80",
    badgeBg: "#4ade80",
  },
  B: {
    text: "#2dd4bf",
    borderColor: "#2dd4bf",
    badgeBg: "#2dd4bf",
  },
  C: {
    text: "#60a5fa",
    borderColor: "#60a5fa",
    badgeBg: "#60a5fa",
  },
  D: {
    text: "#a78bfa",
    borderColor: "#a78bfa",
    badgeBg: "#a78bfa",
  },
  F: {
    text: "#64748b",
    borderColor: "#334155",
    badgeBg: "#475569",
  },
};

// ---------------------------------------------------------
// Логика ранжирования
// rate = (count / maxCount) * 100, или что у тебя там
// ---------------------------------------------------------

export const getWordRank = (rate: number): WordRank => {
  if (rate >= 100) return "SSS";
  if (rate >= 50) return "SS";
  if (rate >= 30) return "S";
  if (rate >= 20) return "A";
  if (rate >= 10) return "B";
  if (rate >= 5) return "C";
  if (rate >= 3) return "D";
  return "F";
};
