document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const toggleBtn = document.getElementById("toggleBtn");
  const modeDisplay = document.getElementById("modeDisplay");
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  // Get active tab ID
  function getCurrentTabId(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (chrome.runtime.lastError) {
        console.error("Error querying tabs:", chrome.runtime.lastError);
        return;
      }
      if (tabs.length > 0) {
        callback(tabs[0].id);
      } else {
        console.warn("No active tab found.");
      }
    });
  }

  // Update mode display text
  function updateModeDisplay(isCleaned) {
    if (!modeDisplay || !toggleBtn) return;
    modeDisplay.textContent = isCleaned ? "Cleaned" : "Original";
    toggleBtn.checked = isCleaned;
  }

  // Get current toggle state from background
  function updateToggleState() {
    getCurrentTabId((tabId) => {
      if (!tabId) return;
      chrome.runtime.sendMessage({ type: "getToggleState", tabId }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting toggle state:", chrome.runtime.lastError);
          return;
        }
        const state = response?.state ?? true; // Default to true (Cleaned)
        updateModeDisplay(state);
      });
    });
  }

  // Save custom title
  saveBtn.addEventListener("click", () => {
    const customTitle = document.getElementById("tabTitle").value;
    if (!customTitle) return;

    getCurrentTabId((tabId) => {
      if (!tabId) return;
      chrome.storage.local.set({ [`tabTitle-${tabId}`]: customTitle }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving custom title:", chrome.runtime.lastError);
          return;
        }
        chrome.scripting.executeScript({
          target: { tabId },
          func: (newTitle) => {
            try {
              document.title = newTitle;
            } catch (e) {
              console.error("Error setting document title:", e);
            }
          },
          args: [customTitle],
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error executing script:", chrome.runtime.lastError);
          }
        });
      });
    });
  });

  // Reset title to original
  resetBtn.addEventListener("click", () => {
    getCurrentTabId((tabId) => {
      if (!tabId) return;
      chrome.storage.local.remove([`tabTitle-${tabId}`], () => {
        if (chrome.runtime.lastError) {
          console.error("Error removing custom title:", chrome.runtime.lastError);
          return;
        }
        chrome.runtime.sendMessage({ type: "resetTitle", tabId }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending resetTitle message:", chrome.runtime.lastError);
            return;
          }
          if (response && response.success) {
            toggleBtn.checked = false;
            modeDisplay.textContent = "Original";
            chrome.tabs.reload(tabId);
          } else {
            console.warn("Reset title response unsuccessful or missing.");
          }
        });
      });
    });
  });

  // Toggle cleaned/original title
  toggleBtn.addEventListener("change", () => {
    getCurrentTabId((tabId) => {
      if (!tabId) return;
      chrome.runtime.sendMessage({ type: "toggleTitle", tabId }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error toggling title:", chrome.runtime.lastError);
          return;
        }
        if (response && typeof response.state === "boolean") {
          updateModeDisplay(response.state);
        }
      });
    });
  });

  // Theme toggle
  function updateThemeIcon() {
    const isDark = body.classList.contains("dark");
    themeToggle.textContent = isDark ? "🌙" : "🌞";
    chrome.storage.sync.set({ themePreference: isDark ? "dark" : "light" }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving theme preference:", chrome.runtime.lastError);
      }
    });
  }

  // Load saved theme
  chrome.storage.sync.get(["themePreference"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading theme preference:", chrome.runtime.lastError);
      return;
    }
    if (result.themePreference === "dark") {
      body.classList.add("dark");
    }
    updateThemeIcon();
  });

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    updateThemeIcon();
  });

  // Init mode state on load
  updateToggleState();
});
