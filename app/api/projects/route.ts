import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-service"
import { createProject, getUserProjects } from "@/lib/db/project-service"
import { logError, ErrorCategory, ErrorSeverity, createErrorResponse } from "@/lib/logging/error-logger"
import { projectCreateSchema, validateRequest } from "@/lib/validation/validation-schemas"

export async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || `req_${Date.now()}`

  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(createErrorResponse("Unauthorized", 401), { status: 401 })
    }

    const result = await getUserProjects(session.user.id)

    if (!result.success) {
      return NextResponse.json(createErrorResponse(result.error, 500), { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.projects,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    await logError({
      category: ErrorCategory.API_ERROR,
      severity: ErrorSeverity.ERROR,
      message: `Error getting projects: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      url: req.nextUrl.pathname,
      method: req.method,
    })

    return NextResponse.json(createErrorResponse("Internal server error", 500), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || `req_${Date.now()}`;
  let session;
  
  try {
    session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        createErrorResponse("Unauthorized", 401),
        { status: 401 }
      );
    }

    // Validate request body against schema
    const validation = await validateRequest(req, projectCreateSchema, "Invalid project data");
    
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        createErrorResponse(validation.error, 400),
        { status: 400 }
      );
    }

    const { title, description } = validation.data;

    const result = await createProject(session.user.id, title, description);

    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(result.error, 500),
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.project,
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  } catch (error) {
    await logError({
      category: ErrorCategory.API_ERROR,
      severity: ErrorSeverity.ERROR,
      message: `Error creating project: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      url: req.nextUrl.pathname,
      method: req.method,
      userId: session?.user?.id,
    })

    return NextResponse.json(createErrorResponse("Internal server error", 500), { status: 500 })
  }
}
