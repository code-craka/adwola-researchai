import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Path to the sample paper in the public directory
    const filePath = path.join(process.cwd(), "public", "samples", "sample-research-paper.pdf")

    // Read the file
    const fileBuffer = fs.readFileSync(filePath)

    // Convert to base64
    const fileContent = fileBuffer.toString("base64")

    return NextResponse.json({
      fileName: "sample-research-paper.pdf",
      fileType: "application/pdf",
      fileContent,
    })
  } catch (error) {
    console.error("Error serving sample paper:", error)
    return NextResponse.json({ error: "Failed to serve sample paper" }, { status: 500 })
  }
}