import { MessageType, MessageRequest } from './shared/types/messages';

interface IParsedResponse {
  technicalQuestions: string[];
  behavioralQuestions: string[];
}

type TJSONStructure = Record<string, string[]>;

async function sendMessage<T>(message: MessageRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (response.error) reject(new Error(response.error));
      else resolve(response.result ?? response.text);
    });
  });
}

async function generateQuestions(jobText: string): Promise<IParsedResponse> {
  const prompt = `
1. Analyze the job description and extract key skills and requirements:
---
${jobText}
---
2. Generate 3 technical and 3 behavioral interview questions.
`;
  const structure: TJSONStructure = {
    technicalQuestions: [''],
    behavioralQuestions: [''],
  };

  const result = await sendMessage<string>({
    type: MessageType.GENERATE_JSON_CONTENT,
    prompt,
    structure,
  });

  return JSON.parse(result);
}

async function generateAnswer(question: string): Promise<string> {
  return sendMessage<string>({
    type: MessageType.GENERATE_ANSWER,
    prompt: question,
  });
}

function displayQuestions(
  questions: string[],
  type: string,
  container: HTMLElement
) {
  const h4 = document.createElement('h4');
  h4.textContent = `${type} Questions`;

  const ol = document.createElement('ol');
  ol.className = 'questions';

  questions.forEach((q, index) => {
    const li = document.createElement('li');
    li.className = 'question';

    const span = document.createElement('span');
    span.textContent = `${index + 1}. ${q}`;

    const btn = document.createElement('button');
    btn.className = 'dontKnowBtn';
    btn.textContent = "Don't know";

    li.append(span, btn);
    ol.appendChild(li);

    btn.addEventListener('click', async () => {
      btn.classList.add('loading');
      btn.textContent = '';
      const answer = await generateAnswer(q);
      btn.remove();
      const hint = document.createElement('p');
      hint.className = 'hint';
      hint.textContent = answer;
      li.appendChild(hint);
    });
  });

  container.append(h4, ol);
}

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const contentDiv = document.getElementById('content');

  generateBtn?.addEventListener('click', async () => {
    generateBtn.classList.add('loading');
    generateBtn.textContent = '';

    try {
      const jobText = await sendMessage<string>({
        type: MessageType.GET_JOB_TEXT,
      });
      const questions = await generateQuestions(jobText);
      generateBtn.style.display = 'none';

      if (contentDiv) {
        displayQuestions(questions.technicalQuestions, 'Technical', contentDiv);
        displayQuestions(
          questions.behavioralQuestions,
          'Behavioral',
          contentDiv
        );
      }
    } catch (error) {
      console.error('Popup error:', error);
      generateBtn.textContent = 'Error occurred';
    }
  });
});
