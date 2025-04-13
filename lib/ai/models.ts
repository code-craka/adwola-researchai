/**
 * AI Model configuration and integration for Research AI
 *
 * This file contains the configuration and integration for various AI models
 * used in the Research AI application for different tasks:
 * - Text processing and summarization
 * - Image and visual content generation
 * - Text-to-speech conversion
 */

import { OpenAI } from "openai"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Safe ElevenLabs initialization
let elevenLabsClient: any = null
// Only try to load ElevenLabs if we're in a browser context or have the right environment
if (typeof window !== 'undefined' || process.env.ELEVENLABS_API_KEY) {
  try {
    // Dynamic import to avoid issues during build time
    const { ElevenLabs } = require("elevenlabs-node")
    if (ElevenLabs) {
      elevenLabsClient = new ElevenLabs({
        apiKey: process.env.ELEVENLABS_API_KEY,
      })
    }
  } catch (e) {
    console.warn("ElevenLabs initialization failed:", e)
  }
}

// Model configurations
export const AI_MODELS = {
  // Text processing models
  TEXT: {
    GPT4: "gpt-4o",
    GPT4_TURBO: "gpt-4-turbo",
    CLAUDE_3: "claude-3-opus-20240229",
    LLAMA_3: "meta/llama-3-70b-instruct",
  },
  // Image generation models
  IMAGE: {
    DALLE3: "dall-e-3",
    STABLE_DIFFUSION: "stability-ai/sdxl",
    MIDJOURNEY: "midjourney/v6",
  },
  // Text-to-speech models
  TTS: {
    ELEVENLABS: "eleven_multilingual_v2",
    OPENAI: "tts-1",
    OPENAI_HD: "tts-1-hd",
  },
}

// System prompts for different tasks
export const SYSTEM_PROMPTS = {
  SUMMARIZATION: `You are an expert academic summarizer. Extract the key points, methodologies, 
  results, and conclusions from academic papers. Focus on maintaining accuracy while making the 
  content accessible to a broader audience. Preserve technical terminology where necessary but 
  explain complex concepts clearly.`,

  PRESENTATION: `You are an expert at creating engaging presentation content from academic papers. 
  Break down complex research into clear, concise slides with a logical flow. Identify key visuals, 
  data points, and quotations that should be highlighted. Create speaker notes that explain each 
  slide in more detail.`,

  PODCAST: `You are an expert at converting academic content into engaging podcast scripts. 
  Transform formal academic writing into conversational, accessible language while maintaining 
  accuracy. Structure the content with an introduction, main discussion points, and conclusion. 
  Include transitions and emphasize interesting findings or implications.`,

  VISUAL: `You are an expert at identifying key visual elements from academic papers. Extract data 
  that would be effective as charts, graphs, or infographics. Identify relationships between concepts 
  that could be visualized as diagrams. Suggest visual metaphors that could help explain complex ideas.`,
}

/**
 * Extracts and summarizes key content from a research paper
 */
export async function extractPaperContent(paperText: string) {
  try {
    const { text: summary } = await generateText({
      model: openai(AI_MODELS.TEXT.GPT4),
      system: SYSTEM_PROMPTS.SUMMARIZATION,
      prompt: `Extract and summarize the key content from this research paper. Include the main research question, 
      methodology, key findings, and conclusions. Also identify any figures, tables, or charts that are important 
      to understanding the research. Here is the paper text: ${paperText.substring(0, 32000)}`,
    })

    return { success: true, summary }
  } catch (error) {
    console.error("Error extracting paper content:", error)
    return { success: false, error: "Failed to extract paper content" }
  }
}

/**
 * Generates presentation content from paper summary
 */
export async function generatePresentationContent(paperSummary: string, title: string) {
  try {
    const { text: presentationContent } = await generateText({
      model: openai(AI_MODELS.TEXT.GPT4),
      system: SYSTEM_PROMPTS.PRESENTATION,
      prompt: `Create presentation content from this research paper summary. Generate 10-15 slides including:
      1. Title slide with the paper title: "${title}"
      2. Introduction slide explaining the research problem
      3. Methodology slides
      4. Results slides
      5. Conclusion slides
      6. References slide
      
      For each slide, provide:
      - A clear, concise title
      - Bullet points for the slide content (3-5 points per slide)
      - Any visualization suggestions (charts, diagrams, etc.)
      - Speaker notes that elaborate on the slide content
      
      Here is the paper summary: ${paperSummary}`,
    })

    return { success: true, presentationContent }
  } catch (error) {
    console.error("Error generating presentation content:", error)
    return { success: false, error: "Failed to generate presentation content" }
  }
}

/**
 * Generates podcast script from paper summary
 */
export async function generatePodcastScript(paperSummary: string, title: string) {
  try {
    const { text: podcastScript } = await generateText({
      model: openai(AI_MODELS.TEXT.GPT4),
      system: SYSTEM_PROMPTS.PODCAST,
      prompt: `Create a podcast script from this research paper summary. The podcast should be 
      approximately 10-15 minutes when read aloud. Structure it with:
      
      1. An engaging introduction that hooks the listener
      2. Clear explanation of the research problem and why it matters
      3. Breakdown of the methodology in accessible language
      4. Discussion of key findings and their implications
      5. Conclusion that summarizes the importance of the research
      
      Use a conversational tone while maintaining accuracy. Include transitions between sections.
      
      Paper title: "${title}"
      Paper summary: ${paperSummary}`,
    })

    return { success: true, podcastScript }
  } catch (error) {
    console.error("Error generating podcast script:", error)
    return { success: false, error: "Failed to generate podcast script" }
  }
}

/**
 * Generates visual content suggestions from paper summary
 */
export async function generateVisualContent(paperSummary: string) {
  try {
    const { text: visualSuggestions } = await generateText({
      model: openai(AI_MODELS.TEXT.GPT4),
      system: SYSTEM_PROMPTS.VISUAL,
      prompt: `Analyze this research paper summary and suggest visual content that would effectively 
      communicate the key findings and concepts. For each suggestion, provide:
      
      1. The type of visual (chart, graph, diagram, infographic, etc.)
      2. What data or concepts it should represent
      3. A brief description of how it should be structured
      4. Why this visualization would be effective
      
      Focus on 3-5 high-impact visualizations that would best communicate the research.
      
      Paper summary: ${paperSummary}`,
    })

    return { success: true, visualSuggestions }
  } catch (error) {
    console.error("Error generating visual content suggestions:", error)
    return { success: false, error: "Failed to generate visual content suggestions" }
  }
}

/**
 * Generates an image based on a description using DALL-E
 */
export async function generateImage(description: string) {
  try {
    const response = await openaiClient.images.generate({
      model: AI_MODELS.IMAGE.DALLE3,
      prompt: `Create a professional, academic visualization based on this description: ${description}. 
      The style should be clean, minimalist, and suitable for academic presentations. Use a color 
      scheme with purple and blue tones. The visualization should be clear and easy to understand.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    })

    return { success: true, imageUrl: response.data[0].url }
  } catch (error) {
    console.error("Error generating image:", error)
    return { success: false, error: "Failed to generate image" }
  }
}

/**
 * Generates audio from text using ElevenLabs
 */
export async function generateAudio(text: string, voice = "Adam") {
  try {
    // Check if ElevenLabs client is available
    if (!elevenLabsClient) {
      console.warn("ElevenLabs client is not initialized")
      return { 
        success: false, 
        error: "Text-to-speech service is not available" 
      }
    }
    
    const audio = await elevenLabsClient.textToSpeech({
      text,
      voice_id: voice,
      model_id: AI_MODELS.TTS.ELEVENLABS,
    })

    return { success: true, audioBuffer: audio }
  } catch (error) {
    console.error("Error generating audio:", error)
    return { success: false, error: "Failed to generate audio" }
  }
}

/**
 * Fine-tunes a model on academic papers (simulation)
 * In a real implementation, this would connect to the OpenAI fine-tuning API
 */
export async function fineTuneModel(datasetId: string, baseModel: string) {
  // This is a simulated function - in a real implementation,
  // you would connect to the OpenAI fine-tuning API
  console.log(`Fine-tuning ${baseModel} on dataset ${datasetId}`)

  // Simulate a fine-tuning job
  return {
    success: true,
    jobId: `ft-${Math.random().toString(36).substring(2, 9)}`,
    status: "started",
    estimatedCompletionTime: "2 hours",
  }
}
