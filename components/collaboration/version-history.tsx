"use client"

import { useState } from "react"
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
import { toast } from "@/components/ui/use-toast"
import { History, Save, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface Version {
  id: string
  versionNumber: number
  description: string | null
  createdAt: string
}

interface VersionHistoryProps {
  projectId: string
  versions: Version[]
}

export default function VersionHistory({ projectId, versions }: VersionHistoryProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const createVersion = async () => {
    setIsCreating(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create version")
      }

      toast({
        title: "Version created",
        description: "A new version of the project has been saved.",
      })

      setIsOpen(false)
      setDescription("")
      router.refresh()
    } catch (error) {
      console.error("Error creating version:", error)
      toast({
        title: "Failed to create version",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Version History</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-white border-purple-500 hover:bg-purple-500/20">
              <Save className="h-4 w-4 mr-2" />
              Save Version
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Save Version</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a snapshot of the current project state.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Description (optional)</label>
                <Input
                  placeholder="What changed in this version?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createVersion} className="bg-purple-600 hover:bg-purple-700" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Version"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {versions.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No versions saved yet</p>
        ) : (
          versions.map((version) => (
            <div
              key={version.id}
              className="flex items-center justify-between p-3 rounded-md bg-gray-800/50 border border-gray-700"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-700/30 p-2 rounded-full">
                  <History className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Version {version.versionNumber}</p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {version.description && (
                <span className="text-xs text-gray-400 max-w-[200px] truncate">{version.description}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
