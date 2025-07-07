import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the n8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.N8N_CR_BANKS_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      return NextResponse.json({ success: false, message: "n8n webhook URL not configured" }, { status: 500 })
    }

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

    if (!response.ok) {
      throw new Error(`n8n workflow failed: ${response.status}`)
    }

    return NextResponse.json({
      success: true,
      message: "CR Banks data refresh triggered successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error triggering CR Banks refresh:", error)
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
