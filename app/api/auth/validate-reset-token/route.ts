import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { compare } from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json()

    if (!email || !token) {
      return NextResponse.json({ error: "Email and token are required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user || !user.resetToken || !user.resetTokenExpires) {
      return NextResponse.json({ error: "Invalid reset request" }, { status: 400 })
    }

    if (user.resetTokenExpires < new Date()) {
      return NextResponse.json({ error: "Reset token has expired" }, { status: 400 })
    }

    const isValidToken = await compare(token, user.resetToken)

    if (!isValidToken) {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
