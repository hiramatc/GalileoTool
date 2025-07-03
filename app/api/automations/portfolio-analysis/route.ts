import { NextResponse } from "next/server"
import { getCurrentUser, trackSearch } from "@/lib/users"

export async function POST(request: Request) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Call your n8n webhook for portfolio analysis
    const response = await fetch("https://hiramtc.app.n8n.cloud/webhook/portfolio-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Portfolio analysis request failed")
    }

    const data = await response.json()
    await trackSearch() // Track usage

    return NextResponse.json(data)
  } catch (error) {
    console.error("Portfolio analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
