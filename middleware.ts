import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { NEXTAUTH_SECRET } from "@/lib/config"
import { logError, ErrorCategory, ErrorSeverity } from "@/lib/logging/error-logger"
import { rateLimit } from "@/lib/security/rate-limit"

export async function middleware(request: NextRequest) {
  // Generate a unique request ID for tracking
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Add request ID to headers for tracking through the request lifecycle
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-request-id", requestId)

  try {
    // Get the pathname
    const path = request.nextUrl.pathname

    // Apply rate limiting to all API routes
    if (path.startsWith("/api/")) {
      const identifier = `api_${request.headers.get('x-forwarded-for')?.split(',')[0] || "unknown"}`
      const { success, limit, remaining, reset } = await rateLimit(identifier, 60) // 60 requests per minute

      if (!success) {
        // Log rate limit exceeded
        await logError({
          category: ErrorCategory.RATE_LIMIT,
          severity: ErrorSeverity.WARNING,
          message: `Rate limit exceeded for ${path}`,
          url: path,
          method: request.method,
          requestId,
        })

        // Return rate limit response
        return new NextResponse(
          JSON.stringify({
            error: "Too many requests. Please try again later.",
            status: 429,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
              "X-Request-ID": requestId,
            },
          },
        )
      }

      // Add rate limit headers to response
      requestHeaders.set("X-RateLimit-Limit", limit.toString())
      requestHeaders.set("X-RateLimit-Remaining", remaining.toString())
      requestHeaders.set("X-RateLimit-Reset", reset.toString())
    }

    // Define protected routes that require authentication
    const protectedRoutes = ["/projects", "/dashboard", "/api/projects", "/api/stripe", "/settings", "/admin"]

    // Check if the path is a protected route or starts with a protected route
    const isProtectedRoute = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`))

    if (isProtectedRoute) {
      const token = await getToken({
        req: request,
        secret: NEXTAUTH_SECRET,
      })

      // If the user is not authenticated, redirect to the login page
      if (!token) {
        // For API routes, return 401 Unauthorized
        if (path.startsWith("/api/")) {
          return new NextResponse(
            JSON.stringify({
              error: "Unauthorized. Authentication required.",
              status: 401,
            }),
            {
              status: 401,
              headers: {
                "Content-Type": "application/json",
                "X-Request-ID": requestId,
              },
            },
          )
        }

        // For non-API routes, redirect to login
        const url = new URL("/login", request.url)
        url.searchParams.set("callbackUrl", encodeURI(request.url))
        return NextResponse.redirect(url)
      }

      // For admin routes, check if user has admin role
      if (path.startsWith("/admin")) {
        // @ts-ignore - token.role might not be in the type definition
        const userRole = token.role || "user"

        if (userRole !== "admin") {
          // For API routes, return 403 Forbidden
          if (path.startsWith("/api/admin")) {
            return new NextResponse(
              JSON.stringify({
                error: "Forbidden. Admin access required.",
                status: 403,
              }),
              {
                status: 403,
                headers: {
                  "Content-Type": "application/json",
                  "X-Request-ID": requestId,
                },
              },
            )
          }

          // For non-API routes, redirect to dashboard
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }
    }

    // Continue with the modified request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Log any errors that occur in middleware
    await logError({
      category: ErrorCategory.API_ERROR,
      severity: ErrorSeverity.ERROR,
      message: `Middleware error: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
      stack: error instanceof Error ? error.stack : undefined,
      url: request.nextUrl.pathname,
      method: request.method,
      requestId,
    })

    // For API routes, return error response
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({
          error: "Internal server error in request processing",
          status: 500,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": requestId,
          },
        },
      )
    }

    // For non-API routes, continue to the error page
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/projects/:path*", "/dashboard/:path*", "/api/:path*", "/settings/:path*", "/admin/:path*"],
}
