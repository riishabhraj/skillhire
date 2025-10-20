import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Fetching from: https://remotive.com/api/remote-jobs')
    
    const response = await fetch('https://remotive.com/api/remote-jobs', {
      headers: {
        'User-Agent': 'SkillHire/1.0',
        'Accept': 'application/json',
      },
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      throw new Error(`Remotive API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Successfully parsed JSON, job count:', data.jobs?.length || 0)
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error fetching remote jobs:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch remote jobs',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
