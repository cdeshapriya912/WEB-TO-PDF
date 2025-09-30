// Popup script for auto-scroll screenshot extension
class PopupController {
  constructor() {
    this.isRunning = false;
    this.currentScreenshots = 0;
    this.totalScreenshots = 0;
    this.pageInfo = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSettings();
    this.refreshPageInfo();
    
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'screenshotComplete') {
        this.onScreenshotComplete(request.totalScreenshots);
      }
    });
  }

  bindEvents() {
    document.getElementById('startBtn').addEventListener('click', () => this.startScreenshot());
    document.getElementById('stopBtn').addEventListener('click', () => this.stopScreenshot());
    document.getElementById('refreshBtn').addEventListener('click', () => this.refreshPageInfo());
    
    // Update scroll step display
    document.getElementById('scrollStep').addEventListener('input', (e) => {
      document.getElementById('scrollStepValue').textContent = e.target.value + '%';
    });

    // Auto-generate folder name
    document.getElementById('folderName').addEventListener('focus', () => {
      if (!document.getElementById('folderName').value) {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
        document.getElementById('folderName').value = `screenshots_${timestamp}`;
      }
    });
  }

  async refreshPageInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' });
      
      if (response && response.success) {
        this.pageInfo = response;
        this.updatePageInfoDisplay();
      } else {
        console.error('Failed to get page info');
        this.showError('Failed to get page information. Please refresh the page and try again.');
      }
    } catch (error) {
      console.error('Error getting page info:', error);
      this.showError('Error getting page information. Make sure the page is fully loaded.');
    }
  }

  updatePageInfoDisplay() {
    if (!this.pageInfo) return;

    document.getElementById('viewportHeight').textContent = this.pageInfo.viewportHeight + 'px';
    document.getElementById('totalHeight').textContent = this.pageInfo.totalHeight + 'px';
    
    // Calculate estimated screenshots
    const scrollStep = parseInt(document.getElementById('scrollStep').value);
    const stepSize = Math.floor(this.pageInfo.viewportHeight * (scrollStep / 100));
    const estimated = Math.ceil(this.pageInfo.totalHeight / stepSize);
    
    document.getElementById('estimatedScreenshots').textContent = estimated;
    this.totalScreenshots = estimated;
  }

  async startScreenshot() {
    if (this.isRunning) return;

    try {
      const settings = this.getSettings();
      
      // Validate settings
      if (!settings.folderName.trim()) {
        this.showError('Please enter a folder name');
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script to start screenshot process
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'startScreenshot',
        settings: settings
      });

      if (response && response.success) {
        this.isRunning = true;
        this.currentScreenshots = 0;
        this.updateUI();
        this.showProgress();
      } else {
        this.showError('Failed to start screenshot process');
      }
    } catch (error) {
      console.error('Error starting screenshot:', error);
      this.showError('Error starting screenshot process. Make sure the page is fully loaded.');
    }
  }

  async stopScreenshot() {
    if (!this.isRunning) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'stopScreenshot'
      });

      if (response && response.success) {
        this.isRunning = false;
        this.updateUI();
        this.hideProgress();
      }
    } catch (error) {
      console.error('Error stopping screenshot:', error);
    }
  }

  onScreenshotComplete(totalScreenshots) {
    this.isRunning = false;
    this.currentScreenshots = totalScreenshots;
    this.updateUI();
    this.hideProgress();
    
    // Show completion message
    this.showSuccess(`Screenshot process completed! ${totalScreenshots} screenshots saved.`);
  }

  getSettings() {
    return {
      folderName: document.getElementById('folderName').value.trim(),
      scrollStep: parseInt(document.getElementById('scrollStep').value),
      delay: parseInt(document.getElementById('delay').value)
    };
  }

  updateUI() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');

    if (this.isRunning) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
      statusText.textContent = 'Capturing...';
      statusDot.className = 'status-dot running';
    } else {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      statusText.textContent = 'Ready';
      statusDot.className = 'status-dot';
    }
  }

  showProgress() {
    const progressSection = document.getElementById('progressSection');
    progressSection.style.display = 'block';
    this.updateProgress();
  }

  hideProgress() {
    const progressSection = document.getElementById('progressSection');
    progressSection.style.display = 'none';
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (this.totalScreenshots > 0) {
      const percentage = (this.currentScreenshots / this.totalScreenshots) * 100;
      progressFill.style.width = percentage + '%';
      progressText.textContent = `${this.currentScreenshots} / ${this.totalScreenshots} screenshots`;
    }
  }

  showError(message) {
    // Simple error display - could be enhanced with a proper notification system
    alert('Error: ' + message);
  }

  showSuccess(message) {
    // Simple success display - could be enhanced with a proper notification system
    alert('Success: ' + message);
  }

  loadSettings() {
    // Load saved settings from storage
    chrome.storage.sync.get(['folderName', 'scrollStep', 'delay'], (result) => {
      if (result.folderName) {
        document.getElementById('folderName').value = result.folderName;
      }
      if (result.scrollStep) {
        document.getElementById('scrollStep').value = result.scrollStep;
        document.getElementById('scrollStepValue').textContent = result.scrollStep + '%';
      }
      if (result.delay) {
        document.getElementById('delay').value = result.delay;
      }
    });
  }

  saveSettings() {
    // Save settings to storage
    const settings = this.getSettings();
    chrome.storage.sync.set({
      folderName: settings.folderName,
      scrollStep: settings.scrollStep,
      delay: settings.delay
    });
  }
}

// Initialize popup controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
