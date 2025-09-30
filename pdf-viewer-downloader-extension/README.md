# PDF Viewer Downloader Chrome Extension

A Chrome extension that captures PDF viewer pages (specifically those using canvas-based rendering like pdf-vue3) and downloads them as PDF files.

## Features

- 🎯 **Auto-detection**: Automatically detects PDF viewer pages with canvas elements
- 📄 **Multi-page support**: Captures all pages from the PDF viewer
- 💾 **High-quality output**: Preserves original canvas resolution in the PDF
- 🎨 **Modern UI**: Clean, responsive popup interface
- ⚡ **Fast processing**: Efficient canvas-to-PDF conversion
- 🔧 **Customizable**: Choose your own filename

## How It Works

This extension works by:
1. Detecting PDF viewer pages that use canvas elements (like pdf-vue3)
2. Capturing each canvas as a high-resolution image
3. Converting all canvas images into a single PDF file
4. Downloading the PDF to your computer

## Installation

### Method 1: Load as Unpacked Extension (Recommended)

1. **Download the extension files** to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right corner)
4. **Click "Load unpacked"** button
5. **Select the folder** containing the extension files
6. **The extension should now appear** in your extensions list

### Method 2: Manual Installation

1. Download all files to a folder:
   - `manifest.json`
   - `content.js`
   - `popup.html`
   - `popup.css`
   - `popup.js`
   - `jspdf.umd.min.js`

2. Follow Method 1 steps 2-6

## Usage

1. **Navigate to a PDF viewer page** (like the one you showed me with canvas elements)
2. **Click the extension icon** in your Chrome toolbar
3. **Wait for detection** - the extension will show how many pages it found
4. **Customize the filename** if desired (optional)
5. **Click "Download PDF"** button
6. **The PDF will be downloaded** to your default download folder

## Supported PDF Viewers

This extension works with PDF viewers that render pages as canvas elements, including:
- pdf-vue3 components
- PDF.js viewers
- Custom canvas-based PDF viewers
- Any web page with multiple canvas elements representing PDF pages

## File Structure

```
pdf-viewer-downloader/
├── manifest.json          # Extension configuration
├── content.js            # Content script for canvas capture
├── popup.html            # Extension popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── jspdf.umd.min.js      # PDF generation library
└── README.md             # This file
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension format)
- **Permissions**: `activeTab`, `scripting`
- **PDF Library**: jsPDF 2.5.1
- **Canvas Capture**: High-resolution PNG format
- **Browser Support**: Chrome, Edge, and other Chromium-based browsers

## Troubleshooting

### "No PDF viewer detected"
- Make sure you're on a page with canvas elements
- Check that the page has loaded completely
- Try refreshing the page and clicking the extension again

### "Failed to communicate with page"
- Ensure the page is fully loaded
- Check if the page has any security restrictions
- Try refreshing the page

### Download not working
- Check your browser's download settings
- Ensure popup blockers aren't interfering
- Try a different filename

### Poor quality PDF
- The extension captures canvas elements at their original resolution
- If quality is poor, the source canvas elements may be low resolution
- Try zooming in on the PDF viewer before downloading

## Privacy & Security

- **No data collection**: The extension doesn't collect or transmit any data
- **Local processing**: All PDF generation happens in your browser
- **No external requests**: Except for loading the jsPDF library
- **Minimal permissions**: Only requires access to the current tab

## Development

To modify or extend this extension:

1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension
4. Test your changes

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Ensure you're on a compatible PDF viewer page
3. Try refreshing the page and extension
4. Check that all files are present in the extension folder

---

**Note**: This extension is specifically designed for canvas-based PDF viewers. It may not work with all PDF viewing implementations.
