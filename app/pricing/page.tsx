import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PricingSection from "@/components/pricing-section"
import { SparklesCore } from "@/components/sparkles"

export default function PricingPage() {
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
            Simple{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Pricing</span>
          </h1>
          <p className="text-gray-400 text-xl mb-12 max-w-3xl mx-auto text-center">
            Choose the plan that best fits your research needs and budget.
          </p>
        </div>
        <PricingSection />
        <Footer />
      </div>
    </main>
  )
}
