"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Search, Loader2 } from 'lucide-react'
import { ProjectCard } from "@/components/project-card"
import { ErrorBoundary } from "@/components/error-boundary"
import { useDataFetching } from "@/lib/hooks/use-data-fetching"
import { toast } from "@/components/ui/use-toast"

export default function ProjectsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Fetch projects with optimized data fetching
  const { data, isLoading, isError, refresh } = useDataFetching("/api/projects")
  
  // Handle project deletion
  const handleDeleteProject = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        })
        
        if (!response.ok) {
          throw new Error("Failed to delete project")
        }
        
        toast({
          title: "Project deleted",
          description: "The project has been successfully deleted.",
        })
        
        // Refresh the projects list
        refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete project",
          variant: "destructive",
        })
      }
    }
  }, [refresh])
  
  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (!data?.data) return []
    
    return data.data
      .filter((project: any) => {
        // Apply search filter
        const matchesSearch = searchTerm === "" || 
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
        
        // Apply status filter
        const matchesStatus = statusFilter === "all" || project.status === statusFilter
        
        return matchesSearch && matchesStatus
      })
      .sort((a: any, b: any) => {
        // Sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [data?.data, searchTerm, statusFilter])

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-white/10 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-black/50 border-white/10 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ErrorBoundary>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">Failed to load projects</p>
              <Button onClick={refresh} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No projects found</h2>
              <p className="text-gray-400 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "No projects match your search criteria"
                  : "Create your first research project to get started"}
              </p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project: any) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}
