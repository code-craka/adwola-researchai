"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, X, Presentation, Podcast, BarChart3, Loader2 } from "lucide-react"

export default function UploadDemo() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [selectedTab, setSelectedTab] = useState("presentation")

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    setFile(file)
    simulateProcessing()
  }

  const simulateProcessing = () => {
    setIsProcessing(true)
    setProcessingStep(1)

    // Simulate AI processing steps
    const steps = [
      "Extracting text and figures...",
      "Analyzing content structure...",
      "Identifying key insights...",
      "Generating output formats...",
    ]

    steps.forEach((_, index) => {
      setTimeout(
        () => {
          setProcessingStep(index + 1)
          if (index === steps.length - 1) {
            setTimeout(() => {
              setIsProcessing(false)
              setIsComplete(true)
            }, 1000)
          }
        },
        (index + 1) * 1500,
      )
    })
  }

  const resetDemo = () => {
    setFile(null)
    setIsProcessing(false)
    setIsComplete(false)
    setProcessingStep(0)
  }

  return (
    <section className="py-20 px-6" id="demo">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Try It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Yourself</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Upload a research paper and see how our AI transforms it into engaging content.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {!file ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                className={`border-2 border-dashed ${isDragging ? "border-purple-500 bg-purple-500/10" : "border-white/20 bg-black/50"} rounded-lg backdrop-blur-sm transition-colors`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <Upload className="h-16 w-16 text-purple-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Drag & Drop Your Research Paper</h3>
                  <p className="text-gray-400 mb-6 max-w-md">
                    Upload your PDF, LaTeX, Word, or plain text file to get started
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <label className="cursor-pointer flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Browse Files
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.tex,.txt"
                          onChange={handleFileInput}
                        />
                      </label>
                    </Button>
                    <Button variant="outline" className="text-white border-purple-500 hover:bg-purple-500/20">
                      Use Sample Paper
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-black/50 border border-white/10 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-purple-500 mr-2" />
                      <span className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={resetDemo} className="text-gray-400 hover:text-white">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {isProcessing && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Processing paper...</span>
                        <span className="text-purple-400">{Math.min(processingStep * 25, 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(processingStep * 25, 100)}%` }}
                        ></div>
                      </div>
                      <div className="mt-4 flex items-center text-gray-400">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {processingStep === 1 && "Extracting text and figures..."}
                        {processingStep === 2 && "Analyzing content structure..."}
                        {processingStep === 3 && "Identifying key insights..."}
                        {processingStep === 4 && "Generating output formats..."}
                      </div>
                    </div>
                  )}

                  {isComplete && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold text-lg mb-4">Choose your output format:</h3>
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

                        <TabsContent value="presentation" className="mt-0">
                          <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                            <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-md flex items-center justify-center mb-2">
                              <Presentation className="h-16 w-16 text-purple-400" />
                            </div>
                            <h4 className="text-white font-medium">Research Presentation</h4>
                            <p className="text-gray-400 text-sm">12 slides with key insights and visualizations</p>
                          </div>
                          <div className="flex justify-end">
                            <Button className="bg-purple-600 hover:bg-purple-700">Download Presentation</Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="podcast" className="mt-0">
                          <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                            <div className="h-32 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-md flex items-center justify-center mb-2">
                              <Podcast className="h-16 w-16 text-purple-400" />
                            </div>
                            <h4 className="text-white font-medium">Research Podcast</h4>
                            <p className="text-gray-400 text-sm">15-minute audio summary with natural voice</p>
                          </div>
                          <div className="flex justify-end">
                            <Button className="bg-purple-600 hover:bg-purple-700">Download Audio</Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="visual" className="mt-0">
                          <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                            <div className="h-64 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-md flex items-center justify-center mb-2">
                              <BarChart3 className="h-16 w-16 text-purple-400" />
                            </div>
                            <h4 className="text-white font-medium">Visual Summary</h4>
                            <p className="text-gray-400 text-sm">
                              Infographic with key findings and data visualization
                            </p>
                          </div>
                          <div className="flex justify-end">
                            <Button className="bg-purple-600 hover:bg-purple-700">Download Visual</Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
