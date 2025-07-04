import { NextRequest, NextResponse } from 'next/server'

interface CRTransaction {
  transactionNumber: string
  issuer: string
  amount: number
  date: string
  isToday: boolean
}

interface CRBankingData {
  processedData: CRTransaction[]
  todayTransactions: CRTransaction[]
  totalAmount: number
  totalTransactions: number
  todayTransactionCount: number
  todayAmount: number
  monthTotal: number
  month: string
  todayDate: string
  updateTime: string
  availableIssuers: string[]
  yearlyLimit: number
  remainingLimit: number
  limitPercentage: number
  projectedYearEnd: number
  projectedLimitDate: string | null
  monthlyAverage: number
}

// In-memory storage for CR banking data
let crBankingData: CRBankingData | null = null

// Helper function to parse DD/MM/YYYY date format
function parseDate(dateString: string): Date {
  const parts = dateString.split('/')
  const day = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1 // Month is 0-indexed
  const year = parseInt(parts[2])
  return new Date(year, month, day)
}

// Helper function to check if date is today
function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export async function POST(request: NextRequest) {
  try {
    console.log('CR Banks webhook called')
    
    const body = await request.json()
    console.log('Received CR data:', body)

    // Handle the simple format from your working code
    let rawData = body
    
    // If it's wrapped in an array, unwrap it
    if (Array.isArray(body) && body.length > 0) {
      rawData = body
    }
    
    if (!Array.isArray(rawData)) {
      console.error('Invalid data format received:', body)
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid data format - expected array' 
      }, { status: 400 })
    }

    console.log(`Processing ${rawData.length} CR transactions`)

    // Process the CR data from your simple format
    const processedData: CRTransaction[] = rawData.map((row: any) => {
      // Handle your simple format
      const transactionNumber = row['Número de transacción'] || ''
      const issuer = row['Emisor'] || 'Unknown'
      const amount = parseFloat(row['Monto de ingreso (en USD)'] || '0')
      const dateStr = row['Fecha'] || ''
      
      const date = parseDate(dateStr)
      
      return {
        transactionNumber: transactionNumber.toString(),
        issuer: issuer.toString(),
        amount: amount,
        date: dateStr,
        isToday: isToday(date)
      }
    }).filter(t => t.amount > 0 && t.date) // Filter out invalid entries

    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Calculate totals
    const totalAmount = processedData.reduce((sum, t) => sum + t.amount, 0)
    const totalTransactions = processedData.length

    // Today's transactions
    const todayTransactions = processedData.filter(t => t.isToday)
    const todayTransactionCount = todayTransactions.length
    const todayAmount = todayTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Current month transactions (simplified - using all for now)
    const monthTotal = totalAmount
    
    // Available issuers
    const availableIssuers = [...new Set(processedData.map(t => t.issuer))].sort()

    // $17M limit calculations
    const YEARLY_LIMIT = 17000000
    const remainingLimit = Math.max(0, YEARLY_LIMIT - totalAmount)
    const limitPercentage = (totalAmount / YEARLY_LIMIT) * 100

    // Simple projections
    const currentMonthNumber = today.getMonth() + 1
    const monthlyAverage = totalAmount / currentMonthNumber
    const projectedYearEnd = monthlyAverage * 12
    
    let projectedLimitDate = null
    if (monthlyAverage > 0 && projectedYearEnd > YEARLY_LIMIT) {
      const monthsToLimit = YEARLY_LIMIT / monthlyAverage
      const limitMonth = Math.ceil(monthsToLimit)
      
      if (limitMonth <= 12) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ]
        projectedLimitDate = `${monthNames[limitMonth - 1]} ${currentYear}`
      }
    }

    // Create the data structure
    crBankingData = {
      processedData,
      todayTransactions,
      totalAmount,
      totalTransactions,
      todayTransactionCount,
      todayAmount,
      monthTotal,
      month: today.toLocaleString('default', { month: 'long', year: 'numeric' }),
      todayDate: today.toISOString().split('T')[0],
      updateTime: today.toISOString(),
      availableIssuers,
      yearlyLimit: YEARLY_LIMIT,
      remainingLimit,
      limitPercentage,
      projectedYearEnd,
      projectedLimitDate,
      monthlyAverage
    }

    console.log('CR Banking data processed successfully:', {
      totalTransactions,
      totalAmount: `${totalAmount.toLocaleString()}`,
      limitPercentage: `${limitPercentage.toFixed(1)}%`,
      projectedLimitDate
    })

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${totalTransactions} CR transactions`,
      data: crBankingData
    })

  } catch (error) {
    console.error('Error processing CR banking data:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing CR banking data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!crBankingData) {
      return NextResponse.json({ 
        success: false, 
        message: 'No CR banking data available yet. The n8n workflow needs to send data first.' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: crBankingData 
    })
  } catch (error) {
    console.error('Error retrieving CR banking data:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error retrieving CR banking data' 
    }, { status: 500 })
  }
}
