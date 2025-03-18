import { MessageType } from './shared/types/messages';

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === MessageType.EXTRACT_TEXT) {
    const jobText = document.body.innerText;
    sendResponse({ text: jobText });
  }
  return true;
});
