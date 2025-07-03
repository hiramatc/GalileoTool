import { NextResponse } from "next/server"
import { getCurrentUser, trackSearch } from "@/lib/users"

export async function POST(request: Request) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Call your n8n webhook for risk assessment
    const response = await fetch("https://hiramtc.app.n8n.cloud/webhook/risk-assessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Risk assessment request failed")
    }

    const data = await response.json()
    await trackSearch() // Track usage

    return NextResponse.json(data)
  } catch (error) {
    console.error("Risk assessment error:", error)
    return NextResponse.json({ error: "Assessment failed" }, { status: 500 })
  }
}
