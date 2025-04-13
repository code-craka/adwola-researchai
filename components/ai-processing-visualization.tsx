"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Brain,
  Database,
  BarChartIcon as ChartBar,
  Presentation,
  Podcast,
  BarChart3,
  Sparkles,
} from "lucide-react"

interface AIProcessingVisualizationProps {
  isProcessing: boolean
  documentId?: string
  onComplete?: () => void
}

// Define the processing steps
const processingSteps = [
  {
    id: "extraction",
    title: "Content Extraction",
    description: "Extracting text, figures, and tables from the document",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
  },
  {
    id: "analysis",
    title: "AI Analysis",
    description: "Analyzing content structure and identifying key insights",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/20",
  },
  {
    id: "structuring",
    title: "Data Structuring",
    description: "Organizing content into structured format",
    icon: Database,
    color: "text-green-500",
    bgColor: "bg-green-500/20",
  },
  {
    id: "insights",
    title: "Insight Generation",
    description: "Generating key insights and summaries",
    icon: ChartBar,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/20",
  },
  {
    id: "formats",
    title: "Format Preparation",
    description: "Preparing content for different output formats",
    icon: Sparkles,
    color: "text-pink-500",
    bgColor: "bg-pink-500/20",
  },
]

export default function AIProcessingVisualization({
  isProcessing,
  documentId,
  onComplete,
}: AIProcessingVisualizationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Reset state when a new document is processed
  useEffect(() => {
    if (isProcessing) {
      setCurrentStep(0)
      setProgress(0)
      setIsComplete(false)
    }
  }, [isProcessing, documentId])

  // Simulate processing steps
  useEffect(() => {
    if (!isProcessing) return

    const stepDuration = 3000 // 3 seconds per step
    let progressInterval: NodeJS.Timeout
    let stepTimeout: NodeJS.Timeout

    // Start progress animation for current step
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, stepDuration / 50)

    // Move to next step after current step completes
    stepTimeout = setTimeout(() => {
      if (currentStep < processingSteps.length - 1) {
        setCurrentStep((prev) => prev + 1)
        setProgress(0)
      } else {
        // All steps complete
        setIsComplete(true)
        if (onComplete) {
          onComplete()
        }
      }
    }, stepDuration)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(stepTimeout)
    }
  }, [isProcessing, currentStep, onComplete])

  if (!isProcessing && !isComplete) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-black/50 border border-white/10 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Brain className="mr-2 h-5 w-5 text-purple-500" />
              AI Processing
              {isComplete && (
                <span className="ml-2 text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Complete</span>
              )}
            </h3>

            <div className="space-y-6">
              {processingSteps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = currentStep === index
                const isCompleted = currentStep > index || isComplete

                return (
                  <div key={step.id} className="relative">
                    {/* Connection line */}
                    {index < processingSteps.length - 1 && (
                      <div
                        className="absolute left-6 top-12 w-0.5 h-10 bg-gray-700"
                        style={{
                          background: isCompleted
                            ? "linear-gradient(to bottom, #8b5cf6, #6366f1)"
                            : "rgba(75, 85, 99, 0.5)",
                        }}
                      />
                    )}

                    <div className="flex items-start">
                      {/* Step icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          isActive ? step.bgColor : isCompleted ? "bg-purple-500/20" : "bg-gray-800"
                        }`}
                      >
                        <StepIcon
                          className={`h-6 w-6 ${
                            isActive ? step.color : isCompleted ? "text-purple-400" : "text-gray-500"
                          }`}
                        />
                      </div>

                      {/* Step content */}
                      <div className="ml-4 flex-1">
                        <h4
                          className={`font-medium ${
                            isActive ? "text-white" : isCompleted ? "text-purple-300" : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">{step.description}</p>

                        {/* Progress bar for active step */}
                        {isActive && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                            <Progress value={progress} className="h-1.5" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
              >
                <div className="flex items-center mb-2">
                  <Sparkles className="h-5 w-5 text-purple-400 mr-2" />
                  <h4 className="font-medium text-white">Processing Complete</h4>
                </div>
                <p className="text-sm text-gray-300">
                  Your document has been processed and is ready for transformation into various formats.
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Presentation className="h-4 w-4 text-purple-400 mr-1" />
                    <span>Presentation</span>
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Podcast className="h-4 w-4 text-purple-400 mr-1" />
                    <span>Podcast</span>
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <BarChart3 className="h-4 w-4 text-purple-400 mr-1" />
                    <span>Visual</span>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
