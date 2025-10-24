import { NextRequest, NextResponse } from 'next/server'
import { uploadLogoFromBase64 } from '@/lib/s3-upload'

export async function POST(request: NextRequest) {
  try {
    const { base64Data, fileName } = await request.json()

    if (!base64Data || !fileName) {
      return NextResponse.json(
        { error: 'Base64 data and filename are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!base64Data.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
    const fileSizeInBytes = (base64String.length * 3) / 4
    const maxSizeInBytes = 5 * 1024 * 1024 // 5MB

    if (fileSizeInBytes > maxSizeInBytes) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    const logoUrl = await uploadLogoFromBase64(base64Data, fileName)

    return NextResponse.json({ logoUrl })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}
