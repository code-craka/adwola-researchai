import { notFound } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ClientSparkles } from "@/components/client-sparkles"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Presentation, Podcast, BarChart3, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { ForwardRefExoticComponent, RefAttributes } from "react"
import { LucideProps } from "lucide-react"

// Define types for different example types
interface BaseExample {
  title: string;
  type: "presentation" | "podcast" | "visual";
  description: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  downloadUrl: string;
}

interface PresentationExample extends BaseExample {
  type: "presentation";
  content: Array<{
    title: string;
    description: string;
    image?: string;
  }>;
}

interface PodcastExample extends BaseExample {
  type: "podcast";
  audioUrl: string;
  transcript: string;
}

interface VisualExample extends BaseExample {
  type: "visual";
  images: Array<{
    title: string;
    description: string;
    image?: string;
  }>;
}

type Example = PresentationExample | PodcastExample | VisualExample;

// Example data - in a real app, this would come from a database or API
const examplesData: Record<string, Example> = {
  "quantum-computing": {
    title: "Quantum Computing Research",
    type: "presentation",
    description:
      "A comprehensive presentation breaking down complex quantum computing concepts into clear, visual slides.",
    icon: Presentation,
    content: [
      {
        title: "Introduction to Quantum Computing",
        description:
          "An overview of quantum computing principles and their potential impact on computational problems.",
        image: "/placeholder.svg?height=600&width=800",
      },
      {
        title: "Quantum Bits (Qubits)",
        description:
          "Understanding the fundamental unit of quantum information and how it differs from classical bits.",
        image: "/placeholder.svg?height=600&width=800",
      },
      {
        title: "Quantum Algorithms",
        description: "Exploring key quantum algorithms like Shor's and Grover's that demonstrate quantum advantage.",
        image: "/placeholder.svg?height=600&width=800",
      },
    ],
    downloadUrl: "/samples/quantum-computing-presentation.pdf",
  },
  "climate-change": {
    title: "Climate Change Analysis",
    type: "podcast",
    description: "An engaging audio podcast discussing the latest climate change research findings and implications.",
    icon: Podcast,
    audioUrl: "/samples/climate-change-podcast-sample.mp3",
    transcript:
      "In this episode, we explore the latest research on climate change impacts across different ecosystems. Recent studies have shown accelerating effects in polar regions, with implications for global sea level rise. Additionally, we discuss new mitigation strategies being developed by international research teams...",
    downloadUrl: "/samples/climate-change-podcast.mp3",
  },
  "neural-networks": {
    title: "Neural Networks Overview",
    type: "visual",
    description: "Visual infographics explaining neural network architectures and their applications in modern AI.",
    icon: BarChart3,
    images: [
      {
        title: "Basic Neural Network Architecture",
        description: "Visualization of input, hidden, and output layers in a standard neural network.",
        image: "/placeholder.svg?height=800&width=1200",
      },
      {
        title: "Convolutional Neural Networks",
        description: "How CNNs process and extract features from image data.",
        image: "/placeholder.svg?height=800&width=1200",
      },
    ],
    downloadUrl: "/samples/neural-networks-infographic.pdf",
  },
  "medical-research": {
    title: "Medical Research Findings",
    type: "presentation",
    description: "A presentation summarizing breakthrough medical research findings in an accessible format.",
    icon: Presentation,
    content: [
      {
        title: "Recent Advances in Immunotherapy",
        description: "Overview of breakthrough treatments using the body's immune system to fight diseases.",
        image: "/placeholder.svg?height=600&width=800",
      },
      {
        title: "Gene Editing Technologies",
        description: "Exploring CRISPR and other gene editing approaches in medical treatments.",
        image: "/placeholder.svg?height=600&width=800",
      },
    ],
    downloadUrl: "/samples/medical-research-presentation.pdf",
  },
  "renewable-energy": {
    title: "Renewable Energy Study",
    type: "podcast",
    description: "A podcast exploring the latest developments in renewable energy technology and implementation.",
    icon: Podcast,
    audioUrl: "/samples/renewable-energy-podcast-sample.mp3",
    transcript:
      "Today we're discussing the latest breakthroughs in renewable energy storage solutions. Recent research has shown promising advances in grid-scale battery technologies that could revolutionize how we integrate renewable sources into our power systems...",
    downloadUrl: "/samples/renewable-energy-podcast.mp3",
  },
  "space-exploration": {
    title: "Space Exploration Data",
    type: "visual",
    description: "Visual representations of space exploration data and astronomical discoveries.",
    icon: BarChart3,
    images: [
      {
        title: "Exoplanet Discoveries by Year",
        description: "Visualization of the increasing rate of exoplanet discoveries over the past two decades.",
        image: "/placeholder.svg?height=800&width=1200",
      },
      {
        title: "Solar System Exploration Timeline",
        description: "Major milestones in robotic exploration of our solar system.",
        image: "/placeholder.svg?height=800&width=1200",
      },
    ],
    downloadUrl: "/samples/space-exploration-visuals.pdf",
  },
}

export default function ExamplePage({ params }: { params: { id: string } }) {
  const example = examplesData[params.id as keyof typeof examplesData]

  if (!example) {
    notFound()
  }

  const IconComponent = example.icon

  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      {/* Ambient background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0">
        <ClientSparkles
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
          <div className="mb-8">
            <Button variant="ghost" asChild className="text-gray-400 hover:text-white mb-4">
              <Link href="/examples">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Examples
              </Link>
            </Button>

            <div className="flex items-center mb-2">
              <IconComponent className="h-6 w-6 text-purple-500 mr-2" />
              <span className="text-purple-400 text-sm">{example.type}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{example.title}</h1>
            <p className="text-gray-400 text-lg max-w-3xl">{example.description}</p>
          </div>

          {/* Content based on example type */}
          {example.type === "presentation" && (
            <div className="space-y-12 mb-12">
              {example.content.map((slide, index) => (
                <Card key={index} className="bg-black/50 border border-white/10 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-6 flex flex-col justify-center">
                        <h2 className="text-xl font-semibold text-white mb-4">{slide.title}</h2>
                        <p className="text-gray-400">{slide.description}</p>
                      </div>
                      <div className="bg-gray-900/50">
                        <img
                          src={slide.image || "/placeholder.svg"}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {example.type === "podcast" && (
            <div className="mb-12">
              <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <audio controls className="w-full">
                      <source src={example.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-4">Transcript</h2>
                  <div className="bg-gray-900/50 p-4 rounded-md">
                    <p className="text-gray-300 whitespace-pre-line">{example.transcript}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {example.type === "visual" && (
            <div className="space-y-12 mb-12">
              {example.images.map((visual, index) => (
                <Card key={index} className="bg-black/50 border border-white/10 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">{visual.title}</h2>
                    <p className="text-gray-400 mb-6">{visual.description}</p>
                    <div className="bg-gray-900/50 p-2 rounded-md">
                      <img src={visual.image || "/placeholder.svg"} alt={visual.title} className="w-full rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Download button */}
          <div className="flex justify-center">
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href={example.downloadUrl}>
                <Download className="mr-2 h-5 w-5" />
                Download{" "}
                {example.type === "presentation" ? "Presentation" : example.type === "podcast" ? "Audio" : "Visuals"}
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  )
}