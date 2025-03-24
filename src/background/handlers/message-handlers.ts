import { LLMServiceInstance } from '../../services/llm';
import {
  MessageType,
  MessageRequest,
  MessageResponse,
  MessageHandler,
} from '../../shared/types/messages';
import { handleError } from '../../shared/error-handler';

const generateJSONContent = async (
  message: MessageRequest,
  sendResponse: (response: MessageResponse) => void
): Promise<void> => {
  try {
    const result = await LLMServiceInstance.generateJSONContent(
      message.prompt ?? '',
      message.structure ?? {},
      message.language || ''
    );
    sendResponse(
      result ? { result } : { error: 'Error generating JSON content' }
    );
  } catch (error) {
    sendResponse(handleError(error));
  }
};

const generateAnswer = async (
  message: MessageRequest,
  sendResponse: (response: MessageResponse) => void
): Promise<void> => {
  try {
    const result = await LLMServiceInstance.generateAnswer(
      message.prompt || '',
      message.language || ''
    );
    sendResponse(result ? { result } : { error: 'Error generating answer' });
  } catch (error) {
    sendResponse(handleError(error));
  }
};

const getJobText = (
  _: MessageRequest,
  sendResponse: (response: MessageResponse) => void
): void => {
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
};

const getPageLanguage = (
  _: MessageRequest,
  sendResponse: (response: MessageResponse) => void
): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab.id) {
      sendResponse({ error: 'No active tab found' });
      return;
    }

    if (tab.url?.startsWith('chrome://')) {
      return sendResponse({
        error: 'Cannot extract language from chrome:// pages',
      });
    }

    chrome.tabs.sendMessage(
      tab.id,
      { type: MessageType.EXTRACT_LANGUAGE },
      sendResponse
    );
  });
};

export const messageHandlers: Record<string, MessageHandler> = {
  [MessageType.GENERATE_ANSWER]: generateAnswer,
  [MessageType.GENERATE_JSON_CONTENT]: generateJSONContent,
  [MessageType.EXTRACT_TEXT]: getJobText,
  [MessageType.EXTRACT_LANGUAGE]: getPageLanguage,
};
