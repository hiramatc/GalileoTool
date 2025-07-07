"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, Search, Filter, AlertCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface Transaction {
  date: string
  bank: string
  account: string
  category: string
  amount: number
  detail: string
  isToday: boolean
}

interface BankingData {
  processedData: Transaction[]
  todayTransactions: Transaction[]
  accountSummary: Record<string, { bank: string; account: string; total: number; count: number }>
  bankSummary: Record<
    string,
    { total: number; count: number; accounts: Record<string, { total: number; count: number }> }
  >
  categorySummary: Record<string, { total: number; count: number }>
  totalTransactions: number
  todayTransactionCount: number
  monthTotal: number
  month: string
  todayDate: string
  updateTime: string
  availableBanks: string[]
  availableAccounts: string[]
  availableCategories: string[]
}

export default function USBanksDashboard() {
  const [data, setData] = useState<BankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBank, setSelectedBank] = useState<string>("all")
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [amountFilter, setAmountFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("last15days")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")

  const allBanks = ["Chase", "PNC", "Relay", "US Bank", "Wise"]
  const allAccounts = ["Felade", "WC", "Legatum", "Finvex", "OneStar"]
  const allCategories = [
    "Bank Charge",
    "Current Balance",
    "Deposit",
    "Hold",
    "Incoming Wire",
    "Miscellaneous",
    "Outgoing Wire",
    "Transfer",
    "Withdrawal",
    "Zelle",
  ]

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const years = ["2023", "2024", "2025", "2026"]

  // Check if user is admin
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

  // Fetch existing banking data
  const fetchExistingData = async () => {
    try {
      console.log("Fetching existing US Banks data...")
      const response = await fetch("/api/webhooks/us-banks")
      const result = await response.json()

      if (result.success && result.data) {
        console.log("US Banks data received:", result.data)
        setData(result.data)
        setFilteredTransactions(result.data.processedData || [])
        setRefreshError(null)
        return true
      } else {
        console.error("Failed to fetch banking data:", result.message)
        setRefreshError(result.message || "Failed to fetch data")
        return false
      }
    } catch (error) {
      console.error("Error fetching banking data:", error)
      setRefreshError(error instanceof Error ? error.message : "Network error")
      return false
    }
  }

  // Enhanced refresh function with n8n trigger
  const refreshData = async () => {
    setRefreshing(true)
    setRefreshError(null)

    try {
      console.log("Starting US Banks refresh...")

      // First, try to trigger n8n workflow
      try {
        console.log("Attempting to trigger n8n workflow...")
        const triggerResponse = await fetch("/api/trigger-refresh/us-banks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const triggerResult = await triggerResponse.json()
        console.log("Trigger response:", triggerResult)

        if (triggerResponse.ok && triggerResult.success) {
          console.log("n8n workflow triggered successfully, waiting for data...")
          // Wait for n8n to process
          await new Promise((resolve) => setTimeout(resolve, 3000))
        } else {
          console.warn("n8n trigger failed:", triggerResult.message)
          setRefreshError(`n8n trigger failed: ${triggerResult.message}`)
        }
      } catch (triggerError) {
        console.warn("n8n trigger error:", triggerError)
        setRefreshError(`n8n trigger error: ${triggerError instanceof Error ? triggerError.message : "Unknown error"}`)
      }

      // Always try to fetch the latest data (whether n8n worked or not)
      const dataFetched = await fetchExistingData()

      if (!dataFetched) {
        throw new Error("Failed to fetch updated data")
      }

      console.log("Refresh completed successfully")
    } catch (error) {
      console.error("Refresh failed:", error)
      setRefreshError(error instanceof Error ? error.message : "Refresh failed")
    } finally {
      setRefreshing(false)
    }
  }

  // Initial data fetch
  const fetchData = async () => {
    setLoading(true)
    await fetchExistingData()
    setLoading(false)
  }

  // Parse date for filtering
  const parseDate = (dateString: string) => {
    const parts = dateString.split("-")
    const day = Number.parseInt(parts[0])
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames.indexOf(parts[1])
    const year = Number.parseInt(parts[2])
    return new Date(year, month, day)
  }

  // Apply filters
  useEffect(() => {
    if (!data) return

    let filtered = data.processedData

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.detail.toLowerCase().includes(searchLower) ||
          t.bank.toLowerCase().includes(searchLower) ||
          t.account.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower),
      )
    }

    if (selectedBank !== "all") {
      filtered = filtered.filter((t) => t.bank === selectedBank)
    }

    if (selectedAccount !== "all") {
      filtered = filtered.filter((t) => t.account === selectedAccount)
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    if (amountFilter !== "all") {
      switch (amountFilter) {
        case "positive":
          filtered = filtered.filter((t) => t.amount > 0)
          break
        case "negative":
          filtered = filtered.filter((t) => t.amount < 0)
          break
        case "large":
          filtered = filtered.filter((t) => Math.abs(t.amount) >= 1000)
          break
        case "small":
          filtered = filtered.filter((t) => Math.abs(t.amount) < 1000)
          break
        case "over10k":
          filtered = filtered.filter((t) => Math.abs(t.amount) >= 10000)
          break
      }
    }

    if (dateFilter !== "all") {
      const today = new Date()
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((t) => t.isToday)
          break
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((t) => parseDate(t.date) >= weekAgo)
          break
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((t) => parseDate(t.date) >= monthAgo)
          break
        case "last15days":
          const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((t) => parseDate(t.date) >= fifteenDaysAgo)
          break
      }
    }

    if (selectedMonth !== "all") {
      const monthIndex = months.indexOf(selectedMonth)
      filtered = filtered.filter((t) => parseDate(t.date).getMonth() === monthIndex)
    }

    if (selectedYear !== "all") {
      const year = Number.parseInt(selectedYear)
      filtered = filtered.filter((t) => parseDate(t.date).getFullYear() === year)
    }

    setFilteredTransactions(filtered)
  }, [
    data,
    searchTerm,
    selectedBank,
    selectedAccount,
    selectedCategory,
    amountFilter,
    dateFilter,
    selectedMonth,
    selectedYear,
  ])

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedBank("all")
    setSelectedAccount("all")
    setSelectedCategory("all")
    setAmountFilter("all")
    setDateFilter("last15days")
    setSelectedMonth("all")
    setSelectedYear("all")
  }

  // Export filtered data
  const exportData = () => {
    const csvContent = [
      ["Date", "Bank", "Account", "Category", "Amount", "Detail"],
      ...filteredTransactions.map((t) => [t.date, t.bank, t.account, t.category, t.amount.toString(), t.detail]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `us-banks-filtered-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading banking data...</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-xim7Sf7mjX1q0kZdL8yllT6RrzLWCl.png"
                alt="GALILEO CAPITAL"
                className="h-8 md:h-12 w-auto filter brightness-0 invert opacity-90"
              />
              <div>
                <h1 className="text-xl md:text-3xl font-light text-white">US Banks Dashboard</h1>
                <p className="text-slate-400 font-mono text-xs md:text-sm">REAL-TIME BANKING DATA</p>
              </div>
            </div>
            <div className="relative">
              <Navigation currentPage="us-banks" isAdmin={isAdmin} />
            </div>
          </header>

          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-6xl mb-4">🏦</div>
            <h2 className="text-2xl font-semibold mb-4 text-white">No Banking Data Available Yet</h2>
            <p className="text-gray-300 mb-6 max-w-md">
              Your n8n workflow hasn't sent any data to the webhook yet. Make sure your automation is running and
              sending data to the correct endpoint.
            </p>

            {refreshError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg max-w-md">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Error: {refreshError}</span>
                </div>
              </div>
            )}

            <Button onClick={refreshData} className="bg-blue-600 hover:bg-blue-700" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-xim7Sf7mjX1q0kZdL8yllT6RrzLWCl.png"
              alt="GALILEO CAPITAL"
              className="h-8 md:h-12 w-auto filter brightness-0 invert opacity-90"
            />
            <div>
              <h1 className="text-xl md:text-3xl font-light text-white">US Banks Dashboard</h1>
              <p className="text-slate-400 font-mono text-xs md:text-sm">REAL-TIME BANKING DATA</p>
            </div>
          </div>
          <div className="relative">
            <Navigation currentPage="us-banks" isAdmin={isAdmin} />
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.totalTransactions}</div>
              <p className="text-xs text-gray-300 mt-1">{data.month}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Today's Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.todayTransactionCount}</div>
              <p className="text-xs text-gray-300 mt-1">Today</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Month Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${data.monthTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-300 mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Bank Account Totals</CardTitle>
            <CardDescription className="text-gray-300">Active accounts with balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(data.accountSummary || {})
                .filter(([key, account]) => {
                  const hideAccounts = ["Chase-Felade", "PNC-WC", "Chase-WC"]
                  return account.count > 0 && !account.bank.includes("Relay") && !hideAccounts.includes(key)
                })
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([key, account]) => (
                  <div key={key} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-medium text-gray-300">{account.bank}</div>
                    <div className="text-lg font-semibold text-white">{account.account}</div>
                    <div className={`text-xl font-bold ${account.total >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ${account.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-400">{account.count} transactions</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Controls */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Bank</label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Banks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Banks</SelectItem>
                    {allBanks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Account</label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {allAccounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        {account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {allCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Amount</label>
                <Select value={amountFilter} onValueChange={setAmountFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Amounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Amounts</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="large">≥ $1,000</SelectItem>
                    <SelectItem value="small">{"< $1,000"}</SelectItem>
                    <SelectItem value="over10k">≥ $10,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="last15days">Last 15 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {refreshError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Refresh Error: {refreshError}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Clear Filters
              </Button>
              <Button onClick={refreshData} className="bg-blue-600 hover:bg-blue-700" disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh Data"}
              </Button>
              <Button onClick={exportData} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">
              Transactions ({filteredTransactions.length} of {data.totalTransactions})
            </CardTitle>
            <CardDescription className="text-gray-300">
              Last updated: {new Date(data.updateTime).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Bank</TableHead>
                    <TableHead className="text-gray-300">Account</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300 text-right">Amount</TableHead>
                    <TableHead className="text-gray-300">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                        No transactions match your current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction, index) => (
                      <TableRow key={index} className="border-white/10">
                        <TableCell className="text-white">
                          {transaction.isToday && (
                            <Badge variant="secondary" className="mr-2 bg-blue-600">
                              Today
                            </Badge>
                          )}
                          {transaction.date}
                        </TableCell>
                        <TableCell className="text-white">{transaction.bank}</TableCell>
                        <TableCell className="text-white">{transaction.account}</TableCell>
                        <TableCell className="text-white">
                          <Badge variant="outline" className="border-white/20 text-white">
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            transaction.amount >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          ${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">{transaction.detail}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

