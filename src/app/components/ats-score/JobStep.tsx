"use client";

import { Button } from "@/components/ui/button";

type JobStepProps = {
  jobDescription: string;
  isAnalyzing: boolean;
  error: string | null;
  onJobDescriptionChange: (text: string) => void;
  onBack: () => void;
  onAnalyze: () => void;
};

const JobStep = ({
  jobDescription,
  isAnalyzing,
  error,
  onJobDescriptionChange,
  onBack,
  onAnalyze,
}: JobStepProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-[#1E3A8A]">
          Paste the job description
        </h3>
        <p className="text-sm text-gray-500">
          We&apos;ll compare your resume against this role to calculate your ATS
          score.
        </p>
      </div>

      <textarea
        value={jobDescription}
        onChange={(event) => onJobDescriptionChange(event.target.value)}
        placeholder="Paste the full job description here..."
        rows={12}
        className="w-full rounded-xl border border-[#BFDBFE] bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 resize-y"
      />

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isAnalyzing}
          className="rounded-xl border-[#BFDBFE] text-[#1E3A8A] w-full sm:w-auto"
        >
          Back
        </Button>
        <Button
          onClick={onAnalyze}
          disabled={!jobDescription.trim() || isAnalyzing}
          className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 w-full sm:w-auto"
        >
          {isAnalyzing ? "Analyzing..." : "Get ATS Score"}
        </Button>
      </div>
    </div>
  );
};

export { JobStep };
