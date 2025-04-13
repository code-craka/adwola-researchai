/**
 * Document Processing Pipeline
 *
 * This module handles the extraction and processing of content from various
 * document formats (PDF, LaTeX, Word, plain text).
 */
import { PDFDocument } from "pdf-lib"
import mammoth from "mammoth"
import { extractPaperContent } from "../ai/models"
import { pdfjsLib, isBrowser } from "./pdf-config"
import { logError, ErrorCategory, ErrorSeverity } from "../logging/error-logger"
import { extractTextWithTesseract } from "./ocr-extraction"

// Define specific error types for better error handling
export class DocumentProcessingError extends Error {
  category: string
  details?: any

  constructor(message: string, category: string, details?: any) {
    super(message)
    this.name = "DocumentProcessingError"
    this.category = category
    this.details = details
  }
}

export class PDFProcessingError extends DocumentProcessingError {
  constructor(message: string, details?: any) {
    super(message, "pdf_processing", details)
    this.name = "PDFProcessingError"
  }
}

/**
 * Main document processing pipeline
 * Handles different document formats and extracts content
 */
export async function processDocument(file: File, userId?: string, documentId?: string, projectId?: string) {
  try {
    // Determine file type and process accordingly
    const fileType = file.name.split(".").pop()?.toLowerCase()

    let extractedText = ""
    let metadata = {}
    let figures: any[] = []
    let tables: any[] = []
    let processingDetails = {} // Store details about the processing

    switch (fileType) {
      case "pdf":
        try {
          const pdfResult = await processPdf(file)
          extractedText = pdfResult.text
          metadata = pdfResult.metadata
          figures = pdfResult.figures
          tables = pdfResult.tables
          processingDetails = pdfResult.processingDetails || {}
        } catch (pdfError) {
          // Log the specific PDF error
          await logError({
            userId,
            category: ErrorCategory.PDF_PROCESSING,
            severity: ErrorSeverity.ERROR,
            message: `PDF processing failed: ${pdfError instanceof Error ? pdfError.message : "Unknown error"}`,
            details: pdfError,
            stack: pdfError instanceof Error ? pdfError.stack : undefined,
            documentId,
            projectId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          })

          // Try fallback extraction if primary method failed
          console.log("Primary PDF extraction failed, attempting fallback method...")

          try {
            // Attempt OCR-based extraction as fallback
            const fallbackResult = await extractTextWithTesseract(file)
            extractedText = fallbackResult.text
            processingDetails = {
              ...processingDetails,
              usedFallbackMethod: true,
              fallbackMethod: "tesseract-ocr",
              primaryMethodError: pdfError instanceof Error ? pdfError.message : "Unknown error",
            }

            // Log successful fallback
            await logError({
              userId,
              category: ErrorCategory.PDF_PROCESSING,
              severity: ErrorSeverity.WARNING,
              message: `Used fallback extraction method for PDF: ${file.name}`,
              details: {
                fallbackMethod: "tesseract-ocr",
                primaryMethodError: pdfError instanceof Error ? pdfError.message : "Unknown error",
              },
              documentId,
              projectId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            })
          } catch (fallbackError) {
            // Both primary and fallback methods failed
            await logError({
              userId,
              category: ErrorCategory.PDF_PROCESSING,
              severity: ErrorSeverity.CRITICAL,
              message: `Both primary and fallback PDF extraction methods failed for: ${file.name}`,
              details: {
                primaryError: pdfError instanceof Error ? pdfError.message : "Unknown error",
                fallbackError: fallbackError instanceof Error ? fallbackError.message : "Unknown error",
              },
              documentId,
              projectId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            })

            // Re-throw with more context
            throw new PDFProcessingError("Failed to extract content from PDF using multiple methods", {
              primaryError: pdfError,
              fallbackError,
            })
          }
        }
        break

      case "docx":
        try {
          const docxResult = await processDocx(file)
          extractedText = docxResult.text
          metadata = docxResult.metadata
        } catch (docxError) {
          await logError({
            userId,
            category: ErrorCategory.DOCUMENT_EXTRACTION,
            severity: ErrorSeverity.ERROR,
            message: `DOCX processing failed: ${docxError instanceof Error ? docxError.message : "Unknown error"}`,
            details: docxError,
            stack: docxError instanceof Error ? docxError.stack : undefined,
            documentId,
            projectId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          })
          throw new DocumentProcessingError(
            `Failed to process DOCX file: ${docxError instanceof Error ? docxError.message : "Unknown error"}`,
            "docx_processing",
            docxError,
          )
        }
        break

      case "tex":
        try {
          const latexResult = await processLatex(file)
          extractedText = latexResult.text
          metadata = latexResult.metadata
        } catch (latexError) {
          await logError({
            userId,
            category: ErrorCategory.DOCUMENT_EXTRACTION,
            severity: ErrorSeverity.ERROR,
            message: `LaTeX processing failed: ${latexError instanceof Error ? latexError.message : "Unknown error"}`,
            details: latexError,
            stack: latexError instanceof Error ? latexError.stack : undefined,
            documentId,
            projectId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          })
          throw new DocumentProcessingError(
            `Failed to process LaTeX file: ${latexError instanceof Error ? latexError.message : "Unknown error"}`,
            "latex_processing",
            latexError,
          )
        }
        break

      case "txt":
        try {
          extractedText = await processText(file)
        } catch (txtError) {
          await logError({
            userId,
            category: ErrorCategory.DOCUMENT_EXTRACTION,
            severity: ErrorSeverity.ERROR,
            message: `Text file processing failed: ${txtError instanceof Error ? txtError.message : "Unknown error"}`,
            details: txtError,
            stack: txtError instanceof Error ? txtError.stack : undefined,
            documentId,
            projectId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          })
          throw new DocumentProcessingError(
            `Failed to process text file: ${txtError instanceof Error ? txtError.message : "Unknown error"}`,
            "text_processing",
            txtError,
          )
        }
        break

      default:
        const unsupportedError = new DocumentProcessingError(
          `Unsupported file format: ${fileType}`,
          "unsupported_format",
        )
        await logError({
          userId,
          category: ErrorCategory.DOCUMENT_EXTRACTION,
          severity: ErrorSeverity.ERROR,
          message: `Unsupported file format: ${fileType}`,
          documentId,
          projectId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        })
        throw unsupportedError
    }

    // Use AI to analyze and structure the content
    let contentAnalysis
    try {
      contentAnalysis = await extractPaperContent(extractedText)

      if (!contentAnalysis.success) {
        await logError({
          userId,
          category: ErrorCategory.DOCUMENT_EXTRACTION,
          severity: ErrorSeverity.WARNING,
          message: `AI content analysis failed: ${contentAnalysis.error || "Unknown error"}`,
          details: contentAnalysis,
          documentId,
          projectId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        })
      }
    } catch (analysisError) {
      await logError({
        userId,
        category: ErrorCategory.DOCUMENT_EXTRACTION,
        severity: ErrorSeverity.WARNING,
        message: `AI content analysis error: ${analysisError instanceof Error ? analysisError.message : "Unknown error"}`,
        details: analysisError,
        stack: analysisError instanceof Error ? analysisError.stack : undefined,
        documentId,
        projectId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })

      // Continue with partial results
      contentAnalysis = {
        success: false,
        error: analysisError instanceof Error ? analysisError.message : "Unknown error",
        summary: "Content analysis failed. Using extracted text only.",
      }
    }

    // Log successful processing
    await logError({
      userId,
      category: ErrorCategory.DOCUMENT_EXTRACTION,
      severity: ErrorSeverity.INFO,
      message: `Successfully processed ${fileType} document: ${file.name}`,
      details: {
        extractedTextLength: extractedText.length,
        figuresCount: figures.length,
        tablesCount: tables.length,
        processingDetails,
      },
      documentId,
      projectId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })

    return {
      success: true,
      text: extractedText,
      summary: contentAnalysis?.summary || "No summary available",
      metadata,
      figures,
      tables,
      processingDetails,
    }
  } catch (error) {
    console.error("Error processing document:", error)

    // Log the general processing error
    await logError({
      userId,
      category: ErrorCategory.DOCUMENT_EXTRACTION,
      severity: ErrorSeverity.ERROR,
      message: `Document processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
      stack: error instanceof Error ? error.stack : undefined,
      documentId,
      projectId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorDetails: error instanceof DocumentProcessingError ? error.details : undefined,
    }
  }
}

/**
 * Process PDF files
 * Extracts text, metadata, figures, and tables with detailed error handling
 */
async function processPdf(file: File) {
  try {
    // Load the PDF file
    const arrayBuffer = await file.arrayBuffer()
    const pdfData = new Uint8Array(arrayBuffer)

    // Track processing details for diagnostics
    const processingDetails = {
      startTime: new Date().toISOString(),
      endTime: null as string | null,
      pdfVersion: null as string | null,
      pageCount: 0,
      extractionMethod: "pdfjs-primary",
      warnings: [] as string[],
    }

    // Extract text using PDF.js with better error handling
    let pdf
    try {
      pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
      processingDetails.pageCount = pdf.numPages

      // Try to get PDF version
      try {
        const metadata = await pdf.getMetadata()
        processingDetails.pdfVersion = metadata?.info?.PDFFormatVersion || null
      } catch (metadataError) {
        processingDetails.warnings.push(
          `Metadata extraction failed: ${metadataError instanceof Error ? metadataError.message : "Unknown error"}`,
        )
      }
    } catch (pdfLoadError) {
      // Handle specific PDF loading errors
      if (pdfLoadError instanceof Error) {
        if (pdfLoadError.message.includes("Missing PDF header")) {
          throw new PDFProcessingError("Invalid PDF format: Missing PDF header", { originalError: pdfLoadError })
        }
        if (pdfLoadError.message.includes("Encrypted")) {
          throw new PDFProcessingError("Cannot process encrypted PDF", { originalError: pdfLoadError })
        }
        if (pdfLoadError.message.includes("Password")) {
          throw new PDFProcessingError("Password-protected PDF cannot be processed", { originalError: pdfLoadError })
        }
        if (pdfLoadError.message.includes("XRef")) {
          throw new PDFProcessingError("PDF structure is invalid or corrupted", { originalError: pdfLoadError })
        }
      }
      throw new PDFProcessingError(
        `Failed to load PDF: ${pdfLoadError instanceof Error ? pdfLoadError.message : "Unknown error"}`,
        { originalError: pdfLoadError },
      )
    }

    let fullText = ""

    // Extract text from each page with page-specific error handling
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          // @ts-ignore - pdfjs types are not complete
          .map((item) => item.str)
          .join(" ")

        fullText += pageText + "\n\n"
      } catch (pageError) {
        processingDetails.warnings.push(
          `Failed to extract text from page ${i}: ${pageError instanceof Error ? pageError.message : "Unknown error"}`,
        )
        // Continue with other pages even if one fails
      }
    }

    // Check if we got any text
    if (fullText.trim().length === 0) {
      processingDetails.warnings.push("No text content extracted from PDF")
    }

    // Extract metadata
    let metadata: any = {}
    try {
      metadata = await pdf.getMetadata()
    } catch (metadataError) {
      processingDetails.warnings.push(
        `Metadata extraction failed: ${metadataError instanceof Error ? metadataError.message : "Unknown error"}`,
      )
    }

    // Use PDF-lib for more detailed analysis only in browser environment
    const figures: any[] = []
    const tables: any[] = []

    // Only attempt to use PDF-lib if we're in a browser environment
    if (isBrowser) {
      try {
        const pdfDoc = await PDFDocument.load(pdfData)
        const pages = pdfDoc.getPages()

        // Extract figures and tables (simplified implementation)
        // In a real implementation, you would use computer vision models
        // or specialized PDF extraction libraries

        // Simulate figure and table extraction
        // In a real implementation, this would use image recognition
        // and table extraction algorithms
        for (let i = 0; i < pages.length; i++) {
          // Check for image objects (simplified)
          if (fullText.includes("Figure") || fullText.includes("Fig.")) {
            figures.push({
              pageNumber: i + 1,
              description: `Figure extracted from page ${i + 1}`,
            })
          }

          // Check for table objects (simplified)
          if (fullText.includes("Table")) {
            tables.push({
              pageNumber: i + 1,
              description: `Table extracted from page ${i + 1}`,
            })
          }
        }
      } catch (pdfLibError) {
        processingDetails.warnings.push(
          `PDF-lib analysis failed: ${pdfLibError instanceof Error ? pdfLibError.message : "Unknown error"}`,
        )
      }
    }

    processingDetails.endTime = new Date().toISOString()

    return {
      text: fullText,
      metadata: metadata?.info || {},
      figures,
      tables,
      processingDetails,
    }
  } catch (error) {
    console.error("Error processing PDF:", error)
    throw error // Re-throw to be handled by the main processDocument function
  }
}

// Other processing functions remain the same...

async function processDocx(file: File): Promise<{ text: string; metadata: any }> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer })
    const text = result.value
    return { text: text, metadata: {} }
  } catch (error) {
    console.error("Error processing DOCX:", error)
    throw error
  }
}

async function processLatex(file: File): Promise<{ text: string; metadata: any }> {
  try {
    const text = await file.text()
    // Basic LaTeX stripping - improve this as needed
    const strippedText = text
      .replace(/\\documentclass\{.*\}/g, "")
      .replace(/\\usepackage\{.*\}/g, "")
      .replace(/\\begin\{document\}/g, "")
      .replace(/\\end\{document\}/g, "")
      .replace(/\\\[.*?\\\]/g, "") // Remove equations
      .replace(/\\$$.*?\\$$/g, "") // Remove inline equations
      .replace(/\{.*?\}/g, "") // Remove curly braces and their contents
      .replace(/\\.*? /g, "") // Remove LaTeX commands
      .replace(/~/g, " ") // Replace tildes with spaces
      .replace(/&/g, "and") // Replace ampersands with "and"

    return { text: strippedText, metadata: {} }
  } catch (error) {
    console.error("Error processing LaTeX:", error)
    throw error
  }
}

async function processText(file: File): Promise<string> {
  try {
    return await file.text()
  } catch (error) {
    console.error("Error processing text file:", error)
    throw error
  }
}