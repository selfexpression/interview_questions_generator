import OpenAI from 'openai';
import { OPENAI_CONFIG, SYSTEM_PROMPTS } from '../shared/constants';

class LLMService {
  private static instance: LLMService | null = null;
  private openAI: OpenAI | null = null;

  constructor() {
    this.openAIInitialize();
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  private openAIInitialize(): void {
    if (this.openAI) {
      console.error('OpenAI is already initialized');
      return;
    }

    const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    this.openAI = new OpenAI({
      baseURL: OPENAI_CONFIG.BASE_URL,
      apiKey: openAIApiKey,
    });
  }

  public async generateJSONContent(
    prompt: string,
    structure: Record<string, string[]>
  ): Promise<string | null | undefined> {
    try {
      const completion = await this.openAI?.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `${
              SYSTEM_PROMPTS.GENERATE_JSON_CONTENT
            } Structure: ${JSON.stringify(structure)}`,
          },
          { role: 'user', content: prompt },
        ],
        model: OPENAI_CONFIG.MODEL,
        response_format: { type: 'json_object' },
      });

      return completion?.choices[0].message.content;
    } catch (error) {
      throw new Error('Error generating JSON content');
    }
  }

  public async generateAnswer(
    prompt: string
  ): Promise<string | null | undefined> {
    try {
      const completion = await this.openAI?.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.GENERATE_ANSWER,
          },
          { role: 'user', content: prompt },
        ],
        model: OPENAI_CONFIG.MODEL,
      });

      return completion?.choices[0].message.content;
    } catch (error) {
      throw new Error('Error generating answer');
    }
  }
}

export const LLMServiceInstance = LLMService.getInstance();
