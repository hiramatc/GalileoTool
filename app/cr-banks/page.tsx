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
  transactionNumber: string
  issuer: string
  amount: number
  date: string
  timestamp: string
  isToday: boolean
  isCurrentYear: boolean
}

interface CRBankingData {
  processedData: Transaction[]
  yearlyTotal: number
  limitPercentage: number
  alertStatus: string
  alertMessage: string
  updateTime: string
  totalTransactions: number
  monthlyTotals: { [key: string]: { total: number; count: number } }
  issuerSummary: { [key: string]: { total: number; count: number } }
  availableIssuers: string[]
  projectedLimitDate: string | null
  monthlyAverage: number
  todayAmount: number
  monthTotal: number
}

const YEARLY_LIMIT = 17000000 // $17 million limit

export default function CRBanksDashboard() {
  const [data, setData] = useState<CRBankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  // Simplified filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIssuer, setSelectedIssuer] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [showCurrentYearOnly, setShowCurrentYearOnly] = useState(false)

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
        setFilteredTransactions(result.data.processedData || [])
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
    // Handle CR date format (17/01/2024 or 04/Jul/2025)
    try {
      const parts = dateString.split("/")
      const day = Number.parseInt(parts[0])
      let month, year

      if (isNaN(Number.parseInt(parts[1]))) {
        // Month name format (04/Jul/2025)
        const months = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        }
        month = months[parts[1] as keyof typeof months]
        year = Number.parseInt(parts[2])
      } else {
        // Numeric format (17/01/2024)
        month = Number.parseInt(parts[1]) - 1
        year = Number.parseInt(parts[2])
      }

      return new Date(year, month, day)
    } catch (error) {
      return new Date()
    }
  }

  // Apply filters
  useEffect(() => {
    if (!data?.processedData) {
      setFilteredTransactions([])
      return
    }

    let filtered = data.processedData

    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.issuer.toLowerCase().includes(searchLower) ||
          t.transactionNumber.toLowerCase().includes(searchLower) ||
          t.amount.toString().includes(searchLower),
      )
    }

    // Issuer filter
    if (selectedIssuer !== "all") {
      filtered = filtered.filter((t) => t.issuer === selectedIssuer)
    }

    // Current year filter
    if (showCurrentYearOnly) {
      filtered = filtered.filter((t) => t.isCurrentYear)
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date()
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((t) => t.isToday)
          break
        case "last7days":
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((t) => parseDate(t.date) >= sevenDaysAgo)
          break
        case "last30days":
          const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((t) => parseDate(t.date) >= thirtyDaysAgo)
          break
        case "currentyear":
          filtered = filtered.filter((t) => t.isCurrentYear)
          break
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())

    setFilteredTransactions(filtered)
  }, [data, searchTerm, selectedIssuer, dateFilter, showCurrentYearOnly])

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedIssuer("all")
    setDateFilter("all")
    setShowCurrentYearOnly(false)
  }

  // Export filtered data
  const exportData = () => {
    if (!filteredTransactions.length) {
      alert("No transaction data available to export")
      return
    }

    const csvContent = [
      ["Date", "Transaction Number", "Issuer", "Amount", "Is Today", "Is Current Year"],
      ...filteredTransactions.map((t) => [
        t.date,
        t.transactionNumber,
        t.issuer,
        t.amount.toString(),
        t.isToday ? "Yes" : "No",
        t.isCurrentYear ? "Yes" : "No",
      ]),
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

  // Generate monthly progression chart data from actual monthlyTotals
  const generateMonthlyChartData = () => {
    if (!data?.monthlyTotals) return []

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const chartData = []
    let cumulativeTotal = 0

    for (let i = 0; i < 12; i++) {
      const monthKey = `${i + 1}/${currentYear}`
      const monthData = data.monthlyTotals[monthKey]
      const monthAmount = monthData ? monthData.total : 0

      cumulativeTotal += monthAmount

      let projected = null
      if (i > currentMonth && data.monthlyAverage > 0) {
        // Project future months based on average
        const projectedCumulative = data.monthlyAverage * (i + 1)
        projected = projectedCumulative
      }

      chartData.push({
        month: months[i],
        amount: cumulativeTotal,
        projected: projected,
        limit: YEARLY_LIMIT,
        monthlyAmount: monthAmount,
        hasData: monthAmount > 0,
      })
    }

    return chartData
  }

  // Calculate remaining amount and get alert color
  const remainingAmount = YEARLY_LIMIT - (data?.yearlyTotal || 0)
  const getAlertColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "normal":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "critical":
      case "exceeded":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
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

        {/* Summary Cards - Enhanced with more data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
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
              <p className="text-xs text-gray-300 mt-1">This year ({data.totalTransactions} transactions)</p>
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

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
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
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-white text-sm font-medium truncate">Today's Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-bold text-blue-400">
                ${data.todayAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-300 mt-1">Today's total</p>
              {data.projectedLimitDate && (
                <p className="text-xs text-yellow-400 mt-1">Limit: {data.projectedLimitDate}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Progress Chart - Using actual data */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6 md:mb-8">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
              <BarChart3 className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Monthly Cumulative Progress</span>
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm">
              <span className="block">Actual monthly cumulative totals toward $17M limit</span>
              {data.projectedLimitDate && (
                <span className="text-yellow-400 text-xs">• Projected to reach limit: {data.projectedLimitDate}</span>
              )}
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
                      name === "amount" ? "Cumulative Total" : name === "projected" ? "Projected" : "Limit",
                    ]}
                    labelFormatter={(label) => `Month: ${label}`}
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
                    strokeWidth={3}
                    dot={(props) => {
                      const { payload } = props
                      return payload?.hasData ? (
                        <circle {...props} fill="#10B981" strokeWidth={2} r={4} />
                      ) : (
                        <circle {...props} fill="transparent" strokeWidth={0} r={0} />
                      )
                    }}
                    name="Cumulative Total"
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
                    name="$17M Limit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Simplified Filters and Controls */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Transaction Filters</span>
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
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-10"
                  />
                </div>
              </div>

              {/* Issuer Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Issuer</label>
                <Select value={selectedIssuer} onValueChange={setSelectedIssuer}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                    <SelectValue placeholder="All Issuers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Issuers</SelectItem>
                    {data?.availableIssuers?.map((issuer) => (
                      <SelectItem key={issuer} value={issuer}>
                        {issuer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Date Filter</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today Only</SelectItem>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="currentyear">Current Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
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
                disabled={!data?.processedData || filteredTransactions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table - Fixed to show actual data */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-white text-lg">
              Transactions
              <span className="text-sm font-normal ml-2">
                ({filteredTransactions.length} of {data.totalTransactions})
              </span>
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm">
              Last updated: {new Date(data.updateTime).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            {data?.processedData && data.processedData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-gray-300 text-xs">Date</TableHead>
                      <TableHead className="text-gray-300 text-xs hidden sm:table-cell">Transaction #</TableHead>
                      <TableHead className="text-gray-300 text-xs">Issuer</TableHead>
                      <TableHead className="text-gray-300 text-xs text-right">Amount</TableHead>
                      <TableHead className="text-gray-300 text-xs hidden md:table-cell">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8 text-sm">
                          No transactions match your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction, index) => (
                        <TableRow key={index} className="border-white/10">
                          <TableCell className="text-white text-xs">
                            <div className="min-w-0">
                              <div className="truncate">{transaction.date}</div>
                              {/* Show transaction number on mobile */}
                              <div className="sm:hidden text-gray-400 text-xs mt-1">
                                #{transaction.transactionNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white text-xs hidden sm:table-cell">
                            #{transaction.transactionNumber}
                          </TableCell>
                          <TableCell className="text-white text-xs">{transaction.issuer}</TableCell>
                          <TableCell className="text-right font-medium text-green-400 text-xs">
                            <div className="min-w-0">
                              <div>${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white text-xs hidden md:table-cell">
                            <div className="flex gap-1">
                              {transaction.isToday && (
                                <Badge variant="outline" className="border-blue-400 text-blue-400 text-xs">
                                  Today
                                </Badge>
                              )}
                              {transaction.isCurrentYear && (
                                <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                                  Current Year
                                </Badge>
                              )}
                            </div>
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
                <p className="text-sm mt-2 px-4">Your n8n workflow needs to send transaction data to the webhook.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


