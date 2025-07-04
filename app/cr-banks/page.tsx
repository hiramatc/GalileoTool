"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, TrendingUp, AlertTriangle, BarChart3, Search, Filter } from "lucide-react"
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
  transactions?: Transaction[]
  monthlyProgress?: Array<{
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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBank, setSelectedBank] = useState<string>("all")
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
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
        console.log("CR Banks data received:", result.data)
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

  // Apply filters
  useEffect(() => {
    if (!data?.transactions) {
      setFilteredTransactions([])
      return
    }

    let filtered = data.transactions

    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchLower) ||
          t.bank.toLowerCase().includes(searchLower) ||
          t.account.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower),
      )
    }

    // Bank filter
    if (selectedBank !== "all") {
      filtered = filtered.filter((t) => t.bank === selectedBank)
    }

    // Account filter
    if (selectedAccount !== "all") {
      filtered = filtered.filter((t) => t.account === selectedAccount)
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

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
  }, [data, searchTerm, selectedBank, selectedAccount, selectedCategory, dateFilter, selectedMonth, selectedYear])

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedBank("all")
    setSelectedAccount("all")
    setSelectedCategory("all")
    setDateFilter("last30days")
    setSelectedMonth("all")
    setSelectedYear("all")
  }

  // Export filtered data
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

  // Generate monthly progression chart data
  const generateMonthlyChartData = () => {
    if (!data) return []

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    // If we have monthlyProgress data from webhook, use it
    if (data.monthlyProgress && data.monthlyProgress.length > 0) {
      return data.monthlyProgress.map((item) => ({
        month: item.month,
        amount: item.amount,
        projected: item.projected || null,
        limit: YEARLY_LIMIT,
      }))
    }

    // Otherwise, generate monthly data based on current total
    const monthlyData = []
    const monthlyAverage = data.yearlyTotal / (currentMonth + 1) // Average per month so far

    for (let i = 0; i <= 11; i++) {
      const monthName = months[i]
      let amount = 0
      let projected = null

      if (i <= currentMonth) {
        // Past and current months - estimate based on current progress
        amount = (data.yearlyTotal / (currentMonth + 1)) * (i + 1)
      } else {
        // Future months - projection
        projected = monthlyAverage * (i + 1)
        amount = projected
      }

      monthlyData.push({
        month: monthName.substring(0, 3), // Short month names
        amount: Math.round(amount),
        projected: i > currentMonth ? Math.round(projected) : null,
        limit: YEARLY_LIMIT,
        isProjected: i > currentMonth,
      })
    }

    return monthlyData
  }

  // Calculate when limit will be reached
  const calculateLimitReachDate = () => {
    if (!data) return null

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const monthlyAverage = data.yearlyTotal / (currentMonth + 1)

    if (monthlyAverage <= 0) return null

    const monthsToLimit = YEARLY_LIMIT / monthlyAverage

    if (monthsToLimit <= 12) {
      const limitMonth = Math.ceil(monthsToLimit) - 1
      return months[Math.min(limitMonth, 11)]
    }

    return null
  }

  // Calculate remaining amount and get alert color
  const remainingAmount = YEARLY_LIMIT - (data?.yearlyTotal || 0)
  const getAlertColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "green":
      case "normal":
        return "text-green-400"
      case "yellow":
      case "warning":
        return "text-yellow-400"
      case "red":
      case "critical":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  // Get unique values for filters
  const getUniqueValues = (field: keyof Transaction) => {
    if (!data?.transactions) return []
    return [...new Set(data.transactions.map((t) => t[field]))].sort()
  }

  const limitReachDate = calculateLimitReachDate()

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
        {/* Header with Navigation - Mobile Optimized */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4">
            {/* Logo and Title Row */}
            <div className="flex items-center gap-3">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-xim7Sf7mjX1q0kZdL8yllT6RrzLWCl.png"
                alt="GALILEO CAPITAL"
                className="h-6 md:h-12 w-auto filter brightness-0 invert opacity-90"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-3xl font-light text-white truncate">CR Banks Dashboard</h1>
                <p className="text-slate-400 font-mono text-xs md:text-sm">COSTA RICA BANKING LIMITS</p>
              </div>
            </div>

            {/* Navigation Row */}
            <div className="flex justify-end">
              <Navigation currentPage="cr-banks" isAdmin={isAdmin} />
            </div>
          </div>
        </header>

        {/* Summary Cards */}
        {/* Summary Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Total Transacted</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-bold text-white">
                ${data.yearlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-300 mt-1">This year</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-white text-sm font-medium truncate">Remaining Amount</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div
                className={`text-xl md:text-2xl font-bold ${remainingAmount > 0 ? "text-green-400" : "text-red-400"}`}
              >
                ${remainingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-300 mt-1">Until $17M limit</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${getAlertColor(data.alertStatus)}`} />
                <span className="truncate">Percentage Used</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className={`text-xl md:text-2xl font-bold ${getAlertColor(data.alertStatus)}`}>
                {data.limitPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Status: <span className={getAlertColor(data.alertStatus)}>{data.alertStatus?.toUpperCase()}</span>
              </p>
              {limitReachDate && <p className="text-xs text-yellow-400 mt-1">Limit: {limitReachDate}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Progress Chart */}
        {/* Monthly Progress Chart - Mobile Optimized */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6 md:mb-8">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
              <BarChart3 className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Monthly Progress</span>
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm">
              <span className="block">Monthly totals with projection</span>
              {limitReachDate && <span className="text-yellow-400 text-xs">• Limit projected: {limitReachDate}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 md:px-6 pb-4">
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateMonthlyChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    stroke="#9CA3AF"
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval={0}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={9}
                    tick={{ fontSize: 9 }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    width={35}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                      name === "amount" ? "Total" : name === "projected" ? "Projected" : "Limit",
                    ]}
                    labelStyle={{ color: "#000", fontSize: "12px" }}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      fontSize: "12px",
                      padding: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", strokeWidth: 1, r: 3 }}
                    name="Total"
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ fill: "#F59E0B", strokeWidth: 1, r: 2 }}
                    name="Projected"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="limit"
                    stroke="#EF4444"
                    strokeWidth={1}
                    strokeDasharray="5 3"
                    dot={false}
                    name="Limit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Controls - Always show */}
        {/* Filters and Controls - Mobile Optimized */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Filters & Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
              {/* Search */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-10"
                  />
                </div>
              </div>

              {/* Bank Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Bank</label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                    <SelectValue placeholder="All Banks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Banks</SelectItem>
                    {getUniqueValues("bank").map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Account Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Account</label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {getUniqueValues("account").map((account) => (
                      <SelectItem key={account} value={account}>
                        {account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getUniqueValues("category").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                    <SelectValue placeholder="Select range" />
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
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
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
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
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

            {/* Action Buttons - Mobile Stacked */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent flex-1 sm:flex-none"
              >
                Clear Filters
              </Button>
              <Button onClick={fetchData} className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={exportData}
                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                disabled={!data?.transactions || filteredTransactions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        {/* Transactions Table - Mobile Optimized */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-white text-lg">
              Transactions
              {data?.transactions ? (
                <span className="text-sm font-normal">
                  ({filteredTransactions.length} of {data.totalTransactions})
                </span>
              ) : (
                <span className="text-sm font-normal">(No detailed data yet)</span>
              )}
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm">
              Last updated: {new Date(data.updateTime).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            {data?.transactions && data.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-gray-300 text-xs">Date</TableHead>
                      <TableHead className="text-gray-300 text-xs hidden sm:table-cell">Bank</TableHead>
                      <TableHead className="text-gray-300 text-xs hidden md:table-cell">Account</TableHead>
                      <TableHead className="text-gray-300 text-xs hidden lg:table-cell">Category</TableHead>
                      <TableHead className="text-gray-300 text-xs text-right">Amount</TableHead>
                      <TableHead className="text-gray-300 text-xs">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8 text-sm">
                          No transactions match your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction, index) => (
                        <TableRow key={index} className="border-white/10">
                          <TableCell className="text-white text-xs">
                            <div className="min-w-0">
                              <div className="truncate">{transaction.date}</div>
                              {/* Show bank/account on mobile */}
                              <div className="sm:hidden text-gray-400 text-xs mt-1">
                                {transaction.bank} - {transaction.account}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white text-xs hidden sm:table-cell">{transaction.bank}</TableCell>
                          <TableCell className="text-white text-xs hidden md:table-cell">
                            {transaction.account}
                          </TableCell>
                          <TableCell className="text-white text-xs hidden lg:table-cell">
                            <Badge variant="outline" className="border-white/20 text-white text-xs">
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-400 text-xs">
                            <div className="min-w-0">
                              <div>${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                              {/* Show category on mobile */}
                              <div className="lg:hidden text-gray-400 text-xs mt-1">{transaction.category}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300 text-xs">
                            <div className="max-w-[120px] md:max-w-xs truncate">{transaction.description}</div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 md:py-12 text-slate-400">
                <BarChart3 className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-base md:text-lg font-mono">No transaction data yet</p>
                <p className="text-sm mt-2 px-4">
                  Your n8n workflow needs to send a "transactions" array for detailed records.
                </p>
                <div className="mt-4 bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 max-w-sm mx-auto">
                  <p className="text-amber-400 text-sm">
                    <strong>Note:</strong> Summary data is working. Individual transactions will appear when sent by
                    n8n.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

