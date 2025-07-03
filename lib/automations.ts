export interface AutomationConfig {
  id: string
  name: string
  description: string
  webhookUrl: string
  inputFields: {
    name: string
    type: "text" | "number" | "select"
    placeholder: string
    required: boolean
    options?: string[]
  }[]
  color: string
  icon: string
}

export const AUTOMATIONS: AutomationConfig[] = [
  {
    id: "client-search",
    name: "Client Search",
    description: "Search client portfolio data",
    webhookUrl: "https://hiramtc.app.n8n.cloud/webhook/client-search",
    inputFields: [
      {
        name: "query",
        type: "text",
        placeholder: "Enter client first name",
        required: true,
      },
    ],
    color: "amber",
    icon: "🔍",
  },
  {
    id: "portfolio-analysis",
    name: "Portfolio Analysis",
    description: "Analyze portfolio performance",
    webhookUrl: "https://hiramtc.app.n8n.cloud/webhook/portfolio-analysis",
    inputFields: [
      {
        name: "portfolioId",
        type: "text",
        placeholder: "Enter portfolio ID",
        required: true,
      },
      {
        name: "timeframe",
        type: "select",
        placeholder: "Select timeframe",
        required: true,
        options: ["1D", "1W", "1M", "3M", "1Y"],
      },
    ],
    color: "emerald",
    icon: "📊",
  },
  {
    id: "risk-assessment",
    name: "Risk Assessment",
    description: "Assess investment risk",
    webhookUrl: "https://hiramtc.app.n8n.cloud/webhook/risk-assessment",
    inputFields: [
      {
        name: "symbol",
        type: "text",
        placeholder: "Enter asset symbol",
        required: true,
      },
      {
        name: "amount",
        type: "number",
        placeholder: "Investment amount",
        required: false,
      },
    ],
    color: "red",
    icon: "⚠️",
  },
]
