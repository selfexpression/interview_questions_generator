import { LLMServiceInstance } from './services/llm';
import {
  MessageType,
  MessageRequest,
  MessageResponse,
} from './shared/types/messages';
import { handleError } from './shared/error-handler';

type MessageHandler = (
  message: MessageRequest,
  sendResponse: (response: MessageResponse) => void
) => Promise<void> | void;

const messageHandlers: Record<string, MessageHandler> = {
  [MessageType.GENERATE_ANSWER]: async (message, sendResponse) => {
    const result = await LLMServiceInstance.generateAnswer(
      message.prompt || ''
    );

    if (!result) {
      sendResponse({ error: 'Error generating answer' });
      return;
    }

    sendResponse({ result });
  },
  [MessageType.GENERATE_JSON_CONTENT]: async (message, sendResponse) => {
    const result = await LLMServiceInstance.generateJSONContent(
      message.prompt ?? '',
      message.structure ?? {}
    );

    if (!result) {
      sendResponse({ error: 'Error generating JSON content' });
      return;
    }

    sendResponse({ result });
  },
  [MessageType.GET_JOB_TEXT]: (_, sendResponse) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        return sendResponse({ error: 'No active tab found' });
      }

      if (tab.url?.startsWith('chrome://')) {
        return sendResponse({
          error: 'Cannot extract text from chrome:// pages',
        });
      }

      chrome.tabs.sendMessage(
        tab.id,
        { type: MessageType.EXTRACT_TEXT },
        sendResponse
      );
    });
  },
};

chrome.runtime.onMessage.addListener(
  (message: MessageRequest, _, sendResponse) => {
    const handler = messageHandlers[message.type];
    if (!handler) return;

    Promise.resolve(handler(message, sendResponse)).catch((error) =>
      sendResponse(handleError(error))
    );
    return true;
  }
);

chrome.runtime.onInstalled.addListener(async () => {
  const manifest = chrome.runtime.getManifest();
  const contentScripts = manifest.content_scripts ?? [];

  for (const cs of contentScripts) {
    const tabs = await chrome.tabs.query({ url: cs.matches });

    for (const tab of tabs) {
      if (tab.url?.match(/(chrome|chrome-extension):\/\//)) continue;

      if (!tab.id) {
        console.error(`Tab ID missing for URL: ${tab.url}`);
        continue;
      }

      const target = { tabId: tab.id, allFrames: cs.all_frames };
      if (cs.js?.length) {
        try {
          await chrome.scripting.executeScript({
            target,
            files: cs.js,
            injectImmediately: cs.run_at === 'document_start',
          });
        } catch (error) {
          console.error(`Script injection failed for tab ${tab.id}:`, error);
        }
      }
    }
  }
});
