import { NextResponse } from "next/server"
import { getUsageStats, getCurrentUser } from "@/lib/users"

export async function GET() {
  const currentUser = await getCurrentUser()

  if (!currentUser?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const stats = await getUsageStats()
  return NextResponse.json({ stats })
}
