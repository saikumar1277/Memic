"use client";

import React from "react";
import { AtsStepper } from "./ats-score/AtsStepper";
import { JobStep } from "./ats-score/JobStep";
import { ResultsStep } from "./ats-score/ResultsStep";
import { UploadStep } from "./ats-score/UploadStep";
import type { AtsScoreResult, AtsStep } from "./ats-score/types";

const Features2 = () => {
  const [step, setStep] = React.useState<AtsStep>(1);
  const [resumeText, setResumeText] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [jobDescription, setJobDescription] = React.useState("");
  const [result, setResult] = React.useState<AtsScoreResult | null>(null);
  const [showPasteMode, setShowPasteMode] = React.useState(false);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsParsing(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ats-score/parse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to parse file");
      }

      setResumeText(data.text);
      setShowPasteMode(false);
    } catch (parseError) {
      setResumeText("");
      setFileName(null);
      setError(
        parseError instanceof Error
          ? parseError.message
          : "Failed to parse file"
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleAnalyze = async () => {
    setError(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to analyze resume");
      }

      setResult(data);
      setStep(3);
    } catch (analyzeError) {
      setError(
        analyzeError instanceof Error
          ? analyzeError.message
          : "Failed to analyze resume"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setResumeText("");
    setFileName(null);
    setJobDescription("");
    setResult(null);
    setShowPasteMode(false);
    setError(null);
  };

  return (
    <section id="ats-score" className="py-16 sm:py-24 lg:py-32 scroll-mt-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-3 mb-10 sm:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E3A8A] leading-tight">
            Get your free ATS resume score
          </h2>
          <p className="text-base sm:text-lg text-[#2563EB] font-medium">
            3x more interview callbacks
          </p>
        </div>

        <div className="mb-10 sm:mb-14">
          <AtsStepper currentStep={step} />
        </div>

        {step === 1 && (
          <UploadStep
            resumeText={resumeText}
            fileName={fileName}
            isParsing={isParsing}
            error={error}
            showPasteMode={showPasteMode}
            onTogglePasteMode={() => {
              setShowPasteMode((prev) => !prev);
              setError(null);
            }}
            onResumeTextChange={setResumeText}
            onFileSelect={handleFileSelect}
            onContinue={() => {
              setError(null);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <JobStep
            jobDescription={jobDescription}
            isAnalyzing={isAnalyzing}
            error={error}
            onJobDescriptionChange={setJobDescription}
            onBack={() => {
              setError(null);
              setStep(1);
            }}
            onAnalyze={handleAnalyze}
          />
        )}

        {step === 3 && result && (
          <ResultsStep result={result} onStartOver={handleStartOver} />
        )}
      </div>
    </section>
  );
};

export { Features2 };
