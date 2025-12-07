import { GoogleGenAI, Type } from "@google/genai";
import { W1HAnswers } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

export const analyzeArticleWithAI = async (articleText: string): Promise<W1HAnswers> => {
  try {
    const prompt = `
      Analyze the following text and extract the 5W1H (Who, When, Where, What, How, Why) information.
      Return the result in Korean suitable for an elementary/middle school student.
      If a field is not explicitly mentioned, infer it reasonably or state '알 수 없음'.
      Keep answers concise (1-2 sentences max).

      Text:
      ${articleText.substring(0, 5000)}
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            who: { type: Type.STRING },
            when: { type: Type.STRING },
            where: { type: Type.STRING },
            what: { type: Type.STRING },
            how: { type: Type.STRING },
            why: { type: Type.STRING },
          },
          required: ["who", "when", "where", "what", "how", "why"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as W1HAnswers;
    }
    throw new Error("No response text from AI");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
};

export const simplifyTextWithAI = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Rewrite the following text to be easily understood by a 10-year-old child. Maintain the key facts but use simpler vocabulary. Text: ${text.substring(0, 3000)}`,
    });
    return response.text || text;
  } catch (error) {
      console.error("Simplification failed:", error);
      return text;
  }
}