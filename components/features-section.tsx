"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Presentation, Podcast, BarChart3, Upload, Brain, Edit } from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Document Upload",
    description: "Upload research papers in PDF, LaTeX, Word, or plain text formats.",
    color: "text-blue-500",
    delay: 0.1,
  },
  {
    icon: Brain,
    title: "AI Content Extraction",
    description: "Our AI extracts text, figures, tables, and citations automatically.",
    color: "text-purple-500",
    delay: 0.2,
  },
  {
    icon: Presentation,
    title: "Presentation Generator",
    description: "Transform papers into professional slides with summaries and visuals.",
    color: "text-pink-500",
    delay: 0.3,
  },
  {
    icon: Podcast,
    title: "Podcast Creation",
    description: "Convert research into engaging audio with natural-sounding voices.",
    color: "text-orange-500",
    delay: 0.4,
  },
  {
    icon: BarChart3,
    title: "Visual Content",
    description: "Generate infographics, charts, and social media-friendly snippets.",
    color: "text-green-500",
    delay: 0.5,
  },
  {
    icon: Edit,
    title: "Editing Tools",
    description: "Refine AI-generated content with powerful editing capabilities.",
    color: "text-yellow-500",
    delay: 0.6,
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powerful{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Features</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our AI-powered platform offers everything you need to transform complex research into engaging content.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              viewport={{ once: true }}
            >
              <Card className="bg-black/50 border border-white/10 backdrop-blur-sm h-full hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <feature.icon className={`h-10 w-10 ${feature.color} mb-2`} />
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
