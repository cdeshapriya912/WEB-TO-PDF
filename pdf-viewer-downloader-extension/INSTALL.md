# PDF Viewer Downloader - Installation Guide

## Quick Installation

### Step 1: Download the Extension
- Download the `pdf-viewer-downloader-extension` folder to your computer
- Keep all files together in the same folder

### Step 2: Install in Chrome
1. **Open Chrome** and go to `chrome://extensions/`
2. **Enable Developer Mode** (toggle switch in top-right corner)
3. **Click "Load unpacked"** button
4. **Select the `pdf-viewer-downloader-extension` folder**
5. **Click "Select Folder"**

### Step 3: Verify Installation
- You should see the extension appear in your extensions list
- The extension icon should appear in your Chrome toolbar
- Status should show "Enabled"

## Usage

1. **Navigate to a PDF viewer page** (with canvas elements)
2. **Click the extension icon** in Chrome toolbar
3. **Wait for detection** - shows page count
4. **Click "Download PDF"** button
5. **PDF downloads** to your default download folder

## Troubleshooting

### Extension not loading?
- Make sure all files are in the same folder
- Check that Developer Mode is enabled
- Try refreshing the extensions page

### No PDF detected?
- Ensure you're on a page with canvas elements
- Check that the page has loaded completely
- Try refreshing the page

### Download not working?
- Check browser download settings
- Ensure popup blockers aren't interfering
- Try a different filename

## File Structure
```
pdf-viewer-downloader-extension/
├── manifest.json          # Extension configuration
├── content.js            # Canvas capture script
├── popup.html            # User interface
├── popup.css             # Styling
├── popup.js              # UI functionality
├── jspdf.umd.min.js      # PDF library
├── README.md             # Full documentation
└── INSTALL.md            # This file
```

## Support
If you encounter issues, check the browser console (F12) for error messages.
