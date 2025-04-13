import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Configure PDF.js worker for browser environments only
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    // Use the installed pdfjs-dist version, with a fallback
    const pdfWorkerVersion = pdfjsLib.version || '3.11.174';

    // Option 1: CDN for the worker (default, minimizes bundling issues)
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfWorkerVersion}/pdf.worker.min.js`;

    // Option 2: Local worker (uncomment to use, requires copying worker to public/)
    // pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

    // Optional: Explicit worker settings for clarity
    pdfjsLib.GlobalWorkerOptions.disableWorker = false;
  } catch (error) {
    console.error('Failed to configure PDF.js worker:', error);
    // Fallback: Disable worker to prevent crashes (slower processing)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    pdfjsLib.GlobalWorkerOptions.disableWorker = true;
  }
}

export default pdfjsLib;