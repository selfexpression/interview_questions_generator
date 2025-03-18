export const handleInstall = async (): Promise<void> => {
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
};

export const installHandlers = {
  onInstalled: handleInstall,
};
