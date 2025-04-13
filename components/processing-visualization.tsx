"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileText, Brain, ChevronRight, Database, BarChart, Sparkles, CheckCircle } from "lucide-react"

interface ProcessingVisualizationProps {
  isProcessing: boolean
  documentName?: string
  onComplete?: () => void
}

export default function ProcessingVisualization({
  isProcessing,
  documentName = "document",
  onComplete,
}: ProcessingVisualizationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const processingSteps = [
    {
      id: "extract",
      title: "Extracting Content",
      description: "Parsing text, figures, tables, and citations from your document",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      duration: 3000,
    },
    {
      id: "analyze",
      title: "Analyzing Structure",
      description: "Identifying sections, key points, and relationships",
      icon: Database,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      duration: 2500,
    },
    {
      id: "understand",
      title: "Understanding Content",
      description: "Comprehending research context and significance",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      duration: 3500,
    },
    {
      id: "generate",
      title: "Generating Insights",
      description: "Creating summaries and identifying key findings",
      icon: Sparkles,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20",
      duration: 3000,
    },
    {
      id: "visualize",
      title: "Preparing Visualizations",
      description: "Creating charts and visual representations of data",
      icon: BarChart,
      color: "text-pink-500",
      bgColor: "bg-pink-500/20",
      duration: 2000,
    },
  ]

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStep(0)
      setIsComplete(false)
      return
    }

    let stepIndex = 0
    const processSteps = async () => {
      for (const step of processingSteps) {
        setCurrentStep(stepIndex)
        // Wait for the duration of this step
        await new Promise((resolve) => setTimeout(resolve, step.duration))
        stepIndex++
      }

      // Processing complete
      setIsComplete(true)
      if (onComplete) {
        onComplete()
      }
    }

    processSteps()

    return () => {
      // Cleanup if component unmounts during processing
      setCurrentStep(0)
      setIsComplete(false)
    }
  }, [isProcessing, onComplete])

  if (!isProcessing && !isComplete) {
    return null
  }

  const progress = isComplete ? 100 : Math.round((currentStep / processingSteps.length) * 100)

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
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white mb-2">
                {isComplete ? "Processing Complete!" : "Processing Your Document"}
              </h3>
              <p className="text-gray-400 text-sm">
                {isComplete ? `AI has finished analyzing ${documentName}` : `Our AI is analyzing ${documentName}`}
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">{isComplete ? "Completed" : "In progress..."}</span>
                <span className="text-sm font-medium text-purple-400">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2 bg-gray-800"
                indicatorClassName={isComplete ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-pink-600"}
              />
            </div>

            <div className="space-y-4">
              {processingSteps.map((step, index) => {
                const isActive = currentStep === index
                const isCompleted = currentStep > index || isComplete
                const isPending = currentStep < index && !isComplete

                return (
                  <div
                    key={step.id}
                    className={`flex items-start p-3 rounded-lg transition-colors ${
                      isActive ? "bg-gray-800/50 border border-gray-700" : isCompleted ? "bg-gray-900/30" : ""
                    }`}
                  >
                    <div
                      className={`
                      flex items-center justify-center w-10 h-10 rounded-full shrink-0
                      ${isActive ? step.bgColor : isCompleted ? "bg-green-500/20" : "bg-gray-800/50"}
                    `}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <step.icon
                          className={`h-5 w-5 ${isActive ? step.color : isPending ? "text-gray-500" : "text-gray-400"}`}
                        />
                      )}
                    </div>

                    <div className="ml-4 flex-1">
                      <h4
                        className={`font-medium ${
                          isActive ? "text-white" : isCompleted ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p
                        className={`text-sm mt-1 ${
                          isActive ? "text-gray-300" : isCompleted ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {step.description}
                      </p>

                      {isActive && (
                        <motion.div
                          className="w-full bg-gray-700/50 h-1 mt-3 rounded overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div
                            className={`h-full ${step.bgColor.replace("/20", "/50")}`}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              duration: step.duration / 1000,
                              ease: "linear",
                            }}
                          />
                        </motion.div>
                      )}
                    </div>

                    {index < processingSteps.length - 1 && (
                      <div className="mx-2 h-full flex items-center">
                        <ChevronRight className={`h-4 w-4 ${isCompleted ? "text-gray-300" : "text-gray-700"}`} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {isComplete && (
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">Processing Complete!</h3>
                <p className="text-gray-400">Your document has been successfully analyzed</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
