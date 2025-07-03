"use client"

import { useState } from "react"

interface NavigationProps {
  currentPage: "client-search" | "us-banks" | "admin" | "create-contract"
  isAdmin?: boolean
}

export function Navigation({ currentPage, isAdmin = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      id: "client-search",
      name: "Client Search",
      href: "/",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      ),
      available: true,
    },
    {
      id: "create-contract",
      name: "Create Contract",
      href: "/create-contract",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      ),
      available: true,
    },
    {
      id: "us-banks",
      name: "US Banks",
      href: "/us-banks",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      available: true,
    },
    {
      id: "admin",
      name: "Admin Panel",
      href: "/admin",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
      ),
      available: isAdmin,
    },
  ]

  const availableItems = navigationItems.filter((item) => item.available)

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-3">
        {availableItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-colors duration-300 text-sm font-mono ${
              currentPage === item.id
                ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                : "bg-slate-800/50 hover:bg-slate-800/70 border-slate-600/30 text-slate-300 hover:text-white"
            }`}
          >
            {item.icon}
            <span>{item.name.replace(" ", "\u00A0")}</span>
          </a>
        ))}
        <a
          href="/logout"
          className="flex items-center gap-2 bg-red-900/30 hover:bg-red-900/50 px-4 py-3 rounded-2xl border border-red-600/30 transition-colors duration-300 text-sm font-mono text-red-400"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>LOGOUT</span>
        </a>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800/70 px-4 py-3 rounded-2xl border border-slate-600/30 transition-colors duration-300 text-sm font-mono"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>MENU</span>
        </button>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-600/30 shadow-2xl z-50">
            <div className="p-4 space-y-2">
              {availableItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 text-sm font-mono ${
                    currentPage === item.id
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              ))}
              <div className="border-t border-slate-600/30 pt-2 mt-2">
                <a
                  href="/logout"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-colors duration-300 text-sm font-mono"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>LOGOUT</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
