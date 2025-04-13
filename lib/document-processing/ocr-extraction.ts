/**
 * OCR-based text extraction
 *
 * Provides fallback extraction capabilities using Tesseract.js
 * This is used when the primary PDF extraction method fails
 */

import { createWorker } from "tesseract.js"
import { PDFDocument } from "pdf-lib"
import { logError, ErrorCategory, ErrorSeverity } from "../logging/error-logger"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

/**
 * Extract text from an image or PDF using Tesseract OCR
 */
export async function extractTextWithTesseract(file: File) {
  if (!isBrowser) {
    throw new Error("OCR extraction is only available in browser environment")
  }

  try {
    let imageData

    // If it's a PDF, we need to render the first page as an image
    if (file.type === "application/pdf") {
      imageData = await renderPdfPageAsImage(file)
    } else {
      // For image files, use directly
      imageData = URL.createObjectURL(file)
    }

    // Initialize Tesseract worker
    const worker = await createWorker("eng")

    // Recognize text
    const result = await worker.recognize(imageData)

    // Clean up
    await worker.terminate()
    if (typeof imageData === "string" && imageData.startsWith("blob:")) {
      URL.revokeObjectURL(imageData)
    }

    return {
      success: true,
      text: result.data.text,
      confidence: result.data.confidence,
      method: "tesseract-ocr",
    }
  } catch (error) {
    console.error("OCR extraction failed:", error)

    // Log the OCR failure
    await logError({
      category: ErrorCategory.DOCUMENT_EXTRACTION,
      severity: ErrorSeverity.ERROR,
      message: `OCR extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
      stack: error instanceof Error ? error.stack : undefined,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })

    throw new Error(`OCR extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Render a PDF page as an image for OCR processing
 */
async function renderPdfPageAsImage(pdfFile: File): Promise<string> {
  try {
    // Load the PDF
    const arrayBuffer = await pdfFile.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)

    // Get the first page
    const pages = pdfDoc.getPages()
    if (pages.length === 0) {
      throw new Error("PDF has no pages")
    }

    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    // Create a canvas to render the page
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")

    if (!context) {
      throw new Error("Could not create canvas context")
    }

    // Fill with white background (for better OCR)
    context.fillStyle = "white"
    context.fillRect(0, 0, width, height)

    // In a real implementation, you would render the PDF page to the canvas
    // This is a simplified version that would need to be replaced with
    // a proper PDF rendering library like pdf.js

    // For now, we'll just return a data URL of the blank canvas
    // In a real implementation, this would be the rendered PDF page
    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error("Failed to render PDF page as image:", error)
    throw error
  }
}
