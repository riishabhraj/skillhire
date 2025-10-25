import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!
  const key = `company-logos/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
    // ACL removed - bucket policy handles public access
  })

  try {
    await s3Client.send(command)
    return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Failed to upload file to S3')
  }
}

export async function uploadLogoFromBase64(
  base64Data: string,
  fileName: string
): Promise<string> {
  // Remove data URL prefix (e.g., "data:image/png;base64,")
  const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
  const buffer = Buffer.from(base64String, 'base64')
  
  // Determine content type from base64 data
  const contentType = base64Data.match(/^data:image\/([a-z]+);base64,/)?.[1] || 'png'
  
  return uploadToS3(buffer, fileName, `image/${contentType}`)
}

export async function uploadFileToS3(
  base64Data: string,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucketName = process.env.AWS_S3_RESUME_BUCKET_NAME!
  const key = `resumes/${fileName}`

  // Remove data URL prefix if present
  const base64String = base64Data.replace(/^data:[^;]+;base64,/, '')
  const buffer = Buffer.from(base64String, 'base64')

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL removed - bucket policy handles public access
  })

  try {
    await s3Client.send(command)
    return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
  } catch (error) {
    console.error('Error uploading resume to S3:', error)
    throw new Error('Failed to upload resume to S3')
  }
}
