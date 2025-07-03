import { NextResponse } from "next/server"
import { getUsers, getCurrentUser } from "@/lib/users"

export async function GET() {
  const currentUser = await getCurrentUser()

  if (!currentUser?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const users = await getUsers()
  return NextResponse.json({ users })
}
