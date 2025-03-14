chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_TEXT') {
    const jobText = document.body.innerText;
    sendResponse({ text: jobText });
  }
});
