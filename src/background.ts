chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.set({
    apiKey: process.env.AI_API_KEY,
  });

  const manifest = chrome.runtime.getManifest();
  if (!manifest.content_scripts) return;

  for (const cs of manifest.content_scripts) {
    const tabs = await chrome.tabs.query({ url: cs.matches });

    for (const tab of tabs) {
      if (tab.url?.match(/(chrome|chrome-extension):\/\//gi)) {
        continue;
      }

      if (!tab.id) {
        console.warn(`Tab ID is missing for URL: ${tab.url}`);
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
          console.log(`Scripts injected into tab ${tab.id}`);
        } catch (error) {
          console.error(
            `Failed to inject scripts into tab ${tab.id}: ${error}`
          );
        }
      }
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_JOB_TEXT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      if (!tabId) {
        sendResponse({ error: 'No active tab found or tab ID is missing.' });
        return;
      }

      console.log(`Sending message to tab ${tabId}`);

      chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_TEXT' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(`Message error: ${chrome.runtime.lastError.message}`);
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse(response || { error: 'No response received' });
        }
      });
    });
    return true;
  }
});
