# Auto Scroll Screenshot Chrome Extension

A Chrome extension that automatically scrolls through web pages and captures screenshots of each viewport section, saving them in organized folders.

## Features

- 🔄 **Auto-scroll functionality** - Automatically scrolls through the entire page
- 📸 **Screenshot capture** - Takes screenshots of each viewport section
- 📁 **Organized storage** - Saves screenshots in timestamped folders
- ⚙️ **Customizable settings** - Adjust scroll step, delay, and folder names
- 📊 **Progress tracking** - Real-time progress display
- 🎯 **Viewport detection** - Automatically detects browser viewport size
- 🛑 **Start/Stop controls** - Full control over the screenshot process

## Installation

1. **Download the extension files** to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** by toggling the switch in the top-right corner
4. **Click "Load unpacked"** and select the `auto-scroll-screenshot-extension` folder
5. **Pin the extension** to your toolbar for easy access

## Usage

1. **Navigate to any webpage** you want to capture
2. **Click the extension icon** in your Chrome toolbar
3. **Configure settings** (optional):
   - **Folder Name**: Custom name for the screenshot folder
   - **Scroll Step**: Percentage of viewport height to scroll each time (50-100%)
   - **Delay**: Time between screenshots in milliseconds (500-5000ms)
4. **Click "Start Screenshot"** to begin the process
5. **Monitor progress** in the popup window
6. **Click "Stop Screenshot"** to halt the process at any time

## How It Works

1. **Page Analysis**: The extension analyzes the page dimensions and viewport size
2. **Auto-scrolling**: Automatically scrolls through the page in configurable steps
3. **Screenshot Capture**: Takes a screenshot at each scroll position
4. **File Organization**: Saves screenshots with sequential numbering and timestamps
5. **Folder Creation**: Creates a new folder for each screenshot session

## File Structure

```
auto-scroll-screenshot-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Content script for page interaction
├── popup.html            # Extension popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
└── README.md             # This file
```

## Screenshot Naming Convention

Screenshots are saved with the following naming pattern:
- **Folder**: `screenshots_YYYY-MM-DDTHH-MM-SS` (or custom name)
- **Files**: `screenshot_001_YYYY-MM-DDTHH-MM-SS.png`

## Permissions

The extension requires the following permissions:
- `activeTab` - To interact with the current tab
- `scripting` - To inject content scripts
- `storage` - To save user preferences
- `downloads` - To save screenshot files
- `host_permissions` - To work on all websites

## Troubleshooting

### Extension not working?
- Make sure the page is fully loaded before starting
- Check that you have granted all necessary permissions
- Try refreshing the page and restarting the extension

### Screenshots not saving?
- Check your Chrome download settings
- Ensure you have sufficient disk space
- Verify that downloads are not blocked by antivirus software

### Poor screenshot quality?
- Adjust the scroll step percentage for better overlap
- Increase the delay between screenshots
- Ensure the page has finished loading all content

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Screenshot Format**: PNG with 100% quality
- **Scroll Method**: Smooth scrolling with configurable step size
- **File Storage**: Uses Chrome's downloads API for reliable file saving

## Browser Compatibility

- Chrome 88+ (Manifest V3 support required)
- Chromium-based browsers (Edge, Brave, etc.)

## Privacy

This extension:
- ✅ Only works on pages you explicitly activate it on
- ✅ Does not collect or transmit any personal data
- ✅ Stores screenshots locally on your device
- ✅ Does not track your browsing activity

## Support

For issues or feature requests, please check the extension's functionality and ensure all requirements are met.

---

**Note**: This extension is designed for personal use and educational purposes. Please respect website terms of service and copyright when capturing screenshots.
