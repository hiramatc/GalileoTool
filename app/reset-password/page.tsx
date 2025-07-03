"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resetPasswordAction } from "./actions"
import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [state, action, isPending] = useActionState(resetPasswordAction, null)

  if (!token) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-semibold mb-4">Invalid Reset Link</h2>
        <p className="text-slate-400 mb-6">This password reset link is invalid or has expired.</p>
        <a href="/login" className="text-amber-400 hover:text-amber-300 underline transition-colors duration-300">
          Back to Login
        </a>
      </div>
    )
  }

  if (state?.success) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold mb-4">Password Reset Successful</h2>
        <p className="text-slate-400 mb-6">Your password has been updated successfully.</p>
        <a
          href="/login"
          className="inline-block bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 px-6 py-3 rounded-2xl font-mono transition-all duration-300"
        >
          LOGIN NOW
        </a>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
          New Password
        </label>
        <Input
          type="password"
          id="password"
          name="password"
          required
          minLength={8}
          className="w-full p-4 text-lg bg-slate-700/50 text-white border border-slate-600/50 rounded-2xl focus:bg-slate-700/70 focus:border-amber-400/50 transition-all duration-300 font-mono"
          placeholder="Enter new password"
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
          Confirm New Password
        </label>
        <Input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          required
          minLength={8}
          className="w-full p-4 text-lg bg-slate-700/50 text-white border border-slate-600/50 rounded-2xl focus:bg-slate-700/70 focus:border-amber-400/50 transition-all duration-300 font-mono"
          placeholder="Confirm new password"
          disabled={isPending}
        />
      </div>

      {state?.error && (
        <div className="bg-red-900/30 border border-red-600/30 rounded-2xl p-4 text-center">
          <p className="text-red-400">{state.error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 border-none rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/25 disabled:opacity-60"
      >
        {isPending ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
            <span className="font-mono">UPDATING...</span>
          </div>
        ) : (
          <span className="font-mono">RESET PASSWORD</span>
        )}
      </Button>

      <div className="text-center">
        <a
          href="/login"
          className="text-amber-400 hover:text-amber-300 underline text-sm transition-colors duration-300"
        >
          Back to Login
        </a>
      </div>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center relative overflow-hidden">
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

      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>

      <div className="bg-slate-800/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-md w-full mx-4 border border-slate-600/30 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-xim7Sf7mjX1q0kZdL8yllT6RrzLWCl.png"
            alt="GALILEO CAPITAL"
            className="h-12 w-auto mx-auto mb-6 filter brightness-0 invert opacity-90"
          />
          <h1 className="text-3xl font-light mb-2">Reset Password</h1>
          <p className="text-slate-400 font-mono text-sm">SECURE PASSWORD UPDATE</p>
        </div>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-mono">256-BIT ENCRYPTION</span>
          </div>
        </div>
      </div>
    </div>
  )
}
