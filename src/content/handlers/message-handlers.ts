import {
  MessageRequest,
  MessageResponse,
  MessageHandler,
  MessageType,
} from '../../shared/types/messages';

const extractText = (
  _: MessageRequest,
  sendResponse: (response: MessageResponse) => void
) => {
  const jobText = document.body.innerText;
  sendResponse({ result: jobText });
};

const extractLanguage = (
  _: MessageRequest,
  sendResponse: (response: MessageResponse) => void
) => {
  const language = document.documentElement.lang || 'unknown';
  sendResponse({ result: language });
};

export const messageHandlers: Record<string, MessageHandler> = {
  [MessageType.EXTRACT_TEXT]: extractText,
  [MessageType.EXTRACT_LANGUAGE]: extractLanguage,
};
