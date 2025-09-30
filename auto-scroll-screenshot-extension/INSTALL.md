# Installation Guide - Auto Scroll Screenshot Extension

## Quick Installation Steps

### 1. Prepare the Extension
- Ensure all extension files are in the `auto-scroll-screenshot-extension` folder
- The folder should contain:
  - `manifest.json`
  - `background.js`
  - `content.js`
  - `popup.html`
  - `popup.css`
  - `popup.js`

### 2. Load Extension in Chrome

1. **Open Chrome** and navigate to the extensions page:
   - Type `chrome://extensions/` in the address bar, or
   - Go to Menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner
   - This will reveal additional options

3. **Load the Extension**:
   - Click "Load unpacked" button
   - Navigate to and select the `auto-scroll-screenshot-extension` folder
   - Click "Select Folder"

4. **Verify Installation**:
   - The extension should appear in your extensions list
   - You should see "Auto Scroll Screenshot" with version 1.0
   - The extension icon should appear in your Chrome toolbar

### 3. Pin the Extension (Recommended)

1. **Click the puzzle piece icon** (🧩) in the Chrome toolbar
2. **Find "Auto Scroll Screenshot"** in the list
3. **Click the pin icon** (📌) next to it
4. The extension icon will now be permanently visible in your toolbar

## Testing the Extension

### 1. Use the Test Page
- Open the `test-page.html` file in Chrome
- This page is specifically designed to test the extension

### 2. Basic Test
1. Click the extension icon in your toolbar
2. The popup should open showing the extension interface
3. Click "Refresh Page Info" to load page dimensions
4. Enter a folder name (or use the auto-generated one)
5. Click "Start Screenshot"
6. Watch as the page auto-scrolls and screenshots are captured
7. Check your Downloads folder for the screenshot folder

### 3. Verify Results
- Look for a new folder in your Downloads directory
- The folder should contain numbered PNG files
- Each file should show a different section of the page

## Troubleshooting

### Extension Not Appearing
- **Check Developer Mode**: Make sure Developer mode is enabled
- **Reload Extension**: Click the refresh icon on the extension card
- **Check Console**: Open Chrome DevTools Console for error messages

### Permission Issues
- **Grant Permissions**: When prompted, click "Allow" for all permissions
- **Check Settings**: Go to `chrome://extensions/` and ensure the extension is enabled

### Screenshots Not Saving
- **Check Downloads**: Verify your default download location
- **Check Permissions**: Ensure the extension has download permissions
- **Try Different Page**: Test on a simpler page first

### Page Not Scrolling
- **Wait for Load**: Ensure the page is fully loaded before starting
- **Check Content Script**: Refresh the page and try again
- **Check Console**: Look for JavaScript errors in DevTools

## File Structure Verification

Your extension folder should look like this:
```
auto-scroll-screenshot-extension/
├── manifest.json          ✓ Required
├── background.js          ✓ Required
├── content.js            ✓ Required
├── popup.html            ✓ Required
├── popup.css             ✓ Required
├── popup.js              ✓ Required
├── README.md             ✓ Documentation
├── INSTALL.md            ✓ This file
└── test-page.html        ✓ Test page
```

## Security Notes

- This extension only works on pages you explicitly activate it on
- It does not collect or transmit any personal data
- Screenshots are saved locally on your device
- The extension requires standard permissions for functionality

## Uninstalling

To remove the extension:
1. Go to `chrome://extensions/`
2. Find "Auto Scroll Screenshot"
3. Click "Remove"
4. Confirm removal

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all files are present and properly formatted
3. Try reloading the extension
4. Test with the provided test page first

---

**Note**: This extension requires Chrome 88 or later for Manifest V3 support.
