"use client";

import React from "react";
import { FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UploadStepProps = {
  resumeText: string;
  fileName: string | null;
  isParsing: boolean;
  error: string | null;
  showPasteMode: boolean;
  onTogglePasteMode: () => void;
  onResumeTextChange: (text: string) => void;
  onFileSelect: (file: File) => void;
  onContinue: () => void;
};

const ACCEPTED_FILE_TYPES =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const UploadStep = ({
  resumeText,
  fileName,
  isParsing,
  error,
  showPasteMode,
  onTogglePasteMode,
  onResumeTextChange,
  onFileSelect,
  onContinue,
}: UploadStepProps) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (file) onFileSelect(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!showPasteMode ? (
        <>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 sm:py-16 transition-colors cursor-pointer",
              isDragging
                ? "border-[#2563EB] bg-[#EFF6FF]"
                : "border-[#BFDBFE] bg-[#F0F7FF]"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />

            <div className="relative mb-4">
              <div className="flex h-16 w-14 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB]">
                <FileUp className="h-8 w-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-white">
                <Upload className="h-3.5 w-3.5" />
              </div>
            </div>

            <p className="text-base sm:text-lg text-[#1E3A8A] text-center">
              Drag &amp; Drop or{" "}
              <span className="font-semibold text-[#2563EB] underline underline-offset-2">
                Choose file
              </span>{" "}
              to upload
            </p>
            <p className="mt-2 text-sm text-gray-500">as .pdf or .docx file</p>

            {isParsing && (
              <p className="mt-4 text-sm font-medium text-[#2563EB]">
                Reading your resume...
              </p>
            )}

            {fileName && !isParsing && (
              <p className="mt-4 text-sm font-medium text-[#1E3A8A]">
                Uploaded: {fileName}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onTogglePasteMode}
            className="block mx-auto text-sm font-medium text-[#2563EB] hover:underline"
          >
            Or paste resume text
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <textarea
            value={resumeText}
            onChange={(event) => onResumeTextChange(event.target.value)}
            placeholder="Paste your resume text here..."
            rows={12}
            className="w-full rounded-xl border border-[#BFDBFE] bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 resize-y"
          />
          <button
            type="button"
            onClick={onTogglePasteMode}
            className="block mx-auto text-sm font-medium text-[#2563EB] hover:underline"
          >
            Or upload a file instead
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      {resumeText.trim() && !isParsing && (
        <div className="flex justify-center">
          <Button
            onClick={onContinue}
            className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8"
          >
            Continue to Add Job
          </Button>
        </div>
      )}
    </div>
  );
};

export { UploadStep };
