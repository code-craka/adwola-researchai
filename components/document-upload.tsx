"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Upload, X, Loader2, AlertCircle, CheckCircle, FileArchive, FileCode, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface DocumentUploadProps {
  projectId: string
  onSuccess?: () => void
  maxFileSize?: number // in MB
}

export default function DocumentUpload({
  projectId,
  onSuccess,
  maxFileSize = 50, // Default max size: 50MB
}: DocumentUploadProps) {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error" | "retry">(
    "idle",
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [showRetryDialog, setShowRetryDialog] = useState(false)
  const [retryOptions, setRetryOptions] = useState({
    useAlternativeMethod: true,
    ignoreEncryption: false,
    skipMetadata: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Allowed file types
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/x-tex",
    "text/plain",
    "application/rtf",
    "text/markdown",
  ]

  // File type icons mapping
  const fileTypeIcons: Record<string, React.ReactNode> = {
    "application/pdf": <FileText className="h-8 w-8 text-red-500" />,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (
      <FileText className="h-8 w-8 text-blue-500" />
    ),
    "application/msword": <FileText className="h-8 w-8 text-blue-500" />,
    "application/x-tex": <FileCode className="h-8 w-8 text-green-500" />,
    "text/plain": <FileText className="h-8 w-8 text-gray-500" />,
    "application/rtf": <FileText className="h-8 w-8 text-orange-500" />,
    "text/markdown": <FileText className="h-8 w-8 text-purple-500" />,
    default: <FileArchive className="h-8 w-8 text-gray-500" />,
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    setErrorMessage(null)

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Invalid file type. Please upload a PDF, DOCX, LaTeX, or TXT file.")
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, LaTeX, or TXT file.",
        variant: "destructive",
      })
      return
    }

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setErrorMessage(`File size exceeds the maximum limit of ${maxFileSize}MB.`)
      toast({
        title: "File too large",
        description: `File size exceeds the maximum limit of ${maxFileSize}MB.`,
        variant: "destructive",
      })
      return
    }

    setFile(file)
    setUploadStatus("idle")
  }

  const uploadDocument = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus("uploading")
    setErrorMessage(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Create XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      })

      // Create a promise to handle the XHR request
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch (e) {
              reject(new Error("Invalid response format"))
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText)
              reject(new Error(errorData.error || "Upload failed"))
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
        }

        xhr.onerror = () => {
          reject(new Error("Network error occurred"))
        }
      })

      // Open and send the request
      xhr.open("POST", `/api/projects/${projectId}/documents`, true)
      xhr.send(formData)

      // Wait for the upload to complete
      const response = await uploadPromise

      // Store document ID for potential retry
      if (response.id) {
        setDocumentId(response.id)
      }

      // Check if there was a processing warning
      if (response.processingWarning) {
        setUploadStatus("error")
        setErrorMessage(response.processingWarning)

        // Show toast with warning
        toast({
          title: "Document uploaded with issues",
          description: response.processingWarning,
          variant: "warning",
        })

        // If we can retry, set status to retry
        if (response.canRetry) {
          setUploadStatus("retry")
        }

        setIsUploading(false)
        return
      }

      // Upload completed, now processing
      setUploadStatus("processing")
      setUploadProgress(100)

      // Simulate processing time (in a real app, you'd poll an API endpoint)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setUploadStatus("success")

      toast({
        title: "Document uploaded successfully",
        description: "Your document has been uploaded and processed.",
      })

      // Reset state after success
      setTimeout(() => {
        setFile(null)
        setIsUploading(false)
        setUploadProgress(0)
        setUploadStatus("idle")
        setDocumentId(null)

        // Call success callback
        if (onSuccess) {
          onSuccess()
        }

        // Refresh the page
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error uploading document:", error)
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to upload document")
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  const retryProcessing = async () => {
    if (!documentId) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus("processing")
    setErrorMessage(null)
    setShowRetryDialog(false)

    try {
      // Send retry request
      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          options: retryOptions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Retry failed")
      }

      const result = await response.json()

      // Check if there was still a processing warning
      if (result.processingWarning) {
        setUploadStatus("error")
        setErrorMessage(result.processingWarning)

        toast({
          title: "Processing issues persist",
          description: result.processingWarning,
          variant: "warning",
        })

        // If we can retry again, set status to retry
        if (result.canRetry) {
          setUploadStatus("retry")
        }

        setIsUploading(false)
        return
      }

      // Processing succeeded
      setUploadStatus("success")

      toast({
        title: "Processing successful",
        description: "Your document has been successfully processed.",
      })

      // Reset state after success
      setTimeout(() => {
        setFile(null)
        setIsUploading(false)
        setUploadProgress(0)
        setUploadStatus("idle")
        setDocumentId(null)

        // Call success callback
        if (onSuccess) {
          onSuccess()
        }

        // Refresh the page
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error retrying document processing:", error)
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to process document")
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  const cancelUpload = () => {
    setFile(null)
    setIsUploading(false)
    setUploadProgress(0)
    setUploadStatus("idle")
    setErrorMessage(null)
    setDocumentId(null)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const getFileIcon = (fileType: string) => {
    return fileTypeIcons[fileType] || fileTypeIcons.default
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className={`border-2 border-dashed ${
            isDragging
              ? "border-purple-500 bg-purple-500/10"
              : errorMessage
                ? "border-red-500 bg-red-500/5"
                : "border-white/20 bg-black/50"
          } rounded-lg backdrop-blur-sm transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-6">
            {!file ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Upload className="h-16 w-16 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Drag & Drop Your Research Paper</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  Upload your PDF, LaTeX, Word, or plain text file to get started
                </p>

                {errorMessage && (
                  <div className="flex items-center text-red-400 mb-4 bg-red-500/10 p-3 rounded-md">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={triggerFileInput}>
                    <FileText className="mr-2 h-5 w-5" />
                    Browse Files
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.tex,.txt,.rtf,.md"
                      onChange={handleFileInput}
                    />
                  </Button>
                  <Button variant="outline" className="text-white border-purple-500 hover:bg-purple-500/20">
                    Use Sample Paper
                  </Button>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  Supported formats: PDF, DOCX, LaTeX, TXT, RTF, MD (Max size: {maxFileSize}MB)
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    {getFileIcon(file.type)}
                    <div className="ml-3">
                      <span className="text-white font-medium truncate max-w-[200px] sm:max-w-xs block">
                        {file.name}
                      </span>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs text-gray-400 mr-2">
                          {file.type.split("/")[1].toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelUpload}
                          className="text-gray-400 hover:text-white"
                          disabled={isUploading && uploadStatus !== "error" && uploadStatus !== "retry"}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {uploadStatus !== "idle" && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {uploadStatus === "uploading" && (
                          <Loader2 className="h-4 w-4 text-purple-400 mr-2 animate-spin" />
                        )}
                        {uploadStatus === "processing" && (
                          <Loader2 className="h-4 w-4 text-blue-400 mr-2 animate-spin" />
                        )}
                        {uploadStatus === "success" && <CheckCircle className="h-4 w-4 text-green-400 mr-2" />}
                        {uploadStatus === "error" && <AlertCircle className="h-4 w-4 text-red-400 mr-2" />}
                        {uploadStatus === "retry" && <RefreshCw className="h-4 w-4 text-yellow-400 mr-2" />}
                        <span className="text-gray-400">
                          {uploadStatus === "uploading" && "Uploading..."}
                          {uploadStatus === "processing" && "Processing document..."}
                          {uploadStatus === "success" && "Upload complete!"}
                          {uploadStatus === "error" && "Upload failed"}
                          {uploadStatus === "retry" && "Processing incomplete"}
                        </span>
                      </div>
                      <span className="text-purple-400">{uploadProgress}%</span>
                    </div>
                    <Progress
                      value={uploadProgress}
                      className="h-2 bg-gray-800"
                      indicatorClassName={
                        uploadStatus === "success"
                          ? "bg-green-500"
                          : uploadStatus === "error"
                            ? "bg-red-500"
                            : uploadStatus === "retry"
                              ? "bg-yellow-500"
                              : "bg-gradient-to-r from-purple-500 to-pink-600"
                      }
                    />

                    {errorMessage && (uploadStatus === "error" || uploadStatus === "retry") && (
                      <div className="mt-2 text-sm text-red-400">{errorMessage}</div>
                    )}

                    {uploadStatus === "retry" && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          className="text-yellow-400 border-yellow-500 hover:bg-yellow-500/20 mr-2"
                          onClick={() => setShowRetryDialog(true)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry Processing
                        </Button>
                        <Button
                          variant="outline"
                          className="text-white border-gray-700 hover:bg-gray-800"
                          onClick={() => {
                            // Continue without processing
                            setFile(null)
                            setIsUploading(false)
                            setUploadProgress(0)
                            setUploadStatus("idle")
                            setDocumentId(null)

                            // Refresh the page to show the document
                            router.refresh()
                          }}
                        >
                          Continue Anyway
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {uploadStatus === "idle" && (
                  <div className="flex justify-end">
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={uploadDocument}
                      disabled={isUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Retry Dialog */}
        <Dialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
          <DialogContent className="bg-black/90 border border-white/10 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-white">Retry Processing Options</DialogTitle>
              <DialogDescription className="text-gray-400">
                Adjust processing options to help resolve issues with your document.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useAlternativeMethod"
                  checked={retryOptions.useAlternativeMethod}
                  onCheckedChange={(checked) =>
                    setRetryOptions({ ...retryOptions, useAlternativeMethod: checked as boolean })
                  }
                />
                <Label htmlFor="useAlternativeMethod" className="text-white">
                  Use alternative extraction method
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ignoreEncryption"
                  checked={retryOptions.ignoreEncryption}
                  onCheckedChange={(checked) =>
                    setRetryOptions({ ...retryOptions, ignoreEncryption: checked as boolean })
                  }
                />
                <Label htmlFor="ignoreEncryption" className="text-white">
                  Attempt to bypass encryption
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipMetadata"
                  checked={retryOptions.skipMetadata}
                  onCheckedChange={(checked) => setRetryOptions({ ...retryOptions, skipMetadata: checked as boolean })}
                />
                <Label htmlFor="skipMetadata" className="text-white">
                  Skip metadata extraction
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRetryDialog(false)} className="text-white">
                Cancel
              </Button>
              <Button onClick={retryProcessing} className="bg-purple-600 hover:bg-purple-700">
                Retry Processing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  )
}
