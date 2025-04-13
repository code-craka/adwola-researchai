// Configure PDF.js differently for browser vs server environments
let pdfjsLib: any

// Only import PDF.js in browser environment or with special handling in Node.js
if (typeof window !== 'undefined') {
  // In browser environment, we can safely import and configure the worker
  try {
    // For newer versions of PDF.js (3.x+), this is the correct import pattern
    const pdfjs = require('pdfjs-dist')
    pdfjsLib = pdfjs
    
    // Ensure the worker source is correctly set
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Use CDN worker for PDF.js 3.x
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    }
  } catch (err) {
    console.error('Failed to load PDF.js in browser:', err)
    // Fallback to alternative import patterns
    try {
      pdfjsLib = require('pdfjs-dist/webpack')
    } catch (fallbackErr1) {
      try {
        pdfjsLib = require('pdfjs-dist/build/pdf')
      } catch (fallbackErr2) {
        try {
          pdfjsLib = require('pdfjs-dist/legacy/build/pdf')
        } catch (fallbackErr3) {
          console.error('Failed to load any version of PDF.js:', fallbackErr3)
          throw new Error('Unable to initialize PDF processing library')
        }
      }
    }
    
    // Set worker if we've loaded any valid version but worker isn't set
    if (pdfjsLib && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
    }
  }
} else {
  // In server environment, create a stub that works without browser APIs
  try {
    // Set up navigator polyfill for server environment
    if (!globalThis.navigator) {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'node',
          platform: process.platform,
        },
        writable: false,
      });
    }
    
    // Try modern version first (for PDF.js 3.x)
    try {
      pdfjsLib = require('pdfjs-dist')
    } catch (err) {
      try {
        pdfjsLib = require('pdfjs-dist/webpack')
      } catch (fallbackErr1) {
        try {
          pdfjsLib = require('pdfjs-dist/build/pdf')
        } catch (fallbackErr2) {
          try {
            pdfjsLib = require('pdfjs-dist/legacy/build/pdf')
          } catch (fallbackErr3) {
            throw new Error('Failed to load any version of PDF.js in Node environment')
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to initialize PDF.js in Node.js environment:', err)
    // Provide minimal stub implementation for server
    pdfjsLib = {
      getDocument: () => {
        return {
          promise: Promise.resolve({
            numPages: 0,
            getPage: () => Promise.resolve({
              getTextContent: () => Promise.resolve({ items: [] }),
            }),
            getMetadata: () => Promise.resolve({ info: {} }),
          }),
        }
      },
    }
  }
}

// Export the configured library
export { pdfjsLib }

// Utility function to check if code is running in browser
export const isBrowser = typeof window !== 'undefined'

// Safe version of getDocument that avoids server-side canvas issues
export async function getDocumentProxy(data: Uint8Array) {
  if (!isBrowser) {
    console.warn('PDF text extraction is limited in server environment')
  }
  
  try {
    // Verify pdfjsLib is properly loaded
    if (!pdfjsLib) {
      console.error('PDF.js library not loaded')
      throw new Error('PDF.js library not properly initialized')
    }
    
    if (typeof pdfjsLib.getDocument !== 'function') {
      console.error('PDF.js getDocument method not found', pdfjsLib)
      throw new Error('PDF.js getDocument method not available')
    }
    
    // Use a simple version on the server that doesn't need canvas
    const loadingTask = pdfjsLib.getDocument({ data })
    return loadingTask.promise
  } catch (err) {
    console.error('Failed to get PDF document:', err)
    throw new Error('PDF processing failed: ' + (err instanceof Error ? err.message : String(err)))
  }
}