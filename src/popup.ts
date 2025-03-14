import { GoogleGenerativeAI } from '@google/generative-ai';

async function analyzeJobText(jobText: string) {
  const prompt = `Analyze the following job description and extract key skills and requirements:\n\n${jobText}`;
  const analysis = await generateContent(prompt);
  return analysis;
}

async function generateQuestions(jobText: string) {
  const prompt = `Generate 5 technical and 5 behavioral interview questions based on the following job description:\n\n${jobText}`;
  const questions = await generateContent(prompt);
  return questions?.split('\n').filter((q) => q.trim() !== '');
}

async function generateContent(prompt: string) {
  const apiKey: string = await new Promise((resolve) => {
    chrome.storage.sync.get(['apiKey'], (result) => {
      resolve(result.apiKey);
    });
  });

  if (!apiKey) {
    console.error('API key is not defined.');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  try {
    const result = await model.generateContent(prompt);
    console.log(result);
    return result.response.text();
  } catch (error) {
    console.error('Error generating content:', error);
  }
}

function displayQuestions(questions: string[]) {
  const questionsOl = document.getElementById('questions');

  if (!questionsOl) {
    console.error('Element with id "questions" not found.');
    return;
  }

  questionsOl.innerHTML = '';
  questions.forEach((q, index) => {
    const li = document.createElement('li');
    li.className = 'question';

    const span = document.createElement('span');
    span.innerText = `Question ${index + 1}: ${q}`;

    const dontKnowBtn = document.createElement('button');
    dontKnowBtn.className = 'dontKnowBtn';
    dontKnowBtn.innerText = "Don't know";

    questionsOl.appendChild(li);
    li.appendChild(span);
    li.appendChild(dontKnowBtn);

    dontKnowBtn.addEventListener('click', async () => {
      dontKnowBtn.classList.add('loading');
      dontKnowBtn.innerText = '';

      const hintAnswer = await generateContent(q);

      if (hintAnswer) {
        dontKnowBtn.style.display = 'none';
        const hint = document.createElement('p');
        hint.className = 'hint';
        hint.innerText = hintAnswer;
        li.appendChild(hint);
      }
    });
  });
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

    if (questions) {
      displayQuestions(questions);
    }
  });
});
