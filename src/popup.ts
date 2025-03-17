interface IParsedResponse {
  technicalQuestions: string[];
  behavioralQuestions: string[];
}

async function generateQuestions(jobText: string): Promise<IParsedResponse> {
  const prompt = `
1. Analyze the following job description and extract key skills and requirements:
---
${jobText}
---

2. Based on the extracted skills and requirements, generate:
- 3 technical interview questions
- 3 behavioral interview questions
`;

  const structure = { technicalQuestions: [], behavioralQuestions: [] };

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'GENERATE_JSON_CONTENT', prompt, structure },
      (response) => {
        if (response.error) {
          console.error('Error:', response.error);
          reject(response.error);
        } else {
          try {
            const parsedResponse: IParsedResponse = JSON.parse(response.result);
            resolve(parsedResponse);
          } catch (error) {
            console.error('Failed to parse LLM response:', error);
            reject('Invalid response format from LLM');
          }
        }
      }
    );
  });
}

async function generateAnswer(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'GENERATE_ANSWER', prompt: question },
      (response) => {
        if (response.error) {
          console.error('Error:', response.error);
          reject(response.error);
        } else {
          resolve(response.result);
        }
      }
    );
  });
}

function displayQuestions(questions: string[], type: string) {
  const contentDiv = document.getElementById('content');

  const h4 = document.createElement('h4');
  h4.innerText = `${type} Questions`;

  const questionsOl = document.createElement('ol');
  questionsOl.className = 'questions';

  questionsOl.innerHTML = '';
  questions.forEach((q, index) => {
    const li = document.createElement('li');
    li.className = 'question';

    const span = document.createElement('span');
    span.innerText = `${index + 1}. ${q}`;

    const dontKnowBtn = document.createElement('button');
    dontKnowBtn.className = 'dontKnowBtn';
    dontKnowBtn.innerText = "Don't know";

    li.appendChild(span);
    li.appendChild(dontKnowBtn);
    questionsOl.appendChild(li);

    dontKnowBtn.addEventListener('click', async () => {
      dontKnowBtn.classList.add('loading');
      dontKnowBtn.innerText = '';

      const hintAnswer = await generateAnswer(q);

      if (hintAnswer) {
        dontKnowBtn.style.display = 'none';
        const hint = document.createElement('p');
        hint.className = 'hint';
        hint.innerText = hintAnswer;
        li.appendChild(hint);
      }
    });
  });

  if (contentDiv) {
    contentDiv.appendChild(h4);
    contentDiv.appendChild(questionsOl);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');

  generateBtn?.addEventListener('click', async () => {
    generateBtn.classList.add('loading');
    generateBtn.innerText = '';

    const jobText: string = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_JOB_TEXT' }, (response) => {
        resolve(response.text);
      });
    });

    const questions = await generateQuestions(jobText);

    generateBtn.style.display = 'none';

    displayQuestions(questions.technicalQuestions, 'Technical');
    displayQuestions(questions.behavioralQuestions, 'Behavioral');
  });
});
