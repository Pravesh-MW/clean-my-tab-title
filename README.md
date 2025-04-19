Clean My Tab Title
Clean My Tab Title is a Chrome extension designed to simplify and declutter browser tab titles. By applying user-defined or default rules, it removes unnecessary elements like site names, separators, or redundant text, making tab titles more concise and readable.​

🚀 Features
Automatic Title Cleaning: Applies predefined or custom regex rules to clean tab titles.

Toggle Cleaned/Original Titles: Easily switch between the cleaned and original tab titles.

Dynamic Title Monitoring: Observes and updates titles in real-time as they change.

Manual Title Overrides: Set custom titles for specific tabs.

Reset Functionality: Revert to the original title without reloading the tab.​

📦 Installation
From Chrome Web Store
Note: If the extension is available on the Chrome Web Store, include the link here.​

Manual Installation
Clone the repository:​
Stack Overflow

bash
Copy
Edit
git clone https://github.com/Pravesh-MW/clean-my-tab-title.git
2. Open Chrome and navigate to chrome://extensions/. 3. Enable Developer mode (toggle switch in the top right). 4. Click on Load unpacked. 5. Select the cloned clean-my-tab-title directory.​
Chrome for Developers
+2
GitHub
+2
Super User
+2

⚙️ Usage
Click on the Clean My Tab Title extension icon in the Chrome toolbar.

Use the popup interface to:

Toggle between cleaned and original titles.

Manually set a custom title for the current tab.

Reset the title to its original state.​

🛠️ Customization
Default Cleaning Rules
The extension uses the following default regex rules to clean tab titles:​

Remove everything after a pipe symbol (|): \|.*$

Remove everything after a dash (-): -.*$

Remove everything after a colon (:): :.*$

Remove pipe with spaces: \s+\|\s+

Remove dash with spaces: \s+-\s+

Remove colon with spaces: \s+:\s+​

Adding Custom Rules
Open the extension's options page.

Add your custom regex rules in the provided input field.

Save the changes.​
Stack Overflow
+4
DEV Community
+4
Tulip Community
+4

Note: Custom rules are stored using Chrome's storage.sync API, allowing them to sync across devices.​

🧩 Permissions
The extension requires the following permissions:​

tabs: To access and modify tab titles.

storage: To store user-defined rules and settings.

scripting: To inject scripts for dynamic title monitoring.​

🧪 Development
Ensure you have Node.js installed.

Clone the repository:​

bash
Copy
Edit
git clone https://github.com/Pravesh-MW/clean-my-tab-title.git
3. Navigate to the project directory:​

bash
Copy
Edit
cd clean-my-tab-title
4. Install dependencies (if applicable):​

bash
Copy
Edit
npm install
5. Load the extension into Chrome as described in the Installation section.​

📝 License
This project is licensed under the MIT License.​
GitHub

📫 Contact
For questions, suggestions, or contributions, please open an issue or submit a pull request on the GitHub repository.​

