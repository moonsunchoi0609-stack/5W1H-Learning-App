import { GoogleGenAI, Type } from "@google/genai";
import { Article, Difficulty, AnalysisResult } from "../types";

// Lazy Initialization of Gemini Client
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please check your environment variables.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const modelName = 'gemini-2.5-flash';

// Helper to handle markdown code blocks in JSON response
const parseResponse = (text: string) => {
  try {
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON Parse Error:", error);
    console.error("Raw Text:", text);
    throw new Error("Failed to parse AI response");
  }
};

export const analyzeArticleWithAI = async (articleText: string, difficulty: Difficulty = 'medium'): Promise<AnalysisResult> => {
  try {
    const client = getAiClient();
    
    // [분석 난이도 설정] 문해력 수준에 맞춰 요약 답변의 난이도 조절
    let answerLevel = "";
    if (difficulty === 'easy') {
      answerLevel = "유치원생도 이해할 수 있는 아주 기초적인 단어와 매우 짧은 문장"; 
    } else if (difficulty === 'hard') {
      answerLevel = "초등학교 고학년 수준의 표준적인 문장";
    } else {
      answerLevel = "초등학교 저학년 수준의 쉬운 문장";
    }

    const prompt = `
      다음 텍스트를 분석하여 육하원칙(누가, 언제, 어디서, 무엇을, 어떻게, 왜)에 해당하는 내용을 추출하세요.
      
      [요구사항]
      1. 'answers': 각 항목에 대한 가장 핵심적인 내용, 즉, 명사구나 핵심 동사구 형태로 간결하게 요약하여 한국어로 작성하세요. ${answerLevel}을 지키며, 가능하면 1문장으로 작성하고, 최대 2문장을 넘지 않도록 하세요.
      2. 'quotes': 본문에서 근거가 되는 부분을 정확히 발췌하세요.
      3. 명시되지 않은 정보는 '알 수 없음'으로 표시하세요.

      분석할 텍스트:
      ${articleText.substring(0, 5000)}
    `;

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answers: {
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
            quotes: {
              type: Type.OBJECT,
              properties: {
                who: { type: Type.ARRAY, items: { type: Type.STRING } },
                when: { type: Type.ARRAY, items: { type: Type.STRING } },
                where: { type: Type.ARRAY, items: { type: Type.STRING } },
                what: { type: Type.ARRAY, items: { type: Type.STRING } },
                how: { type: Type.ARRAY, items: { type: Type.STRING } },
                why: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["who", "when", "where", "what", "how", "why"],
            }
          },
          required: ["answers", "quotes"],
        },
      },
    });

    if (response.text) {
      return parseResponse(response.text) as AnalysisResult;
    }
    throw new Error("No response text from AI");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
};

export const refineTextForW1H = async (text: string): Promise<string> => {
  return text;
};

export const generateEducationalArticle = async (topic: string, difficulty: Difficulty = 'medium'): Promise<Article> => {
  
  // [공통 설정] 생활연령은 모두 청소년(중고등) 기준 -> 유치한 말투 배제
  const baseTone = "생활연령이 청소년(중고등학생)임을 명심하세요. 절대 '우리 친구들~' 같은 유치한 말투나 반말을 쓰지 말고, 성인을 대하듯 존중하는 정중한 '해요체'를 사용하세요.";

  let literacyDescription = "";
  let writingStyle = "";
  let lengthGuide = "";

  if (difficulty === 'easy') {
    // Easy: 유치원 문해력 + 청소년 생활연령
    literacyDescription = "글을 거의 읽지 못하거나 유치원생 수준의 문해력을 가진 학생";
    writingStyle = "가장 기초적인 단어만 사용. 복문 금지(주어+서술어 형태). 추상적인 표현 배제.";
    lengthGuide = "300~400자 내외 (부담 없이 읽을 수 있는 분량)";
  } else if (difficulty === 'hard') {
    // Hard: 초등 고학년 문해력 + 청소년 생활연령
    literacyDescription = "초등학교 고학년(4~6학년) 수준의 문해력을 가진 학생";
    writingStyle = "육하원칙이 잘 드러나는 표준적인 문장 구조. 인과관계가 명확한 서술.";
    lengthGuide = "800~1000자 내외 (내용이 풍부하고 긴 분량)";
  } else {
    // Medium: 초등 저학년 문해력 + 청소년 생활연령
    literacyDescription = "초등학교 저학년(1~3학년) 수준의 문해력을 가진 학생";
    writingStyle = "일상적인 쉬운 어휘 사용. 문장은 길지 않게 끊어서 작성.";
    lengthGuide = "600자 내외 (적당한 분량)";
  }

  try {
    const client = getAiClient();
    const prompt = `
      주제 '${topic}'에 대해 교육용 읽기 자료를 작성해 주세요.

      [핵심 독자 설정]
      1. 문해력 수준: ${literacyDescription}
      2. 생활연령: 중·고등학생 (청소년)
      
      [작성 가이드]
      1. 어조: ${baseTone}
      2. 문체 스타일: ${writingStyle}
      3. 목표 분량: ${lengthGuide}
      4. 구성 방식 (핵심):
         - **[글감 생성 지침] 문해력이 낮은 청소년의 읽기 수준을 고려하여 다음 조건에 맞는 쉬운 일화 또는 사건 중심 글감을 선정하고 생성해야 합니다.**
           - 주요 사건이나 인물에 대한 내용으로, 시간의 흐름에 따라 진행된 단일 사건 또는 구체적인 일화를 다룰 것. (허구의 이야기, 동화 형식 허용)
           - 육하원칙(누가, 언제, 어디서, 무엇을, 어떻게, 왜) 요소가 모두 포함될 수 있는 명확한 정보를 가질 것.
           - 정보는 간결하고 명확해야 하며, 복잡하거나 추상적인 개념의 도입을 지양할 것.
         - **절대로** '언제: O월 O일', '장소: OO' 처럼 정보를 요약하거나 나열하지 마세요.
         - 사건이 일어난 순서나 인과 관계에 따라 자연스러운 줄글(이야기) 형태로 서술하세요.
         - 학생이 글을 꼼꼼히 읽어야만 육하원칙 요소를 발견할 수 있도록 문맥 속에 정보를 자연스럽게 녹여내세요.
         - **[가독성] 전체 글의 내용의 흐름과 논리적 단위를 고려하여 적절하게 문단을 나누고 줄바꿈을 하여 보기 좋게 출력하세요.**
      5. 주의사항:
         - [사실 엄수] 사실에 기반한 글을 작성하는 경우에만 없는 사실을 지어내거나(날조/허위 정보 생성) 추측을 사실인 것처럼 서술하는 행위를 일절 금합니다. (단, 일화나 동화 등 허구적 서사를 의도한 경우에는 해당하지 않음) 모든 내용은 반드시 검증된 사실에 근거해야 합니다.
         - 문해력이 낮은 청소년이 낮은 단계를 쉬운 단계의 글을 선택할 수 있도록 중립적인 톤을 유지하되 표현만 쉽게 바꾸세요.
         - 사실관계를 해치지 않는 선에서 배경 설명을 덧붙여 이해를 도우세요.
         - 한국어 맞춤법, 띄어쓰기, 문장 부호(마침표, 쉼표 등)를 오류 없이 완벽하게 준수해야 합니다.

      응답은 JSON 형식만 반환하세요.
    `;

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["title", "category", "content"],
        },
      },
    });

    if (response.text) {
      const data = parseResponse(response.text);
      return {
        id: `gen_${Date.now()}`,
        title: data.title,
        category: data.category,
        content: data.content,
        source: 'AI 생성 활동지',
        readTime: difficulty === 'easy' ? '쉬움' : difficulty === 'hard' ? '어려움' : '보통',
        keywords: [topic, 'AI작문']
      };
    }
    throw new Error("No text generated");
  } catch (error) {
    console.error("Article generation failed:", error);
    throw error;
  }
};

export const getRecommendedKeywords = async (): Promise<string[]> => {
  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: modelName,
      contents: `✅ 육하원칙(누가, 언제, 어디서, 무엇을, 어떻게, 왜) 분석에 가장 적합한 구체적인 검색 키워드 6가지를 추천해주세요.
      * **다양성 확보:** 생활 일화, 판타지 동화, 역사적 상상, 환경 관련 이야기 등 **최소 5개 이상의 다양한 분야**에서 랜덤하게 선정하여 매번 새로운 느낌을 주도록 하세요.
      * **적합성 기준 (허구 허용):** 키워드는 **'특정 시점과 장소에서 발생한 단일 사건이나 일화'**를 가리켜야 하며, 이는 **실제 사실이 아닌 허구의 이야기**여도 무방합니다. (예: '준우의 토요일', '하늘을 나는 강아지 몽실이의 하루', '시간 여행자가 발견한 미래의 모습')
      * **구체성:** 광범위하거나 추상적인 단어는 피하고, **육하원칙 요소(특히, 주체, 시간, 장소, 사건, 과정)가 명확하게 드러날 수 있는 구체적인 소재**를 제시하세요.
      * **탐구 가능성:** 사건의 전개 과정('어떻게')과 캐릭터의 동기/원인('왜')을 탐구할 여지(즉, 문맥 속에 정보가 숨겨져 있을 여지)가 있는 주제여야 합니다.`,
      config: {
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      const keywords = parseResponse(response.text);
      if (Array.isArray(keywords)) return keywords;
    }
    return [];
  } catch (e) {
    console.error("Failed to fetch keywords", e);
    return [];
  }
};