"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugWebhookPage() {
  const [webhookData, setWebhookData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [testData, setTestData] = useState(`{
  "totalTransactions": 1250,
  "todayTransactionCount": 45,
  "monthTotal": 125000,
  "updateTime": "${new Date().toISOString()}"
}`)

  const loadWebhookData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/webhooks/us-banks")
      const result = await response.json()
      setWebhookData(result)
    } catch (error) {
      console.error("Error loading webhook data:", error)
      setWebhookData({ error: "Failed to load data" })
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/webhooks/us-banks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: testData,
      })

      const result = await response.json()
      setTestResult({
        status: response.status,
        success: response.ok,
        data: result,
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWebhookData()
  }, [])

  const webhookUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/us-banks` : "/api/webhooks/us-banks"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4">Webhook Debug Center</h1>
          <p className="text-slate-400 font-mono">Troubleshoot your n8n HTTP node connection</p>
        </div>

        {/* Webhook URL Info */}
        <Card className="bg-slate-800/30 border-slate-600/30">
          <CardHeader>
            <CardTitle className="text-amber-400">Webhook URL Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Webhook URL (use this in n8n):
              </label>
              <div className="bg-slate-700/50 rounded-lg p-4 font-mono text-sm break-all">{webhookUrl}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-emerald-400">Method:</strong> POST
              </div>
              <div>
                <strong className="text-emerald-400">Content-Type:</strong> application/json
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Webhook */}
        <Card className="bg-slate-800/30 border-slate-600/30">
          <CardHeader>
            <CardTitle className="text-blue-400">Test Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Test Data (JSON):</label>
              <textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                className="w-full h-32 bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 text-white font-mono text-sm"
                placeholder="Enter JSON data to test..."
              />
            </div>
            <Button
              onClick={testWebhook}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-mono"
            >
              {loading ? "TESTING..." : "TEST WEBHOOK"}
            </Button>

            {testResult && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  testResult.success
                    ? "bg-emerald-900/30 border border-emerald-600/30"
                    : "bg-red-900/30 border border-red-600/30"
                }`}
              >
                <h4 className={`font-semibold mb-2 ${testResult.success ? "text-emerald-400" : "text-red-400"}`}>
                  Test Result: {testResult.success ? "SUCCESS" : "FAILED"}
                </h4>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Data & Logs */}
        <Card className="bg-slate-800/30 border-slate-600/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-emerald-400">Current Data & Request Logs</CardTitle>
            <Button
              onClick={loadWebhookData}
              disabled={loading}
              className="bg-slate-700/50 hover:bg-slate-700/70 text-white px-4 py-2 rounded-lg font-mono text-sm"
            >
              {loading ? "REFRESHING..." : "REFRESH"}
            </Button>
          </CardHeader>
          <CardContent>
            {webhookData ? (
              <div className="space-y-4">
                {webhookData.success ? (
                  <div className="bg-emerald-900/20 border border-emerald-600/30 rounded-lg p-4">
                    <h4 className="text-emerald-400 font-semibold mb-2">✅ Data Available</h4>
                    <p className="text-sm text-slate-300">
                      Last updated: {new Date(webhookData.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
                    <h4 className="text-amber-400 font-semibold mb-2">⚠️ No Data Yet</h4>
                    <p className="text-sm text-slate-300">{webhookData.message}</p>
                  </div>
                )}

                {webhookData.requestLog && webhookData.requestLog.length > 0 && (
                  <div>
                    <h4 className="text-slate-300 font-semibold mb-2">Recent Requests:</h4>
                    <div className="space-y-2">
                      {webhookData.requestLog.map((log: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg text-sm ${
                            log.success
                              ? "bg-emerald-900/20 border border-emerald-600/30"
                              : "bg-red-900/20 border border-red-600/30"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={log.success ? "text-emerald-400" : "text-red-400"}>
                              {log.success ? "✅ SUCCESS" : "❌ FAILED"}
                            </span>
                            <span className="text-slate-400 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          {log.error && <p className="text-red-300 text-xs">{log.error}</p>}
                          {log.dataKeys && (
                            <p className="text-slate-300 text-xs">Data keys: {log.dataKeys.join(", ")}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-slate-300 font-semibold mb-2">Full Response:</h4>
                  <pre className="text-xs text-slate-400 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(webhookData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>Loading webhook data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Troubleshooting Guide */}
        <Card className="bg-slate-800/30 border-slate-600/30">
          <CardHeader>
            <CardTitle className="text-red-400">Common n8n HTTP Node Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-amber-500 pl-4">
                <h4 className="font-semibold text-amber-400">1. Wrong URL</h4>
                <p className="text-slate-300">
                  Make sure you're using the exact URL shown above in your n8n HTTP node.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-400">2. Method & Headers</h4>
                <p className="text-slate-300">
                  Set Method to <code className="bg-slate-700 px-1 rounded">POST</code> and Content-Type to{" "}
                  <code className="bg-slate-700 px-1 rounded">application/json</code>
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-4">
                <h4 className="font-semibold text-emerald-400">3. JSON Format</h4>
                <p className="text-slate-300">Ensure your data is valid JSON format. Use the test above to verify.</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-purple-400">4. Network Issues</h4>
                <p className="text-slate-300">
                  If deployed, make sure your domain is accessible. If local, use ngrok or similar tunnel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="text-center">
          <a
            href="/us-banks"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 px-6 py-3 rounded-2xl font-mono transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            BACK TO US BANKS DASHBOARD
          </a>
        </div>
      </div>
    </div>
  )
}
