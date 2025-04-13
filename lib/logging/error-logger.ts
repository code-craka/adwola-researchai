/**
 * Enhanced Error Logger Service
 *
 * Handles detailed logging of application errors with standardized formats
 */

import { prisma } from "@/lib/db/prisma"
import { captureException } from "@sentry/nextjs"

// Define error severity levels
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

// Define error categories
export enum ErrorCategory {
  PDF_PROCESSING = "pdf_processing",
  DOCUMENT_UPLOAD = "document_upload",
  DOCUMENT_EXTRACTION = "document_extraction",
  API_ERROR = "api_error",
  AUTHENTICATION = "authentication",
  DATABASE = "database",
  STORAGE = "storage",
  EMAIL = "email",
  PAYMENT = "payment",
  RATE_LIMIT = "rate_limit",
  FILE_VALIDATION = "file_validation",
  SECURITY = "security",
  GENERAL = "general",
  REACT_ERROR = "REACT_ERROR",
}

// Interface for error log entries
export interface ErrorLogEntry {
  userId?: string
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  details?: any
  stack?: string
  documentId?: string
  projectId?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  requestId?: string
  url?: string
  method?: string
  statusCode?: number
  timestamp?: Date
}

/**
 * Log an error to the database, console, and monitoring service
 */
export async function logError(entry: ErrorLogEntry): Promise<void> {
  // Add timestamp if not provided
  const timestamp = entry.timestamp || new Date()

  try {
    // Generate a unique request ID if not provided
    const requestId = entry.requestId || generateRequestId()

    // Always log to console first (in case database logging fails)
    const consoleMethod = getConsoleMethod(entry.severity)

    consoleMethod(
      `[${timestamp.toISOString()}][${requestId}][${entry.severity.toUpperCase()}][${entry.category}] ${entry.message}`,
      {
        details: entry.details,
        stack: entry.stack,
        documentId: entry.documentId,
        projectId: entry.projectId,
        fileName: entry.fileName,
        fileType: entry.fileType,
        userId: entry.userId,
        url: entry.url,
        method: entry.method,
        statusCode: entry.statusCode,
      },
    )

    // For ERROR and CRITICAL severity, send to monitoring service
    if (entry.severity === ErrorSeverity.ERROR || entry.severity === ErrorSeverity.CRITICAL) {
      captureException(new Error(entry.message), {
        tags: {
          category: entry.category,
          severity: entry.severity,
        },
        extra: {
          details: entry.details,
          documentId: entry.documentId,
          projectId: entry.projectId,
          fileName: entry.fileName,
          userId: entry.userId,
          requestId,
        },
      })
    }

    // Store in database if available
    if (prisma) {
      await prisma.errorLog.create({
        data: {
          userId: entry.userId,
          category: entry.category,
          severity: entry.severity,
          message: entry.message,
          details: entry.details ? JSON.stringify(entry.details) : null,
          stack: entry.stack,
          documentId: entry.documentId,
          projectId: entry.projectId,
          fileName: entry.fileName,
          fileType: entry.fileType,
          fileSize: entry.fileSize,
          requestId,
          url: entry.url,
          method: entry.method,
          statusCode: entry.statusCode,
          createdAt: timestamp,
        },
      })
    }
  } catch (error) {
    // Fallback logging if database logging fails
    console.error("Failed to log error to database:", error)
    console.error("Original error:", entry)
  }
}

/**
 * Get error logs for a specific document
 */
export async function getDocumentErrorLogs(documentId: string) {
  try {
    return await prisma.errorLog.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Failed to retrieve document error logs:", error)
    return []
  }
}

/**
 * Get error logs for a specific project
 */
export async function getProjectErrorLogs(projectId: string) {
  try {
    return await prisma.errorLog.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Failed to retrieve project error logs:", error)
    return []
  }
}

/**
 * Format error message for user display
 */
export function formatUserErrorMessage(error: any, defaultMessage = "An error occurred"): string {
  // Extract the most user-friendly error message
  if (typeof error === "string") {
    return sanitizeErrorMessage(error)
  }

  if (error instanceof Error) {
    // Extract specific PDF error types
    if (error.message.includes("PDF")) {
      if (error.message.includes("Missing PDF header")) {
        return "The PDF file appears to be corrupted (Missing PDF header)"
      }
      if (error.message.includes("Missing EOF marker")) {
        return "The PDF file is incomplete or corrupted (Missing EOF marker)"
      }
      if (error.message.includes("Encrypted")) {
        return "The PDF file is encrypted and cannot be processed"
      }
      if (error.message.includes("Password")) {
        return "The PDF file is password protected"
      }
      if (error.message.includes("XRef")) {
        return "The PDF structure is invalid or corrupted"
      }
      if (error.message.includes("Font")) {
        return "There was an issue with fonts in the PDF"
      }

      // Generic PDF error
      return `PDF processing error: ${sanitizeErrorMessage(error.message)}`
    }

    return sanitizeErrorMessage(error.message)
  }

  return defaultMessage
}

/**
 * Create a standardized API error response
 */
export function createErrorResponse(error: any, status = 500) {
  const message = formatUserErrorMessage(error)

  return {
    error: message,
    status,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Helper function to get the appropriate console method based on severity
 */
function getConsoleMethod(severity: ErrorSeverity): (message: string, ...args: any[]) => void {
  switch (severity) {
    case ErrorSeverity.INFO:
      return console.info
    case ErrorSeverity.WARNING:
      return console.warn
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      return console.error
    default:
      return console.log
  }
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Sanitize error messages to prevent sensitive information leakage
 */
function sanitizeErrorMessage(message: string): string {
  // Remove potential sensitive information like file paths, IPs, etc.
  return message
    .replace(/\/[\w/.-]+/g, "[PATH]") // Replace file paths
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[IP]") // Replace IP addresses
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL]") // Replace emails
    .replace(/password=["']?[^"'&\s]+["']?/gi, "password=[REDACTED]") // Redact passwords
    .replace(/key=["']?[^"'&\s]+["']?/gi, "key=[REDACTED]") // Redact API keys
    .replace(/token=["']?[^"'&\s]+["']?/gi, "token=[REDACTED]") // Redact tokens
}
