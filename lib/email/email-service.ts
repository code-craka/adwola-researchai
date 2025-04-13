import nodemailer from "nodemailer"
import { logError, ErrorCategory, ErrorSeverity } from "../logging/error-logger"

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

// Create a transporter based on environment
const getTransporter = () => {
  // For production, use actual SMTP settings
  if (process.env.EMAIL_SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: Number.parseInt(process.env.EMAIL_SMTP_PORT || "587"),
      secure: process.env.EMAIL_SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASSWORD,
      },
    })
  }

  // For development, use ethereal.email (fake SMTP service)
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL || "ethereal.user@ethereal.email",
      pass: process.env.ETHEREAL_PASSWORD || "ethereal_pass",
    },
  })
}

export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = getTransporter()

    const from = process.env.EMAIL_FROM || "noreply@adwolaresearch.ai"

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    // Log success in development
    if (process.env.NODE_ENV !== "production") {
      console.log("Email sent: %s", info.messageId)

      // If using ethereal, log preview URL
      if (info.messageId && info.messageId.includes("ethereal")) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
      }
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    // Log the error
    await logError({
      category: ErrorCategory.EMAIL,
      severity: ErrorSeverity.ERROR,
      message: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: {
        to: options.to,
        subject: options.subject,
      },
      stack: error instanceof Error ? error.stack : undefined,
    })

    return {
      success: false,
      error: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
