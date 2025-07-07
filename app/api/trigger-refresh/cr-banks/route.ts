import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Triggering CR Banks refresh...")

    // Call your n8n webhook to trigger the workflow
    const n8nWebhookUrl = "https://hiramtc.app.n8n.cloud/webhook/cr-banks-trigger"

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trigger: "manual_refresh",
        timestamp: new Date().toISOString(),
        source: "dashboard_refresh_button",
      }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.text()
    console.log("n8n webhook response:", result)

    return NextResponse.json({
      success: true,
      message: "CR Banks refresh triggered successfully",
      timestamp: new Date().toISOString(),
      webhookResponse: result,
    })
  } catch (error) {
    console.error("Error triggering CR Banks refresh:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to trigger CR Banks refresh",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
