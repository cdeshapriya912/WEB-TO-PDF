// Content script for auto-scroll screenshot extension
class AutoScrollScreenshot {
  constructor() {
    this.isScrolling = false;
    this.currentPosition = 0;
    this.viewportHeight = 0;
    this.totalHeight = 0;
    this.screenshotCount = 0;
    this.scrollStep = 0;
    this.delay = 1000; // 1 second delay between screenshots
    this.folderName = '';
    
    this.init();
  }

  init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'startScreenshot') {
        this.startScreenshot(request.settings);
        sendResponse({ success: true });
      } else if (request.action === 'stopScreenshot') {
        this.stopScreenshot();
        sendResponse({ success: true });
      } else if (request.action === 'getPageInfo') {
        this.getPageInfo();
        sendResponse({ 
          success: true, 
          viewportHeight: this.viewportHeight,
          totalHeight: this.totalHeight,
          currentPosition: this.currentPosition
        });
      }
    });
  }

  getPageInfo() {
    this.viewportHeight = window.innerHeight;
    this.totalHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    this.currentPosition = window.pageYOffset;
  }

  startScreenshot(settings) {
    if (this.isScrolling) {
      console.log('Screenshot process already running');
      return;
    }

    this.isScrolling = true;
    this.screenshotCount = 0;
    this.delay = settings.delay || 1000;
    this.folderName = settings.folderName || `screenshots_${Date.now()}`;
    this.scrollStep = settings.scrollStep || this.viewportHeight * 0.8; // 80% of viewport height

    this.getPageInfo();
    
    // Start the screenshot process
    this.captureScreenshots();
  }

  stopScreenshot() {
    this.isScrolling = false;
    console.log('Screenshot process stopped');
  }

  async captureScreenshots() {
    if (!this.isScrolling) return;

    // Scroll to current position
    window.scrollTo(0, this.currentPosition);

    // Wait for scroll to complete
    await this.sleep(500);

    // Take screenshot
    await this.takeScreenshot();

    // Move to next position
    this.currentPosition += this.scrollStep;

    // Check if we've reached the bottom
    if (this.currentPosition >= this.totalHeight - this.viewportHeight) {
      // Take final screenshot at the bottom
      window.scrollTo(0, this.totalHeight - this.viewportHeight);
      await this.sleep(500);
      await this.takeScreenshot();
      
      this.isScrolling = false;
      console.log('Screenshot process completed');
      
      // Notify popup that process is complete
      chrome.runtime.sendMessage({
        action: 'screenshotComplete',
        totalScreenshots: this.screenshotCount
      });
      return;
    }

    // Continue with next screenshot after delay
    setTimeout(() => {
      this.captureScreenshots();
    }, this.delay);
  }

  async takeScreenshot() {
    try {
      // Send message to background script to capture screenshot
      const response = await chrome.runtime.sendMessage({
        action: 'captureScreenshot',
        folderName: this.folderName,
        screenshotNumber: this.screenshotCount + 1,
        currentPosition: this.currentPosition,
        viewportHeight: this.viewportHeight
      });

      if (response.success) {
        this.screenshotCount++;
        console.log(`Screenshot ${this.screenshotCount} captured at position ${this.currentPosition}`);
      } else {
        console.error('Failed to capture screenshot:', response.error);
      }
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize the auto-scroll screenshot functionality
const autoScrollScreenshot = new AutoScrollScreenshot();
