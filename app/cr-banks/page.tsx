"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Transaction {
  date: string
  bank: string
  account: string
  amount: number
  description: string
  category: string
}

interface CRBankingData {
  totalTransactions: number
  yearlyTotal: number
  limitPercentage: number
  alertStatus: string
  updateTime: string
  transactions?: Transaction[] // Make optional
  monthlyProgress?: Array<{
    // Make optional
    month: string
    amount: number
    projected?: number
  }>
}

const YEARLY_LIMIT = 17000000 // $17 million limit

export default function CRBanksDashboard() {
  const [data, setData] = useState<CRBankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  // Filter states
  const [dateFilter, setDateFilter] = useState<string>("last30days")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")

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

  // Fetch CR banking data
  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/webhooks/cr-banks")
      const result = await response.json()

      if (result.success) {
        console.log("CR Banks data received:", result.data) // Debug log
        setData(result.data)
        setFilteredTransactions(result.data.transactions || [])
      } else {
        console.error("Failed to fetch CR banking data:", result.message)
      }
    } catch (error) {
      console.error("Error fetching CR banking data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Parse date for filtering
  const parseDate = (dateString: string) => {
    return new Date(dateString)
  }

  // Apply filters (only if transactions exist)
  useEffect(() => {
    if (!data?.transactions) {
      setFilteredTransactions([])
      return
    }

    let filtered = data.transactions

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date()

      switch (dateFilter) {
        case "last30days":
          const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((t) => parseDate(t.date) >= thirtyDaysAgo)
          break
        case "last7days":
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((t) => parseDate(t.date) >= sevenDaysAgo)
          break
        case "last90days":
          const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((t) => parseDate(t.date) >= ninetyDaysAgo)
          break
      }
    }

    // Month filter
    if (selectedMonth !== "all") {
      const monthIndex = months.indexOf(selectedMonth)
      filtered = filtered.filter((t) => parseDate(t.date).getMonth() === monthIndex)
    }

    // Year filter
    if (selectedYear !== "all") {
      const year = Number.parseInt(selectedYear)
      filtered = filtered.filter((t) => parseDate(t.date).getFullYear() === year)
    }

    setFilteredTransactions(filtered)
  }, [data, dateFilter, selectedMonth, selectedYear])

  // Clear filters
  const clearFilters = () => {
    setDateFilter("last30days")
    setSelectedMonth("all")
    setSelectedYear("all")
  }

  // Export filtered data (only if transactions exist)
  const exportData = () => {
    if (!filteredTransactions.length) {
      alert("No transaction data available to export")
      return
    }

    const csvContent = [
      ["Date", "Bank", "Account", "Amount", "Description", "Category"],
      ...filteredTransactions.map((t) => [t.date, t.bank, t.account, t.amount.toString(), t.description, t.category]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cr-banks-filtered-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Calculate remaining amount and get alert color
  const remainingAmount = YEARLY_LIMIT - (data?.yearlyTotal || 0)
  const getAlertColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "green":
        return "text-green-400"
      case "yellow":
        return "text-yellow-400"
      case "red":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  // Generate simple chart data based on current progress
  const generateSimpleChartData = () => {
    if (!data) return []

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Create a simple progress chart showing current position vs limit
    return [
      { month: "Start", amount: 0, limit: YEARLY_LIMIT },
      { month: "Current", amount: data.yearlyTotal, limit: YEARLY_LIMIT },
      { month: "Limit", amount: YEARLY_LIMIT, limit: YEARLY_LIMIT },
    ]
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading CR banking data...</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
          {/* Header with Navigation */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-xim7Sf7mjX1q0kZdL8yllT6RrzLWCl.png"
                alt="GALILEO CAPITAL"
                className="h-8 md:h-12 w-auto filter brightness-0 invert opacity-90"
              />
              <div>
                <h1 className="text-xl md:text-3xl font-light text-white">CR Banks Dashboard</h1>
                <p className="text-slate-400 font-mono text-xs md:text-sm">COSTA RICA BANKING LIMITS</p>
              </div>
            </div>
            <div className="relative">
              <Navigation currentPage="cr-banks" isAdmin={isAdmin} />
            </div>
          </header>

          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-6xl mb-4">🏛️</div>
            <h2 className="text-2xl font-semibold mb-4 text-white">No CR Banking Data Available Yet</h2>
            <p className="text-gray-300 mb-6 max-w-md">
              Your n8n workflow hasn't sent any data to the CR Banks webhook yet. Make sure your automation is running
              and sending data to the correct endpoint.
            </p>
            <Button onClick={fetchData} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
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
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with Navigation */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-xim7Sf7mjX1q0kZdL8yllT6RrzLWCl.png"
              alt="GALILEO CAPITAL"
              className="h-8 md:h-12 w-auto filter brightness-0 invert opacity-90"
            />
            <div>
              <h1 className="text-xl md:text-3xl font-light text-white">CR Banks Dashboard</h1>
              <p className="text-slate-400 font-mono text-xs md:text-sm">COSTA RICA BANKING LIMITS</p>
            </div>
          </div>
          <div className="relative">
            <Navigation currentPage="cr-banks" isAdmin={isAdmin} />
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Transacted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${data.yearlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-300 mt-1">This year</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Remaining Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remainingAmount > 0 ? "text-green-400" : "text-red-400"}`}>
                ${remainingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-300 mt-1">Until $17M limit</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${getAlertColor(data.alertStatus)}`} />
                Percentage Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getAlertColor(data.alertStatus)}`}>
                {data.limitPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Status: <span className={getAlertColor(data.alertStatus)}>{data.alertStatus?.toUpperCase()}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart - Simple version */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progress Toward $17M Limit
            </CardTitle>
            <CardDescription className="text-gray-300">
              Current position relative to the yearly transaction limit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateSimpleChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tick={{ fontSize: 12 }} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                      name === "amount" ? "Current Amount" : "Limit",
                    ]}
                    labelStyle={{ color: "#000" }}
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                    name="Current Amount"
                  />
                  <Line
                    type="monotone"
                    dataKey="limit"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                    name="$17M Limit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Data Status Card */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Data Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">✅ Summary Data Available</h4>
                <p className="text-sm text-slate-300">
                  Total transactions, yearly total, percentage, and alert status are being tracked successfully.
                </p>
              </div>

              <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
                <h4 className="text-amber-400 font-semibold mb-2">⚠️ Detailed Data Pending</h4>
                <p className="text-sm text-slate-300">
                  Individual transaction records and monthly breakdowns will appear here when your n8n workflow sends
                  them.
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button onClick={fetchData} className="bg-green-600 hover:bg-green-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button
                onClick={() => console.log("Current data:", data)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Debug Data
              </Button>
            </div>

            <div className="mt-4 bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-slate-300 font-semibold mb-2">Last Update:</h4>
              <p className="text-slate-400 text-sm font-mono">
                {data.updateTime ? new Date(data.updateTime).toLocaleString() : "No timestamp available"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Section - Only show if data exists */}
        {data.transactions && data.transactions.length > 0 ? (
          <>
            {/* Filters */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Transaction Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Date Range Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Date Range</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="last7days">Last 7 Days</SelectItem>
                        <SelectItem value="last30days">Last 30 Days</SelectItem>
                        <SelectItem value="last90days">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Month Filter */}
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

                  {/* Year Filter */}
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

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    Clear Filters
                  </Button>
                  <Button onClick={exportData} className="bg-blue-600 hover:bg-blue-700">
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
                        <TableHead className="text-gray-300">Description</TableHead>
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
                            <TableCell className="text-white">{transaction.date}</TableCell>
                            <TableCell className="text-white">{transaction.bank}</TableCell>
                            <TableCell className="text-white">{transaction.account}</TableCell>
                            <TableCell className="text-white">
                              <Badge variant="outline" className="border-white/20 text-white">
                                {transaction.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-400">
                              ${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-gray-300 max-w-xs truncate">{transaction.description}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Individual Transactions</CardTitle>
              <CardDescription className="text-gray-300">
                Detailed transaction records will appear here when available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-400">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-mono">No individual transaction data available yet</p>
                <p className="text-sm mt-2">
                  Your n8n workflow needs to send a "transactions" array for detailed records to appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
