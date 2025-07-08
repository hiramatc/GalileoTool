"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { trackSearch } from "@/lib/users"
import { UnifiedLayout } from "@/components/unified-layout"

// Financial particle component with currency symbols
const FinancialParticle = ({ delay, symbol }: { delay: number; symbol: string }) => (
  <div
    className="absolute text-emerald-400/20 text-xs font-mono animate-pulse select-none pointer-events-none"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${4 + Math.random() * 3}s`,
    }}
  >
    {symbol}
  </div>
)

// Chart pattern background
const ChartPattern = () => (
  <div className="absolute inset-0 opacity-5 pointer-events-none">
    <svg width="100%" height="100%" viewBox="0 0 400 200" className="w-full h-full">
      <path
        d="M0,150 Q50,120 100,130 T200,110 T300,90 T400,80"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="text-emerald-400"
      />
      <path
        d="M0,170 Q60,140 120,150 T240,130 T360,110 T400,100"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        className="text-blue-400"
      />
    </svg>
  </div>
)

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-600/30 animate-pulse">
    <div className="h-8 bg-slate-700/50 rounded-lg mb-6 w-1/3"></div>
    <div className="space-y-4">
      <div className="h-4 bg-slate-700/50 rounded w-full"></div>
      <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
      <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
      <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
      <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
    </div>
  </div>
)

const formatAIResponse = (text: string) => {
  // First, detect and replace URLs and emails BEFORE any other HTML transformations
  const formattedText = text
    // Convert URLs to clickable links (more precise regex)
    .replace(
      /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #10B981; text-decoration: underline; word-break: break-all; overflow-wrap: anywhere; transition: color 0.3s ease;" onmouseover="this.style.color=\'#059669\'" onmouseout="this.style.color=\'#10B981\'">$1</a>',
    )
    // Convert email addresses to clickable mailto links (more precise regex)
    .replace(
      /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
      '<a href="mailto:$1" style="color: #F59E0B; text-decoration: underline; word-break: break-all; overflow-wrap: anywhere; transition: color 0.3s ease;" onmouseover="this.style.color=\'#D97706\'" onmouseout="this.style.color=\'#F59E0B\'">$1</a>',
    )

  // Then apply other formatting transformations
  return formattedText
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #F59E0B;">$1</strong>')
    .replace(/\* {3}/g, "• ")
    .replace(/\n/g, "<br>")
    .replace(/ {4}/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
}

export default function ClientSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")
  const [financialParticles, setFinancialParticles] = useState<Array<{ id: number; symbol: string }>>([])

  // Generate financial particles on mount
  useEffect(() => {
    const symbols = ["₿", "$", "€", "£", "¥", "₿", "$", "€", "₿", "$"]
    setFinancialParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        symbol: symbols[i % symbols.length],
      })),
    )
  }, [])

  // Your n8n webhook URL
  const WEBHOOK_URL = "https://hiramtc.app.n8n.cloud/webhook/client-search"

  const searchClient = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a client name to search")
      return
    }

    setLoading(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchTerm,
        }),
      })

      if (!response.ok) {
        throw new Error("Search request failed")
      }

      const data = await response.json()
      // Track the search
      await trackSearch()
      displayResults(data, searchTerm)
    } catch (error) {
      console.error("Search error:", error)
      setError("Unable to search clients. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchClient()
    }
  }

  const displayResults = (data: any, searchTerm: string) => {
    console.log("Received data:", data) // Debug log

    // Handle different possible response formats
    let aiResponse = ""

    if (data) {
      // Try different possible data structures
      if (typeof data === "string") {
        aiResponse = data
      } else if (Array.isArray(data) && data.length > 0) {
        // Handle array response
        if (data[0].output) {
          aiResponse = data[0].output
        } else if (data[0].text) {
          aiResponse = data[0].text
        } else if (typeof data[0] === "string") {
          aiResponse = data[0]
        }
      } else if (data.output) {
        aiResponse = data.output
      } else if (data.text) {
        aiResponse = data.text
      } else if (data.response) {
        aiResponse = data.response
      }
    }

    console.log("Extracted AI response:", aiResponse) // Debug log

    if (!aiResponse || aiResponse.trim() === "") {
      setResults([])
      setError(`No clients matching "${searchTerm}" were found in the database.`)
      return
    }

    // Set results with the formatted response
    setResults([{ output: aiResponse }])
  }

  return (
    <UnifiedLayout title="Client Portfolio" currentPage="client-search">
      <div className="relative">
        {/* Financial Chart Pattern Background */}
        <ChartPattern />

        {/* Animated Financial Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {financialParticles.map((particle) => (
            <FinancialParticle key={particle.id} delay={particle.id * 0.2} symbol={particle.symbol} />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight tracking-tight">
              Client{" "}
              <span className="font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Portfolio
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 opacity-90 max-w-3xl mx-auto font-light leading-relaxed">
              Secure access to arbitrage trading records and exchange history
            </p>
            <div className="flex items-center justify-center gap-6 mb-16 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">₿</span>
                <span className="text-sm font-mono">CRYPTO</span>
                <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-amber-400">$</span>
                <span className="text-sm font-mono">FIAT</span>
              </div>
            </div>
          </div>

          {/* Enhanced Search Container */}
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-2xl mx-auto mb-12 border border-slate-600/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-slate-800/40 animate-float">
            <div className="flex gap-4 mb-6 max-md:flex-col">
              <Input
                type="text"
                placeholder="Search by client's name or business name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-4 md:p-5 text-lg bg-slate-700/50 text-white border border-slate-600/50 rounded-2xl focus:bg-slate-700/70 focus:border-amber-400/50 focus:shadow-2xl focus:scale-105 transition-all duration-300 font-mono placeholder:text-slate-400"
                disabled={loading}
              />
              <Button
                onClick={searchClient}
                disabled={loading}
                className="px-8 py-4 md:py-5 text-lg font-semibold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 border-none rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/25 hover:-translate-y-1 disabled:opacity-60 disabled:hover:transform-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                    <span className="font-mono">SEARCHING...</span>
                  </div>
                ) : (
                  <span className="font-mono">SEARCH PORTFOLIO</span>
                )}
              </Button>
            </div>

            {/* Enhanced Loading State */}
            {loading && (
              <div className="text-center py-8 animate-fade-in">
                <div className="flex justify-center items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="font-mono text-slate-300">Accessing secure database...</p>
              </div>
            )}
          </div>

          {/* Results Container */}
          {(results || error) && (
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              <div className="text-center mb-8">
                <div className="text-xl md:text-2xl opacity-90 font-light">
                  Portfolio data for "<span className="text-amber-400 font-mono">{searchTerm}</span>"
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 backdrop-blur-lg border border-red-600/30 rounded-2xl p-8 mb-6 text-center shadow-xl animate-shake">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-2xl font-semibold mb-4">Access Denied</h3>
                  <p className="text-lg opacity-90 mb-2">{error}</p>
                  <p className="text-sm opacity-70 font-mono">Verify client credentials and try again</p>
                </div>
              )}

              {loading && <LoadingSkeleton />}

              {results && !error && !loading && (
                <div className="bg-slate-800/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-slate-600/30 hover:bg-slate-800/40 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 shadow-2xl animate-float">
                  <div className="flex items-center gap-3 text-2xl md:text-3xl font-light mb-8 text-amber-400">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                    Portfolio Overview
                  </div>
                  <div
                    className="text-left leading-relaxed whitespace-pre-wrap text-sm md:text-lg font-light font-mono break-words overflow-wrap-anywhere"
                    style={{ wordBreak: "break-all", overflowWrap: "anywhere" }}
                    dangerouslySetInnerHTML={{
                      __html: formatAIResponse(results[0]?.output || "No information available"),
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Enhanced User Instructions */}
          {!results && !error && !loading && (
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-slate-600/30 shadow-2xl animate-float">
                <div className="flex items-center gap-3 text-2xl md:text-3xl font-light mb-8 text-amber-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Access Instructions
                </div>
                <div className="text-left space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-700/20 hover:bg-slate-700/30 transition-colors duration-300 border border-slate-600/20">
                    <span className="text-amber-400 font-bold text-2xl min-w-[2rem] font-mono">1.</span>
                    <p className="text-lg md:text-xl font-light">Search by client's name or business name</p>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-700/20 hover:bg-slate-700/30 transition-colors duration-300 border border-slate-600/20">
                    <span className="text-amber-400 font-bold text-2xl min-w-[2rem] font-mono">2.</span>
                    <p className="text-lg md:text-xl font-light">Search is case sensitive for security</p>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-700/20 hover:bg-slate-700/30 transition-colors duration-300 border border-slate-600/20">
                    <span className="text-amber-400 font-bold text-2xl min-w-[2rem] font-mono">3.</span>
                    <p className="text-lg md:text-xl font-light">Retry if connection fails</p>
                  </div>

                  <div className="border-t border-slate-600/30 pt-8 mt-10">
                    <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl p-6 border border-amber-500/20">
                      <p className="text-center font-light text-lg">
                        <span className="text-slate-300">Technical support:</span>{" "}
                        <a
                          href="mailto:hiram@galileocapital.io"
                          className="text-amber-400 hover:text-amber-300 underline transition-colors duration-300 font-medium"
                        >
                          hiram@galileocapital.io
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      </div>
    </UnifiedLayout>
  )
}

