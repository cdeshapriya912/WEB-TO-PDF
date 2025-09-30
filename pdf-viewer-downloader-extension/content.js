// Content script for PDF Viewer Downloader
console.log('PDF Viewer Downloader: Content script loaded');

// Debug function to check library loading
function debugLibraryLoading() {
  console.log('=== Library Loading Debug ===');
  console.log('window.jspdf:', window.jspdf);
  console.log('window.jsPDF:', window.jsPDF);
  console.log('Available PDF-related properties:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')));
  
  if (window.jspdf) {
    console.log('window.jspdf keys:', Object.keys(window.jspdf));
    console.log('window.jspdf.jsPDF:', window.jspdf.jsPDF);
    console.log('window.jspdf.default:', window.jspdf.default);
  }
  
  console.log('Script elements:', Array.from(document.querySelectorAll('script')).map(s => s.src));
  console.log('============================');
}

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
    // Check if jsPDF is already loaded
    if (window.jspdf && window.jspdf.jsPDF) {
      return await createPDF();
    }
    
    // Try loading from CDN first
    return new Promise((resolve, reject) => {
      // Check if script is already being loaded
      if (document.querySelector('script[src*="jspdf"]')) {
        // Wait for existing script to load
        const checkLoaded = setInterval(() => {
          if (window.jspdf && window.jspdf.jsPDF) {
            clearInterval(checkLoaded);
            createPDF().then(resolve).catch(reject);
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkLoaded);
          reject(new Error('jsPDF library failed to load'));
        }, 10000);
        return;
      }
      
      // Try CDN first
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.crossOrigin = 'anonymous';
      
      script.onload = async () => {
        try {
          // Wait a moment for the library to initialize
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try multiple ways to access jsPDF
          let jsPDFConstructor = null;
          
          if (window.jspdf && window.jspdf.jsPDF) {
            jsPDFConstructor = window.jspdf.jsPDF;
          } else if (window.jspdf && window.jspdf.default) {
            jsPDFConstructor = window.jspdf.default;
          } else if (window.jsPDF) {
            jsPDFConstructor = window.jsPDF;
          } else {
            // Try to find it in the global scope
            const possibleNames = ['jsPDF', 'jspdf', 'JsPDF'];
            for (const name of possibleNames) {
              if (window[name] && typeof window[name] === 'function') {
                jsPDFConstructor = window[name];
                break;
              }
            }
          }
          
          if (!jsPDFConstructor) {
            debugLibraryLoading();
            // Try fallback method
            console.log('Trying fallback PDF generation method...');
            const result = await createPDFFallback();
            resolve(result);
            return;
          }
          
          // Temporarily assign to window.jspdf for compatibility
          if (!window.jspdf) {
            window.jspdf = { jsPDF: jsPDFConstructor };
          }
          
          const result = await createPDF();
          resolve(result);
        } catch (error) {
          console.error('Error in script onload:', error);
          // Try fallback method
          try {
            const result = await createPDFFallback();
            resolve(result);
          } catch (fallbackError) {
            reject(fallbackError);
          }
        }
      };
      
      script.onerror = async (error) => {
        console.error('CDN script load error, trying local fallback:', error);
        // Try local fallback
        try {
          const result = await createPDFFallback();
          resolve(result);
        } catch (fallbackError) {
          reject(fallbackError);
        }
      };
      
      document.head.appendChild(script);
    });
    
  } catch (error) {
    throw new Error(`Error generating PDF: ${error.message}`);
  }
}

// Separate function to create PDF once library is loaded
async function createPDF() {
  const canvasData = capturePDFCanvases();
  
  if (canvasData.length === 0) {
    throw new Error('No canvas data found');
  }
  
  // Get jsPDF constructor
  const jsPDF = window.jspdf.jsPDF;
  
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
  
  return {
    blob: pdfBlob,
    url: pdfUrl,
    pageCount: canvasData.length
  };
}

// Fallback method that downloads individual canvas images
async function createPDFFallback() {
  console.log('Using fallback method: downloading individual canvas images');
  
  const canvasData = capturePDFCanvases();
  
  if (canvasData.length === 0) {
    throw new Error('No canvas data found');
  }
  
  // Download each canvas as a separate image
  for (let i = 0; i < canvasData.length; i++) {
    const page = canvasData[i];
    const link = document.createElement('a');
    link.download = `pdf-page-${i + 1}.png`;
    link.href = page.imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Return a mock result
  return {
    blob: null,
    url: null,
    pageCount: canvasData.length,
    fallback: true
  };
}

// Function to download PDF
function downloadPDF(pdfBlob, filename = 'downloaded-pdf.pdf') {
  if (!pdfBlob) {
    console.log('No PDF blob available (fallback mode)');
    return;
  }
  
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
  console.log('Content script received message:', request);
  
  if (request.action === 'downloadPDF') {
    generatePDFFromCanvases()
      .then(result => {
        if (result.fallback) {
          sendResponse({ 
            success: true, 
            message: `Downloaded ${result.pageCount} individual PNG images (fallback mode)`,
            pageCount: result.pageCount,
            fallback: true
          });
        } else {
          downloadPDF(result.blob, request.filename || 'pdf-viewer-download.pdf');
          sendResponse({ 
            success: true, 
            message: `PDF downloaded successfully with ${result.pageCount} pages`,
            pageCount: result.pageCount
          });
        }
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
      // Try multiple selectors to find canvas elements
      let canvases = document.querySelectorAll('.pdf-vue3-canvas-container canvas');
      
      // If no canvases found with specific selector, try broader search
      if (canvases.length === 0) {
        canvases = document.querySelectorAll('canvas');
        console.log('Found canvases with broader selector:', canvases.length);
      }
      
      // Check if any canvas has content
      let validCanvases = 0;
      canvases.forEach(canvas => {
        try {
          const ctx = canvas.getContext('2d');
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          // Check if canvas has non-transparent content
          const hasContent = imageData.data.some((value, index) => 
            index % 4 === 3 && value > 0 // Check alpha channel
          );
          if (hasContent) validCanvases++;
        } catch (e) {
          // Canvas might not be ready yet
        }
      });
      
      console.log(`Found ${canvases.length} canvas elements, ${validCanvases} with content`);
      
      sendResponse({ 
        success: true, 
        pageCount: canvases.length,
        validCanvases: validCanvases,
        message: canvases.length > 0 ? 
          `Found ${canvases.length} canvas elements` : 
          'No canvas elements found. Make sure you are on a PDF viewer page.'
      });
    } catch (error) {
      console.error('Error getting page count:', error);
      sendResponse({ 
        success: false, 
        message: `Error: ${error.message}` 
      });
    }
  }
  
  // Always return true for async responses
  return true;
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
