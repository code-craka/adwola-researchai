import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SparklesCore } from "@/components/sparkles"

export default function ExampleNotFound() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden flex items-center justify-center">
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

      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Example Not Found</h1>
        <p className="text-gray-400 mb-8">The example you're looking for doesn't exist or has been moved.</p>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/examples">Back to Examples</Link>
        </Button>
      </div>
    </main>
  )
}