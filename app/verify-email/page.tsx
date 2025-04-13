"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SparklesCore } from "@/components/sparkles"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      const email = searchParams.get("email")

      if (!token || !email) {
        setStatus("error")
        setMessage("Invalid verification link. Please request a new verification email.")
        return
      }

      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, email }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage("Your email has been verified successfully. You can now sign in.")
        } else {
          setStatus("error")
          setMessage(data.error || "Failed to verify email. Please try again.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("An error occurred during verification. Please try again.")
      }
    }

    verifyEmail()
  }, [searchParams, router])

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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <h1 className="text-3xl font-bold text-white">
              Research<span className="text-purple-500">AI</span>
            </h1>
          </Link>
        </div>

        <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">Email Verification</CardTitle>
            <CardDescription className="text-center text-gray-400">
              {status === "loading" ? "Verifying your email address..." : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {status === "loading" && <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />}
            {status === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}

            <p className="mt-6 text-center text-gray-300">{message}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            {status !== "loading" && (
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/login">{status === "success" ? "Sign In" : "Back to Login"}</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
