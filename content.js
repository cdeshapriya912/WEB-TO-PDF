// Content script for PDF Viewer Downloader
console.log('PDF Viewer Downloader: Content script loaded');

// Function to capture all canvas elements from PDF viewer
function capturePDFCanvases() {
  const canvases = document.querySelectorAll('.pdf-vue3-canvas-container canvas');
  console.log(`Found ${canvases.length} canvas elements`);
  
  if (canvases.length === 0) {
    throw new Error('No PDF canvas elements found. Make sure you are on a PDF viewer page.');
  }
  
  return Array.from(canvases).map((canvas, index) => {
    // Get the canvas image data
    const imageData = canvas.toDataURL('image/png', 1.0);
    return {
      pageNumber: index + 1,
      imageData: imageData,
      width: canvas.width,
      height: canvas.height
    };
  });
}

// Function to generate PDF from canvas data
async function generatePDFFromCanvases() {
  try {
    // Load jsPDF library
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('jspdf.umd.min.js');
    document.head.appendChild(script);
    
    return new Promise((resolve, reject) => {
      script.onload = async () => {
        try {
          const { jsPDF } = window.jspdf;
          const canvasData = capturePDFCanvases();
          
          if (canvasData.length === 0) {
            reject(new Error('No canvas data found'));
            return;
          }
          
          // Create new PDF document
          const pdf = new jsPDF({
            orientation: canvasData[0].width > canvasData[0].height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvasData[0].width, canvasData[0].height]
          });
          
          // Add each canvas as a page
          canvasData.forEach((page, index) => {
            if (index > 0) {
              pdf.addPage([page.width, page.height]);
            }
            
            // Add image to PDF page
            pdf.addImage(
              page.imageData,
              'PNG',
              0,
              0,
              page.width,
              page.height
            );
          });
          
          // Generate PDF blob
          const pdfBlob = pdf.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          resolve({
            blob: pdfBlob,
            url: pdfUrl,
            pageCount: canvasData.length
          });
          
        } catch (error) {
          reject(error);
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load jsPDF library'));
      };
    });
    
  } catch (error) {
    throw new Error(`Error generating PDF: ${error.message}`);
  }
}

// Function to download PDF
function downloadPDF(pdfBlob, filename = 'downloaded-pdf.pdf') {
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadPDF') {
    generatePDFFromCanvases()
      .then(result => {
        downloadPDF(result.blob, request.filename || 'pdf-viewer-download.pdf');
        sendResponse({ 
          success: true, 
          message: `PDF downloaded successfully with ${result.pageCount} pages`,
          pageCount: result.pageCount
        });
      })
      .catch(error => {
        console.error('PDF download error:', error);
        sendResponse({ 
          success: false, 
          message: error.message 
        });
      });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
  
  if (request.action === 'getPageCount') {
    try {
      const canvases = document.querySelectorAll('.pdf-vue3-canvas-container canvas');
      sendResponse({ 
        success: true, 
        pageCount: canvases.length 
      });
    } catch (error) {
      sendResponse({ 
        success: false, 
        message: error.message 
      });
    }
  }
});

// Auto-detect PDF viewer and show notification
function detectPDFViewer() {
  const canvases = document.querySelectorAll('.pdf-vue3-canvas-container canvas');
  if (canvases.length > 0) {
    console.log(`PDF Viewer detected: ${canvases.length} pages found`);
    
    // Create a subtle notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>📄</span>
        <span>PDF Viewer detected (${canvases.length} pages)</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 8px;">×</button>
      </div>
    `;
    
    // Add animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }
}

// Run detection when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', detectPDFViewer);
} else {
  detectPDFViewer();
}
