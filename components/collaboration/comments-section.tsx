"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Send, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Comment {
  id: string
  content: string
  createdAt: string
  userId: string
  user?: {
    name: string
    image: string
  }
}

interface CommentsProps {
  projectId: string
  comments: Comment[]
}

export default function CommentsSection({ projectId, comments: initialComments }: CommentsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when comments change
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [comments])

  const submitComment = async () => {
    if (!newComment.trim()) return
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add comments.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add comment")
      }

      const comment = await response.json()

      // Add the new comment to the list
      setComments([
        ...comments,
        {
          ...comment,
          user: {
            name: session.user.name || "User",
            image: session.user.image || "",
          },
        },
      ])

      setNewComment("")
      router.refresh()
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Failed to add comment",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-white font-semibold mb-4">Comments</h3>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[400px]">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user?.image} alt={comment.user?.name || ""} />
                <AvatarFallback className="bg-purple-700">{comment.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-white text-sm">{comment.user?.name || "User"}</span>
                    <span className="text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      <div className="mt-auto">
        <div className="flex space-x-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white resize-none"
            rows={2}
          />
          <Button
            className="bg-purple-600 hover:bg-purple-700 self-end"
            size="icon"
            onClick={submitComment}
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
