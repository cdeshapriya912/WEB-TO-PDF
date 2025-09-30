// Background script for auto-scroll screenshot extension
class ScreenshotManager {
  constructor() {
    this.init();
  }

  init() {
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'captureScreenshot') {
        this.captureScreenshot(request, sender.tab.id)
          .then(result => sendResponse(result))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
      }
    });
  }

  async captureScreenshot(request, tabId) {
    try {
      // Capture visible area screenshot
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {
        format: 'png',
        quality: 100
      });

      // Convert data URL to blob
      const blob = await this.dataURLToBlob(dataUrl);
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot_${String(request.screenshotNumber).padStart(3, '0')}_${timestamp}.png`;
      
      // Create folder name
      const folderName = request.folderName || `screenshots_${Date.now()}`;
      
      // Download the screenshot
      await this.downloadScreenshot(blob, filename, folderName);

      return {
        success: true,
        filename: filename,
        folderName: folderName,
        screenshotNumber: request.screenshotNumber
      };
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async dataURLToBlob(dataURL) {
    const response = await fetch(dataURL);
    return await response.blob();
  }

  async downloadScreenshot(blob, filename, folderName) {
    return new Promise((resolve, reject) => {
      // Create object URL
      const url = URL.createObjectURL(blob);
      
      // Use chrome.downloads API to save the file
      chrome.downloads.download({
        url: url,
        filename: `${folderName}/${filename}`,
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log(`Screenshot saved: ${folderName}/${filename}`);
          resolve(downloadId);
        }
      });
    });
  }
}

// Initialize the screenshot manager
const screenshotManager = new ScreenshotManager();
