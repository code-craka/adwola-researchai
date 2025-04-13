import Hero from "@/components/hero"
import Navbar from "@/components/navbar"
import FeaturesSection from "@/components/features-section"
import HowItWorks from "@/components/how-it-works"
import UploadDemo from "@/components/upload-demo"
import PricingSection from "@/components/pricing-section"
import Footer from "@/components/footer"
import { SparklesCore } from "@/components/sparkles"

export default function Home() {
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
        <Hero />
        <FeaturesSection />
        <HowItWorks />
        <UploadDemo />
        <PricingSection />
        <Footer />
      </div>
    </main>
  )
}
