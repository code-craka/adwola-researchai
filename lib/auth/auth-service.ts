import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare, hash } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/db/prisma"
import crypto from "crypto"
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET,
  NEXT_PUBLIC_APP_URL,
  ENABLE_GOOGLE_AUTH,
} from "@/lib/config"
import { sendEmail } from "@/lib/email/email-service"
import { rateLimit } from "@/lib/security/rate-limit"

// Enhanced security for token generation
const generateSecureToken = () => {
  return crypto.randomBytes(40).toString("hex")
}

// Enhanced password validation
const isStrongPassword = (password: string): boolean => {
  // At least 8 chars, with uppercase, lowercase, number, and special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return strongPasswordRegex.test(password)
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours (reduced from 30 days for security)
  },
  pages: {
    signIn: "/login",
    error: "/login?error=true",
    verifyRequest: "/verify-email",
  },
  providers: [
    ...(ENABLE_GOOGLE_AUTH
      ? [
          GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        // Apply rate limiting to prevent brute force attacks
        const identifier = `auth_${credentials.email.toLowerCase()}`
        const { success, limit, reset, remaining } = await rateLimit(identifier, 5) // 5 attempts per minute

        if (!success) {
          throw new Error(`Too many login attempts. Please try again after ${new Date(reset).toLocaleTimeString()}`)
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase(), // Normalize email
          },
        })

        if (!user || !user.password) {
          throw new Error("No user found with this email")
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  // Enhanced CSRF protection
  secret: NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}

export async function registerUser(name: string, email: string, password: string) {
  try {
    // Normalize email to lowercase
    email = email.toLowerCase()

    // Apply rate limiting to prevent registration abuse
    const identifier = `register_${email}`
    const { success } = await rateLimit(identifier, 3) // 3 registrations per hour

    if (!success) {
      return { success: false, error: "Too many registration attempts. Please try again later." }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return { success: false, error: "User with this email already exists" }
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return {
        success: false,
        error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      }
    }

    // Hash password with increased work factor
    const hashedPassword = await hash(password, 12)

    // Generate secure verification token
    const verificationToken = generateSecureToken()
    const hashedToken = await hash(verificationToken, 12)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken: hashedToken,
        verificationTokenExpires: expires,
      },
    })

    // Send verification email
    const verificationUrl = `${NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`
    await sendEmail({
      to: email,
      subject: "Verify your email address",
      text: `Please verify your email address by clicking the following link: ${verificationUrl}`,
      html: `
        <h1>Email Verification</h1>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #6d28d9; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>Or copy and paste this link: ${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `,
    })

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Failed to register user" }
  }
}

// Other functions with security enhancements...

export async function verifyEmail(email: string, token: string) {
  try {
    // Apply rate limiting to prevent token guessing
    const identifier = `verify_${email}`
    const { success } = await rateLimit(identifier, 5) // 5 attempts per minute

    if (!success) {
      return { success: false, error: "Too many verification attempts. Please try again later." }
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(), // Normalize email
      },
    })

    if (!user || !user.verificationToken || !user.verificationTokenExpires) {
      return { success: false, error: "Invalid verification request" }
    }

    if (user.verificationTokenExpires < new Date()) {
      return { success: false, error: "Verification token has expired" }
    }

    const isValidToken = await compare(token, user.verificationToken)

    if (!isValidToken) {
      return { success: false, error: "Invalid verification token" }
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Email verification error:", error)
    return { success: false, error: "Failed to verify email" }
  }
}

export async function requestPasswordReset(email: string) {
  try {
    // Apply rate limiting
    const identifier = `reset_${email.toLowerCase()}`
    const { success } = await rateLimit(identifier, 3) // 3 requests per hour

    if (!success) {
      return { success: false, error: "Too many password reset requests. Please try again later." }
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    })

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      // But also don't waste resources sending an email
      return { success: true }
    }

    // Generate secure reset token
    const resetToken = generateSecureToken()
    const hashedToken = await hash(resetToken, 12)
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken: hashedToken,
        resetTokenExpires: expires,
      },
    })

    // Send password reset email
    const resetUrl = `${NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
    await sendEmail({
      to: email,
      subject: "Reset your password",
      text: `Reset your password by clicking the following link: ${resetUrl}`,
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #6d28d9; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy and paste this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Password reset request error:", error)
    return { success: false, error: "Failed to process password reset request" }
  }
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  try {
    // Apply rate limiting
    const identifier = `reset_confirm_${email.toLowerCase()}`
    const { success } = await rateLimit(identifier, 5) // 5 attempts per minute

    if (!success) {
      return { success: false, error: "Too many password reset attempts. Please try again later." }
    }

    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      return {
        success: false,
        error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      }
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    })

    if (!user || !user.resetToken || !user.resetTokenExpires) {
      return { success: false, error: "Invalid password reset request" }
    }

    if (user.resetTokenExpires < new Date()) {
      return { success: false, error: "Password reset token has expired" }
    }

    const isValidToken = await compare(token, user.resetToken)

    if (!isValidToken) {
      return { success: false, error: "Invalid password reset token" }
    }

    const hashedPassword = await hash(newPassword, 12)

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        passwordChangedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, error: "Failed to reset password" }
  }
}
