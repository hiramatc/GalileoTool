import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for CR banking data (in production, use a database)
let crBankingData: any = null
let lastUpdated: string | null = null

export async function POST(request: NextRequest) {
  try {
    console.log("CR Banks webhook received data")
    const data = await request.json()

    // Store the received data
    crBankingData = data
    lastUpdated = new Date().toISOString()

    console.log("CR Banks data stored successfully:", {
      totalTransactions: data.totalTransactions || 0,
      yearlyTotal: data.yearlyTotal || 0,
      updateTime: lastUpdated,
    })

    return NextResponse.json({
      success: true,
      message: "CR Banks data received and stored successfully",
      timestamp: lastUpdated,
    })
  } catch (error) {
    console.error("Error processing CR Banks webhook:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process webhook data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("CR Banks GET request - checking for data...")

    if (!crBankingData) {
      console.log("No CR Banks data available yet")
      return NextResponse.json({
        success: false,
        message: "No CR banking data available yet. Waiting for n8n workflow to send data.",
        data: null,
        lastUpdated: null,
      })
    }

    console.log("Returning CR Banks data:", {
      totalTransactions: crBankingData.totalTransactions || 0,
      yearlyTotal: crBankingData.yearlyTotal || 0,
      lastUpdated,
    })

    return NextResponse.json({
      success: true,
      message: "CR Banks data retrieved successfully",
      data: crBankingData,
      lastUpdated,
    })
  } catch (error) {
    console.error("Error retrieving CR Banks data:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve CR banking data",
        error: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 },
    )
  }
}
