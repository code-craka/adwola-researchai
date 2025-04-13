"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { SparklesCore } from "@/components/sparkles"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (!sessionId) {
      router.push("/pricing")
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-payment?session_id=${sessionId}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setIsSuccess(true)
        } else {
          // If verification fails, redirect to pricing
          setTimeout(() => {
            router.push("/pricing")
          }, 3000)
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [sessionId, router])

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

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">
              {isVerifying ? "Processing Payment" : isSuccess ? "Payment Successful!" : "Payment Verification Failed"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isVerifying
                ? "Please wait while we verify your payment..."
                : isSuccess
                  ? "Thank you for subscribing to ResearchAI Pro!"
                  : "We couldn't verify your payment. Please try again."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {isVerifying ? (
              <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 text-2xl">×</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {!isVerifying && (
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href={isSuccess ? "/dashboard" : "/pricing"}>
                  {isSuccess ? "Go to Dashboard" : "Back to Pricing"}
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
