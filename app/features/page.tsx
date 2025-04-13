import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import FeaturesSection from "@/components/features-section"
import { SparklesCore } from "@/components/sparkles"

export default function FeaturesPage() {
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
            ResearchAI{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Features</span>
          </h1>
          <p className="text-gray-400 text-xl mb-12 max-w-3xl mx-auto text-center">
            Discover the powerful capabilities that make ResearchAI the ultimate tool for transforming research papers
            into engaging content.
          </p>
        </div>
        <FeaturesSection />
        <Footer />
      </div>
    </main>
  )
}
