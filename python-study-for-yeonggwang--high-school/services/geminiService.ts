import { GoogleGenAI } from "@google/genai";

// FIX: Refactored to align with @google/genai coding guidelines.
// The API key is now sourced directly and exclusively from `process.env.API_KEY`.
// Fallback keys and manual checks within functions have been removed, as the guidelines
// state to assume the key is always provided in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const prompts = {
  feedback: {
    en: (code: string) => `
      You are an expert Python programming instructor. 
      Analyze the following Python code submitted by a student. 
      Provide constructive feedback on correctness, style (PEP 8), and potential improvements. 
      Keep the feedback concise, encouraging, and easy for a beginner to understand. 
      Format your feedback using markdown. Start with a general overview, then use bullet points for specific suggestions.
      
      The student's code is:
      \`\`\`python
      ${code}
      \`\`\`
    `,
    ko: (code: string) => `
      당신은 전문 파이썬 프로그래밍 강사입니다.
      학생이 제출한 다음 파이썬 코드를 분석해주세요.
      정확성, 스타일(PEP 8), 그리고 개선점에 대한 건설적인 피드백을 제공해주세요.
      피드백은 간결하고, 격려가 되며, 초보자가 이해하기 쉽게 작성해주세요.
      피드백은 마크다운을 사용하여 서식을 지정해주세요. 전반적인 개요로 시작한 다음, 글머리 기호를 사용하여 구체적인 제안을 해주세요.

      학생의 코드는 다음과 같습니다:
      \`\`\`python
      ${code}
      \`\`\`
    `
  },
  explanation: {
    en: (code: string) => `
      You are a Python code explainer. 
      Provide a very brief, one-sentence explanation for each line or logical block of the following Python code.
      Be as concise as possible.
      Format your response using markdown.

      The student's code is:
      \`\`\`python
      ${code}
      \`\`\`
    `,
    ko: (code: string) => `
      당신은 파이썬 코드 설명가입니다.
      다음 파이썬 코드의 각 줄 또는 논리적 블록에 대해 매우 간결한 한 문장으로 된 설명을 제공해주세요.
      최대한 간결하게 작성해주세요.
      응답은 마크다운을 사용하여 서식을 지정해주세요.

      학생의 코드는 다음과 같습니다:
      \`\`\`python
      ${code}
      \`\`\`
    `
  }
};


export const getCodeFeedback = async (code: string, locale: 'en' | 'ko' = 'en'): Promise<string> => {
  try {
    const prompt = prompts.feedback[locale](code);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching code feedback from Gemini:", error);
    return "An error occurred while generating feedback. Please try again later.";
  }
};

export const getCodeExplanation = async (code: string, locale: 'en' | 'ko' = 'en'): Promise<string> => {
  try {
    const prompt = prompts.explanation[locale](code);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching code explanation from Gemini:", error);
    return "An error occurred while generating the explanation. Please try again later.";
  }
};