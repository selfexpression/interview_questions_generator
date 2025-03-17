import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: apiKey,
});

async function generateJSONContent(
  prompt: string,
  structure: Record<string, string>
) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant. Your task is to help analyze and study information from vacancies on job search sites, and then provide an answer to the user's current prompt 3. Return the result as a JSON object with the following structure: ${JSON.stringify(
          structure
        )}`,
      },
      { role: 'user', content: prompt },
    ],
    model: 'deepseek-chat',
    response_format: { type: 'json_object' },
  });

  return completion.choices[0].message.content;
}

async function generateAnswer(prompt: string) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a developer interviewing for a job. You need to answer technical and behavioral questions to successfully pass the interview. Your answers should be concise and to the point, no more than 2-3 sentences. Focus on providing clear and actionable information.',
      },
      { role: 'user', content: prompt },
    ],
    model: 'deepseek-chat',
  });

  return completion.choices[0].message.content;
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'GENERATE_ANSWER') {
    generateAnswer(message.prompt)
      .then((result) => sendResponse({ result }))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'GENERATE_JSON_CONTENT') {
    generateJSONContent(message.prompt, message.structure)
      .then((result) => sendResponse({ result }))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const manifest = chrome.runtime.getManifest();
  if (!manifest.content_scripts) return;

  for (const cs of manifest.content_scripts) {
    const tabs = await chrome.tabs.query({ url: cs.matches });

    for (const tab of tabs) {
      if (tab.url?.match(/(chrome|chrome-extension):\/\//gi)) {
        console.warn(`Skipping tab with URL: ${tab.url}`);
        continue;
      }

      if (!tab.id) {
        console.error(`Tab ID is missing for URL: ${tab.url}`);
        continue;
      }

      const target = { tabId: tab.id, allFrames: cs.all_frames };

      if (cs.js && cs.js.length > 0) {
        try {
          await chrome.scripting.executeScript({
            target,
            files: cs.js,
            injectImmediately: cs.run_at === 'document_start',
          });
        } catch (error) {
          console.error(`Failed to inject scripts into tab ${tab.id}:`, error);
        }
      }
    }
  }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'GET_JOB_TEXT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      const tabUrl = tabs[0]?.url;

      if (tabUrl?.startsWith('chrome://')) {
        sendResponse({
          error: 'Cannot extract text from internal Chrome pages.',
        });
        return;
      }

      if (!tabId) {
        sendResponse({ error: 'No active tab found or tab ID is missing.' });
        return;
      }

      chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_TEXT' }, (response) => {
        sendResponse(response);
      });
    });
    return true;
  }
});
