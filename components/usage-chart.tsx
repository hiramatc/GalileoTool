"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"

interface UsageStats {
  date: string
  searches: number
  logins: number
}

interface UsageChartProps {
  data: UsageStats[]
}

export function UsageChart({ data }: UsageChartProps) {
  // Fill in missing dates with zero values
  const filledData = []
  const last7Days = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    last7Days.push(dateStr)
  }

  last7Days.forEach((dateStr) => {
    const existing = data.find((d) => d.date === dateStr)
    filledData.push({
      date: dateStr,
      searches: existing?.searches || 0,
      logins: existing?.logins || 0,
      displayDate: new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    })
  })

  const totalSearches = data.reduce((sum, day) => sum + day.searches, 0)
  const totalLogins = data.reduce((sum, day) => sum + day.logins, 0)

  return (
    <div className="space-y-6">
      {/* Mobile-Optimized Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800/30 border-slate-600/30">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription className="text-slate-400 text-xs">Total Searches</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-emerald-400">{totalSearches}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xs text-slate-500">Last 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-600/30">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription className="text-slate-400 text-xs">Total Logins</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-amber-400">{totalLogins}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xs text-slate-500">Last 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-600/30">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription className="text-slate-400 text-xs">Avg. Daily Usage</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-blue-400">
              {Math.round((totalSearches + totalLogins) / 7)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xs text-slate-500">Searches + Logins</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-Optimized Usage Chart */}
      <Card className="bg-slate-800/30 border-slate-600/30">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-lg md:text-xl text-amber-400">Daily Usage Activity</CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Client searches and user logins over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent className="px-1 md:px-6 pb-4">
          <ChartContainer
            config={{
              searches: {
                label: "Searches",
                color: "hsl(var(--chart-1))",
              },
              logins: {
                label: "Logins",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[200px] md:h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filledData}
                margin={{
                  top: 10,
                  right: 5,
                  left: 0,
                  bottom: 20,
                }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#9CA3AF"
                  fontSize={9}
                  tick={{ fontSize: 9 }}
                  tickMargin={5}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={9}
                  tick={{ fontSize: 9 }}
                  tickMargin={5}
                  axisLine={false}
                  tickLine={false}
                  width={20}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="searches"
                  fill="var(--color-searches)"
                  name="Searches"
                  radius={[1, 1, 0, 0]}
                  maxBarSize={40}
                />
                <Bar dataKey="logins" fill="var(--color-logins)" name="Logins" radius={[1, 1, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
