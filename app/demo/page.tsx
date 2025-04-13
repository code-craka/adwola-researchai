"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DocumentUpload from "@/components/document-upload"
import ProcessingVisualization from "@/components/processing-visualization"
import OutputGenerator from "@/components/output-generator"
import { SparklesCore } from "@/components/sparkles"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const [step, setStep] = useState<"upload" | "processing" | "output">("upload")
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const handleUploadSuccess = (filename = "research-paper.pdf") => {
    setUploadedFile(filename)
    setIsProcessing(true)
    setStep("processing")

    // Simulate processing completion after some time
    setTimeout(() => {
      setIsProcessing(false)
      setStep("output")
    }, 15000) // 15 seconds to show all processing steps
  }

  const handleProcessingComplete = () => {
    setStep("output")
  }

  const handleOutputGenerated = () => {
    // Reset the demo
    setStep("upload")
    setUploadedFile(null)
    setIsProcessing(false)
  }

  const dummySummary = `This research paper explores the applications of artificial intelligence in healthcare, 
  focusing on early disease detection and personalized treatment plans. The study analyzes data from over 10,000 
  patients across 15 hospitals and demonstrates a 35% improvement in early diagnosis rates when AI-assisted 
  tools are implemented. Key findings include the identification of subtle patterns in medical imaging that 
  human specialists often miss, and the development of an algorithm that can predict patient response to 
  specific treatments with 82% accuracy. The paper concludes that AI integration in healthcare systems could 
  significantly reduce diagnostic errors and improve patient outcomes, while emphasizing the continued 
  importance of human oversight in medical decision-making.`

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative">
      {/* Ambient background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4 text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">
            Research<span className="text-purple-500">AI</span> Demo
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-black/50 border border-white/10 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="text-white">
                  {step === "upload" && "Step 1: Upload Your Research Paper"}
                  {step === "processing" && "Step 2: AI Processing"}
                  {step === "output" && "Step 3: Generate Output"}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {step === "upload" && "Upload a research paper to begin the transformation process"}
                  {step === "processing" && "Our AI is analyzing your document"}
                  {step === "output" && "Choose your desired output format"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {step === "upload" && <DocumentUpload projectId="demo" onSuccess={() => handleUploadSuccess()} />}

                {step === "processing" && (
                  <ProcessingVisualization
                    isProcessing={isProcessing}
                    documentName={uploadedFile || undefined}
                    onComplete={handleProcessingComplete}
                  />
                )}

                {step === "output" && (
                  <OutputGenerator
                    projectId="demo"
                    documentSummary={dummySummary}
                    projectTitle="AI in Healthcare"
                    onSuccess={handleOutputGenerated}
                  />
                )}
              </CardContent>
            </Card>

            {/* Progress indicator */}
            <div className="flex justify-between mb-8">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step === "upload" ? "bg-purple-600" : "bg-purple-600/50"
                  }`}
                >
                  <span className="text-white font-medium">1</span>
                </div>
                <span className={`text-sm mt-2 ${step === "upload" ? "text-white" : "text-gray-400"}`}>Upload</span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className={`h-1 w-full ${step === "upload" ? "bg-gray-700" : "bg-purple-600/50"}`}></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step === "processing" ? "bg-purple-600" : step === "output" ? "bg-purple-600/50" : "bg-gray-700"
                  }`}
                >
                  <span className="text-white font-medium">2</span>
                </div>
                <span
                  className={`text-sm mt-2 ${
                    step === "processing" ? "text-white" : step === "output" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Process
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className={`h-1 w-full ${step === "output" ? "bg-purple-600/50" : "bg-gray-700"}`}></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step === "output" ? "bg-purple-600" : "bg-gray-700"
                  }`}
                >
                  <span className="text-white font-medium">3</span>
                </div>
                <span className={`text-sm mt-2 ${step === "output" ? "text-white" : "text-gray-600"}`}>Generate</span>
              </div>
            </div>

            {/* Description of the current step */}
            <Card className="bg-black/30 border border-white/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-white mb-3">
                  {step === "upload" && "Upload Your Research Paper"}
                  {step === "processing" && "AI Processing Your Document"}
                  {step === "output" && "Choose Your Output Format"}
                </h3>
                <p className="text-gray-400">
                  {step === "upload" &&
                    "Start by uploading your research paper in PDF, DOCX, LaTeX, or TXT format. Our AI will analyze the content, extract key information, and prepare it for transformation."}
                  {step === "processing" &&
                    "Our advanced AI is analyzing your document, extracting text, figures, and tables, understanding the structure, and identifying key insights. This process typically takes a few minutes depending on the document size and complexity."}
                  {step === "output" &&
                    "Now you can choose how you want to transform your research paper. Generate a presentation with professional slides, create a podcast script with natural narration, or produce visual content that highlights your key findings."}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
