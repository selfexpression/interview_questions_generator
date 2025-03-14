chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'EXTRACT_TEXT') {
    const jobText = document.body.innerText;
    sendResponse({ text: jobText });
  }

  return true;
});
