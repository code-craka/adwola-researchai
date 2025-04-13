"use client"

import { memo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Share2, Edit, Trash2, BarChart3, Podcast, Presentation } from 'lucide-react'
import Link from "next/link"

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string | null
    status: string
    createdAt: string
    outputs?: Array<{
      id: string
      type: string
      title: string
      thumbnailUrl: string | null
    }>
    collaborators?: Array<{
      id: string
      user: {
        id: string
        name: string | null
        image: string | null
      }
    }>
  }
  onDelete?: (id: string) => void
  onEdit?: (project: any) => void
}

function ProjectCardComponent({ project, onDelete, onEdit }: ProjectCardProps) {
  // Get the output counts by type
  const presentations = project.outputs?.filter((o) => o.type === "presentation").length || 0
  const podcasts = project.outputs?.filter((o) => o.type === "podcast").length || 0
  const visuals = project.outputs?.filter((o) => o.type === "visual").length || 0

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-500/20 text-yellow-400"
      case "processing":
        return "bg-blue-500/20 text-blue-400"
      case "completed":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <Card className="bg-black/50 border border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-white">{project.title}</CardTitle>
          <Badge className={`${getStatusColor(project.status)}`}>{project.status}</Badge>
        </div>
        <CardDescription className="text-gray-400">
          {new Date(project.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {project.description && <p className="text-gray-300 text-sm mb-4">{project.description}</p>}

        {(presentations > 0 || podcasts > 0 || visuals > 0) && (
          <div className="flex space-x-4 mb-4">
            {presentations > 0 && (
              <div className="flex items-center">
                <Presentation className="h-4 w-4 text-purple-400 mr-1" />
                <span className="text-xs text-gray-300">{presentations}</span>
              </div>
            )}
            {podcasts > 0 && (
              <div className="flex items-center">
                <Podcast className="h-4 w-4 text-purple-400 mr-1" />
                <span className="text-xs text-gray-300">{podcasts}</span>
              </div>
            )}
            {visuals > 0 && (
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-purple-400 mr-1" />
                <span className="text-xs text-gray-300">{visuals}</span>
              </div>
            )}
          </div>
        )}

        {project.collaborators && project.collaborators.length > 0 && (
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {project.collaborators.slice(0, 3).map((collab) => (
                <div
                  key={collab.id}
                  className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-xs text-white border-2 border-gray-800"
                >
                  {collab.user.name?.charAt(0) || "U"}
                </div>
              ))}
            </div>
            {project.collaborators.length > 3 && (
              <span className="text-xs text-gray-400 ml-2">+{project.collaborators.length - 3} more</span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => onEdit(project)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-400"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href={`/projects/${project.id}`}>View Project</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const ProjectCard = memo(ProjectCardComponent)
