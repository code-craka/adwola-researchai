import { z } from "zod"

// User schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

// Project schemas
export const projectCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
})

export const projectUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "processing", "completed"]).optional(),
})

// Document schemas
export const documentUploadSchema = z.object({
  file: z.any(),
  isRetry: z.boolean().optional(),
  documentId: z.string().optional(),
  skipProcessing: z.boolean().optional(),
})

export const documentRetrySchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  options: z
    .object({
      useAlternativeMethod: z.boolean().optional(),
      ignoreEncryption: z.boolean().optional(),
      skipMetadata: z.boolean().optional(),
    })
    .optional(),
})

// Collaborator schemas
export const collaboratorAddSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["viewer", "editor", "admin"]).default("viewer"),
})

// Comment schemas
export const commentAddSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000),
})

// Version schemas
export const versionCreateSchema = z.object({
  description: z.string().optional(),
})

// Output schemas
export const outputCreateSchema = z.object({
  type: z.enum(["presentation", "podcast", "visual"]),
  title: z.string().min(1, "Title is required").max(255),
  summary: z.string().min(1, "Summary is required"),
  template: z.string().optional(),
})

// Payment schemas
export const checkoutSessionSchema = z.object({
  priceId: z.string().min(1, "Price ID is required"),
  planType: z.string().min(1, "Plan type is required"),
})

export const customPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  productName: z.string().min(1, "Product name is required"),
})

// Helper function to validate request against schema
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodType<T>,
  errorMessage = "Invalid request data",
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const contentType = request.headers.get("content-type")

    let body
    if (contentType?.includes("application/json")) {
      body = await request.json()
    } else if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries())
    } else {
      return { success: false, error: "Unsupported content type" }
    }

    const result = schema.safeParse(body)

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")

      return {
        success: false,
        error: `${errorMessage}: ${formattedErrors}`,
      }
    }

    return { success: true, data: result.data }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse request: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
