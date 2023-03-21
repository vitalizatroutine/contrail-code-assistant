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
    const message = { content: url, filename: fullPath };

    console.log("Sending message to background worker:", message);
    chrome.runtime.sendMessage(message);

    URL.revokeObjectURL(url);
  });
}

function checkIfGenerating() {
  const buttons = document.getElementsByTagName('button');

  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].textContent === 'Stop generating') {
      console.log("Still generating a response. Aborting check.");

      return true;
    }
  }

  return false;
}

function checkNewMessages() {
  console.log("Checking for new messages...");

  if (checkIfGenerating()) return

  const messages = document.querySelectorAll(".markdown");

  console.log("messages found:", messages);
  console.log("lastCheckedMessageIndex:", lastCheckedMessageIndex);

  for (let i = lastCheckedMessageIndex; i < messages.length; i++) {
    const message = messages[i];
    const codeElement = message.querySelector("pre code");

    console.log("codeElement", codeElement);

    if (codeElement) {
      const code = codeElement.textContent;

      if (isDiffFormat(code)) {
        console.log("Diff format code found. Saving to file.", code);
        const filename = `contrail.patch`;
        saveToFile(filename, code);
      }
    } else {
      console.log("Diff format code not found within block, continueing.");
    }
  }

  lastCheckedMessageIndex = messages.length;
}

chrome.storage.sync.get(["savePath", "checkInterval"], (result) => {
  const savePath = result.savePath || "";
  const checkInterval = (result.checkInterval || 5) * 1000;

  console.log("Initialized ChatGPT Code Monitor");
  console.log("Options:\n\nsavePath:", savePath, "\n\ncheckInterval:", checkInterval / 1000);

  // Check for new messages based on the stored interval
  setInterval(checkNewMessages, checkInterval);
});
