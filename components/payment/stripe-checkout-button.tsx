"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/config"

interface StripeCheckoutButtonProps {
  priceId: string
  planType: string
  children: React.ReactNode
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
}

export default function StripeCheckoutButton({
  priceId,
  planType,
  children,
  variant = "default",
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      // Verify that we have the Stripe publishable key
      if (!STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe publishable key is not configured")
      }

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          planType,
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
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  )
}