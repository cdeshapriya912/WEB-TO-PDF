// Popup script for PDF Viewer Downloader
document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const pageInfoDiv = document.getElementById('pageInfo');
    const pageCountSpan = document.getElementById('pageCount');
    const controlsDiv = document.getElementById('controls');
    const errorDiv = document.getElementById('error');
    const successDiv = document.getElementById('success');
    const downloadBtn = document.getElementById('downloadBtn');
    const filenameInput = document.getElementById('filename');

    // Check if we're on a PDF viewer page
    checkPDFViewer();

    function checkPDFViewer() {
        // Get the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                // Send message to content script to check for PDF viewer
                chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageCount' }, function(response) {
                    if (chrome.runtime.lastError) {
                        showError('Failed to communicate with page. Make sure you are on a PDF viewer page.');
                        return;
                    }

                    if (response && response.success) {
                        if (response.pageCount > 0) {
                            showPDFDetected(response.pageCount);
                        } else {
                            showError('No PDF viewer detected. Please navigate to a PDF viewer page.');
                        }
                    } else {
                        showError(response ? response.message : 'Unknown error occurred.');
                    }
                });
            } else {
                showError('No active tab found.');
            }
        });
    }

    function showPDFDetected(pageCount) {
        statusDiv.style.display = 'none';
        pageInfoDiv.style.display = 'block';
        controlsDiv.style.display = 'block';
        pageCountSpan.textContent = pageCount;
        
        // Set default filename based on page count
        filenameInput.value = `pdf-document-${pageCount}-pages.pdf`;
    }

    function showError(message) {
        statusDiv.style.display = 'none';
        pageInfoDiv.style.display = 'none';
        controlsDiv.style.display = 'none';
        errorDiv.style.display = 'flex';
        errorDiv.querySelector('.error-message').textContent = message;
    }

    function showSuccess(message) {
        successDiv.style.display = 'flex';
        successDiv.querySelector('.success-message').textContent = message;
        
        // Hide after 3 seconds
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }

    function showLoading() {
        downloadBtn.disabled = true;
        downloadBtn.classList.add('loading');
        downloadBtn.querySelector('.btn-text').textContent = 'Downloading';
    }

    function hideLoading() {
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('loading');
        downloadBtn.querySelector('.btn-text').textContent = 'Download PDF';
    }

    // Download button click handler
    downloadBtn.addEventListener('click', function() {
        const filename = filenameInput.value.trim() || 'pdf-viewer-download.pdf';
        
        // Validate filename
        if (!filename.endsWith('.pdf')) {
            filenameInput.value = filename + '.pdf';
        }

        showLoading();
        hideError();
        hideSuccess();

        // Send message to content script to download PDF
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { 
                    action: 'downloadPDF', 
                    filename: filenameInput.value 
                }, function(response) {
                    hideLoading();
                    
                    if (chrome.runtime.lastError) {
                        showError('Failed to communicate with page. Please try again.');
                        return;
                    }

                    if (response && response.success) {
                        showSuccess(response.message);
                    } else {
                        showError(response ? response.message : 'Download failed. Please try again.');
                    }
                });
            } else {
                hideLoading();
                showError('No active tab found.');
            }
        });
    });

    function hideError() {
        errorDiv.style.display = 'none';
    }

    function hideSuccess() {
        successDiv.style.display = 'none';
    }

    // Filename input validation
    filenameInput.addEventListener('input', function() {
        // Remove invalid characters for filenames
        this.value = this.value.replace(/[<>:"/\\|?*]/g, '');
    });

    // Allow Enter key to trigger download
    filenameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !downloadBtn.disabled) {
            downloadBtn.click();
        }
    });

    // Refresh button functionality (optional)
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '🔄 Refresh';
    refreshBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    `;
    refreshBtn.addEventListener('click', function() {
        checkPDFViewer();
    });
    document.querySelector('.header').appendChild(refreshBtn);
});
