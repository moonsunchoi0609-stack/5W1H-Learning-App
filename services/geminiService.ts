import { GoogleGenAI, Type } from "@google/genai";
import { W1HAnswers } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

export const analyzeArticleWithAI = async (articleText: string): Promise<W1HAnswers> => {
  try {
    const prompt = `
      다음 텍스트를 분석하여 육하원칙(누가, 언제, 어디서, 무엇을, 어떻게, 왜)에 해당하는 내용을 추출하세요.
      결과는 한국어로 작성해야 하며, 초등학교 고학년이 이해하기 쉬운 문장으로 작성하세요.
      명시되지 않은 정보는 문맥을 통해 합리적으로 추론하거나, 전혀 알 수 없는 경우 '알 수 없음'으로 표시하세요.
      각 항목은 1~2문장으로 핵심만 요약하세요.

      분석할 텍스트:
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

export const refineTextForW1H = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `
          다음 텍스트를 읽고 학생들이 '육하원칙(5W1H)'을 스스로 찾아 빈칸을 채울 수 있도록 학습 자료용 지문으로 다듬어주세요.

[작성 가이드]

대상 독자 및 난이도: 초등학교 고학년 수준의 쉬운 어휘와 명확한 문장 구조를 사용하세요. (생활연령이 높은 학생도 읽기 편한 세련되지만 쉬운 문체)

구성 방식 (핵심):

'언제: O월 O일', '장소: OO' 처럼 정보를 요약하거나 나열하지 마세요.

사건이 일어난 순서나 인과 관계에 따라 자연스러운 줄글(이야기) 형태로 서술하세요.

학생이 글을 꼼꼼히 읽어야만 육하원칙 요소를 발견할 수 있도록 문맥 속에 정보를 자연스럽게 녹여내세요.

내용 보강: 원문의 정보가 너무 빈약하여 추론이 어렵다면, 사실관계를 해치지 않는 선에서 상황을 이해할 수 있는 배경 설명이나 묘사를 1~2문장 추가하세요.

어조: 친절하고 차분한 설명조('~합니다/했습니다')를 유지하세요.

          원문:
          ${text.substring(0, 4000)}
        `,
    });
    return response.text || text;
  } catch (error) {
      console.error("Refinement failed:", error);
      return text;
  }
}