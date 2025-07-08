"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Menu, X, LogOut, BarChart3, Wrench, Shield } from "lucide-react"
import Link from "next/link"

interface UnifiedLayoutProps {
  children: React.ReactNode
  title: string
  currentPage: string
}

export function UnifiedLayout({ children, title, currentPage }: UnifiedLayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch("/api/current-user")
        if (response.ok) {
          const userData = await response.json()
          setIsAdmin(userData.isAdmin || false)
        }
      } catch (error) {
        console.error("Error checking user role:", error)
      }
    }
    checkUserRole()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5">
        <div
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />

      {/* Header */}
      <header className="relative z-50 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-xim7Sf7mjX1q0kZdL8yllT6RrzLWCl.png"
                alt="GALILEO CAPITAL"
                className="h-8 w-auto filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
              <h1 className="text-xl font-light text-white">{title}</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {/* Dashboards Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-slate-700/50 px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboards
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-600 text-white">
                  <DropdownMenuItem asChild>
                    <Link href="/us-banks" className="cursor-pointer">
                      US Banks Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cr-banks" className="cursor-pointer">
                      CR Banks Dashboard
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-slate-700/50 px-4 py-2 rounded-xl transition-all duration-300"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Tools
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-600 text-white">
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer">
                      Client Search
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/create-contract" className="cursor-pointer">
                      Contract Generator
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Admin Dropdown (if admin) */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-slate-700/50 px-4 py-2 rounded-xl transition-all duration-300"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 border-slate-600 text-white">
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/test-data" className="cursor-pointer">
                        Test Data
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Logout */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-white hover:bg-red-600/20 hover:text-red-400 px-4 py-2 rounded-xl transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="md:hidden text-white hover:bg-slate-700/50 p-2 rounded-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-700/50">
              <div className="space-y-2">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-400 mb-2">Dashboards</p>
                  <div className="space-y-1 ml-4">
                    <Link
                      href="/us-banks"
                      className="block py-2 text-white hover:text-amber-400 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      US Banks Dashboard
                    </Link>
                    <Link
                      href="/cr-banks"
                      className="block py-2 text-white hover:text-amber-400 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      CR Banks Dashboard
                    </Link>
                  </div>
                </div>

                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-400 mb-2">Tools</p>
                  <div className="space-y-1 ml-4">
                    <Link
                      href="/"
                      className="block py-2 text-white hover:text-amber-400 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Client Search
                    </Link>
                    <Link
                      href="/create-contract"
                      className="block py-2 text-white hover:text-amber-400 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contract Generator
                    </Link>
                  </div>
                </div>

                {isAdmin && (
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-400 mb-2">Admin</p>
                    <div className="space-y-1 ml-4">
                      <Link
                        href="/admin"
                        className="block py-2 text-white hover:text-amber-400 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                      <Link
                        href="/test-data"
                        className="block py-2 text-white hover:text-amber-400 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Test Data
                      </Link>
                    </div>
                  </div>
                )}

                <div className="px-4 py-2 border-t border-slate-700/50">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-red-600/20 hover:text-red-400 px-0 py-2 rounded-xl transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}

