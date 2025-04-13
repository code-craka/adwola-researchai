import * as pdfjs from "pdfjs-dist"

// This file is used to configure the PDF.js worker
// It should be imported in any file that uses PDF.js

// Only set the worker source if we're in the browser
if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
}

export default pdfjs
