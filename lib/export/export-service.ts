/**
 * Export Service
 *
 * Handles exporting content to various formats (PPTX, MP3, PNG/PDF)
 */

import PptxGenJS from "pptxgenjs"
import { uploadToS3 } from "../storage/s3-service"
import { generateAudio } from "../ai/models"
import { createOutput } from "../db/project-service"

/**
 * Export presentation to PPTX
 */
export async function exportToPptx(
  projectId: string,
  userId: string,
  title: string,
  slides: Array<{
    title: string
    content: string[]
    notes?: string
    image?: string
  }>,
  template = "default",
) {
  try {
    // Create new presentation
    const pptx = new PptxGenJS()

    // Set presentation properties
    pptx.layout = "LAYOUT_16x9"
    pptx.title = title

    // Apply template
    applyTemplate(pptx, template)

    // Add title slide
    const titleSlide = pptx.addSlide()
    titleSlide.addText(title, {
      x: "10%",
      y: "40%",
      w: "80%",
      fontSize: 44,
      color: "363636",
      bold: true,
      align: "center",
    })

    // Add content slides
    for (const slide of slides) {
      const newSlide = pptx.addSlide()

      // Add slide title
      newSlide.addText(slide.title, {
        x: "5%",
        y: "5%",
        w: "90%",
        fontSize: 32,
        color: "363636",
        bold: true,
      })

      // Add content as bullet points
      if (slide.content && slide.content.length > 0) {
        newSlide.addText(
          slide.content.map((item) => ({ text: item, bullet: true })),
          {
            x: "5%",
            y: "20%",
            w: slide.image ? "55%" : "90%",
            h: "70%",
            fontSize: 18,
            color: "666666",
          },
        )
      }

      // Add image if available
      if (slide.image) {
        newSlide.addImage({
          path: slide.image,
          x: "65%",
          y: "20%",
          w: "30%",
          h: "60%",
        })
      }

      // Add speaker notes
      if (slide.notes) {
        newSlide.addNotes(slide.notes)
      }
    }

    // Generate PPTX as buffer
    const buffer = await pptx.write({ outputType: "nodebuffer" })

    // Create file from buffer
    const file = new File([buffer], `${title.replace(/\s+/g, "_")}.pptx`, {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    })

    // Upload to S3
    const fileKey = `projects/${projectId}/outputs/${Date.now()}-${file.name}`
    const uploadResult = await uploadToS3(file, fileKey)

    if (!uploadResult.success) {
      throw new Error("Failed to upload presentation")
    }

    // Create output record
    const output = await createOutput(projectId, userId, {
      type: "presentation",
      title: title,
      description: `Presentation with ${slides.length} slides`,
      fileUrl: uploadResult.url,
    })

    return { success: true, output: output.output }
  } catch (error) {
    console.error("Error exporting to PPTX:", error)
    return { success: false, error: "Failed to export presentation" }
  }
}

/**
 * Apply template to presentation
 */
function applyTemplate(pptx: PptxGenJS, template: string) {
  switch (template) {
    case "academic":
      pptx.defineSlideMaster({
        title: "ACADEMIC",
        background: { color: "FFFFFF" },
        objects: [
          { rect: { x: 0, y: "90%", w: "100%", h: "10%", fill: { color: "4472C4" } } },
          { text: { text: "Research AI", x: "2%", y: "92%", w: "30%", color: "FFFFFF" } },
        ],
      })
      break

    case "corporate":
      pptx.defineSlideMaster({
        title: "CORPORATE",
        background: { color: "FFFFFF" },
        objects: [
          { rect: { x: 0, y: 0, w: "100%", h: "10%", fill: { color: "4472C4" } } },
          { text: { text: "Research AI", x: "2%", y: "2%", w: "30%", color: "FFFFFF" } },
        ],
      })
      break

    case "minimalist":
      pptx.defineSlideMaster({
        title: "MINIMALIST",
        background: { color: "FFFFFF" },
        objects: [{ line: { x: "5%", y: "95%", w: "90%", line: { color: "CCCCCC", width: 1 } } }],
      })
      break

    default:
      // Default template
      pptx.defineSlideMaster({
        title: "DEFAULT",
        background: { color: "FFFFFF" },
      })
      break
  }

  // Apply the template
  pptx.layout = "LAYOUT_16x9"
  pptx.theme = template === "default" ? "DEFAULT" : template.toUpperCase()
}

/**
 * Export podcast to MP3
 */
export async function exportToPodcast(
  projectId: string,
  userId: string,
  title: string,
  script: string,
  voice = "Adam",
) {
  try {
    // Generate audio from script
    const audioResult = await generateAudio(script, voice)

    if (!audioResult.success) {
      throw new Error("Failed to generate audio")
    }

    // Create file from audio buffer
    const file = new File([audioResult.audioBuffer], `${title.replace(/\s+/g, "_")}.mp3`, {
      type: "audio/mpeg",
    })

    // Upload to S3
    const fileKey = `projects/${projectId}/outputs/${Date.now()}-${file.name}`
    const uploadResult = await uploadToS3(file, fileKey)

    if (!uploadResult.success) {
      throw new Error("Failed to upload audio")
    }

    // Create output record
    const output = await createOutput(projectId, userId, {
      type: "podcast",
      title: title,
      description: `Podcast audio (${Math.round(script.length / 1000)} minutes)`,
      fileUrl: uploadResult.url,
    })

    return { success: true, output: output.output }
  } catch (error) {
    console.error("Error exporting to podcast:", error)
    return { success: false, error: "Failed to export podcast" }
  }
}

/**
 * Export visual content to PNG/PDF
 */
export async function exportVisual(
  projectId: string,
  userId: string,
  title: string,
  imageUrl: string,
  description?: string,
) {
  try {
    // Create output record
    const output = await createOutput(projectId, userId, {
      type: "visual",
      title: title,
      description: description || "Visual content",
      fileUrl: imageUrl,
      thumbnailUrl: imageUrl,
    })

    return { success: true, output: output.output }
  } catch (error) {
    console.error("Error exporting visual:", error)
    return { success: false, error: "Failed to export visual" }
  }
}
