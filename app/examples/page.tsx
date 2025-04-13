import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { SparklesCore } from "@/components/sparkles"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Presentation, Podcast, BarChart3, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

// Example data
const examples = [
  {
    title: "Quantum Computing Research",
    type: "presentation",
    description:
      "A comprehensive presentation breaking down complex quantum computing concepts into clear, visual slides.",
    icon: Presentation,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "Climate Change Analysis",
    type: "podcast",
    description: "An engaging audio podcast discussing the latest climate change research findings and implications.",
    icon: Podcast,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "Neural Networks Overview",
    type: "visual",
    description: "Visual infographics explaining neural network architectures and their applications in modern AI.",
    icon: BarChart3,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "Medical Research Findings",
    type: "presentation",
    description: "A presentation summarizing breakthrough medical research findings in an accessible format.",
    icon: Presentation,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "Renewable Energy Study",
    type: "podcast",
    description: "A podcast exploring the latest developments in renewable energy technology and implementation.",
    icon: Podcast,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "Space Exploration Data",
    type: "visual",
    description: "Visual representations of space exploration data and astronomical discoveries.",
    icon: BarChart3,
    image: "/placeholder.svg?height=400&width=600",
  },
]

export default function ExamplesPage() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
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

      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
            Example{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Transformations
            </span>
          </h1>
          <p className="text-gray-400 text-xl mb-12 max-w-3xl mx-auto text-center">
            See how ResearchAI transforms complex research papers into engaging presentations, podcasts, and visual
            content.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {examples.map((example, index) => (
              <Card
                key={index}
                className="bg-black/50 border border-white/10 backdrop-blur-sm overflow-hidden hover:border-purple-500/50 transition-colors"
              >
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={example.image || "/placeholder.svg"}
                    alt={example.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <example.icon className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-sm text-purple-400">{example.type}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{example.title}</h3>
                  <p className="text-gray-400 mb-4">{example.description}</p>
                  <Button variant="outline" className="w-full text-white border-purple-500 hover:bg-purple-500/20">
                    View Example
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Link href="/projects/new">
                <FileText className="mr-2 h-5 w-5" />
                Create Your Own
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  )
}
