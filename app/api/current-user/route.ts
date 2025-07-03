import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/users"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      username: currentUser.username,
      email: currentUser.email,
      isAdmin: currentUser.isAdmin,
    })
  } catch (error) {
    console.error("Error getting current user:", error)
    return NextResponse.json({ error: "Failed to get user info" }, { status: 500 })
  }
}
