'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Download, Filter, AlertTriangle, TrendingUp } from 'lucide-react'

interface CRTransaction {
  transactionNumber: string
  issuer: string
  amount: number
  date: string
  isToday: boolean
}

interface CRBankingData {
  processedData: CRTransaction[]
  todayTransactions: CRTransaction[]
  totalAmount: number
  totalTransactions: number
  todayTransactionCount: number
  todayAmount: number
  monthTotal: number
  month: string
  todayDate: string
  updateTime: string
  availableIssuers: string[]
  yearlyLimit: number
  remainingLimit: number
  limitPercentage: number
  projectedYearEnd: number
  projectedLimitDate: string | null
  monthlyAverage: number
}

export default function CRBanksDashboard() {
  const [data, setData] = useState<CRBankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filteredTransactions, setFilteredTransactions] = useState<CRTransaction[]>([])
  
  // Filter states
  const [dateFilter, setDateFilter] = useState<string>('month') // Default to last 30 days
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const years = ['2023', '2024', '2025', '2026']

  // Fetch CR banking data
  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhooks/cr-banks')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setFilteredTransactions(result.data.processedData)
      } else {
        console.error('Failed to fetch CR banking data:', result.message)
      }
    } catch (error) {
      console.error('Error fetching CR banking data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Parse date for filtering (DD/MM/YYYY format)
  const parseDate = (dateString: string) => {
    const parts = dateString.split('/')
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1 // Month is 0-indexed
    const year = parseInt(parts[2])
    return new Date(year, month, day)
  }

  // Apply filters
  useEffect(() => {
    if (!data) return

    let filtered = data.processedData

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      
      switch (dateFilter) {
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(t => parseDate(t.date) >= weekAgo)
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(t => parseDate(t.date) >= monthAgo)
          break
      }
    }

    // Month filter
    if (selectedMonth !== 'all') {
      const monthIndex = months.indexOf(selectedMonth)
      filtered = filtered.filter(t => parseDate(t.date).getMonth() === monthIndex)
    }

    // Year filter
    if (selectedYear !== 'all') {
      const year = parseInt(selectedYear)
      filtered = filtered.filter(t => parseDate(t.date).getFullYear() === year)
    }

    setFilteredTransactions(filtered)
  }, [data, dateFilter, selectedMonth, selectedYear])

  // Clear filters
  const clearFilters = () => {
    setDateFilter('month') // Reset to last 30 days
    setSelectedMonth('all')
    setSelectedYear('all')
  }

  // Export filtered data
  const exportData = () => {
    const csvContent = [
      ['Transaction Number', 'Issuer', 'Amount (USD)', 'Date'],
      ...filteredTransactions.map(t => [
        t.transactionNumber,
        t.issuer,
        t.amount.toString(),
        t.date
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cr-banks-filtered-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Get status color and text for limit tracker
  const getLimitStatus = () => {
    if (!data) return { color: 'bg-gray-500', text: 'UNKNOWN', textColor: 'text-gray-300' }
    
    const percentage = data.limitPercentage
    if (percentage >= 100) return { color: 'bg-red-500', text: 'LIMIT EXCEEDED', textColor: 'text-red-400' }
    if (percentage >= 95) return { color: 'bg-red-400', text: '95% THRESHOLD', textColor: 'text-red-400' }
    if (percentage >= 90) return { color: 'bg-orange-500', text: '90% THRESHOLD', textColor: 'text-orange-400' }
    if (percentage >= 80) return { color: 'bg-yellow-500', text: '80% THRESHOLD', textColor: 'text-yellow-400' }
    return { color: 'bg-green-500', text: 'NORMAL', textColor: 'text-green-400' }
  }

  // Generate projection chart data
  const generateProjectionData = () => {
    if (!data) return []
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const monthlyAverage = data.monthlyAverage
    
    return monthNames.map((month, index) => {
      if (index <= currentMonth) {
        // For past/current months, calculate actual cumulative total
        // This would need to be calculated from actual data
        // For now, we'll simulate based on the current total and distribution
        const progress = (index + 1) / (currentMonth + 1)
        return {
          month,
          actual: Math.round(data.totalAmount * progress),
          projected: null
        }
      } else {
        // For future months, use projection
        const monthsFromStart = index + 1
        const projected = Math.round(monthlyAverage * monthsFromStart)
        return {
          month,
          actual: null,
          projected
        }
      }
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading CR banking data...</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">No CR banking data available yet</div>
        </div>
      </div>
    )
  }

  const status = getLimitStatus()
  const projectionData = generateProjectionData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Costa Rica Banks Dashboard</h1>
          <p className="text-gray-300">US → CR Transfer Tracking & Annual Limit Monitoring</p>
          <Badge variant="outline" className="mt-2 border-white/20 text-white">
            Annual Limit: $17M
          </Badge>
        </div>

        {/* $17M Limit Tracker */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8 border-2">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              US → CR Transfer Limit Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Current Total */}
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400 mb-2">
                  ${(data.totalAmount / 1000000).toFixed(2)}M
                </div>
                <div className="text-gray-300 text-lg">Total Received</div>
              </div>

              {/* Remaining */}
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">
                  ${(data.remainingLimit / 1000000).toFixed(2)}M
                </div>
                <div className="text-gray-300 text-lg">Remaining</div>
              </div>

              {/* Status */}
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-bold ${status.color} mb-2`}>
                  {status.text}
                </div>
                <div className="text-gray-300 text-lg">
                  {data.limitPercentage.toFixed(1)}% Used
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-6 mb-6">
              <div 
                className={`h-6 rounded-full transition-all duration-500 ${status.color}`}
                style={{ width: `${Math.min(data.limitPercentage, 100)}%` }}
              ></div>
            </div>

            {/* Projection Warning */}
            {data.projectedLimitDate && (
              <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div>
                  <div className="text-yellow-400 font-medium">Projection Alert</div>
                  <div className="text-gray-300 text-sm">
                    Based on current trends, you may reach the $17M limit around {data.projectedLimitDate}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2025 Projection Chart */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">2025 Projection</CardTitle>
            <CardDescription className="text-gray-300">
              Monthly cumulative transfer amounts vs $17M annual limit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900/50 p-6 rounded-lg">
              <div className="text-center mb-4">
                <div className="text-red-400 font-bold text-lg">
                  ━━━━━━━━━━━━━━━━━━━━━━━━━ $17M LIMIT ━━━━━━━━━━━━━━━━━━━━━━━━━
                </div>
              </div>
              
              <div className="space-y-3">
                {projectionData.map((item, index) => {
                  const isActual = item.actual !== null
                  const value = isActual ? item.actual : item.projected
                  const percentage = (value / data.yearlyLimit) * 100
                  
                  return (
                    <div key={item.month} className="flex items-center">
                      <span className={`w-12 text-sm ${isActual ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {item.month}
                      </span>
                      <div className="flex-1 bg-gray-700 rounded h-6 ml-3">
                        <div 
                          className={`h-6 rounded transition-all duration-300 ${
                            percentage >= 100 ? 'bg-red-500' :
                            percentage >= 95 ? 'bg-red-400' :
                            percentage >= 90 ? 'bg-orange-500' :
                            percentage >= 80 ? 'bg-yellow-500' :
                            isActual ? 'bg-blue-500' : 'bg-green-500'
                          } ${!isActual ? 'opacity-70 border-2 border-dashed border-gray-400' : ''}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`ml-3 text-sm w-20 ${isActual ? 'text-white font-medium' : 'text-gray-400'}`}>
                        ${(value / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 text-center">
                {data.projectedYearEnd > data.yearlyLimit && (
                  <div className="bg-red-900/50 border border-red-600 rounded p-3 inline-block">
                    <span className="text-red-400 font-medium">
                      ⚠️ Projected year-end total: ${(data.projectedYearEnd / 1000000).toFixed(1)}M (exceeds limit)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 mr-2 rounded"></div>
                <span className="text-gray-300">Actual</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 opacity-70 border border-dashed border-gray-400 mr-2 rounded"></div>
                <span className="text-gray-300">Projected</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 mr-2 rounded"></div>
                <span className="text-gray-300">Over/Near Limit</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.totalTransactions}</div>
              <p className="text-xs text-gray-300 mt-1">This year</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Today's Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.todayTransactionCount}</div>
              <p className="text-xs text-gray-300 mt-1">
                ${data.todayAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Month Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${data.monthTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-gray-300 mt-1">{data.month}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm font-medium">Monthly Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${data.monthlyAverage.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-gray-300 mt-1">Per month</p>
            </CardContent>
          </Card>
        </div>

        {/* Simplified Filters */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
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
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
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
                    {months.map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={clearFilters}
                className="bg-gray-600 hover:bg-gray-700 border-gray-600 text-white"
              >
                Clear Filters
              </Button>
              <Button 
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button 
                onClick={exportData}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
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
              US → CR Transactions ({filteredTransactions.length} of {data.totalTransactions})
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
                    <TableHead className="text-gray-300">Transaction Number</TableHead>
                    <TableHead className="text-gray-300">Issuer</TableHead>
                    <TableHead className="text-gray-300 text-right">Amount (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                        No transactions match your current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction, index) => (
                      <TableRow key={index} className="border-white/10">
                        <TableCell className="text-white">
                          {transaction.isToday && (
                            <Badge variant="secondary" className="mr-2 bg-blue-600">Today</Badge>
                          )}
                          {transaction.date}
                        </TableCell>
                        <TableCell className="text-white font-mono text-sm">
                          {transaction.transactionNumber}
                        </TableCell>
                        <TableCell className="text-white">{transaction.issuer}</TableCell>
                        <TableCell className="text-right font-medium text-green-400">
                          ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </TableCell>
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
