/**
 * Background script for Clean My Tab Title extension.
 * Handles automatic cleaning of tab titles based on user-defined rules,
 * toggling between cleaned and original titles, and observing dynamic title changes.
 */

const originalTitles = {}; // Store original titles per tabId
const toggleStates = {};   // Store toggle state per tabId: true = cleaned, false = original

// Default cleaning rules (regex patterns as strings)
const defaultRules = [
  "\\|.*$",       // Remove everything after pipe symbol
  "-.*$",         // Remove everything after dash
  ":.*$",         // Remove everything after colon
  "\\s+\\|\\s+",  // Remove pipe with spaces
  "\\s+-\\s+",    // Remove dash with spaces
  "\\s+:\\s+"     // Remove colon with spaces
];

// Helper: Check if URL is scriptable
function isScriptableUrl(url) {
  return url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://');
}

// Load user-defined rules from storage or use default
function loadRules(callback) {
  chrome.storage.sync.get(['cleanRules'], (result) => {
    const rules = result.cleanRules || defaultRules;
    callback(rules);
  });
}

// Apply cleaning rules to a title string
function applyRules(title, rules) {
  if (!title) return title;
  let cleaned = title;
  for (const rule of rules) {
    try {
      const regex = new RegExp(rule, 'gi');
      cleaned = cleaned.replace(regex, '');
    } catch (e) {
      console.warn('Invalid regex rule:', rule);
    }
  }
  cleaned = cleaned.trim();
  if (cleaned.length > 60) {
    cleaned = cleaned.substring(0, 57) + '...';
  }
  return cleaned;
}

// Inject MutationObserver script into tab to watch for dynamic title changes
function injectTitleObserver(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (!isScriptableUrl(tab.url)) return;
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        if (window.__cleanMyTabTitleObserver) return;
        window.__cleanMyTabTitleObserver = new MutationObserver(() => {
          chrome.runtime.sendMessage({ type: 'titleChanged', title: document.title });
        });
        const titleEl = document.querySelector('title');
        if (titleEl) {
          window.__cleanMyTabTitleObserver.observe(titleEl, { childList: true });
        }
      }
    });
  });
}

// Clean or restore title based on toggle state
function updateTabTitle(tabId, originalTitle, rules) {
  chrome.tabs.get(tabId, (tab) => {
    if (!isScriptableUrl(tab.url)) return;
    const isCleaned = toggleStates[tabId] !== false;
    if (isCleaned) {
      const cleaned = applyRules(originalTitle, rules);
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (newTitle) => { document.title = newTitle; },
        args: [cleaned]
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (origTitle) => { document.title = origTitle; },
        args: [originalTitle]
      });
    }
  });
}

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.title && isScriptableUrl(tab.url)) {
    if (!originalTitles[tabId]) {
      originalTitles[tabId] = changeInfo.title;
    }

    chrome.storage.local.get([`tabTitle-${tabId}`], (result) => {
      if (result[`tabTitle-${tabId}`]) return;
      loadRules((rules) => {
        updateTabTitle(tabId, originalTitles[tabId], rules);
      });
    });

    injectTitleObserver(tabId);
  }
});

// Listen for messages from content scripts (MutationObserver)
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'titleChanged' && sender.tab) {
    const tabId = sender.tab.id;
    if (toggleStates[tabId] === false) {
      originalTitles[tabId] = message.title;
    } else {
      loadRules((rules) => {
        updateTabTitle(tabId, message.title, rules);
      });
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'toggleTitle' && typeof message.tabId === 'number') {
    const tabId = message.tabId;
    toggleStates[tabId] = !toggleStates[tabId];
    loadRules((rules) => {
      const originalTitle = originalTitles[tabId] || '';
      updateTabTitle(tabId, originalTitle, rules);
      sendResponse({ state: toggleStates[tabId] });
    });
    return true;
  } else if (message.type === 'getToggleState' && typeof message.tabId === 'number') {
    const tabId = message.tabId;
    const state = toggleStates[tabId] !== false;
    sendResponse({ state: state });
    return true;
  } else if (message.type === 'getCleanedTitle' && typeof message.tabId === 'number') {
    const tabId = message.tabId;
    const originalTitle = originalTitles[tabId] || '';
    loadRules((rules) => {
      const cleaned = applyRules(originalTitle, rules);
      sendResponse({ cleanedTitle: cleaned });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "resetTitle" && typeof message.tabId === "number") {
    const tabId = message.tabId;
    loadRules((rules) => {
      const originalTitle = originalTitles[tabId] || "";
      toggleStates[tabId] = false;
      updateTabTitle(tabId, originalTitle, rules);
      sendResponse({ success: true });
    });
    return true; // async response
  }
});

// Clean up stored data when tab is removed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete originalTitles[tabId];
  delete toggleStates[tabId];
});
