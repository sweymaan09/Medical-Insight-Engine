import { openai } from "@workspace/integrations-openai-ai-server";
import type { LabValue } from "@workspace/db";

interface AnalysisResult {
  reportType: string;
  patientName: string | null;
  reportDate: string | null;
  summary: string;
  simplifiedExplanation: string;
  healthInsights: string;
  labValues: LabValue[];
  abnormalCount: number;
  criticalCount: number;
}

export async function analyzeReport(
  base64Content: string,
  mimeType: string,
  fileName: string
): Promise<AnalysisResult> {
  const systemPrompt = `You are a friendly health helper. You explain medical reports to people in villages who have no medical knowledge. Use very simple, easy words. Write like you are talking to a farmer or a house wife.

VERY IMPORTANT RULES:
- NEVER use big medical words. Use simple everyday words.
- NEVER say "consult a doctor" or "see a clinician" or "seek medical advice".
- ALWAYS tell them: what is the problem, what caused it, and what they can do at home to feel better.
- Write like explaining to a 10 year old child.
- Use short sentences. Maximum 15 words per sentence.
- Give real home remedies, food advice, and simple lifestyle tips.

When analyzing the report, extract:
1. Report type (like "Blood Test", "Sugar Test", "Kidney Test" - use simple names)
2. Patient name if visible (or null)
3. Report date if visible (or null)
4. A very short summary in simple words (2 sentences maximum)
5. A simple explanation - imagine explaining to a villager what this report means overall
6. Health advice - practical things they can eat, drink, do at home to feel better
7. All test values with simple explanations

For each test value, you must provide:
- "name": Simple name for the test (e.g. "Blood Sugar", "Red Blood Cells", "Iron Level")
- "value": The actual number from the report
- "unit": The unit
- "referenceRange": The normal range
- "status": "normal", "high", "low", or "critical"
- "explanation": 1 simple sentence explaining what this test checks (use words like "blood sugar" not "glucose")
- "problem": If not normal - what is happening in the body in simple words. If normal, say "Good! This is fine."
- "cause": If not normal - what common simple things cause this (bad food, less water, stress, etc). If normal, say "Keep eating well and staying healthy."
- "solution": If not normal - exactly what they can eat/drink/do at home to fix this. Be specific (e.g. "Drink 8 glasses of water daily. Eat green leafy vegetables. Walk 30 minutes every morning."). If normal, say "Continue your current healthy habits."

For status:
- "normal": value is within normal range
- "high": value is above normal (not dangerous but needs attention)
- "low": value is below normal (not dangerous but needs attention)
- "critical": value is dangerously high or low (needs urgent action at home immediately)

Respond ONLY with a valid JSON object:
{
  "reportType": "string",
  "patientName": "string or null",
  "reportDate": "string or null",
  "summary": "string",
  "simplifiedExplanation": "string",
  "healthInsights": "string",
  "labValues": [
    {
      "name": "string",
      "value": "string",
      "unit": "string",
      "referenceRange": "string",
      "status": "normal|high|low|critical",
      "explanation": "string",
      "problem": "string",
      "cause": "string",
      "solution": "string"
    }
  ]
}`;

  const userMessage =
    mimeType === "application/pdf"
      ? `Please analyze this medical report PDF named "${fileName}". Extract and explain all medical information as described.`
      : `Please analyze this medical report image named "${fileName}". Extract and explain all medical information as described.`;

  const isImage = mimeType.startsWith("image/");

  const messages: Parameters<typeof openai.chat.completions.create>[0]["messages"] =
    isImage
      ? [
          {
            role: "user",
            content: [
              { type: "text", text: userMessage },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Content}`,
                },
              },
            ],
          },
        ]
      : [
          {
            role: "user",
            content: `${userMessage}\n\nFile: ${fileName}\n\nPlease analyze this medical report and provide a complete JSON response.`,
          },
        ];

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });

  const content = response.choices[0]?.message?.content ?? "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI did not return valid JSON");
  }

  const result = JSON.parse(jsonMatch[0]) as AnalysisResult;

  const abnormalCount = result.labValues.filter(
    (v) => v.status === "high" || v.status === "low"
  ).length;
  const criticalCount = result.labValues.filter(
    (v) => v.status === "critical"
  ).length;

  return { ...result, abnormalCount, criticalCount };
}
