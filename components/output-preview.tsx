"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"

interface OutputPreviewProps {
  type: "presentation" | "podcast" | "visual"
  title: string
  content: any
}

export default function OutputPreview({ type, title, content }: OutputPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)

  // For presentation preview
  const handleNextSlide = () => {
    if (type === "presentation" && content.slides && currentSlide < content.slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handlePrevSlide = () => {
    if (type === "presentation" && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  // For podcast preview
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)

    // Simulate audio progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 100)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="bg-black/50 border border-white/10 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <p className="text-sm text-gray-400">Preview your {type}</p>
          </div>

          {type === "presentation" && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                {content.slides && content.slides.length > 0 && (
                  <div className="h-full w-full p-8 flex flex-col">
                    <h2 className="text-2xl font-bold text-white mb-4">{content.slides[currentSlide].title}</h2>
                    <ul className="space-y-2 text-gray-300">
                      {content.slides[currentSlide].content.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-400 mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Slide navigation */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevSlide}
                    disabled={currentSlide === 0}
                    className="bg-black/30 text-white hover:bg-black/50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-xs text-white bg-black/30 px-2 py-1 rounded">
                    {currentSlide + 1} / {content.slides?.length || 1}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextSlide}
                    disabled={!content.slides || currentSlide === content.slides.length - 1}
                    className="bg-black/30 text-white hover:bg-black/50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Download className="mr-2 h-4 w-4" />
                  Download Presentation
                </Button>
              </div>
            </div>
          )}

          {type === "podcast" && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-medium">{title}</h3>
                    <p className="text-sm text-gray-400">15:30 minutes</p>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                    className="rounded-full h-12 w-12 bg-purple-600 border-0 hover:bg-purple-700"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 text-white" />
                    ) : (
                      <Play className="h-6 w-6 text-white ml-1" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-100"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      {Math.floor((audioProgress * 15.5) / 100)}:
                      {String(Math.floor((((audioProgress * 15.5) / 100) % 1) * 60)).padStart(2, "0")}
                    </span>
                    <span>15:30</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-white text-sm font-medium mb-2">Transcript Preview</h4>
                  <p className="text-gray-300 text-sm">
                    In this episode, we explore the fascinating research on artificial intelligence in healthcare. The
                    study demonstrates a 35% improvement in early diagnosis rates when AI-assisted tools are implemented
                    in clinical settings...
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Download className="mr-2 h-4 w-4" />
                  Download Audio
                </Button>
              </div>
            </div>
          )}

          {type === "visual" && (
            <div className="space-y-4">
              <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                  <div className="w-full max-w-md">
                    <h2 className="text-xl font-bold text-white text-center mb-6">{title}</h2>

                    {/* Sample infographic */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <h3 className="text-purple-400 text-center mb-3">Key Findings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-white">35%</div>
                          <div className="text-xs text-gray-300">Improvement in diagnosis</div>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-white">82%</div>
                          <div className="text-xs text-gray-300">Treatment prediction accuracy</div>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-white">10k+</div>
                          <div className="text-xs text-gray-300">Patients analyzed</div>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-white">15</div>
                          <div className="text-xs text-gray-300">Hospitals participating</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-purple-400 text-center mb-3">Impact Areas</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="text-xs text-gray-300 w-32">Early Detection</div>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: "85%" }}></div>
                          </div>
                          <div className="text-xs text-gray-300 ml-2">85%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-xs text-gray-300 w-32">Treatment Planning</div>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: "72%" }}></div>
                          </div>
                          <div className="text-xs text-gray-300 ml-2">72%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-xs text-gray-300 w-32">Patient Outcomes</div>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: "68%" }}></div>
                          </div>
                          <div className="text-xs text-gray-300 ml-2">68%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-xs text-gray-300 w-32">Cost Reduction</div>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: "45%" }}></div>
                          </div>
                          <div className="text-xs text-gray-300 ml-2">45%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Download className="mr-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
