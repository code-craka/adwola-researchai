import { type NextRequest, NextResponse } from "next/server"
import { requestPasswordReset } from "@/lib/auth/auth-service"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await requestPasswordReset(email)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Always return success for security reasons, even if the email doesn't exist
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
