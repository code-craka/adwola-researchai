"use client"

import { motion } from "framer-motion"
import { FileText, Cpu, Presentation, Download } from "lucide-react"

const steps = [
  {
    icon: FileText,
    title: "Upload Your Paper",
    description: "Upload your research paper in PDF, LaTeX, Word, or plain text format.",
    color: "bg-blue-500/20",
    iconColor: "text-blue-500",
    delay: 0.1,
  },
  {
    icon: Cpu,
    title: "AI Processing",
    description: "Our AI analyzes your paper, extracting key information, figures, and insights.",
    color: "bg-purple-500/20",
    iconColor: "text-purple-500",
    delay: 0.2,
  },
  {
    icon: Presentation,
    title: "Choose Output Format",
    description: "Select your desired output: presentation slides, podcast, or visual content.",
    color: "bg-pink-500/20",
    iconColor: "text-pink-500",
    delay: 0.3,
  },
  {
    icon: Download,
    title: "Export & Share",
    description: "Download your content in various formats or share directly with colleagues.",
    color: "bg-green-500/20",
    iconColor: "text-green-500",
    delay: 0.4,
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-6 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-purple-900/10 to-black/0 pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Works</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Transform your research papers into engaging content in just a few simple steps.
          </p>
        </motion.div>

        <div className="flex flex-col items-center">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: step.delay }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-16 last:mb-0 w-full max-w-3xl"
            >
              <div className={`flex items-center justify-center w-16 h-16 rounded-full ${step.color} shrink-0`}>
                <step.icon className={`h-8 w-8 ${step.iconColor}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2 text-center md:text-left">{step.title}</h3>
                <p className="text-gray-400 text-center md:text-left">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="hidden md:block h-16 w-0.5 bg-gradient-to-b from-purple-500/50 to-transparent mt-4 ml-8" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
