"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import {
  FileText,
  Upload,
  X,
  AlertCircle,
  FileImage,
  FileArchive,
  FileIcon as FilePdf,
  File,
  Loader2,
} from "lucide-react"

interface EnhancedFileUploadProps {
  projectId: string
  onSuccess?: (documentId: string) => void
  onProcessingStart?: () => void
  maxSize?: number // in MB
  allowedTypes?: string[]
}

export default function EnhancedFileUpload({
  projectId,
  onSuccess,
  onProcessingStart,
  maxSize = 10, // Default 10MB
  allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/x-tex",
    "text/plain",
  ],
}: EnhancedFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File validation function
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: PDF, DOCX, LaTeX, TXT`,
      }
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return {
        valid: false,
        error: `File size exceeds the ${maxSize}MB limit`,
      }
    }

    return { valid: true }
  }

  const getFileIcon = (fileType: string) => {
    switch (true) {
      case fileType.includes("pdf"):
        return <FilePdf className="h-8 w-8 text-red-500" />
      case fileType.includes("image"):
        return <FileImage className="h-8 w-8 text-blue-500" />
      case fileType.includes("zip") || fileType.includes("archive"):
        return <FileArchive className="h-8 w-8 text-yellow-500" />
      case fileType.includes("document"):
        return <FileText className="h-8 w-8 text-green-500" />
      default:
        return <File className="h-8 w-8 text-purple-500" />
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      setError(null)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0]
        const validation = validateFile(droppedFile)

        if (!validation.valid) {
          setError(validation.error || "Invalid file")
          return
        }

        setFile(droppedFile)
      }
    },
    [setFile],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0]
        const validation = validateFile(selectedFile)

        if (!validation.valid) {
          setError(validation.error || "Invalid file")
          return
        }

        setFile(selectedFile)
      }
    },
    [validateFile, setFile],
  )

  const uploadDocument = useCallback(async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Create XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest()

      // Set up progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      })

      // Create a promise to handle the XHR request
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.open("POST", `/api/projects/${projectId}/documents`, true)

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response.id)
            } catch (error) {
              reject(new Error("Invalid response format"))
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText)
              reject(new Error(errorResponse.error || "Upload failed"))
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
        }

        xhr.onerror = () => {
          reject(new Error("Network error occurred"))
        }

        xhr.send(formData)
      })

      // Wait for upload to complete
      const documentId = await uploadPromise

      // Show success message
      toast({
        title: "Document uploaded successfully",
        description: "Your document is now being processed.",
      })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Call onProcessingStart callback
      if (onProcessingStart) {
        onProcessingStart()
      }

      // Simulate processing completion after a delay
      setTimeout(() => {
        setIsUploading(false)
        setFile(null)
        setUploadProgress(0)

        // Call success callback with document ID
        if (onSuccess) {
          onSuccess(documentId)
        }
      }, 1000)
    } catch (error) {
      console.error("Error uploading document:", error)
      setError(error instanceof Error ? error.message : "Failed to upload document")
      setIsUploading(false)
    }
  }, [file, projectId, onSuccess, onProcessingStart])

  const cancelUpload = useCallback(() => {
    setFile(null)
    setIsUploading(false)
    setUploadProgress(0)
    setError(null)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`border-2 border-dashed ${
            isDragging
              ? "border-purple-500 bg-purple-500/10"
              : error
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
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                  <Upload className="h-16 w-16 text-purple-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">Drag & Drop Your Research Paper</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  Upload your PDF, LaTeX, Word, or plain text file to get started
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center bg-red-500/20 text-red-300 p-3 rounded-md mb-4 w-full max-w-md"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <label className="cursor-pointer flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Browse Files
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.tex,.txt"
                        onChange={handleFileInput}
                      />
                    </label>
                  </Button>
                  <Button variant="outline" className="text-white border-purple-500 hover:bg-purple-500/20">
                    Use Sample Paper
                  </Button>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  Supported formats: PDF, DOCX, LaTeX, TXT • Max size: {maxSize}MB
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    {getFileIcon(file.type)}
                    <div className="ml-3">
                      <span className="text-white font-medium truncate max-w-[200px] sm:max-w-xs block">
                        {file.name}
                      </span>
                      <span className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelUpload}
                    className="text-gray-400 hover:text-white"
                    disabled={isUploading}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center bg-red-500/20 text-red-300 p-3 rounded-md mb-4"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {isUploading ? (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Uploading...</span>
                      <span className="text-purple-400">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                    <div className="mt-4 flex items-center text-gray-400">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">
                        {uploadProgress < 100 ? "Transferring file to server..." : "Processing upload..."}
                      </span>
                    </div>
                  </div>
                ) : (
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
      </motion.div>
    </AnimatePresence>
  )
}
