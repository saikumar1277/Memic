import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { AtsScoreResult } from "@/app/components/ats-score/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const stopWords = new Set([
    "the", "and", "for", "with", "you", "your", "our", "are", "will", "this",
    "that", "from", "have", "has", "was", "were", "been", "being", "their",
    "they", "them", "about", "into", "using", "use", "work", "experience",
  ]);

  const frequency = new Map<string, number>();
  for (const word of words) {
    if (stopWords.has(word)) continue;
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([word]) => word);
}

function buildFallbackScore(
  resumeText: string,
  jobDescription: string
): AtsScoreResult {
  const resumeLower = resumeText.toLowerCase();
  const jobKeywords = extractKeywords(jobDescription);
  const matched = jobKeywords.filter((keyword) =>
    resumeLower.includes(keyword)
  );
  const missing = jobKeywords.filter(
    (keyword) => !resumeLower.includes(keyword)
  );

  const keywordScore =
    jobKeywords.length === 0
      ? 70
      : Math.round((matched.length / jobKeywords.length) * 100);

  const lengthScore =
    resumeText.length > 400 && resumeText.length < 6000 ? 85 : 60;

  const overallScore = Math.round((keywordScore * 0.7 + lengthScore * 0.3));

  return {
    overallScore,
    summary:
      overallScore >= 75
        ? "Your resume matches many keywords from the job description."
        : "Your resume could better align with this job description.",
    categories: [
      {
        name: "Keyword Match",
        score: keywordScore,
        feedback: `${matched.length} of ${jobKeywords.length} important keywords found in your resume.`,
      },
      {
        name: "Content Length",
        score: lengthScore,
        feedback:
          resumeText.length < 400
            ? "Your resume looks short. Add more relevant experience and skills."
            : "Your resume has a reasonable amount of content for ATS parsing.",
      },
      {
        name: "Formatting",
        score: 75,
        feedback:
          "Plain text was detected successfully. Avoid tables and graphics for best ATS results.",
      },
    ],
    keywordMatch: { matched, missing: missing.slice(0, 8) },
    suggestions: [
      missing.length > 0
        ? `Consider adding these job keywords if you have the experience: ${missing.slice(0, 5).join(", ")}.`
        : "Strong keyword overlap. Focus on quantifying your impact in bullet points.",
      "Use standard section headings like Experience, Skills, and Education.",
      "Mirror important phrases from the job description in your bullet points.",
    ],
  };
}

export async function POST(request: NextRequest) {
  let resumeText = "";
  let jobDescription = "";

  try {
    const body = await request.json();
    resumeText = body.resumeText ?? "";
    jobDescription = body.jobDescription ?? "";

    if (!resumeText?.trim()) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    if (!jobDescription?.trim()) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        buildFallbackScore(resumeText, jobDescription)
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an ATS resume scoring expert. Analyze how well a resume matches a job description.
Return JSON with this exact shape:
{
  "overallScore": number (0-100),
  "summary": string,
  "categories": [{ "name": string, "score": number, "feedback": string }] (exactly 3 items: Keyword Match, Experience Alignment, Formatting & Clarity),
  "keywordMatch": { "matched": string[], "missing": string[] },
  "suggestions": string[] (3 actionable tips)
}
Be practical, concise, and encouraging.`,
        },
        {
          role: "user",
          content: `Resume:\n${resumeText.slice(0, 8000)}\n\nJob Description:\n${jobDescription.slice(0, 4000)}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        buildFallbackScore(resumeText, jobDescription)
      );
    }

    const parsed = JSON.parse(content) as AtsScoreResult;
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("ATS score error:", error);

    if (resumeText && jobDescription) {
      return NextResponse.json(
        buildFallbackScore(resumeText, jobDescription)
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
