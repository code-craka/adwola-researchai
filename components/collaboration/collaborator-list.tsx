"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { UserPlus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Collaborator {
  id: string
  role: string
  user: {
    id: string
    name: string
    email: string
    image: string
  }
}

interface CollaboratorListProps {
  projectId: string
  collaborators: Collaborator[]
}

export default function CollaboratorList({ projectId, collaborators }: CollaboratorListProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("viewer")
  const [isLoading, setIsLoading] = useState(false)

  const addCollaborator = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add collaborator")
      }

      toast({
        title: "Collaborator added",
        description: `${email} has been added as a ${role}.`,
      })

      setIsOpen(false)
      setEmail("")
      setRole("viewer")
      router.refresh()
    } catch (error) {
      console.error("Error adding collaborator:", error)
      toast({
        title: "Failed to add collaborator",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400"
      case "editor":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-blue-500/20 text-blue-400"
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Collaborators</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-white border-purple-500 hover:bg-purple-500/20">
              <UserPlus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add Collaborator</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a team member to collaborate on this project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <Input
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Role</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="viewer" className="text-white">
                      Viewer
                    </SelectItem>
                    <SelectItem value="editor" className="text-white">
                      Editor
                    </SelectItem>
                    <SelectItem value="admin" className="text-white">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addCollaborator} className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Collaborator"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-3 rounded-md bg-gray-800/50 border border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={collaborator.user.image} alt={collaborator.user.name || ""} />
                <AvatarFallback className="bg-purple-700">
                  {collaborator.user.name?.charAt(0) || collaborator.user.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{collaborator.user.name}</p>
                <p className="text-xs text-gray-400">{collaborator.user.email}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${getRoleBadgeColor(collaborator.role)}`}>
              {collaborator.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
