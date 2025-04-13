/**
 * Project Service
 *
 * Handles CRUD operations for projects, documents, and outputs
 */

import { PrismaClient } from "@prisma/client"
import { uploadToS3, deleteFromS3 } from "../storage/s3-service"
import { processDocument } from "../document-processing/pipeline"

const prisma = new PrismaClient()

/**
 * Create a new project
 */
export async function createProject(userId: string, title: string, description?: string) {
  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        userId,
        status: "draft",
      },
    })

    return { success: true, project }
  } catch (error) {
    console.error("Error creating project:", error)
    return { success: false, error: "Failed to create project" }
  }
}

/**
 * Get a project by ID
 */
export async function getProject(projectId: string, userId: string) {
  try {
    // Check if user is the owner or a collaborator
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        documents: true,
        outputs: true,
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        versions: {
          orderBy: {
            versionNumber: "desc",
          },
        },
      },
    })

    if (!project) {
      return { success: false, error: "Project not found" }
    }

    return { success: true, project }
  } catch (error) {
    console.error("Error getting project:", error)
    return { success: false, error: "Failed to get project" }
  }
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string) {
  try {
    // Get projects where user is owner or collaborator
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        outputs: {
          select: {
            id: true,
            type: true,
            title: true,
            thumbnailUrl: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return { success: true, projects }
  } catch (error) {
    console.error("Error getting user projects:", error)
    return { success: false, error: "Failed to get projects" }
  }
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  userId: string,
  data: {
    title?: string
    description?: string
    status?: string
  },
) {
  try {
    // Check if user is the owner or an admin collaborator
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
                role: "admin",
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return { success: false, error: "Project not found or permission denied" }
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data,
    })

    return { success: true, project: updatedProject }
  } catch (error) {
    console.error("Error updating project:", error)
    return { success: false, error: "Failed to update project" }
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string, userId: string) {
  try {
    // Check if user is the owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        documents: true,
        outputs: true,
      },
    })

    if (!project) {
      return { success: false, error: "Project not found or permission denied" }
    }

    // Delete associated files from S3
    for (const document of project.documents) {
      await deleteFromS3(document.fileUrl)
    }

    for (const output of project.outputs) {
      if (output.fileUrl) {
        await deleteFromS3(output.fileUrl)
      }
      if (output.thumbnailUrl) {
        await deleteFromS3(output.thumbnailUrl)
      }
    }

    // Delete project from database
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting project:", error)
    return { success: false, error: "Failed to delete project" }
  }
}

/**
 * Upload a document to a project
 */
export async function uploadDocument(projectId: string, userId: string, file: File) {
  try {
    // Check if user is the owner or an editor collaborator
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
                role: {
                  in: ["editor", "admin"],
                },
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return { success: false, error: "Project not found or permission denied" }
    }

    // Upload file to S3
    const fileKey = `projects/${projectId}/documents/${Date.now()}-${file.name}`
    const uploadResult = await uploadToS3(file, fileKey)

    if (!uploadResult.success) {
      return { success: false, error: "Failed to upload file" }
    }

    // Process document
    const processResult = await processDocument(file)

    if (!processResult.success) {
      return { success: false, error: "Failed to process document" }
    }

    // Create document in database
    const document = await prisma.document.create({
      data: {
        projectId,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: uploadResult.url,
        textContent: processResult.text,
        metadata: processResult.metadata,
      },
    })

    // Create figures
    if (processResult.figures && processResult.figures.length > 0) {
      await prisma.figure.createMany({
        data: processResult.figures.map((figure) => ({
          documentId: document.id,
          pageNumber: figure.pageNumber,
          description: figure.description,
          imageUrl: figure.imageUrl,
        })),
      })
    }

    // Create tables
    if (processResult.tables && processResult.tables.length > 0) {
      await prisma.table.createMany({
        data: processResult.tables.map((table) => ({
          documentId: document.id,
          pageNumber: table.pageNumber,
          description: table.description,
          tableData: table.data,
        })),
      })
    }

    // Update project status
    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        status: "processing",
      },
    })

    return { success: true, document }
  } catch (error) {
    console.error("Error uploading document:", error)
    return { success: false, error: "Failed to upload document" }
  }
}

/**
 * Create a new output for a project
 */
export async function createOutput(
  projectId: string,
  userId: string,
  data: {
    type: string
    title: string
    description?: string
    fileUrl?: string
    thumbnailUrl?: string
  },
) {
  try {
    // Check if user is the owner or an editor collaborator
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
                role: {
                  in: ["editor", "admin"],
                },
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return { success: false, error: "Project not found or permission denied" }
    }

    // Create output
    const output = await prisma.output.create({
      data: {
        projectId,
        ...data,
      },
    })

    // Update project status
    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        status: "completed",
      },
    })

    return { success: true, output }
  } catch (error) {
    console.error("Error creating output:", error)
    return { success: false, error: "Failed to create output" }
  }
}

/**
 * Add a collaborator to a project
 */
export async function addCollaborator(projectId: string, userId: string, collaboratorEmail: string, role: string) {
  try {
    // Check if user is the owner or an admin collaborator
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
                role: "admin",
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return { success: false, error: "Project not found or permission denied" }
    }

    // Find collaborator by email
    const collaborator = await prisma.user.findUnique({
      where: {
        email: collaboratorEmail,
      },
    })

    if (!collaborator) {
      return { success: false, error: "User not found" }
    }

    // Check if collaborator is already added
    const existingCollaborator = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: collaborator.id,
        },
      },
    })

    if (existingCollaborator) {
      return { success: false, error: "User is already a collaborator" }
    }

    // Add collaborator
    const projectCollaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        userId: collaborator.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return { success: true, collaborator: projectCollaborator }
  } catch (error) {
    console.error("Error adding collaborator:", error)
    return { success: false, error: "Failed to add collaborator" }
  }
}

/**
 * Add a comment to a project
 */
export async function addComment(projectId: string, userId: string, content: string) {
  try {
    // Check if user is the owner or a collaborator
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return { success: false, error: "Project not found or permission denied" }
    }

    // Add comment
    const comment = await prisma.comment.create({
      data: {
        projectId,
        userId,
        content,
      },
    })

    return { success: true, comment }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { success: false, error: "Failed to add comment" }
  }
}

/**
 * Create a new version of a project
 */
export async function createProjectVersion(projectId: string, userId: string, description?: string) {
  try {
    // Check if user is the owner or an editor collaborator
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
                role: {
                  in: ["editor", "admin"],
                },
              },
            },
          },
        ],
      },
      include: {
        documents: true,
        outputs: true,
      },
    })

    if (!project) {
      return { success: false, error: "Project not found or permission denied" }
    }

    // Get latest version number
    const latestVersion = await prisma.projectVersion.findFirst({
      where: {
        projectId,
      },
      orderBy: {
        versionNumber: "desc",
      },
    })

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1

    // Create snapshot of project
    const snapshot = {
      title: project.title,
      description: project.description,
      status: project.status,
      documents: project.documents.map((doc: { id: string; filename: string; fileUrl: string }) => ({
        id: doc.id,
        filename: doc.filename,
        fileUrl: doc.fileUrl,
      })),
      outputs: project.outputs.map((output: { id: string; type: string; title: string; fileUrl: string | null }) => ({
        id: output.id,
        type: output.type,
        title: output.title,
        fileUrl: output.fileUrl,
      })),
    }

    // Create version
    const version = await prisma.projectVersion.create({
      data: {
        projectId,
        versionNumber,
        description,
        snapshot,
      },
    })

    return { success: true, version }
  } catch (error) {
    console.error("Error creating project version:", error)
    return { success: false, error: "Failed to create project version" }
  }
}

/**
 * Add a comment to a project - Alias for addComment to match function names in routes
 */
export async function addProjectComment(projectId: string, userId: string, content: string) {
  return addComment(projectId, userId, content);
}

/**
 * Add a document to a project
 */
export async function addDocumentToProject(
  projectId: string, 
  userId: string,
  documentData: {
    filename: string,
    fileSize: number,
    mimeType: string,
    fileUrl: string,
    textContent?: string,
    summary?: string,
  }
) {
  try {
    // Check if user is the owner or an editor/admin collaborator
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
                role: {
                  in: ["editor", "admin"],
                },
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return { success: false, error: "Project not found or permission denied" }
    }

    // Create document in database
    const document = await prisma.document.create({
      data: {
        projectId,
        filename: documentData.filename,
        fileType: documentData.mimeType,
        fileSize: documentData.fileSize,
        fileUrl: documentData.fileUrl,
        textContent: documentData.textContent || "",
        metadata: {
          summary: documentData.summary || "",
          processed: true,
        },
      },
    })

    // Update project status to indicate document was added
    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        status: "active",
        updatedAt: new Date(),
      },
    })

    return { success: true, document }
  } catch (error) {
    console.error("Error adding document to project:", error)
    return { success: false, error: "Failed to add document to project" }
  }
}
