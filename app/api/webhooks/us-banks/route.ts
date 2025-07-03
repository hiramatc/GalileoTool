import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for banking data (similar to your current approach)
let usBanksData: any = null
let lastUpdated = ""
let requestLog: any[] = []

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()

  try {
    // Log the incoming request details
    const headers = Object.fromEntries(request.headers.entries())
    const url = request.url
    const method = request.method

    console.log("=== US BANKS WEBHOOK REQUEST ===")
    console.log("Timestamp:", timestamp)
    console.log("Method:", method)
    console.log("URL:", url)
    console.log("Headers:", headers)

    // Parse the incoming data from n8n
    const rawBody = await request.text()
    console.log("Raw Body:", rawBody)

    let data
    try {
      data = JSON.parse(rawBody)
      console.log("Parsed Data:", data)
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)

      // Log the failed request
      requestLog.unshift({
        timestamp,
        success: false,
        error: "Invalid JSON",
        rawBody: rawBody.substring(0, 500), // First 500 chars
        headers,
      })

      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON format",
          message: "Request body is not valid JSON",
          receivedData: rawBody.substring(0, 200),
        },
        { status: 400 },
      )
    }

    // Store the data in memory
    usBanksData = data
    lastUpdated = timestamp

    // Log successful request
    requestLog.unshift({
      timestamp,
      success: true,
      dataKeys: Object.keys(data),
      dataSize: JSON.stringify(data).length,
    })

    // Keep only last 10 requests in log
    if (requestLog.length > 10) {
      requestLog = requestLog.slice(0, 10)
    }

    // Log for debugging
    console.log("US Banks data updated successfully:", {
      totalTransactions: data.totalTransactions,
      todayTransactions: data.todayTransactionCount,
      monthTotal: data.monthTotal,
      updateTime: data.updateTime,
      dataKeys: Object.keys(data),
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: "US Banks data updated successfully",
      timestamp: lastUpdated,
      receivedData: {
        totalTransactions: data.totalTransactions,
        todayTransactions: data.todayTransactionCount,
        monthTotal: data.monthTotal,
        dataKeys: Object.keys(data),
        dataSize: JSON.stringify(data).length,
      },
    })
  } catch (error) {
    console.error("=== US BANKS WEBHOOK ERROR ===")
    console.error("Error processing US Banks webhook:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")

    // Log the failed request
    requestLog.unshift({
      timestamp,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process US Banks data",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp,
      },
      { status: 500 },
    )
  }
}

// GET endpoint to retrieve current banking data (for your dashboard)
export async function GET() {
  try {
    if (!usBanksData) {
      return NextResponse.json(
        {
          success: false,
          message: "No banking data available yet",
          lastUpdated: null,
          requestLog: requestLog.slice(0, 5), // Show last 5 requests for debugging
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: usBanksData,
      lastUpdated: lastUpdated,
      requestLog: requestLog.slice(0, 5), // Show last 5 requests for debugging
    })
  } catch (error) {
    console.error("Error retrieving US Banks data:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve US Banks data",
      },
      { status: 500 },
    )
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
