import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("US Banks refresh triggered")

    // Get the n8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.N8N_US_BANKS_WEBHOOK_URL

    console.log("N8N_US_BANKS_WEBHOOK_URL:", n8nWebhookUrl ? "Set" : "Not set")

    if (!n8nWebhookUrl) {
      console.error("n8n webhook URL not configured")
      return NextResponse.json(
        {
          success: false,
          message: "n8n webhook URL not configured. Please set N8N_US_BANKS_WEBHOOK_URL environment variable.",
        },
        { status: 500 },
      )
    }

    console.log("Triggering n8n workflow at:", n8nWebhookUrl)

    // Trigger the n8n workflow
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trigger: "manual_refresh",
        timestamp: new Date().toISOString(),
        source: "dashboard_refresh",
      }),
    })

    console.log("n8n response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("n8n workflow failed:", response.status, errorText)
      throw new Error(`n8n workflow failed: ${response.status} - ${errorText}`)
    }

    const responseData = await response.text()
    console.log("n8n response:", responseData)

    return NextResponse.json({
      success: true,
      message: "US Banks data refresh triggered successfully",
      timestamp: new Date().toISOString(),
      n8nResponse: responseData,
    })
  } catch (error) {
    console.error("Error triggering US Banks refresh:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to trigger data refresh",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
