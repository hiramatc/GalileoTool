"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addUserAction, deleteUserAction, updateUserAction } from "./actions"
import { useActionState } from "react"
import type { User } from "@/lib/users"
import { UsageChart } from "@/components/usage-chart"
import type { UsageStats } from "@/lib/users"
import { Navigation } from "@/components/navigation"

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [addState, addAction, isAddPending] = useActionState(addUserAction, null)
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteUserAction, null)
  const [updateState, updateAction, isUpdatePending] = useActionState(updateUserAction, null)

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  // Reload users when actions complete
  useEffect(() => {
    if (addState?.success || deleteState?.success || updateState?.success) {
      loadUsers()
      setShowAddUser(false)
      setEditingUser(null)
    }
  }, [addState, deleteState, updateState])

  const loadUsers = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([fetch("/api/users"), fetch("/api/usage-stats")])
      const usersData = await usersResponse.json()
      const statsData = await statsResponse.json()
      setUsers(usersData.users || [])
      setUsageStats(statsData.stats || [])
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-5">
        <div
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl relative z-10">
        {/* Mobile-Optimized Header */}
        <header className="mb-8">
          {/* Top row - Logo and title */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-xim7Sf7mjX1q0kZdL8yllT6RrzLWCl.png"
              alt="GALILEO CAPITAL"
              className="h-8 md:h-12 w-auto filter brightness-0 invert opacity-90"
            />
            <div>
              <h1 className="text-xl md:text-3xl font-light">Admin Panel</h1>
              <p className="text-slate-400 font-mono text-xs md:text-sm">USER MANAGEMENT</p>
            </div>
          </div>

          {/* Bottom row - Navigation buttons */}
          <div className="relative">
            <Navigation currentPage="admin" isAdmin={true} />
          </div>
        </header>

        {/* Mobile-Optimized Usage Analytics */}
        <div className="mb-8">
          <UsageChart data={usageStats} />
        </div>

        {/* Add User Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAddUser(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-4 rounded-2xl font-mono text-sm md:text-base"
          >
            + ADD NEW USER
          </Button>
        </div>

        {/* Mobile-Optimized Add User Form */}
        {showAddUser && (
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-8 border border-slate-600/30">
            <h2 className="text-xl md:text-2xl font-light mb-6 text-amber-400">Add New User</h2>
            <form action={addAction} className="space-y-4">
              <Input
                name="username"
                placeholder="Username"
                required
                className="w-full bg-slate-700/50 border-slate-600/50 text-white rounded-2xl p-4"
                disabled={isAddPending}
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full bg-slate-700/50 border-slate-600/50 text-white rounded-2xl p-4"
                disabled={isAddPending}
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full bg-slate-700/50 border-slate-600/50 text-white rounded-2xl p-4"
                disabled={isAddPending}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  disabled={isAddPending}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 px-6 py-4 rounded-2xl font-mono"
                >
                  {isAddPending ? "ADDING..." : "ADD USER"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-700/70 text-white px-6 py-4 rounded-2xl font-mono"
                >
                  CANCEL
                </Button>
              </div>
            </form>
            {addState?.error && (
              <div className="mt-4 bg-red-900/30 border border-red-600/30 rounded-2xl p-4">
                <p className="text-red-400 text-sm">{addState.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Mobile-Optimized Users List */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-600/30">
          <h2 className="text-xl md:text-2xl font-light mb-6 text-amber-400">Current Users ({users.length})</h2>

          {users.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg
                className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-base md:text-lg font-mono">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-slate-700/30 rounded-2xl p-4 md:p-6 border border-slate-600/20">
                  {/* Mobile-first user card layout */}
                  <div className="space-y-4">
                    {/* User info */}
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{user.username}</h3>
                      <p className="text-amber-400 font-mono text-sm break-all">{user.email}</p>
                      <p className="text-slate-400 text-xs md:text-sm font-mono mt-1">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      {user.lastLogin && (
                        <p className="text-slate-400 text-xs md:text-sm font-mono">
                          Last login: {new Date(user.lastLogin).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-slate-400 text-xs md:text-sm font-mono">Login count: {user.loginCount}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => setEditingUser(user)}
                        className="flex-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-4 py-3 rounded-xl font-mono text-sm"
                      >
                        EDIT USER
                      </Button>
                      <form action={deleteAction} className="flex-1">
                        <input type="hidden" name="userId" value={user.id} />
                        <Button
                          type="submit"
                          disabled={isDeletePending}
                          className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-3 rounded-xl font-mono text-sm"
                          onClick={(e) => {
                            if (!confirm(`Delete user "${user.username}"?`)) {
                              e.preventDefault()
                            }
                          }}
                        >
                          {isDeletePending ? "DELETING..." : "DELETE USER"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile-Optimized Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 w-full max-w-md border border-slate-600/30">
              <h2 className="text-xl md:text-2xl font-light mb-6 text-amber-400">Edit User</h2>
              <form action={updateAction} className="space-y-4">
                <input type="hidden" name="userId" value={editingUser.id} />
                <Input
                  name="username"
                  defaultValue={editingUser.username}
                  placeholder="Username"
                  required
                  className="w-full bg-slate-700/50 border-slate-600/50 text-white rounded-2xl p-4"
                  disabled={isUpdatePending}
                />
                <Input
                  name="email"
                  type="email"
                  defaultValue={editingUser.email}
                  placeholder="Email"
                  required
                  className="w-full bg-slate-700/50 border-slate-600/50 text-white rounded-2xl p-4"
                  disabled={isUpdatePending}
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="New Password (leave blank to keep current)"
                  className="w-full bg-slate-700/50 border-slate-600/50 text-white rounded-2xl p-4"
                  disabled={isUpdatePending}
                />
                <div className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    disabled={isUpdatePending}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 py-4 rounded-2xl font-mono"
                  >
                    {isUpdatePending ? "UPDATING..." : "UPDATE USER"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="w-full bg-slate-700/50 hover:bg-slate-700/70 text-white py-4 rounded-2xl font-mono"
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
              {updateState?.error && (
                <div className="mt-4 bg-red-900/30 border border-red-600/30 rounded-2xl p-4">
                  <p className="text-red-400 text-sm">{updateState.error}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
