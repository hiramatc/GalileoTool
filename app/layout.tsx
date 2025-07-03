import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GALILEO CAPITAL - Client Portfolio Access",
  description: "Secure access to arbitrage trading records and exchange history",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23F59E0B'/><path d='M35 35 L50 20 L65 35 L50 50 Z' fill='white'/><path d='M50 50 L35 65 L50 80 L65 65 Z' fill='white' opacity='0.8'/></svg>",
        type: "image/svg+xml",
      },
    ],
    shortcut:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23F59E0B'/><path d='M35 35 L50 20 L65 35 L50 50 Z' fill='white'/><path d='M50 50 L35 65 L50 80 L65 65 Z' fill='white' opacity='0.8'/></svg>",
    apple:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23F59E0B'/><path d='M35 35 L50 20 L65 35 L50 50 Z' fill='white'/><path d='M50 50 L35 65 L50 80 L65 65 Z' fill='white' opacity='0.8'/></svg>",
  },
  themeColor: "#F59E0B",
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23F59E0B'/><path d='M35 35 L50 20 L65 35 L50 50 Z' fill='white'/><path d='M50 50 L35 65 L50 80 L65 65 Z' fill='white' opacity='0.8'/></svg>"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
