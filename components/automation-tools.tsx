"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AutomationTools() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("client-search")

  const runAutomation = async (endpoint: string, data: any, automationType: string) => {
    setLoading(automationType)
    setResults(null)

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Automation failed")
      }

      const result = await response.json()
      setResults({ type: automationType, data: result })
    } catch (error) {
      console.error("Automation error:", error)
      setResults({ type: automationType, error: "Automation failed" })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/30 border border-slate-600/30">
          <TabsTrigger value="client-search" className="font-mono text-xs">
            CLIENT SEARCH
          </TabsTrigger>
          <TabsTrigger value="portfolio-analysis" className="font-mono text-xs">
            PORTFOLIO
          </TabsTrigger>
          <TabsTrigger value="risk-assessment" className="font-mono text-xs">
            RISK
          </TabsTrigger>
          <TabsTrigger value="market-data" className="font-mono text-xs">
            MARKET
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client-search" className="mt-6">
          <ClientSearchTool onRun={runAutomation} loading={loading} />
        </TabsContent>

        <TabsContent value="portfolio-analysis" className="mt-6">
          <PortfolioAnalysisTool onRun={runAutomation} loading={loading} />
        </TabsContent>

        <TabsContent value="risk-assessment" className="mt-6">
          <RiskAssessmentTool onRun={runAutomation} loading={loading} />
        </TabsContent>

        <TabsContent value="market-data" className="mt-6">
          <MarketDataTool onRun={runAutomation} loading={loading} />
        </TabsContent>
      </Tabs>

      {/* Results Display */}
      {results && (
        <Card className="mt-8 bg-slate-800/30 border-slate-600/30">
          <CardHeader>
            <CardTitle className="text-amber-400">{results.type.replace("-", " ").toUpperCase()} Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.error ? (
              <p className="text-red-400">{results.error}</p>
            ) : (
              <pre className="text-sm text-slate-300 whitespace-pre-wrap">{JSON.stringify(results.data, null, 2)}</pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ClientSearchTool({ onRun, loading }: any) {
  const [clientName, setClientName] = useState("")

  return (
    <Card className="bg-slate-800/30 border-slate-600/30">
      <CardHeader>
        <CardTitle className="text-amber-400">Client Portfolio Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter client first name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="bg-slate-700/50 border-slate-600/50 text-white"
        />
        <Button
          onClick={() =>
            onRun("https://hiramtc.app.n8n.cloud/webhook/client-search", { query: clientName }, "client-search")
          }
          disabled={loading === "client-search" || !clientName}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 font-mono"
        >
          {loading === "client-search" ? "SEARCHING..." : "SEARCH CLIENT"}
        </Button>
      </CardContent>
    </Card>
  )
}

function PortfolioAnalysisTool({ onRun, loading }: any) {
  const [portfolioId, setPortfolioId] = useState("")

  return (
    <Card className="bg-slate-800/30 border-slate-600/30">
      <CardHeader>
        <CardTitle className="text-emerald-400">Portfolio Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter portfolio ID"
          value={portfolioId}
          onChange={(e) => setPortfolioId(e.target.value)}
          className="bg-slate-700/50 border-slate-600/50 text-white"
        />
        <Button
          onClick={() => onRun("/api/automations/portfolio-analysis", { portfolioId }, "portfolio-analysis")}
          disabled={loading === "portfolio-analysis" || !portfolioId}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-mono"
        >
          {loading === "portfolio-analysis" ? "ANALYZING..." : "ANALYZE PORTFOLIO"}
        </Button>
      </CardContent>
    </Card>
  )
}

function RiskAssessmentTool({ onRun, loading }: any) {
  const [assetSymbol, setAssetSymbol] = useState("")

  return (
    <Card className="bg-slate-800/30 border-slate-600/30">
      <CardHeader>
        <CardTitle className="text-red-400">Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter asset symbol (e.g., BTC, ETH)"
          value={assetSymbol}
          onChange={(e) => setAssetSymbol(e.target.value)}
          className="bg-slate-700/50 border-slate-600/50 text-white"
        />
        <Button
          onClick={() => onRun("/api/automations/risk-assessment", { symbol: assetSymbol }, "risk-assessment")}
          disabled={loading === "risk-assessment" || !assetSymbol}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-mono"
        >
          {loading === "risk-assessment" ? "ASSESSING..." : "ASSESS RISK"}
        </Button>
      </CardContent>
    </Card>
  )
}

function MarketDataTool({ onRun, loading }: any) {
  const [exchange, setExchange] = useState("")

  return (
    <Card className="bg-slate-800/30 border-slate-600/30">
      <CardHeader>
        <CardTitle className="text-blue-400">Market Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter exchange name"
          value={exchange}
          onChange={(e) => setExchange(e.target.value)}
          className="bg-slate-700/50 border-slate-600/50 text-white"
        />
        <Button
          onClick={() => onRun("/api/automations/market-data", { exchange }, "market-data")}
          disabled={loading === "market-data" || !exchange}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-mono"
        >
          {loading === "market-data" ? "FETCHING..." : "GET MARKET DATA"}
        </Button>
      </CardContent>
    </Card>
  )
}
