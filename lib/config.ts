// Environment variables configuration

// Authentication
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL!
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL!

// API Keys
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!

// AWS S3 Configuration
export const AWS_REGION = process.env.AWS_REGION!
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

// Database Configuration
export const DATABASE_URL = process.env.DATABASE_URL!

// Feature Flags
export const ENABLE_GOOGLE_AUTH = process.env.ENABLE_GOOGLE_AUTH === "true"

// Stripe Configuration
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY!
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!
export const NEXT_PUBLIC_STRIPE_PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!

// Validate required environment variables
export function validateConfig() {
  const requiredVars = [
    { name: "NEXTAUTH_SECRET", value: NEXTAUTH_SECRET },
    { name: "NEXTAUTH_URL", value: NEXTAUTH_URL },
    { name: "NEXT_PUBLIC_APP_URL", value: NEXT_PUBLIC_APP_URL },
    { name: "DATABASE_URL", value: DATABASE_URL },

    // Stripe (required for payment processing)
    { name: "STRIPE_SECRET_KEY", value: STRIPE_SECRET_KEY },
    { name: "STRIPE_PUBLISHABLE_KEY", value: STRIPE_PUBLISHABLE_KEY },
    { name: "STRIPE_WEBHOOK_SECRET", value: STRIPE_WEBHOOK_SECRET },
    { name: "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID", value: NEXT_PUBLIC_STRIPE_PRO_PRICE_ID },
  ]

  // Authentication (Google is optional if ENABLE_GOOGLE_AUTH is true)
  if (ENABLE_GOOGLE_AUTH) {
    requiredVars.push(
      { name: "GOOGLE_CLIENT_ID", value: GOOGLE_CLIENT_ID },
      { name: "GOOGLE_CLIENT_SECRET", value: GOOGLE_CLIENT_SECRET },
    )
  }

  // AWS S3 (required for document storage)
  requiredVars.push(
    { name: "AWS_REGION", value: AWS_REGION },
    { name: "AWS_ACCESS_KEY_ID", value: AWS_ACCESS_KEY_ID },
    { name: "AWS_SECRET_ACCESS_KEY", value: AWS_SECRET_ACCESS_KEY },
    { name: "AWS_S3_BUCKET_NAME", value: AWS_S3_BUCKET_NAME },
  )

  // API Keys (required for AI features)
  requiredVars.push(
    { name: "OPENAI_API_KEY", value: OPENAI_API_KEY },
    { name: "ELEVENLABS_API_KEY", value: ELEVENLABS_API_KEY },
  )

  const missingVars = requiredVars.filter((v) => !v.value)

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.map((v) => v.name).join(", ")}`)
  }
}