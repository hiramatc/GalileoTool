"use server"

import { resetPassword } from "@/lib/users"

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  const success = await resetPassword(token, password)

  if (success) {
    return { success: "Password reset successfully" }
  } else {
    return { error: "Invalid or expired reset token" }
  }
}
