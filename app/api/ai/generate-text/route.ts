import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-service"
import { generateText, StreamingTextResponse } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Create a stream
    const stream = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    // Return the stream as a proper streaming text response
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error("Error generating text:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate text" },
      { status: 500 },
    )
  }
}
