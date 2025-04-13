import { logError, ErrorCategory, ErrorSeverity } from "../logging/error-logger"

// Define allowed file types and their corresponding MIME types
export const ALLOWED_FILE_TYPES = {
  pdf: ["application/pdf"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-word.document.macroEnabled.12",
  ],
  doc: ["application/msword"],
  tex: ["application/x-tex", "text/x-tex"],
  txt: ["text/plain"],
  rtf: ["application/rtf", "text/rtf"],
  md: ["text/markdown", "text/x-markdown"],
}

// File size limits in bytes
export const FILE_SIZE_LIMITS = {
  pdf: 50 * 1024 * 1024, // 50MB
  docx: 25 * 1024 * 1024, // 25MB
  doc: 25 * 1024 * 1024, // 25MB
  tex: 10 * 1024 * 1024, // 10MB
  txt: 10 * 1024 * 1024, // 10MB
  rtf: 15 * 1024 * 1024, // 15MB
  md: 10 * 1024 * 1024, // 10MB
  default: 50 * 1024 * 1024, // 50MB default
}

// Magic numbers/signatures for common file types
const FILE_SIGNATURES: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  docx: [[0x50, 0x4b, 0x03, 0x04]], // PK..
  doc: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]], // DOCFILE
  // Add more signatures as needed
}

/**
 * Validates a file based on extension, size, and content type
 */
export async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    // Extract file extension
    const extension = file.name.split(".").pop()?.toLowerCase()

    if (!extension || !Object.keys(ALLOWED_FILE_TYPES).includes(extension)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(", ")}`,
      }
    }

    // Check file size
    const sizeLimit = FILE_SIZE_LIMITS[extension as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.default
    if (file.size > sizeLimit) {
      return {
        valid: false,
        error: `File size exceeds the limit of ${Math.round(sizeLimit / (1024 * 1024))}MB`,
      }
    }

    // Check MIME type
    const allowedMimeTypes = ALLOWED_FILE_TYPES[extension as keyof typeof ALLOWED_FILE_TYPES]
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file content type: ${file.type}. Expected one of: ${allowedMimeTypes.join(", ")}`,
      }
    }

    // For critical file types, verify file signature (magic numbers)
    if (FILE_SIGNATURES[extension]) {
      const isValidSignature = await verifyFileSignature(file, FILE_SIGNATURES[extension])
      if (!isValidSignature) {
        return {
          valid: false,
          error: `Invalid file content. The file does not appear to be a valid ${extension.toUpperCase()} file.`,
        }
      }
    }

    return { valid: true }
  } catch (error) {
    await logError({
      category: ErrorCategory.FILE_VALIDATION,
      severity: ErrorSeverity.ERROR,
      message: `File validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { fileName: file.name, fileType: file.type, fileSize: file.size },
      stack: error instanceof Error ? error.stack : undefined,
    })

    return { valid: false, error: "File validation failed due to an unexpected error" }
  }
}

/**
 * Verifies file signature (magic numbers) to ensure file type integrity
 */
async function verifyFileSignature(file: File, signatures: number[][]): Promise<boolean> {
  try {
    // Read the first 8 bytes of the file
    const arrayBuffer = await file.slice(0, 8).arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // Check if the file starts with any of the valid signatures
    return signatures.some((signature) => {
      if (signature.length > bytes.length) return false

      for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !== signature[i]) return false
      }

      return true
    })
  } catch (error) {
    console.error("Error verifying file signature:", error)
    return false
  }
}

/**
 * Sanitizes a filename to prevent path traversal and other injection attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  let sanitized = filename.replace(/^.*[\\/]/, "")

  // Remove special characters and limit length
  sanitized = sanitized
    .replace(/[^\w\s.-]/g, "_") // Replace special chars with underscore
    .replace(/\s+/g, "_") // Replace spaces with underscore
    .substring(0, 255) // Limit length

  return sanitized || "unnamed_file"
}
