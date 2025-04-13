import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/db"
import { logError, ErrorCategory, ErrorSeverity } from "@/lib/logging/error-logger"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const requestId = headers().get("x-request-id") || `req_${Date.now()}`
  
  try {
    // Get the raw request body
    const body = await req.text()
    
    // Get the signature from headers
    const signature = headers().get("stripe-signature")
    
    if (!signature) {
      await logError({
        category: ErrorCategory.PAYMENT,
        severity: ErrorSeverity.WARNING,
        message: "Missing Stripe signature",
        requestId,
        url: "/api/stripe/webhook",
        method: "POST",
      })
      
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      const error = err as Error
      
      await logError({
        category: ErrorCategory.PAYMENT,
        severity: ErrorSeverity.WARNING,
        message: `Webhook signature verification failed: ${error.message}`,
        details: error,
        stack: error.stack,
        requestId,
        url: "/api/stripe/webhook",
        method: "POST",
      })
      
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${error.message}` },
        { status: 400 }
      )
    }

    // Log the event type for debugging
    console.log(`Processing Stripe event: ${event.type}`)

    // Handle the event based on its type
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        
        // Validate the session data
        if (!checkoutSession.metadata?.userId || !checkoutSession.customer) {
          await logError({
            category: ErrorCategory.PAYMENT,
            severity: ErrorSeverity.WARNING,
            message: "Missing metadata or customer in checkout session",
            details: { checkoutSession },
            requestId,
          })
          
          return NextResponse.json(
            { error: "Invalid checkout session data" },
            { status: 400 }
          )
        }

        // Update user with subscription info
        await prisma.user.update({
          where: { id: checkoutSession.metadata.userId },
          data: {
            stripeCustomerId: checkoutSession.customer as string,
            planType: checkoutSession.metadata.planType,
            subscriptionStatus: "active",
            updatedAt: new Date(),
          },
        })
        
        // Log successful subscription
        await logError({
          category: ErrorCategory.PAYMENT,
          severity: ErrorSeverity.INFO,
          message: "Subscription created successfully",
          details: {
            userId: checkoutSession.metadata.userId,
            planType: checkoutSession.metadata.planType,
            stripeCustomerId: checkoutSession.customer,
          },
          requestId,
        })
        
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        
        // Validate subscription data
        if (!subscription.customer) {
          await logError({
            category: ErrorCategory.PAYMENT,
            severity: ErrorSeverity.WARNING,
            message: "Missing customer in subscription update",
            details: { subscription },
            requestId,
          })
          
          return NextResponse.json(
            { error: "Invalid subscription data" },
            { status: 400 }
          )
        }

        // Find user with this subscription
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: subscription.status,
              updatedAt: new Date(),
            },
          })
          
          // Log subscription update
          await logError({
            category: ErrorCategory.PAYMENT,
            severity: ErrorSeverity.INFO,
            message: "Subscription updated",
            details: {
              userId: user.id,
              subscriptionStatus: subscription.status,
            },
            requestId,
          })
        } else {
          await logError({
            category: ErrorCategory.PAYMENT,
            severity: ErrorSeverity.WARNING,
            message: "User not found for subscription update",
            details: { stripeCustomerId: subscription.customer },
            requestId,
          })
        }
        
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        // Validate subscription data
        if (!subscription.customer) {
          await logError({
            category: ErrorCategory.PAYMENT,
            severity: ErrorSeverity.WARNING,
            message: "Missing customer in subscription deletion",
            details: { subscription },
            requestId,
          })
          
          return NextResponse.json(
            { error: "Invalid subscription data" },
            { status: 400 }
          )
        }

        // Find user with this subscription
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "canceled",
              planType: "free",
              updatedAt: new Date(),
            },
          })
          
          // Log subscription cancellation
          await logError({
            category: ErrorCategory.PAYMENT,
            severity: ErrorSeverity.INFO,
            message: "Subscription canceled",
            details: {
              userId: user.id,
            },
            requestId,
          })
        } else {
          await logError({
            category: ErrorCategory.PAYMENT,
            severity: ErrorSeverity.WARNING,
            message: "User not found for subscription deletion",
            details: { stripeCustomerId: subscription.customer },
            requestId,
          })
        }
        
        break
      }
      
      // Handle other event types as needed
      default: {
        // Log unhandled event types
        console.log(`Unhandled event type: ${event.type}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    
    await logError({
      category: ErrorCategory.PAYMENT,
      severity: ErrorSeverity.ERROR,
      message: `Error handling Stripe webhook: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      url: "/api/stripe/webhook",
      method: "POST",
    })
    
    return NextResponse.json(
      { error: "Failed to handle webhook" },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
