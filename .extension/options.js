document.getElementById("saveButton").addEventListener("click", () => {
  const savePath = document.getElementById("savePath").value;
  const checkInterval = parseInt(
    document.getElementById("checkInterval").value,
    10
  );

  chrome.storage.sync.set({ savePath, checkInterval }, () => {
    console.log(`Save path set to: ${savePath}`);
    console.log(`Check interval set to: ${checkInterval} seconds`);
  });
});
