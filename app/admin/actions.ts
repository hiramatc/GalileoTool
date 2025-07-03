"use server"

import { addUser, deleteUser, updateUser, getCurrentUser } from "@/lib/users"
import { redirect } from "next/navigation"

export async function addUserAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.isAdmin) {
    redirect("/login")
  }

  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await addUser({
      username,
      email,
      password,
      isAdmin: false,
    })

    return { success: "User added successfully" }
  } catch (error) {
    return { error: "Failed to add user" }
  }
}

export async function deleteUserAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.isAdmin) {
    redirect("/login")
  }

  const userId = formData.get("userId") as string

  try {
    await deleteUser(userId)
    return { success: "User deleted successfully" }
  } catch (error) {
    return { error: "Failed to delete user" }
  }
}

export async function updateUserAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.isAdmin) {
    redirect("/login")
  }

  const userId = formData.get("userId") as string
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const updates: any = { username, email }
    if (password) {
      updates.password = password
    }

    await updateUser(userId, updates)
    return { success: "User updated successfully" }
  } catch (error) {
    return { error: "Failed to update user" }
  }
}
