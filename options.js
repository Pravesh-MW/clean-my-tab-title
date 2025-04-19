const defaultRules = [
  "\\|.*$",       // Remove everything after pipe symbol
  "-.*$",         // Remove everything after dash
  ":.*$",         // Remove everything after colon
  "\\s+\\|\\s+",  // Remove pipe with spaces
  "\\s+-\\s+",    // Remove dash with spaces
  "\\s+:\\s+"     // Remove colon with spaces
];

// Load rules from storage and populate textarea
function loadRules() {
  chrome.storage.sync.get(['cleanRules'], (result) => {
    const rules = result.cleanRules || defaultRules;
    document.getElementById('rulesTextarea').value = rules.join('\n');
    updatePreview();
  });
}

// Save rules from textarea to storage
function saveRules() {
  const rulesText = document.getElementById('rulesTextarea').value;
  const rules = rulesText.split('\n').map(r => r.trim()).filter(r => r.length > 0);
  chrome.storage.sync.set({ cleanRules: rules }, () => {
    alert('Rules saved.');
    updatePreview();
  });
}

// Reset rules to default
function resetRules() {
  document.getElementById('rulesTextarea').value = defaultRules.join('\n');
  saveRules();
}

// Apply rules to sample title and update preview
function applyRules(title, rules) {
  let cleaned = title;
  for (const rule of rules) {
    try {
      const regex = new RegExp(rule, 'gi');
      cleaned = cleaned.replace(regex, '');
    } catch (e) {
      // Invalid regex, ignore
      console.warn('Invalid regex:', rule);
    }
  }
  return cleaned.trim();
}

// Update preview output based on sample title and rules
function updatePreview() {
  const sampleTitle = document.getElementById('sampleTitle').value;
  const rulesText = document.getElementById('rulesTextarea').value;
  const rules = rulesText.split('\n').map(r => r.trim()).filter(r => r.length > 0);
  const cleaned = applyRules(sampleTitle, rules);
  document.getElementById('previewOutput').textContent = cleaned;
}

// Event listeners
document.getElementById('saveBtn').addEventListener('click', saveRules);
document.getElementById('resetBtn').addEventListener('click', resetRules);
document.getElementById('sampleTitle').addEventListener('input', updatePreview);
document.getElementById('rulesTextarea').addEventListener('input', updatePreview);

// Initialize
loadRules();
