# ChatGPT Code Monitor

ChatGPT Code Monitor is a browser extension that monitors ChatGPT conversations for diff format code and saves it to a file.

## Installation

1. Clone the repository to your local machine.
2. Load the extension into your browser as an unpacked extension:
   - For Chrome:
     - Navigate to `chrome://extensions`.
     - Enable Developer Mode by clicking the toggle switch.
     - Click "Load unpacked" and select the `chrome-extension` folder in the project directory.

## Usage

When a ChatGPT conversation contains diff format code, the extension will automatically save it as a `.patch` file to the specified save path. The extension checks for new messages every 5 seconds.

## Configuration

You can configure the save path for the generated files and the interval for checking new messages through the extension's options page:

1. Open the ChatGPT Code Monitor Options page.
2. Enter the desired save path in the "Save path" input field.
3. Enter the desired check interval in seconds in the "Check interval" input field.
4. Click "Save" to save your changes.
