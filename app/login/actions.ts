"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateUser, generateResetToken } from "@/lib/users"

export async function loginAction(prevState: any, formData: FormData) {
  const usernameOrEmail = formData.get("usernameOrEmail") as string
  const password = formData.get("password") as string

  const user = await validateUser(usernameOrEmail, password)

  if (user) {
    // Set authentication cookie
    const cookieStore = await cookies()
    cookieStore.set(
      "galileo_auth",
      JSON.stringify({
        username: user.username,
        isAdmin: user.isAdmin,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      },
    )

    if (user.isAdmin) {
      redirect("/admin")
    } else {
      redirect("/")
    }
  } else {
    return {
      error: "Invalid credentials. Access denied.",
    }
  }
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string

  const token = await generateResetToken(email)

  if (token) {
    return {
      success: "If an account with that email exists, you will receive a password reset link.",
    }
  } else {
    return {
      success: "If an account with that email exists, you will receive a password reset link.",
    }
  }
}
