import { NextRequest, NextResponse } from 'next/server'

interface ContractData {
  companyName: string
  companyId: string
  companyAddress: string
  legalRepName: string
  legalRepId: string
  legalRepAddress: string
  legalRepGender: string
}

export async function POST(request: NextRequest) {
  try {
    const contractData: ContractData = await request.json()
    
    // Validate required fields
    const requiredFields = ['companyName', 'companyId', 'companyAddress', 'legalRepName', 'legalRepId', 'legalRepAddress', 'legalRepGender']
    const missingFields = requiredFields.filter(field => !contractData[field as keyof ContractData])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // For now, return a simple response while we fix the deployment
    return NextResponse.json({
      message: 'Contract generation feature is being updated. Please try again later.',
      data: contractData
    })
    
  } catch (error) {
    console.error('Error generating contract:', error)
    return NextResponse.json(
      { error: 'Failed to generate contract' },
      { status: 500 }
    )
  }
}
