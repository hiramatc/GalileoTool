"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, TrendingUp, AlertTriangle, BarChart3, Search, Filter, AlertCircle } from "lucide-react"
import { UnifiedLayout } from "@/components/unified-layout"
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

const YEARLY_LIMIT = 17000000

export default function CRBanksDashboard() {
  const [data, setData] = useState<CRBankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [refreshError, setRefreshError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("last15days")
  const [showCurrentYearOnly, setShowCurrentYearOnly] = useState(false)

  // Fetch existing CR banking data
  const fetchExistingData = async () => {
    try {
      console.log("Fetching existing CR Banks data...")
      const response = await fetch("/api/webhooks/cr-banks")
      const result = await response.json()

      if (result.success && result.data) {
        console.log("CR Banks data received:", result.data)
        setData(result.data)
        setFilteredTransactions(result.data.processedData || [])
        setRefreshError(null)
        return true
      } else {
        console.error("Failed to fetch CR banking data:", result.message)
        setRefreshError(result.message || "Failed to fetch data")
        return false
      }
    } catch (error) {
      console.error("Error fetching CR banking data:", error)
      setRefreshError(error instanceof Error ? error.message : "Network error")
      return false
    }
  }

  // Enhanced refresh function with n8n trigger
  const refreshData = async () => {
    setRefreshing(true)
    setRefreshError(null)

    try {
      console.log("Starting CR Banks refresh...")

      // First, try to trigger n8n workflow
      try {
        console.log("Attempting to trigger CR Banks n8n workflow...")
        const triggerResponse = await fetch("/api/trigger-refresh/cr-banks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const triggerResult = await triggerResponse.json()
        console.log("CR Banks trigger response:", triggerResult)

        if (triggerResponse.ok && triggerResult.success) {
          console.log("CR Banks n8n workflow triggered successfully, waiting for data...")
          // Wait for n8n to process
          await new Promise((resolve) => setTimeout(resolve, 3000))
        } else {
          console.warn("CR Banks n8n trigger failed:", triggerResult.message)
          setRefreshError(`n8n trigger failed: ${triggerResult.message}`)
        }
      } catch (triggerError) {
        console.warn("CR Banks n8n trigger error:", triggerError)
        setRefreshError(`n8n trigger error: ${triggerError instanceof Error ? triggerError.message : "Unknown error"}`)
      }

      // Always try to fetch the latest data (whether n8n worked or not)
      const dataFetched = await fetchExistingData()

      if (!dataFetched) {
        throw new Error("Failed to fetch updated data")
      }

      console.log("CR Banks refresh completed successfully")
    } catch (error) {
      console.error("CR Banks refresh failed:", error)
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

  const parseDate = (dateString: string) => {
    try {
      const parts = dateString.split("/")
      const day = Number.parseInt(parts[0])
      let month, year

      if (isNaN(Number.parseInt(parts[1]))) {
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
        month = Number.parseInt(parts[1]) - 1
        year = Number.parseInt(parts[2])
      }

      return new Date(year, month, day)
    } catch (error) {
      return new Date()
    }
  }

  useEffect(() => {
    if (!data?.processedData) {
      setFilteredTransactions([])
      return
    }

    let filtered = data.processedData

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.issuer.toLowerCase().includes(searchLower) ||
          t.transactionNumber.toLowerCase().includes(searchLower) ||
          t.amount.toString().includes(searchLower),
      )
    }

    if (showCurrentYearOnly) {
      filtered = filtered.filter((t) => t.isCurrentYear)
    }

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
        case "last15days":
          const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((t) => parseDate(t.date) >= fifteenDaysAgo)
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

    filtered.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
    setFilteredTransactions(filtered)
  }, [data, searchTerm, dateFilter, showCurrentYearOnly])

  const clearFilters = () => {
    setSearchTerm("")
    setDateFilter("last15days")
    setShowCurrentYearOnly(false)
  }

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

  const generateMonthlyChartData = () => {
    if (!data?.monthlyTotals) return []

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const chartData = []
    let cumulativeTotal = 0

    for (let i = 0; i < 12; i++) {
      const monthKey = `${i + 1}/${currentYear}`
      const monthData = data.monthlyTotals[monthKey]
      const monthAmount = monthData ? monthData.total : 0

      if (monthAmount > 0) {
        cumulativeTotal += monthAmount
      }

      chartData.push({
        month: months[i],
        amount: cumulativeTotal,
        projected: null,
        limit: YEARLY_LIMIT,
        monthlyAmount: monthAmount,
        hasData: monthAmount > 0,
      })
    }

    return chartData
  }

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
      <UnifiedLayout title="CR Banks Dashboard" currentPage="cr-banks">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-xl">Loading CR banking data...</div>
        </div>
      </UnifiedLayout>
    )
  }

  if (!data) {
    return (
      <UnifiedLayout title="CR Banks Dashboard" currentPage="cr-banks">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <h2 className="text-2xl font-semibold mb-4 text-white">No CR Banking Data Available Yet</h2>
          <p className="text-gray-300 mb-6 max-w-md">
            Your n8n workflow hasn't sent any data to the CR Banks webhook yet. Make sure your automation is running and
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

          <Button onClick={refreshData} className="bg-green-600 hover:bg-green-700" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </UnifiedLayout>
    )
  }

  return (
    <UnifiedLayout title="CR Banks Dashboard" currentPage="cr-banks">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-600/30 hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="truncate">Total Transacted</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">
              ${data.yearlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-300 mt-1">This year ({data.totalTransactions} transactions)</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-600/30 hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium truncate">Remaining Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${remainingAmount > 0 ? "text-green-400" : "text-red-400"}`}>
              ${remainingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-300 mt-1">Until $17M limit</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-600/30 sm:col-span-2 lg:col-span-1 hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${getAlertColor(data.alertStatus)}`} />
              <span className="truncate">Percentage Used</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${getAlertColor(data.alertStatus)}`}>
              {data.limitPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Status: <span className={getAlertColor(data.alertStatus)}>{data.alertStatus?.toUpperCase()}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-600/30 mb-6 sm:mb-8 hover:bg-slate-800/40 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
            <BarChart3 className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Monthly Progress</span>
          </CardTitle>
          <CardDescription className="text-gray-300 text-sm">
            <span className="block">Monthly cumulative totals toward $17M limit</span>
            {data.projectedLimitDate && (
              <span className="text-yellow-400 text-xs">• Projected limit: {data.projectedLimitDate}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateMonthlyChartData()} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={40}
                  interval={0}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  width={50}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                    name === "amount" ? "Current" : name === "projected" ? "Projection" : "Limit",
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                  labelStyle={{ color: "#fff", fontSize: "12px" }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    fontSize: "12px",
                    padding: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={(props) => {
                    const { payload } = props
                    return payload?.hasData ? (
                      <circle {...props} fill="#10B981" strokeWidth={1} r={3} />
                    ) : (
                      <circle {...props} fill="transparent" strokeWidth={0} r={0} />
                    )
                  }}
                  name="Current"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ fill: "#F59E0B", strokeWidth: 1, r: 2 }}
                  name="Projection"
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

      <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-600/30 mb-6 hover:bg-slate-800/40 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Transaction Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-gray-400 h-10 text-sm focus:border-amber-400/50 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Date Filter</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white h-10 text-sm focus:border-amber-400/50 transition-all duration-300">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last15days">Last 15 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
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

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-slate-600/50 text-white hover:bg-slate-700/50 bg-transparent text-sm h-9 transition-all duration-300"
            >
              Clear Filters
            </Button>
            <Button
              onClick={refreshData}
              className="bg-green-600 hover:bg-green-700 text-sm h-9 transition-all duration-300"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
            <Button
              onClick={exportData}
              className="bg-blue-600 hover:bg-blue-700 text-sm h-9 transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredTransactions.length > 0 && (
        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-600/30 hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Transactions ({filteredTransactions.length} of {data.totalTransactions})
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm">
              Last updated: {new Date(data.updateTime).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600/30">
                    <TableHead className="text-gray-300 text-sm">Date</TableHead>
                    <TableHead className="text-gray-300 text-sm">Transaction #</TableHead>
                    <TableHead className="text-gray-300 text-sm">Issuer</TableHead>
                    <TableHead className="text-gray-300 text-sm text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => (
                    <TableRow
                      key={index}
                      className="border-slate-600/20 hover:bg-slate-700/20 transition-colors duration-200"
                    >
                      <TableCell className="text-white text-sm">
                        {transaction.isToday && (
                          <Badge variant="secondary" className="mr-2 bg-green-600 text-xs">
                            Today
                          </Badge>
                        )}
                        <span className="text-sm">{transaction.date}</span>
                      </TableCell>
                      <TableCell className="text-white text-sm font-mono">{transaction.transactionNumber}</TableCell>
                      <TableCell className="text-white text-sm">
                        <Badge variant="outline" className="border-slate-600/50 text-white text-xs">
                          {transaction.issuer}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-400 text-sm">
                        ${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </UnifiedLayout>
  )
}
