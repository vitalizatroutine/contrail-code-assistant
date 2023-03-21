chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Messaged received:", message);
    chrome.downloads.download({
        url: message.content,
        filename: message.filename
    });
});
  