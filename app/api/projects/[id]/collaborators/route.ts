import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-service"
import { addCollaborator } from "@/lib/db/project-service"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract id properly from params
    const { id: projectId } = params
    const { email, role } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["viewer", "editor", "admin"]
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const result = await addCollaborator(projectId, session.user.id, email, role || "viewer")

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.collaborator, { status: 201 })
  } catch (error) {
    console.error("Error adding collaborator:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
