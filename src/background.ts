chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set(
    { apiKey: 'AIzaSyALXR97xEju1HGpgZlCSuBfjDt5jg8yYTM' },
    () => {
      console.log('API key saved to storage.');
    }
  );
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_JOB_TEXT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      console.log(tabId);
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_TEXT' }, (response) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ error: 'No active tab found or tab ID is missing.' });
      }
    });

    return true;
  }
});
