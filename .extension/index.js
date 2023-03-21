let lastCheckedMessageIndex = 0;

function isDiffFormat(code) {
  const diffRegex = /^diff --git a\/.* b\/.*$/m;
  return diffRegex.test(code);
}

function saveToFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  chrome.storage.sync.get(["savePath"], (result) => {
    const savePath = result.savePath || "";
    const fullPath = savePath + filename;

    chrome.downloads.download({
      url,
      filename: fullPath,
      conflictAction: "uniquify",
      saveAs: false,
    });

    URL.revokeObjectURL(url);
  });
}

function checkNewMessages() {
  console.log("Checking for new messages...");
  const messages = document.querySelectorAll(".markdown");

  for (let i = lastCheckedMessageIndex; i < messages.length; i++) {
    const message = messages[i];
    const codeElement = message.querySelector("pre code");

    if (codeElement) {
      const code = codeElement.textContent;

      if (isDiffFormat(code)) {
        console.log("Diff format code found. Saving to file.");
        const filename = `contrail.patch`;
        saveToFile(filename, code);
      }
    }
  }

  lastCheckedMessageIndex = messages.length;
}

chrome.storage.sync.get(["checkInterval"], (result) => {
  const checkInterval = (result.checkInterval || 5) * 1000;
  // Check for new messages based on the stored interval
  setInterval(checkNewMessages, checkInterval);
});
