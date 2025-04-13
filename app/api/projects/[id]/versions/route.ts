import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-service"
import { createProjectVersion } from "@/lib/db/project-service"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract id properly from params
    const { id: projectId } = params
    const { description } = await req.json()

    const result = await createProjectVersion(projectId, session.user.id, description)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.version, { status: 201 })
  } catch (error) {
    console.error("Error creating version:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
