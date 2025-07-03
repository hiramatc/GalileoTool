"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginAction, forgotPasswordAction } from "./actions"
import { useActionState, useState } from "react"

export default function LoginPage() {
  const [loginState, loginActionHandler, isLoginPending] = useActionState(loginAction, null)
  const [forgotState, forgotActionHandler, isForgotPending] = useActionState(forgotPasswordAction, null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

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
          <h1 className="text-3xl font-light mb-2">{showForgotPassword ? "Reset Password" : "Secure Access"}</h1>
          <p className="text-slate-400 font-mono text-sm">
            {showForgotPassword ? "ENTER YOUR EMAIL ADDRESS" : "AUTHORIZED PERSONNEL ONLY"}
          </p>
        </div>

        {!showForgotPassword ? (
          /* Login Form */
          <form action={loginActionHandler} className="space-y-6">
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-slate-300 mb-2">
                Username or Email
              </label>
              <Input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                required
                className="w-full p-4 text-lg bg-slate-700/50 text-white border border-slate-600/50 rounded-2xl focus:bg-slate-700/70 focus:border-amber-400/50 transition-all duration-300 font-mono"
                placeholder="Enter username or email"
                disabled={isLoginPending}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                required
                className="w-full p-4 text-lg bg-slate-700/50 text-white border border-slate-600/50 rounded-2xl focus:bg-slate-700/70 focus:border-amber-400/50 transition-all duration-300 font-mono"
                placeholder="Enter password"
                disabled={isLoginPending}
              />
            </div>

            {loginState?.error && (
              <div className="bg-red-900/30 border border-red-600/30 rounded-2xl p-4 text-center">
                <p className="text-red-400">{loginState.error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoginPending}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 border-none rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/25 disabled:opacity-60"
            >
              {isLoginPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                  <span className="font-mono">AUTHENTICATING...</span>
                </div>
              ) : (
                <span className="font-mono">SECURE LOGIN</span>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-amber-400 hover:text-amber-300 underline text-sm transition-colors duration-300"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          /* Forgot Password Form */
          <form action={forgotActionHandler} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                className="w-full p-4 text-lg bg-slate-700/50 text-white border border-slate-600/50 rounded-2xl focus:bg-slate-700/70 focus:border-amber-400/50 transition-all duration-300 font-mono"
                placeholder="Enter your email"
                disabled={isForgotPending}
              />
            </div>

            {forgotState?.success && (
              <div className="bg-emerald-900/30 border border-emerald-600/30 rounded-2xl p-4 text-center">
                <p className="text-emerald-400">{forgotState.success}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isForgotPending}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 border-none rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/25 disabled:opacity-60"
            >
              {isForgotPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                  <span className="font-mono">SENDING...</span>
                </div>
              ) : (
                <span className="font-mono">SEND RESET LINK</span>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-amber-400 hover:text-amber-300 underline text-sm transition-colors duration-300"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

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
