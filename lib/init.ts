import { validateConfig } from "@/lib/config"

// Validate environment variables during initialization
try {
  validateConfig()
  console.log("Environment variables validated successfully")
} catch (error) {
  console.error("Environment validation error:", error)
  // In production, you might want to exit the process
  if (process.env.NODE_ENV === "production") {
    process.exit(1)
  }
}
