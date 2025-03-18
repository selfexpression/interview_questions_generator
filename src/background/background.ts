import { messageHandlers } from './handlers/message-handlers';
import { installHandlers } from './handlers/install-handlers';
import { handleError } from '../shared/error-handler';
import type { MessageRequest } from '../shared/types/messages';

chrome.runtime.onMessage.addListener(
  (message: MessageRequest, _, sendResponse) => {
    const handler = messageHandlers[message.type];

    if (!handler) {
      sendResponse({
        error: `No handler for message type: ${message.type}`,
      });

      return true;
    }

    Promise.resolve(handler(message, sendResponse)).catch((error) =>
      sendResponse(handleError(error))
    );

    return true;
  }
);

chrome.runtime.onInstalled.addListener(() => {
  installHandlers.onInstalled();
});
