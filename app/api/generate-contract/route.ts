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

    // Handle gender representation
    const genderRepresentation = contractData.legalRepGender === 'male' 
      ? 'representado por el señor' 
      : 'representada por la señora'

    // Your exact HTML document (copy the entire content from your document)
    let htmlContent = 

    // Replace the placeholders with actual data
    htmlContent = htmlContent
      .replace(/\{\{COMPANY_NAME\}\}/g, contractData.companyName)
      .replace(/\{\{COMPANY_ID\}\}/g, contractData.companyId)
      .replace(/\{\{COMPANY_ADDRESS\}\}/g, contractData.companyAddress)
      .replace(/\{\{LEGAL_REP_NAME\}\}/g, contractData.legalRepName)
      .replace(/\{\{LEGAL_REP_ID\}\}/g, contractData.legalRepId)
      .replace(/\{\{LEGAL_REP_ADDRESS\}\}/g, contractData.legalRepAddress)
      .replace(/\{\{GENDER_REPRESENTATION\}\}/g, genderRepresentation)

    // For now, return the HTML as a downloadable file
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="Contrato_${contractData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.html"`
      }
    })
    
  } catch (error) {
    console.error('Error generating contract:', error)
    return NextResponse.json(
      { error: 'Failed to generate contract' },
      { status: 500 }
    )
  }
}
