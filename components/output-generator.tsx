"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Presentation,
  Podcast,
  BarChart3,
  Loader2,
  Download,
  Share2,
  Copy,
  Layout,
  Mic,
  PieChart,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"

interface OutputGeneratorProps {
  projectId: string
  documentSummary: string
  projectTitle: string
  onSuccess?: () => void
}

export default function OutputGenerator({ projectId, documentSummary, projectTitle, onSuccess }: OutputGeneratorProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("presentation")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Presentation settings
  const [presentationTemplate, setPresentationTemplate] = useState("academic")
  const [slideCount, setSlideCount] = useState(10)
  const [includeNotes, setIncludeNotes] = useState(true)

  // Podcast settings
  const [podcastVoice, setPodcastVoice] = useState("adam")
  const [podcastDuration, setPodcastDuration] = useState(10)
  const [includeIntro, setIncludeIntro] = useState(true)

  // Visual settings
  const [visualType, setVisualType] = useState("infographic")
  const [colorScheme, setColorScheme] = useState("purple")
  const [includeData, setIncludeData] = useState(true)

  // Preview data
  const previewData = {
    presentation: {
      academic: "/placeholder.svg?height=300&width=500",
      corporate: "/placeholder.svg?height=300&width=500",
      minimalist: "/placeholder.svg?height=300&width=500",
    },
    podcast: {
      adam: "/placeholder.svg?height=200&width=500",
      emily: "/placeholder.svg?height=200&width=500",
      john: "/placeholder.svg?height=200&width=500",
    },
    visual: {
      infographic: "/placeholder.svg?height=300&width=500",
      chart: "/placeholder.svg?height=300&width=500",
      diagram: "/placeholder.svg?height=300&width=500",
    },
  }

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
      const settings: Record<string, any> = {
        type: selectedTab,
        title: projectTitle,
        summary: documentSummary,
      }

      // Add type-specific settings
      if (selectedTab === "presentation") {
        settings.template = presentationTemplate
        settings.slideCount = slideCount
        settings.includeNotes = includeNotes
      } else if (selectedTab === "podcast") {
        settings.voice = podcastVoice
        settings.duration = podcastDuration
        settings.includeIntro = includeIntro
      } else if (selectedTab === "visual") {
        settings.visualType = visualType
        settings.colorScheme = colorScheme
        settings.includeData = includeData
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

  const getPreviewImage = () => {
    if (selectedTab === "presentation") {
      return previewData.presentation[presentationTemplate as keyof typeof previewData.presentation]
    } else if (selectedTab === "podcast") {
      return previewData.podcast[podcastVoice as keyof typeof previewData.podcast]
    } else {
      return previewData.visual[visualType as keyof typeof previewData.visual]
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTab}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="presentation" className="mt-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white font-medium mb-3">Template Style</h4>
                          <RadioGroup
                            value={presentationTemplate}
                            onValueChange={setPresentationTemplate}
                            className="grid grid-cols-3 gap-3"
                          >
                            <div>
                              <RadioGroupItem value="academic" id="academic" className="peer sr-only" />
                              <Label
                                htmlFor="academic"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800/50 p-4 hover:bg-gray-800 hover:border-purple-600 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-600/20 [&:has([data-state=checked])]:border-purple-600"
                              >
                                <Layout className="mb-2 h-6 w-6 text-purple-400" />
                                <span className="text-sm font-medium text-white">Academic</span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="corporate" id="corporate" className="peer sr-only" />
                              <Label
                                htmlFor="corporate"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800/50 p-4 hover:bg-gray-800 hover:border-purple-600 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-600/20 [&:has([data-state=checked])]:border-purple-600"
                              >
                                <Layout className="mb-2 h-6 w-6 text-blue-400" />
                                <span className="text-sm font-medium text-white">Corporate</span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="minimalist" id="minimalist" className="peer sr-only" />
                              <Label
                                htmlFor="minimalist"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800/50 p-4 hover:bg-gray-800 hover:border-purple-600 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-600/20 [&:has([data-state=checked])]:border-purple-600"
                              >
                                <Layout className="mb-2 h-6 w-6 text-gray-400" />
                                <span className="text-sm font-medium text-white">Minimalist</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label htmlFor="slide-count" className="text-white font-medium">
                              Slide Count
                            </Label>
                            <span className="text-sm text-gray-400">{slideCount} slides</span>
                          </div>
                          <Slider
                            id="slide-count"
                            min={5}
                            max={20}
                            step={1}
                            value={[slideCount]}
                            onValueChange={(value) => setSlideCount(value[0])}
                            className="py-4"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="include-notes" className="text-white font-medium">
                            Include Speaker Notes
                          </Label>
                          <Switch id="include-notes" checked={includeNotes} onCheckedChange={setIncludeNotes} />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="podcast" className="mt-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white font-medium mb-3">Voice Selection</h4>
                          <RadioGroup
                            value={podcastVoice}
                            onValueChange={setPodcastVoice}
                            className="grid grid-cols-3 gap-3"
                          >
                            <div>
                              <RadioGroupItem value="adam" id="adam" className="peer sr-only" />
                              <Label
                                htmlFor="adam"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800/50 p-4 hover:bg-gray-800 hover:border-purple-600 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-600/20 [&:has([data-state=checked])]:border-purple-600"
                              >
                                <Mic className="mb-2 h-6 w-6 text-blue-400" />
                                <span className="text-sm font-medium text-white">Adam</span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="emily" id="emily" className="peer sr-only" />
                              <Label
                                htmlFor="emily"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800/50 p-4 hover:bg-gray-800 hover:border-purple-600 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-600/20 [&:has([data-state=checked])]:border-purple-600"
                              >
                                <Mic className="mb-2 h-6 w-6 text-pink-400" />
                                <span className="text-sm font-medium text-white">Emily</span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="john" id="john" className="peer sr-only" />
                              <Label
                                htmlFor="john"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800/50 p-4 hover:bg-gray-800 hover:border-purple-600 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-600/20 [&:has([data-state=checked])]:border-purple-600"
                              >
                                <Mic className="mb-2 h-6 w-6 text-green-400" />
                                <span className="text-sm font-medium text-white">John</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label htmlFor="podcast-duration" className="text-white font-medium">
                              Duration
                            </Label>
                            <span className="text-sm text-gray-400">{podcastDuration} minutes</span>
                          </div>
                          <Slider
                            id="podcast-duration"
                            min={5}
                            max={20}
                            step={1}
                            value={[podcastDuration]}
                            onValueChange={(value) => setPodcastDuration(value[0])}
                            className="py-4"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="include-intro" className="text-white font-medium">
                            Include Introduction
                          </Label>
                          <Switch id="include-intro" checked={includeIntro} onCheckedChange={setIncludeIntro} />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="visual" className="mt-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white font-medium mb-3">Visual Type</h4>
                          <RadioGroup
                            value={visualType}
                            onValueChange={setVisualType}
                            className="grid grid-cols-3 gap-3"
                          >
                            <div>
                              <RadioGroupItem value="infographic" id="infographic" className="peer sr-only" />
                              <Label
                                htmlFor="infographic"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800/50 p-4 hover:bg-gray-800 hover:border-purple-600 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-600/20 [&:has([data-state=checked])]:border-purple-600"
                              >
                                <Layout className="mb-2 h-6 w-6 text-purple-400" />
                                <span className="text-sm font-medium text-white">Infographic</span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="chart" id="chart" className="peer sr-only" />
                              <Label
                                htmlFor="chart"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800/50 p-4 hover:bg-gray-800 hover:border-purple-600 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-600/20 [&:has([data-state=checked])]:border-purple-600"
                              >
                                <BarChart3 className="mb-2 h-6 w-6 text-blue-400" />
                                <span className="text-sm font-medium text-white">Chart</span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="diagram" id="diagram" className="peer sr-only" />
                              <Label
                                htmlFor="diagram"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-800/50 p-4 hover:bg-gray-800 hover:border-purple-600 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-600/20 [&:has([data-state=checked])]:border-purple-600"
                              >
                                <PieChart className="mb-2 h-6 w-6 text-green-400" />
                                <span className="text-sm font-medium text-white">Diagram</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-3">Color Scheme</h4>
                          <RadioGroup
                            value={colorScheme}
                            onValueChange={setColorScheme}
                            className="grid grid-cols-4 gap-3"
                          >
                            <div>
                              <RadioGroupItem value="purple" id="purple" className="peer sr-only" />
                              <Label
                                htmlFor="purple"
                                className="flex items-center justify-center rounded-md border-2 border-gray-700 bg-purple-900/30 p-2 hover:bg-purple-900/50 hover:border-purple-600 peer-data-[state=checked]:border-purple-600 [&:has([data-state=checked])]:border-purple-600"
                              >
                                <span className="h-6 w-6 rounded-full bg-purple-500"></span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="blue" id="blue" className="peer sr-only" />
                              <Label
                                htmlFor="blue"
                                className="flex items-center justify-center rounded-md border-2 border-gray-700 bg-blue-900/30 p-2 hover:bg-blue-900/50 hover:border-blue-600 peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600"
                              >
                                <span className="h-6 w-6 rounded-full bg-blue-500"></span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="green" id="green" className="peer sr-only" />
                              <Label
                                htmlFor="green"
                                className="flex items-center justify-center rounded-md border-2 border-gray-700 bg-green-900/30 p-2 hover:bg-green-900/50 hover:border-green-600 peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600"
                              >
                                <span className="h-6 w-6 rounded-full bg-green-500"></span>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem value="orange" id="orange" className="peer sr-only" />
                              <Label
                                htmlFor="orange"
                                className="flex items-center justify-center rounded-md border-2 border-gray-700 bg-orange-900/30 p-2 hover:bg-orange-900/50 hover:border-orange-600 peer-data-[state=checked]:border-orange-600 [&:has([data-state=checked])]:border-orange-600"
                              >
                                <span className="h-6 w-6 rounded-full bg-orange-500"></span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="include-data" className="text-white font-medium">
                            Include Data Tables
                          </Label>
                          <Switch id="include-data" checked={includeData} onCheckedChange={setIncludeData} />
                        </div>
                      </div>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Preview</h4>
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-md flex items-center justify-center mb-3 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${selectedTab}-${
                        selectedTab === "presentation"
                          ? presentationTemplate
                          : selectedTab === "podcast"
                            ? podcastVoice
                            : visualType
                      }`}
                      src={getPreviewImage()}
                      alt={`${selectedTab} preview`}
                      className="w-full h-full object-contain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                </div>
                <div className="flex justify-between items-center">
                  <h5 className="text-white font-medium">
                    {selectedTab === "presentation"
                      ? `${presentationTemplate.charAt(0).toUpperCase() + presentationTemplate.slice(1)} Presentation`
                      : selectedTab === "podcast"
                        ? `Podcast with ${podcastVoice.charAt(0).toUpperCase() + podcastVoice.slice(1)}'s voice`
                        : `${visualType.charAt(0).toUpperCase() + visualType.slice(1)} in ${colorScheme} theme`}
                  </h5>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-gray-400 border-gray-700">
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline" className="text-gray-400 border-gray-700">
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {generationStatus !== "idle" && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {generationStatus === "generating" && (
                      <Loader2 className="h-4 w-4 text-purple-400 mr-2 animate-spin" />
                    )}
                    {generationStatus === "success" && <CheckCircle className="h-4 w-4 text-green-400 mr-2" />}
                    {generationStatus === "error" && <AlertCircle className="h-4 w-4 text-red-400 mr-2" />}
                    <span className="text-gray-400">
                      {generationStatus === "generating" && `Generating ${selectedTab}...`}
                      {generationStatus === "success" &&
                        `${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} generated successfully!`}
                      {generationStatus === "error" && "Generation failed"}
                    </span>
                  </div>
                  <span className="text-purple-400">{Math.round(generationProgress)}%</span>
                </div>
                <Progress
                  value={generationProgress}
                  className="h-2 bg-gray-800"
                  indicatorClassName={
                    generationStatus === "success"
                      ? "bg-green-500"
                      : generationStatus === "error"
                        ? "bg-red-500"
                        : "bg-gradient-to-r from-purple-500 to-pink-600"
                  }
                />

                {errorMessage && generationStatus === "error" && (
                  <div className="mt-2 text-sm text-red-400">{errorMessage}</div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={generateOutput} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate {selectedTab}
                    <Download className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
