/**
 * S3 Storage Service
 *
 * Handles file uploads and downloads to/from AWS S3
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME as string

/**
 * Upload a file to S3
 */
export async function uploadToS3(file: File, key: string) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    // Generate URL
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    return { success: true, url }
  } catch (error) {
    console.error("Error uploading to S3:", error)
    return { success: false, error: "Failed to upload file" }
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(url: string) {
  try {
    // Extract key from URL
    const key = url.split(`https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1]

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)

    return { success: true }
  } catch (error) {
    console.error("Error deleting from S3:", error)
    return { success: false, error: "Failed to delete file" }
  }
}

/**
 * Generate a presigned URL for downloading a file
 */
export async function getPresignedUrl(key: string, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })

    return { success: true, url }
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    return { success: false, error: "Failed to generate URL" }
  }
}
