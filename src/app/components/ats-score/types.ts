export type AtsStep = 1 | 2 | 3;

export type AtsScoreCategory = {
  name: string;
  score: number;
  feedback: string;
};

export type AtsScoreResult = {
  overallScore: number;
  summary: string;
  categories: AtsScoreCategory[];
  keywordMatch: {
    matched: string[];
    missing: string[];
  };
  suggestions: string[];
};

export const ATS_STEPS = [
  { number: 1, label: "Upload Resume" },
  { number: 2, label: "Add Job" },
  { number: 3, label: "View Results" },
] as const;
