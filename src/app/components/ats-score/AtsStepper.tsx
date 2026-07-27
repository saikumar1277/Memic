import { cn } from "@/lib/utils";
import React from "react";
import { ATS_STEPS, type AtsStep } from "./types";

type AtsStepperProps = {
  currentStep: AtsStep;
};

const AtsStepper = ({ currentStep }: AtsStepperProps) => {
  return (
    <div className="flex items-start justify-center w-full max-w-lg mx-auto">
      {ATS_STEPS.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center min-w-[88px] sm:min-w-[100px]">
              <div
                className={cn(
                  "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isActive || isCompleted
                    ? "bg-[#2563EB] text-white"
                    : "border-2 border-[#BFDBFE] text-[#93C5FD] bg-white"
                )}
              >
                {step.number}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs sm:text-sm text-center leading-tight",
                  isActive
                    ? "font-semibold text-[#1E3A8A]"
                    : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>

            {index < ATS_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mt-5 rounded-full mx-1 sm:mx-2",
                  currentStep > step.number ? "bg-[#2563EB]" : "bg-[#E5E7EB]"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export { AtsStepper };
