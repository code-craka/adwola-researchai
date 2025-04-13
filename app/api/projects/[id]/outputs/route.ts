import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-service"
import { exportToPptx, exportToPodcast, exportVisual } from "@/lib/export/export-service"
import { generatePresentationContent, generatePodcastScript, generateImage } from "@/lib/ai/models"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id
    const { type, title, summary, template } = await req.json()

    if (!type || !title || !summary) {
      return NextResponse.json({ error: "Type, title, and summary are required" }, { status: 400 })
    }

    let result

    switch (type) {
      case "presentation":
        // Generate presentation content
        const presentationResult = await generatePresentationContent(summary, title)

        if (!presentationResult.success) {
          return NextResponse.json({ error: presentationResult.error }, { status: 500 })
        }

        // Parse presentation content
        const presentationContent = JSON.parse(presentationResult.presentationContent)

        // Export to PPTX
        result = await exportToPptx(
          projectId,
          session.user.id,
          title,
          presentationContent.slides,
          template || "default",
        )
        break

      case "podcast":
        // Generate podcast script
        const podcastResult = await generatePodcastScript(summary, title)

        if (!podcastResult.success) {
          return NextResponse.json({ error: podcastResult.error }, { status: 500 })
        }

        // Export to MP3
        result = await exportToPodcast(projectId, session.user.id, title, podcastResult.podcastScript)
        break

      case "visual":
        // Generate image description
        const imageDescription = `Create a visual summary of the research titled "${title}" with the following content: ${summary.substring(0, 500)}`

        // Generate image
        const imageResult = await generateImage(imageDescription)

        if (!imageResult.success) {
          return NextResponse.json({ error: imageResult.error }, { status: 500 })
        }

        // Export visual
        result = await exportVisual(
          projectId,
          session.user.id,
          title,
          imageResult.imageUrl,
          "AI-generated visual summary",
        )
        break

      default:
        return NextResponse.json({ error: "Invalid output type" }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.output, { status: 201 })
  } catch (error) {
    console.error("Error creating output:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
