"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addUserAction, deleteUserAction, updateUserAction } from "./actions"
import { useActionState } from "react"
import type { User } from "@/lib/users"
import { UsageChart } from "@/components/usage-chart"
import type { UsageStats } from "@/lib/users"
import { UnifiedLayout } from "@/components/unified-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Users } from "lucide-react"

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
    <UnifiedLayout title="Admin Panel" currentPage="admin">
      {/* Usage Analytics */}
      <div className="mb-8">
        <UsageChart data={usageStats} />
      </div>

      {/* Add User Button */}
      <div className="mb-6">
        <Button
          onClick={() => setShowAddUser(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-600/30 mb-8 hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-400" />
              Add New User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addAction} className="space-y-4">
              <Input
                name="username"
                placeholder="Username"
                required
                className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl p-4 focus:border-amber-400/50 transition-all duration-300"
                disabled={isAddPending}
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl p-4 focus:border-amber-400/50 transition-all duration-300"
                disabled={isAddPending}
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl p-4 focus:border-amber-400/50 transition-all duration-300"
                disabled={isAddPending}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  disabled={isAddPending}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 px-6 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  {isAddPending ? "Adding..." : "Add User"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-700/70 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
            {addState?.error && (
              <div className="mt-4 bg-red-900/30 border border-red-600/30 rounded-xl p-4">
                <p className="text-red-400 text-sm">{addState.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-600/30 hover:bg-slate-800/40 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-400" />
            Current Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-slate-700/30 rounded-xl p-4 sm:p-6 border border-slate-600/20 hover:bg-slate-700/40 transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* User info */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{user.username}</h3>
                      <p className="text-amber-400 font-mono text-sm break-all">{user.email}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs sm:text-sm text-slate-400 font-mono">
                        <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                        {user.lastLogin && <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>}
                        <span>Login count: {user.loginCount}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => setEditingUser(user)}
                        className="flex-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </Button>
                      <form action={deleteAction} className="flex-1">
                        <input type="hidden" name="userId" value={user.id} />
                        <Button
                          type="submit"
                          disabled={isDeletePending}
                          className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                          onClick={(e) => {
                            if (!confirm(`Delete user "${user.username}"?`)) {
                              e.preventDefault()
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeletePending ? "Deleting..." : "Delete User"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/30 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-400" />
                Edit User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateAction} className="space-y-4">
                <input type="hidden" name="userId" value={editingUser.id} />
                <Input
                  name="username"
                  defaultValue={editingUser.username}
                  placeholder="Username"
                  required
                  className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl p-4 focus:border-amber-400/50 transition-all duration-300"
                  disabled={isUpdatePending}
                />
                <Input
                  name="email"
                  type="email"
                  defaultValue={editingUser.email}
                  placeholder="Email"
                  required
                  className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl p-4 focus:border-amber-400/50 transition-all duration-300"
                  disabled={isUpdatePending}
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="New Password (leave blank to keep current)"
                  className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl p-4 focus:border-amber-400/50 transition-all duration-300"
                  disabled={isUpdatePending}
                />
                <div className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    disabled={isUpdatePending}
                    className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    {isUpdatePending ? "Updating..." : "Update User"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="bg-slate-700/50 hover:bg-slate-700/70 text-white py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
              {updateState?.error && (
                <div className="mt-4 bg-red-900/30 border border-red-600/30 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{updateState.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </UnifiedLayout>
  )
}

