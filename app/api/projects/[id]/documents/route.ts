import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-service"
import { processDocument } from "@/lib/document-processing/pipeline"
import { addDocumentToProject } from "@/lib/db/project-service"
import { saveDocumentToStorage } from "@/lib/storage/document-storage"
import { logError, ErrorCategory, ErrorSeverity, formatUserErrorMessage } from "@/lib/logging/error-logger"
import { validateFile, sanitizeFilename } from "@/lib/security/file-validation"
import { rateLimit } from "@/lib/security/rate-limit"
import { z } from "zod"

// Schema for document upload request validation
const documentUploadSchema = z.object({
  file: z.instanceof(File, { message: "File is required" }),
  isRetry: z.boolean().optional(),
  documentId: z.string().optional(),
  skipProcessing: z.boolean().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract id properly from params
    const projectId = params.id

    // Validate project ID format
    if (!projectId.match(/^[a-zA-Z0-9_-]+$/)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 })
    }

    // Apply rate limiting for document uploads
    const { success: rateLimitSuccess } = await rateLimit(`upload_${session.user.id}`, 10) // 10 uploads per minute

    if (!rateLimitSuccess) {
      return NextResponse.json(
        {
          error: "Too many upload requests. Please try again later.",
        },
        { status: 429 },
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    // Parse and validate form data
    const parseResult = documentUploadSchema.safeParse({
      file,
      isRetry: formData.get("isRetry") === "true",
      documentId: formData.get("documentId") as string | null,
      skipProcessing: formData.get("skipProcessing") === "true",
    })

    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { isRetry, documentId, skipProcessing } = parseResult.data

    // Validate file security
    const fileValidation = await validateFile(file)
    if (!fileValidation.valid) {
      await logError({
        userId: session.user.id,
        category: ErrorCategory.DOCUMENT_UPLOAD,
        severity: ErrorSeverity.WARNING,
        message: `File validation failed: ${fileValidation.error}`,
        projectId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })

      return NextResponse.json({ error: fileValidation.error }, { status: 400 })
    }

    // Sanitize filename for security
    const sanitizedFilename = sanitizeFilename(file.name)

    // Create a new file with sanitized name
    const secureFile = new File([await file.arrayBuffer()], sanitizedFilename, {
      type: file.type,
    })

    // First save the file to storage
    const storageResult = await saveDocumentToStorage(secureFile)

    if (!storageResult.success) {
      await logError({
        userId: session.user.id,
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.ERROR,
        message: `Failed to save document to storage: ${storageResult.error}`,
        projectId,
        fileName: sanitizedFilename,
        fileType: file.type,
        fileSize: file.size,
      })

      return NextResponse.json({ error: storageResult.error }, { status: 500 })
    }

    // Create initial document record to get an ID
    const initialDocResult = await addDocumentToProject(projectId, session.user.id, {
      filename: sanitizedFilename,
      fileSize: file.size,
      mimeType: file.type,
      fileUrl: storageResult.fileUrl || "",
      status: "uploading",
    })

    if (!initialDocResult.success) {
      await logError({
        userId: session.user.id,
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.ERROR,
        message: `Failed to create initial document record: ${initialDocResult.error}`,
        projectId,
        fileName: sanitizedFilename,
        fileType: file.type,
        fileSize: file.size,
      })

      return NextResponse.json({ error: initialDocResult.error }, { status: 500 })
    }

    const newDocumentId = initialDocResult.document.id

    // Process the document with better error handling
    let processingResult
    if (!skipProcessing) {
      try {
        processingResult = await processDocument(secureFile, session.user.id, newDocumentId, projectId)

        if (!processingResult.success) {
          console.error("Document processing failed:", processingResult.error)

          // Update document status to reflect processing failure
          await addDocumentToProject(projectId, session.user.id, {
            id: newDocumentId,
            status: "processing_failed",
            processingError: processingResult.error,
            processingErrorDetails: JSON.stringify(processingResult.errorDetails || {}),
          })

          // Continue anyway with limited data - don't block the upload
        }
      } catch (processingError) {
        console.error("Error during document processing:", processingError)

        // Log the processing error
        await logError({
          userId: session.user.id,
          category: ErrorCategory.DOCUMENT_EXTRACTION,
          severity: ErrorSeverity.ERROR,
          message: `Document processing error: ${processingError instanceof Error ? processingError.message : "Unknown error"}`,
          details: processingError,
          stack: processingError instanceof Error ? processingError.stack : undefined,
          documentId: newDocumentId,
          projectId,
          fileName: sanitizedFilename,
          fileType: file.type,
          fileSize: file.size,
        })

        // Update document status
        await addDocumentToProject(projectId, session.user.id, {
          id: newDocumentId,
          status: "processing_failed",
          processingError: processingError instanceof Error ? processingError.message : "Unknown processing error",
        })

        // If processing fails, we can still add the document with limited data
        processingResult = {
          success: false,
          error: processingError instanceof Error ? processingError.message : "Unknown processing error",
          text: "",
          summary: "",
        }
      }
    }

    // Update the document with processing results
    const result = await addDocumentToProject(projectId, session.user.id, {
      id: newDocumentId,
      filename: sanitizedFilename,
      fileSize: file.size,
      mimeType: file.type,
      fileUrl: storageResult.fileUrl || "",
      textContent: processingResult?.text || "",
      summary: processingResult?.summary || "",
      status: processingResult?.success ? "ready" : "processing_incomplete",
      processingDetails: processingResult?.processingDetails
        ? JSON.stringify(processingResult.processingDetails)
        : null,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Return success even if processing had issues
    return NextResponse.json(
      {
        ...result.document,
        processingWarning: processingResult?.success
          ? undefined
          : formatUserErrorMessage(processingResult?.error, "Document uploaded but content extraction was limited"),
        canRetry: !processingResult?.success,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error processing document:", error)

    // Log the unexpected error
    await logError({
      category: ErrorCategory.API_ERROR,
      severity: ErrorSeverity.ERROR,
      message: `Unexpected error in document upload API: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

// Add a new endpoint to handle retry requests with enhanced security
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id

    // Validate project ID format
    if (!projectId.match(/^[a-zA-Z0-9_-]+$/)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 })
    }

    // Apply rate limiting for retry requests
    const { success: rateLimitSuccess } = await rateLimit(`retry_${session.user.id}`, 5) // 5 retries per minute

    if (!rateLimitSuccess) {
      return NextResponse.json(
        {
          error: "Too many retry requests. Please try again later.",
        },
        { status: 429 },
      )
    }

    // Validate request body
    const requestSchema = z.object({
      documentId: z.string().min(1),
      options: z
        .object({
          useAlternativeMethod: z.boolean().optional(),
          ignoreEncryption: z.boolean().optional(),
          skipMetadata: z.boolean().optional(),
        })
        .optional(),
    })

    const parseResult = requestSchema.safeParse(await req.json())

    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { documentId, options } = parseResult.data

    // Get the document to retry processing
    const getDocResult = await fetch(`/api/projects/${projectId}/documents/${documentId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!getDocResult.ok) {
      return NextResponse.json({ error: "Failed to retrieve document" }, { status: 404 })
    }

    const document = await getDocResult.json()

    // Update document status to indicate retry
    await addDocumentToProject(projectId, session.user.id, {
      id: documentId,
      status: "processing_retry",
    })

    // Fetch the file from storage
    const fileResponse = await fetch(document.fileUrl)
    if (!fileResponse.ok) {
      throw new Error("Failed to fetch document file from storage")
    }

    const fileBlob = await fileResponse.blob()
    const file = new File([fileBlob], document.filename, { type: document.mimeType })

    // Process with adjusted options
    const processingOptions = {
      ...options,
      isRetry: true,
      ignoreEncryption: options?.ignoreEncryption || false,
      useAlternativeMethod: options?.useAlternativeMethod || false,
      skipMetadata: options?.skipMetadata || false,
    }

    // Process the document again
    const processingResult = await processDocument(file, session.user.id, documentId, projectId)

    // Update the document with new processing results
    const result = await addDocumentToProject(projectId, session.user.id, {
      id: documentId,
      textContent: processingResult?.text || document.textContent || "",
      summary: processingResult?.summary || document.summary || "",
      status: processingResult?.success ? "ready" : "processing_failed",
      processingDetails: processingResult?.processingDetails
        ? JSON.stringify(processingResult.processingDetails)
        : null,
      processingError: processingResult?.success ? null : processingResult?.error,
      retryCount: (document.retryCount || 0) + 1,
      lastRetryAt: new Date().toISOString(),
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      ...result.document,
      processingWarning: processingResult?.success ? undefined : formatUserErrorMessage(processingResult?.error),
      canRetry: !processingResult?.success,
    })
  } catch (error) {
    console.error("Error retrying document processing:", error)

    await logError({
      category: ErrorCategory.API_ERROR,
      severity: ErrorSeverity.ERROR,
      message: `Error in document processing retry API: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
