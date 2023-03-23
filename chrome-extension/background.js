chrome.runtime.onMessage.addListener((message) => {
    console.log("Message received:", message);
    chrome.downloads.download({
        url: message.content,
        filename: message.filename
    });
});
  