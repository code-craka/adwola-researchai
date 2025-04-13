/**
 * Collaboration Service
 *
 * Handles real-time collaboration features and version control
 */

import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import { PrismaClient } from "@prisma/client"
import { createProjectVersion } from "../db/project-service"

const prisma = new PrismaClient()

// Map of active project collaborations
const activeCollaborations = new Map<string, Set<string>>()

/**
 * Initialize Socket.IO server for real-time collaboration
 */
export function initializeSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error("Authentication error"))
    }

    try {
      // Verify token (this would use your auth service)
      // For simplicity, we're just checking if the token exists
      socket.data.userId = "user_id_from_token"
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.userId}`)

    // Join a project room
    socket.on("join-project", async (projectId) => {
      try {
        // Check if user has access to project
        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            OR: [
              { userId: socket.data.userId },
              {
                collaborators: {
                  some: {
                    userId: socket.data.userId,
                  },
                },
              },
            ],
          },
        })

        if (!project) {
          socket.emit("error", "Project not found or access denied")
          return
        }

        // Join the project room
        socket.join(`project:${projectId}`)

        // Add user to active collaborations
        if (!activeCollaborations.has(projectId)) {
          activeCollaborations.set(projectId, new Set())
        }
        activeCollaborations.get(projectId)?.add(socket.data.userId)

        // Notify other users
        socket.to(`project:${projectId}`).emit("user-joined", {
          userId: socket.data.userId,
          timestamp: new Date(),
        })

        // Send list of active collaborators
        const collaborators = Array.from(activeCollaborations.get(projectId) || [])
        socket.emit("active-collaborators", collaborators)

        console.log(`User ${socket.data.userId} joined project ${projectId}`)
      } catch (error) {
        console.error("Error joining project:", error)
        socket.emit("error", "Failed to join project")
      }
    })

    // Leave a project room
    socket.on("leave-project", (projectId) => {
      socket.leave(`project:${projectId}`)

      // Remove user from active collaborations
      activeCollaborations.get(projectId)?.delete(socket.data.userId)
      if (activeCollaborations.get(projectId)?.size === 0) {
        activeCollaborations.delete(projectId)
      }

      // Notify other users
      socket.to(`project:${projectId}`).emit("user-left", {
        userId: socket.data.userId,
        timestamp: new Date(),
      })

      console.log(`User ${socket.data.userId} left project ${projectId}`)
    })

    // Handle document changes
    socket.on("document-change", (data) => {
      const { projectId, documentId, changes } = data

      // Broadcast changes to other users in the project
      socket.to(`project:${projectId}`).emit("document-changed", {
        userId: socket.data.userId,
        documentId,
        changes,
        timestamp: new Date(),
      })
    })

    // Handle comments
    socket.on("add-comment", async (data) => {
      const { projectId, content } = data

      try {
        // Add comment to database
        const comment = await prisma.comment.create({
          data: {
            projectId,
            userId: socket.data.userId,
            content,
          },
          include: {
            project: {
              select: {
                title: true,
              },
            },
          },
        })

        // Broadcast comment to other users
        io.to(`project:${projectId}`).emit("comment-added", {
          id: comment.id,
          userId: socket.data.userId,
          content,
          createdAt: comment.createdAt,
          projectTitle: comment.project.title,
        })
      } catch (error) {
        console.error("Error adding comment:", error)
        socket.emit("error", "Failed to add comment")
      }
    })

    // Handle version creation
    socket.on("create-version", async (data) => {
      const { projectId, description } = data

      try {
        // Create version in database
        const result = await createProjectVersion(projectId, socket.data.userId, description)

        if (!result.success) {
          socket.emit("error", result.error)
          return
        }

        // Broadcast version creation to all users
        io.to(`project:${projectId}`).emit("version-created", {
          id: result.version.id,
          versionNumber: result.version.versionNumber,
          description: result.version.description,
          createdAt: result.version.createdAt,
        })
      } catch (error) {
        console.error("Error creating version:", error)
        socket.emit("error", "Failed to create version")
      }
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.userId}`)

      // Remove user from all active collaborations
      for (const [projectId, users] of activeCollaborations.entries()) {
        if (users.has(socket.data.userId)) {
          users.delete(socket.data.userId)

          // Notify other users
          socket.to(`project:${projectId}`).emit("user-left", {
            userId: socket.data.userId,
            timestamp: new Date(),
          })

          // Clean up empty projects
          if (users.size === 0) {
            activeCollaborations.delete(projectId)
          }
        }
      }
    })
  })

  return io
}

/**
 * Get active collaborators for a project
 */
export function getActiveCollaborators(projectId: string) {
  return Array.from(activeCollaborations.get(projectId) || [])
}

/**
 * Implement Operational Transformation for conflict resolution
 * This is a simplified version - a real implementation would be more complex
 */
export function transformOperation(op1: any, op2: any) {
  // Simple implementation for text operations
  // In a real system, you would use a library like ot.js or yjs

  // If operations are on different documents or positions, no transformation needed
  if (op1.documentId !== op2.documentId || op1.position !== op2.position) {
    return op1
  }

  // If both are inserts at the same position, adjust position of the second operation
  if (op1.type === "insert" && op2.type === "insert") {
    return {
      ...op1,
      position: op1.position + op2.text.length,
    }
  }

  // If op1 is insert and op2 is delete, adjust position if needed
  if (op1.type === "insert" && op2.type === "delete") {
    if (op1.position > op2.position) {
      return {
        ...op1,
        position: Math.max(op1.position - op2.length, op2.position),
      }
    }
  }

  // If op1 is delete and op2 is insert, adjust position if needed
  if (op1.type === "delete" && op2.type === "insert") {
    if (op1.position > op2.position) {
      return {
        ...op1,
        position: op1.position + op2.text.length,
      }
    }
  }

  // If both are deletes, adjust position and length if needed
  if (op1.type === "delete" && op2.type === "delete") {
    if (op1.position > op2.position) {
      return {
        ...op1,
        position: op1.position - Math.min(op2.length, op1.position - op2.position),
      }
    }
  }

  return op1
}
