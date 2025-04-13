"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

// Stripe price IDs - these would come from your Stripe dashboard
const STRIPE_PRICE_IDS = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_pro",
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Perfect for trying out the platform",
    features: [
      "3 paper uploads per month",
      "Basic presentation templates",
      "Standard quality audio",
      "Export as PDF or MP3",
      "24-hour support response time",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    planType: "free",
    delay: 0.1,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For individual researchers and students",
    features: [
      "20 paper uploads per month",
      "Premium presentation templates",
      "High-quality audio with voice options",
      "Export in multiple formats",
      "Social media content generation",
      "4-hour support response time",
    ],
    buttonText: "Subscribe Now",
    buttonVariant: "default" as const,
    highlighted: true,
    planType: "pro",
    priceId: STRIPE_PRICE_IDS.pro,
    delay: 0.2,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For research teams and institutions",
    features: [
      "Unlimited paper uploads",
      "Custom branded templates",
      "Premium audio with multiple voices",
      "All export formats",
      "Team collaboration features",
      "API access",
      "Dedicated support",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    planType: "enterprise",
    delay: 0.3,
  },
]

export default function PricingSection() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handlePlanSelection = async (plan: (typeof plans)[0]) => {
    // If not logged in, redirect to login
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/pricing")}`)
      return
    }

    // For free plan, just redirect to dashboard
    if (plan.planType === "free") {
      router.push("/dashboard")
      return
    }

    // For enterprise plan, redirect to contact page
    if (plan.planType === "enterprise") {
      router.push("/contact")
      return
    }

    // For pro plan, create Stripe checkout session
    try {
      setIsLoading(plan.planType)

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planType: plan.planType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process subscription",
        variant: "destructive",
      })
      setIsLoading(null)
    }
  }

  return (
    <section className="py-20 px-6" id="pricing">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Pricing</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Choose the plan that fits your research needs</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: plan.delay }}
              viewport={{ once: true }}
              className={plan.highlighted ? "md:-mt-4 md:mb-4" : ""}
            >
              <Card
                className={`h-full ${plan.highlighted ? "border-purple-500 bg-black/70" : "border-white/10 bg-black/50"} backdrop-blur-sm`}
              >
                <CardHeader>
                  <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-400 ml-1">{plan.period}</span>}
                  </div>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    variant={plan.buttonVariant}
                    onClick={() => handlePlanSelection(plan)}
                    disabled={isLoading !== null}
                  >
                    {isLoading === plan.planType ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                  {plan.planType === "pro" && (
                    <Button
                      className="w-full border-purple-500 text-white hover:bg-purple-500/20"
                      variant="outline"
                      onClick={() => router.push("/payment/custom")}
                    >
                      Custom Payment
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}