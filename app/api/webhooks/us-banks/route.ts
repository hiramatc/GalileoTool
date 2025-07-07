import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for banking data (in production, use a database)
let bankingData: any = null
let lastUpdated: string | null = null

export async function POST(request: NextRequest) {
  try {
    console.log("US Banks webhook received data")
    const data = await request.json()

    // Store the received data
    bankingData = data
    lastUpdated = new Date().toISOString()

    console.log("US Banks data stored successfully:", {
      totalTransactions: data.totalTransactions || 0,
      updateTime: lastUpdated,
    })

    return NextResponse.json({
      success: true,
      message: "US Banks data received and stored successfully",
      timestamp: lastUpdated,
    })
  } catch (error) {
    console.error("Error processing US Banks webhook:", error)
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
    console.log("US Banks GET request - checking for data...")

    if (!bankingData) {
      console.log("No US Banks data available yet")
      return NextResponse.json({
        success: false,
        message: "No banking data available yet. Waiting for n8n workflow to send data.",
        data: null,
        lastUpdated: null,
      })
    }

    console.log("Returning US Banks data:", {
      totalTransactions: bankingData.totalTransactions || 0,
      lastUpdated,
    })

    return NextResponse.json({
      success: true,
      message: "US Banks data retrieved successfully",
      data: bankingData,
      lastUpdated,
    })
  } catch (error) {
    console.error("Error retrieving US Banks data:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve banking data",
        error: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 },
    )
  }
}

