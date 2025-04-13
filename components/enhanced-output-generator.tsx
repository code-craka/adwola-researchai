"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Presentation, Podcast, BarChart3, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

interface EnhancedOutputGeneratorProps {
  projectId: string
  documentSummary: string
  projectTitle: string
  onSuccess?: () => void
}

export default function EnhancedOutputGenerator({
  projectId,
  documentSummary,
  projectTitle,
  onSuccess,
}: EnhancedOutputGeneratorProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("presentation")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  // These state variables are used in the generateOutput function
  // Note: generationStatus and errorMessage are used during the generation process
  // and would be displayed in a more complete UI implementation
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const generateOutput = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus("generating")
    setErrorMessage(null)

    try {
      // Set up progress simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          const increment = Math.random() * 5 + 1
          const newProgress = prev + increment
          return newProgress > 95 ? 95 : newProgress
        })
      }, 500)

      // Prepare settings based on selected output type
      const settings = {
        type: selectedTab,
        title: projectTitle,
        summary: documentSummary,
      }

      // Generate output
      const response = await fetch(`/api/projects/${projectId}/outputs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to generate ${selectedTab}`)
      }

      setGenerationProgress(100)
      setGenerationStatus("success")

      toast({
        title: "Output generated",
        description: `Your ${selectedTab} has been generated successfully.`,
      })

      // Reset state
      setTimeout(() => {
        setIsGenerating(false)
        setGenerationProgress(0)
        setGenerationStatus("idle")

        // Call success callback
        if (onSuccess) {
          onSuccess()
        }

        // Refresh the page
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error generating output:", error)
      setGenerationStatus("error")
      setErrorMessage(error instanceof Error ? error.message : `Failed to generate ${selectedTab}`)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : `Failed to generate ${selectedTab}`,
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="bg-black/50 border border-white/10 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Generate output:</h3>

          <Tabs defaultValue="presentation" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="presentation" className="data-[state=active]:bg-purple-600">
                <Presentation className="h-4 w-4 mr-2" />
                Presentation
              </TabsTrigger>
              <TabsTrigger value="podcast" className="data-[state=active]:bg-purple-600">
                <Podcast className="h-4 w-4 mr-2" />
                Podcast
              </TabsTrigger>
              <TabsTrigger value="visual" className="data-[state=active]:bg-purple-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Visual
              </TabsTrigger>
            </TabsList>

            {isGenerating ? (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Generating {selectedTab}...</span>
                  <span className="text-purple-400">{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            ) : (
              <div className="flex justify-end">
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={generateOutput}>
                  Generate {selectedTab}
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
