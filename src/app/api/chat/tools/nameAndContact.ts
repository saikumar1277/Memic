import { Agent, Runner, tool, FunctionTool, RunContext } from "@openai/agents";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const nameAndContactInfoFormatTool: FunctionTool<any> = {
  type: "function",
  name: "nameAndContactInfoFormat",
  description: "Updates the name and contact info section of the resume",
  parameters: {
    type: "object",
    properties: {
      htmlToUpdate: { type: "string", description: "The html to be updated" },
      jobDescription: { type: "string", description: "The job description" },
      userQuestion: { type: "string", description: "The user question" },
      resumeId: {
        type: "string",
        description: "The ID of the resume being edited",
      },
    },
    required: ["htmlToUpdate", "jobDescription", "userQuestion", "resumeId"],
    additionalProperties: false,
  },
  strict: true,
  needsApproval: async () => false,
  invoke: async (_context: RunContext<unknown>, input: string) => {
    const parsedInput = JSON.parse(input) as {
      htmlToUpdate: string;
      jobDescription: string;
      userQuestion: string;
      resumeId: string;
    };

    // Create a sub-agent for this tool
    const subAgent = new Agent({
      name: "NameAndContactInfoUpdater",
      instructions: `
      # Role and Objective
      You are HTML, CSS and Resume building expert for tiptap editor, your task is to correctly construct the NewEditorHTML and DiffEditorHTML by updating the OldEditorHTML based on the job description and user question.

     # Instructions:
      You must format the name and contact info to be in the following format: Make name on the 1st line in the center and all the contact info on the 2nd line in the center.
      Name should be on the first line centered.
      Contact info should be on the second line centered, separated by " | ".
      All contact info elements should be on the same line.
      Only use span tags if they already exist in the original HTML. Do not create new span tags unless they are already present in the existing structure.

      STEPS:
      First build NewEditorHTML by updating the OldEditorHTML based on the job description and user question.
      Then build DiffEditorHTML by comparing the NewEditorHTML and OldEditorHTML. For removed content wrap it mark tag with style="background-color: #fdb8c0;" and for added content wrap it mark tag with style="background-color: #acf2bd;". If adding mark tags inside existing span tags, preserve the span structure as it was in the original HTML. IMPORTANT: Only highlight actual text content changes, NOT style attribute changes. If only style attributes change between tags (e.g., style="color: red" to style="color: blue"), do NOT show this as a diff. Only wrap content in <mark> tags when the actual text content is added or removed. Ignore changes to inline style attributes when determining what to highlight.

      IMPORTANT:
      - Do not remove or add any content from the OldEditorHTML.
      - Create NewEditorHTML by updating the OldEditorHTML based on the job description and user question.
      - Create DiffEditorHTML by comparing the NewEditorHTML and OldEditorHTML.
      - Do not remove or add any content from the NewEditorHTML.
      - Do not remove or add any content from the DiffEditorHTML.

      OUTPUT FORMAT:    
      OldEditorHTML: The original HTML content you received (before any changes) (MUST be returned exactly as received, with no changes)
      NewEditorHTML: The modified HTML content (after changes, without diff styling) (MUST be the full HTML, not just the changed part)
      DiffEditorHTML: Generate a diff view of the OldEditorHTML and NewEditorHTML. 

      Before returning the output, think step by step and make sure you have followed the steps correctly.

`,
      outputType: z.object({
        oldEditorHTML: z.string(),
        newEditorHTML: z.string(),
        diffEditorHTML: z.string(),
      }),
    });
    const subRunner = new Runner({ model: "gpt-4.1" });
    const prompt = `Job Description: ${parsedInput.jobDescription}\nUser Question: ${parsedInput.userQuestion}\nHTML to Update: ${parsedInput.htmlToUpdate}`;
    try {
      const result: any = await subRunner.run(subAgent, prompt);
      let outputText = "";
      if (result && typeof result === "object" && "output" in result) {
        outputText = result.output;
      } else if (typeof result === "string") {
        outputText = result;
      } else if (
        Array.isArray(result) &&
        result.length > 0 &&
        typeof result[0] === "string"
      ) {
        outputText = result[0];
      } else {
        outputText = JSON.stringify(result);
      }
      // Parse the result to validate oldEditorHTML
      // Get current resume content from database
      const resume = await prisma.resume.findUnique({
        where: {
          id: parsedInput.resumeId,
        },
        select: {
          content: true,
        },
      });

      // Parse the result to validate oldEditorHTML
      try {
        const parsedResult = outputText as any;

        // Try multiple parsing approaches for robustness
        let res;
        try {
          // First try direct parsing (for newer format)
          res =
            typeof parsedResult === "string"
              ? JSON.parse(parsedResult)
              : parsedResult;
        } catch {
          // Fallback to nested parsing (for older format)
          res = JSON.parse(parsedResult[0].content[0].text);
        }

        // Validate that the oldEditorHTML from the tool matches what's in the current editor
        if (
          res.oldEditorHTML &&
          resume?.content &&
          !resume?.content.includes(res.oldEditorHTML.trim())
        ) {
          // Tool failed - return failure response with current resume content
          return JSON.stringify({
            success: false,
            oldEditorHTML: parsedInput.htmlToUpdate,
            newEditorHTML: parsedInput.htmlToUpdate,
            diffEditorHTML: parsedInput.htmlToUpdate,
            error: `TOOL_VALIDATION_FAILED: The HTML section to be updated was not found in the current editor. This likely means the editor content has changed since the tool was called. 

RETRY REQUIRED: Use the currentResumeContent provided below as the new currentEditorHTML parameter. Extract the name and contact section from this updated content and retry the tool call.

Current editor content: ${resume?.content}
`,
            retryInstructions:
              "Extract the name and contact section from currentResumeContent and retry the nameAndContactInfoFormat tool with: 1) htmlToUpdate = name and contact section from currentResumeContent, 2) same jobDescription and userQuestion",
            currentResumeContent: resume?.content || "",
          });
        }

        // Success case - add success flag and current resume content
        const successResult = {
          success: true,
          ...(typeof parsedResult === "string"
            ? JSON.parse(parsedResult)
            : parsedResult),
          currentResumeContent: resume?.content || "",
        };

        return JSON.stringify(successResult);
      } catch (parseError: any) {
        // Return failure response with current resume content
        return JSON.stringify({
          success: false,
          oldEditorHTML: parsedInput.htmlToUpdate,
          newEditorHTML: parsedInput.htmlToUpdate,
          diffEditorHTML: parsedInput.htmlToUpdate,
          error: `Failed to parse tool output: ${parseError.message}. RETRY REQUIRED: Use the currentResumeContent below and retry the tool call.`,
          retryInstructions:
            "Extract the name and contact section from currentResumeContent and retry the nameAndContactInfoFormat tool with: 1) htmlToUpdate = name and contact section from currentResumeContent, 2) same jobDescription and userQuestion",
          currentResumeContent: resume?.content || "",
        });
      }
    } catch (error: any) {
      // Get current resume content even in error case
      let currentResumeContent = "";
      try {
        const resume = await prisma.resume.findUnique({
          where: {
            id: parsedInput.resumeId,
          },
          select: {
            content: true,
          },
        });
        currentResumeContent = resume?.content || "";
      } catch (dbError) {}

      // Return error response instead of throwing
      return JSON.stringify({
        success: false,
        oldEditorHTML: parsedInput.htmlToUpdate,
        newEditorHTML: parsedInput.htmlToUpdate,
        diffEditorHTML: parsedInput.htmlToUpdate,
        error: `Name and Contact update tool failed: ${
          error.message || "Unknown error"
        }`,
        currentResumeContent: currentResumeContent,
      });
    }
  },
};
