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
                // First try to send message to existing content script
                chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageCount' }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.log('Content script not found, injecting...');
                        
                        // Inject content script if not present
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            files: ['content.js']
                        }, function() {
                            if (chrome.runtime.lastError) {
                                console.error('Failed to inject content script:', chrome.runtime.lastError);
                                showError('Failed to inject extension script. Please refresh the page and try again.');
                                return;
                            }
                            
                            // Wait a moment for script to load, then try again
                            setTimeout(() => {
                                chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageCount' }, function(response) {
                                    if (chrome.runtime.lastError) {
                                        console.error('Still failed after injection:', chrome.runtime.lastError);
                                        showError('Failed to communicate with page. Please refresh the page and try again.');
                                        return;
                                    }
                                    
                                    handleResponse(response);
                                });
                            }, 500);
                        });
                        return;
                    }

                    handleResponse(response);
                });
            } else {
                showError('No active tab found.');
            }
        });
    }
    
    function handleResponse(response) {
        console.log('Response from content script:', response);

        if (response && response.success) {
            if (response.pageCount > 0) {
                showPDFDetected(response.pageCount, response.validCanvases || response.pageCount);
            } else {
                showError('No PDF viewer detected. Please navigate to a PDF viewer page with canvas elements.');
            }
        } else {
            showError(response ? response.message : 'Unknown error occurred. Check browser console for details.');
        }
    }

    function showPDFDetected(pageCount, validCanvases) {
        statusDiv.style.display = 'none';
        pageInfoDiv.style.display = 'block';
        controlsDiv.style.display = 'block';
        pageCountSpan.textContent = pageCount;
        
        // Show additional info if there are canvases without content
        if (validCanvases < pageCount) {
            const infoText = document.createElement('div');
            infoText.style.cssText = 'font-size: 12px; color: #666; margin-top: 4px;';
            infoText.textContent = `${validCanvases} canvases have content`;
            pageInfoDiv.appendChild(infoText);
        }
        
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
                        if (response.fallback) {
                            showSuccess(response.message + '\n\nNote: Individual PNG images were downloaded instead of a single PDF due to library loading issues.');
                        } else {
                            showSuccess(response.message);
                        }
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
