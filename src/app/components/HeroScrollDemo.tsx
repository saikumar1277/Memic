"use client";
import React from "react";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-24 duration-1000">
        <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl"></div>

        <div className="mt-4 sm:mt-6 text-center px-4">
          <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Build your resume the same way you build code.
          </p>
        </div>
      </div>
    </div>
  );
}
