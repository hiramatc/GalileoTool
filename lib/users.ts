"use server"

import { cookies } from "next/headers"

export interface User {
  id: string
  username: string
  email: string
  password: string
  isAdmin: boolean
  createdAt: string
  lastLogin?: string
  loginCount: number
}

export interface UsageStats {
  date: string
  searches: number
  logins: number
}

// Initial users database
const INITIAL_USERS: User[] = [
  {
    id: "admin-1",
    username: "hiram",
    email: "hiram@galileocapital.io",
    password: "Sl@y3r952/",
    isAdmin: true,
    createdAt: new Date().toISOString(),
    loginCount: 0,
  },
  {
    id: "user-1",
    username: "mxiques",
    email: "max@galileo.finance",
    password: "mxiques1234/",
    isAdmin: false,
    createdAt: new Date().toISOString(),
    loginCount: 0,
  },
  {
    id: "user-2",
    username: "alberto",
    email: "alberto@galileocapital.io",
    password: "albertoalfa1234/",
    isAdmin: false,
    createdAt: new Date().toISOString(),
    loginCount: 0,
  },
]

// In a real app, this would be a database
const users: User[] = [...INITIAL_USERS]
const usageStats: UsageStats[] = []

export async function getUsers(): Promise<User[]> {
  return users.filter((user) => !user.isAdmin)
}

export async function getAllUsers(): Promise<User[]> {
  return users
}

export async function findUser(usernameOrEmail: string): Promise<User | null> {
  return users.find((user) => user.username === usernameOrEmail || user.email === usernameOrEmail) || null
}

export async function validateUser(usernameOrEmail: string, password: string): Promise<User | null> {
  const user = await findUser(usernameOrEmail)
  if (user && user.password === password) {
    // Update login stats
    user.lastLogin = new Date().toISOString()
    user.loginCount += 1

    // Track daily login stats
    const today = new Date().toISOString().split("T")[0]
    const todayStats = usageStats.find((stat) => stat.date === today)
    if (todayStats) {
      todayStats.logins += 1
    } else {
      usageStats.push({ date: today, searches: 0, logins: 1 })
    }

    return user
  }
  return null
}

export async function trackSearch(): Promise<void> {
  const today = new Date().toISOString().split("T")[0]
  const todayStats = usageStats.find((stat) => stat.date === today)
  if (todayStats) {
    todayStats.searches += 1
  } else {
    usageStats.push({ date: today, searches: 1, logins: 0 })
  }
}

export async function getUsageStats(): Promise<UsageStats[]> {
  // Return last 30 days of stats
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return usageStats
    .filter((stat) => new Date(stat.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function addUser(userData: Omit<User, "id" | "createdAt" | "loginCount">): Promise<User> {
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
    loginCount: 0,
  }
  users.push(newUser)
  return newUser
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return null

  users[userIndex] = { ...users[userIndex], ...updates }
  return users[userIndex]
}

export async function deleteUser(id: string): Promise<boolean> {
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return false

  users.splice(userIndex, 1)
  return true
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("galileo_auth")

  if (!authCookie) return null

  try {
    const userData = JSON.parse(authCookie.value)
    return await findUser(userData.username)
  } catch {
    return null
  }
}

// Password reset functionality
const resetTokens = new Map<string, { email: string; expires: number }>()

export async function generateResetToken(email: string): Promise<string | null> {
  const user = users.find((u) => u.email === email)
  if (!user) return null

  const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const expires = Date.now() + 60 * 60 * 1000 // 1 hour

  resetTokens.set(token, { email, expires })

  // In a real app, you'd send an actual email here
  console.log(`Password reset link: ${process.env.VERCEL_URL || "http://localhost:3000"}/reset-password?token=${token}`)

  return token
}

export async function validateResetToken(token: string): Promise<string | null> {
  const tokenData = resetTokens.get(token)
  if (!tokenData || tokenData.expires < Date.now()) {
    resetTokens.delete(token)
    return null
  }
  return tokenData.email
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const email = await validateResetToken(token)
  if (!email) return false

  const user = users.find((u) => u.email === email)
  if (!user) return false

  user.password = newPassword
  resetTokens.delete(token)
  return true
}
