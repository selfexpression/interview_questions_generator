async function injectScriptsToTabs() {
  const manifest = chrome.runtime.getManifest();
  if (!manifest.content_scripts) return;

  for (const cs of manifest.content_scripts) {
    const tabs = await chrome.tabs.query({ url: cs.matches });

    for (const tab of tabs) {
      if (tab.url?.match(/(chrome|chrome-extension):\/\//gi)) {
        console.error(`Skipping tab with URL: ${tab.url}`);
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
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({
    apiKey: 'AIzaSyALXR97xEju1HGpgZlCSuBfjDt5jg8yYTM',
  });

  await injectScriptsToTabs();
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'GET_JOB_TEXT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
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
