"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AtsScoreResult } from "./types";

type ResultsStepProps = {
  result: AtsScoreResult;
  onStartOver: () => void;
};

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getScoreRingColor(score: number) {
  if (score >= 80) return "border-green-500";
  if (score >= 60) return "border-yellow-500";
  return "border-red-500";
}

const ResultsStep = ({ result, onStartOver }: ResultsStepProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col items-center text-center space-y-3">
        <div
          className={cn(
            "flex h-28 w-28 items-center justify-center rounded-full border-8 bg-white",
            getScoreRingColor(result.overallScore)
          )}
        >
          <span
            className={cn(
              "text-4xl font-bold",
              getScoreColor(result.overallScore)
            )}
          >
            {result.overallScore}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-[#1E3A8A]">Your ATS Score</h3>
        <p className="text-sm text-gray-600 max-w-lg">{result.summary}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {result.categories.map((category) => (
          <div
            key={category.name}
            className="rounded-xl border border-[#BFDBFE] bg-white p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1E3A8A]">
                {category.name}
              </p>
              <span
                className={cn(
                  "text-lg font-bold",
                  getScoreColor(category.score)
                )}
              >
                {category.score}
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {category.feedback}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#BFDBFE] bg-[#F0F7FF] p-4">
          <p className="text-sm font-semibold text-[#1E3A8A] mb-2">
            Matched keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {result.keywordMatch.matched.length > 0 ? (
              result.keywordMatch.matched.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">No strong matches yet</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#BFDBFE] bg-white p-4">
          <p className="text-sm font-semibold text-[#1E3A8A] mb-2">
            Missing keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {result.keywordMatch.missing.length > 0 ? (
              result.keywordMatch.missing.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">
                Great keyword coverage
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#BFDBFE] bg-white p-4 space-y-3">
        <p className="text-sm font-semibold text-[#1E3A8A]">
          Suggestions to improve
        </p>
        <ul className="space-y-2">
          {result.suggestions.map((suggestion) => (
            <li
              key={suggestion}
              className="text-sm text-gray-600 flex gap-2 leading-relaxed"
            >
              <span className="text-[#2563EB] font-bold">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onStartOver}
          className="rounded-xl border-[#BFDBFE] text-[#2563EB]"
        >
          Check another resume
        </Button>
      </div>
    </div>
  );
};

export { ResultsStep };
