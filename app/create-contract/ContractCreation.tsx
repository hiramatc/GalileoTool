"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Eye } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface ContractData {
  companyName: string
  companyId: string
  companyAddress: string
  legalRepName: string
  legalRepId: string
  legalRepAddress: string
  legalRepGender: string
}

export default function ContractCreation() {
  const [contractData, setContractData] = useState<ContractData>({
    companyName: "",
    companyId: "",
    companyAddress: "",
    legalRepName: "",
    legalRepId: "",
    legalRepAddress: "",
    legalRepGender: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

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

  const handleInputChange = (field: keyof ContractData, value: string) => {
    setContractData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateContract = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contractData),
      })

      if (response.ok) {
        // Get the HTML content
        const htmlContent = await response.text()

        // Create a simple PDF using browser's print functionality
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(`
          <html>
            <head>
              <title>Contract - ${contractData.companyName}</title>
              <style>
                @media print {
                  body { margin: 0; }
                  @page { margin: 0.5in; }
                }
              </style>
            </head>
            <body>
              ${htmlContent}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => window.close(), 1000);
                }
              </script>
            </body>
          </html>
        `)
          printWindow.document.close()
        }
      } else {
        throw new Error("Failed to generate contract")
      }
    } catch (error) {
      console.error("Error generating contract:", error)
      alert("Failed to generate contract. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const isFormValid = Object.values(contractData).every((value) => value.trim() !== "")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background effects */}
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

      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-5xl relative z-10">
        {/* Header with Navigation - Fixed Layout */}
        <header className="mb-8 md:mb-16">
          <div className="flex flex-col gap-4">
            {/* Logo and Title Row */}
            <div className="flex items-center gap-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-xim7Sf7mjX1q0kZdL8yllT6RrzLWCl.png"
                alt="GALILEO CAPITAL"
                className="h-8 md:h-12 w-auto filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
              <div className="flex-1">
                <h1 className="text-xl md:text-3xl font-light">Contract Generator</h1>
                <p className="text-slate-400 font-mono text-xs md:text-sm">PROFESSIONAL LEGAL DOCUMENTS</p>
              </div>
            </div>

            {/* Navigation Row */}
            <div className="flex justify-end">
              <Navigation currentPage="create-contract" isAdmin={isAdmin} />
            </div>
          </div>
        </header>

        {/* Contract Form */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-600/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-amber-400" />
                Contract Information
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Fill in the client details to generate the custody and transfer contract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Company Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-amber-400 border-b border-amber-400/30 pb-3">
                  Company Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium text-slate-300 mb-2 block">
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      value={contractData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      placeholder="Enter company name"
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 p-4 text-lg rounded-2xl focus:bg-slate-700/70 focus:border-amber-400/50 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyId" className="text-sm font-medium text-slate-300 mb-2 block">
                      Company ID (Cédula Jurídica) *
                    </Label>
                    <Input
                      id="companyId"
                      value={contractData.companyId}
                      onChange={(e) => handleInputChange("companyId", e.target.value)}
                      placeholder="e.g., 3-101-123456"
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 p-4 text-lg rounded-2xl focus:bg-slate-700/70 focus:border-amber-400/50 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyAddress" className="text-sm font-medium text-slate-300 mb-2 block">
                    Company Address *
                  </Label>
                  <Input
                    id="companyAddress"
                    value={contractData.companyAddress}
                    onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                    placeholder="Enter complete company address"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 p-4 text-lg rounded-2xl focus:bg-slate-700/70 focus:border-amber-400/50 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Legal Representative Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-emerald-400 border-b border-emerald-400/30 pb-3">
                  Legal Representative Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label htmlFor="legalRepName" className="text-sm font-medium text-slate-300 mb-2 block">
                      Legal Representative Name *
                    </Label>
                    <Input
                      id="legalRepName"
                      value={contractData.legalRepName}
                      onChange={(e) => handleInputChange("legalRepName", e.target.value)}
                      placeholder="Enter full name"
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 p-4 text-lg rounded-2xl focus:bg-slate-700/70 focus:border-emerald-400/50 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="legalRepId" className="text-sm font-medium text-slate-300 mb-2 block">
                      Legal Representative ID *
                    </Label>
                    <Input
                      id="legalRepId"
                      value={contractData.legalRepId}
                      onChange={(e) => handleInputChange("legalRepId", e.target.value)}
                      placeholder="Enter ID number"
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 p-4 text-lg rounded-2xl focus:bg-slate-700/70 focus:border-emerald-400/50 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label htmlFor="legalRepAddress" className="text-sm font-medium text-slate-300 mb-2 block">
                      Legal Representative Address *
                    </Label>
                    <Input
                      id="legalRepAddress"
                      value={contractData.legalRepAddress}
                      onChange={(e) => handleInputChange("legalRepAddress", e.target.value)}
                      placeholder="Enter complete address"
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 p-4 text-lg rounded-2xl focus:bg-slate-700/70 focus:border-emerald-400/50 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="legalRepGender" className="text-sm font-medium text-slate-300 mb-2 block">
                      Gender (for legal language) *
                    </Label>
                    <Select
                      value={contractData.legalRepGender}
                      onValueChange={(value) => handleInputChange("legalRepGender", value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white p-4 text-lg rounded-2xl focus:bg-slate-700/70 focus:border-emerald-400/50 transition-all duration-300 [&>span]:text-white">
                        <SelectValue placeholder="Select gender" className="text-white" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 text-white">
                        <SelectItem
                          value="male"
                          className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                        >
                          Señor (Male)
                        </SelectItem>
                        <SelectItem
                          value="female"
                          className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white"
                        >
                          Señora (Female)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={generateContract}
                  disabled={!isFormValid || isGenerating}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 border-none rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/25 disabled:opacity-60 flex-1 py-4 text-lg font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <FileText className="h-5 w-5 mr-2 animate-pulse" />
                      Generating Contract...
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 mr-2" />
                      Generate & Preview Contract
                    </>
                  )}
                </Button>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-2xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-400 font-semibold mb-2">Contract Information</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      This generates a professional custody and transfer contract between GIO Capital Group SA and the
                      specified client. The contract includes all necessary legal clauses, terms, and conditions for
                      financial services in Costa Rica.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}
