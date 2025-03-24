import { MessageType, MessageRequest } from '../../../shared/types/messages';

interface IParsedResponse {
  technicalQuestions: string[];
  behavioralQuestions: string[];
}

const sendMessage = async <T>(message: MessageRequest): Promise<T> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (response.error) reject(new Error(response.error));
      else resolve(response.result ?? response.text);
    });
  });
};

const generateQuestions = async (jobText: string): Promise<IParsedResponse> => {
  const prompt = `
1. Analyze the job description and extract key skills and requirements:
---
${jobText}
---
2. Generate 3 technical and 3 behavioral interview questions.
`;
  const structure: Record<string, string[]> = {
    technicalQuestions: [''],
    behavioralQuestions: [''],
  };

  const result = await sendMessage<string>({
    type: MessageType.GENERATE_JSON_CONTENT,
    prompt,
    structure,
  });

  return JSON.parse(result);
};

const generateAnswer = (question: string): Promise<string> => {
  return sendMessage<string>({
    type: MessageType.GENERATE_ANSWER,
    prompt: question,
  });
};

export const messageHandlers = {
  sendMessage,
  generateQuestions,
  generateAnswer,
};
