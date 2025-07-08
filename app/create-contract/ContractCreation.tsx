"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, FileText, Download, Loader2 } from "lucide-react"

interface ContractData {
  companyName: string
  companyId: string
  companyAddress: string
  legalRepName: string
  legalRepId: string
  legalRepAddress: string
  gender: string
}

export default function ContractCreation() {
  const [formData, setFormData] = useState<ContractData>({
    companyName: "",
    companyId: "",
    companyAddress: "",
    legalRepName: "",
    legalRepId: "",
    legalRepAddress: "",
    gender: "",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [contractGenerated, setContractGenerated] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const handleInputChange = (field: keyof ContractData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateContract = async () => {
    // Validate required fields
    const requiredFields = [
      "companyName",
      "companyId",
      "companyAddress",
      "legalRepName",
      "legalRepId",
      "legalRepAddress",
      "gender",
    ]

    const missingFields = requiredFields.filter((field) => !formData[field as keyof ContractData])

    if (missingFields.length > 0) {
      alert("Please fill in all required fields")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate contract")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setContractGenerated(true)
    } catch (error) {
      console.error("Error generating contract:", error)
      alert("Failed to generate contract. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadContract = () => {
    if (pdfUrl) {
      const link = document.createElement("a")
      link.href = pdfUrl
      link.download = `Custody_Transfer_Contract_${formData.companyName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-500/20 p-3 rounded-xl">
            <FileText className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Contract Information</h1>
            <p className="text-gray-400">Fill in the client details to generate the custody and transfer contract</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-8">
        {/* Company Information */}
        <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-600/30">
          <CardHeader>
            <CardTitle className="text-amber-400 text-lg">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-white">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-amber-400/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyId" className="text-white">
                  Company ID (Cédula Jurídica) *
                </Label>
                <Input
                  id="companyId"
                  placeholder="e.g., 3-101-123456"
                  value={formData.companyId}
                  onChange={(e) => handleInputChange("companyId", e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-amber-400/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress" className="text-white">
                Company Address *
              </Label>
              <Input
                id="companyAddress"
                placeholder="Enter complete company address"
                value={formData.companyAddress}
                onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-amber-400/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal Representative Information */}
        <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-600/30">
          <CardHeader>
            <CardTitle className="text-emerald-400 text-lg">Legal Representative Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="legalRepName" className="text-white">
                  Legal Representative Name *
                </Label>
                <Input
                  id="legalRepName"
                  placeholder="Enter full name"
                  value={formData.legalRepName}
                  onChange={(e) => handleInputChange("legalRepName", e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-amber-400/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalRepId" className="text-white">
                  Legal Representative ID *
                </Label>
                <Input
                  id="legalRepId"
                  placeholder="Enter ID number"
                  value={formData.legalRepId}
                  onChange={(e) => handleInputChange("legalRepId", e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-amber-400/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="legalRepAddress" className="text-white">
                  Legal Representative Address *
                </Label>
                <Input
                  id="legalRepAddress"
                  placeholder="Enter complete address"
                  value={formData.legalRepAddress}
                  onChange={(e) => handleInputChange("legalRepAddress", e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-amber-400/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-white">
                  Gender (for legal language) *
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white focus:border-amber-400/50">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={generateContract}
            disabled={isGenerating}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
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

        {/* Contract Information */}
        <Card className="bg-blue-900/20 backdrop-blur-xl border-blue-600/30">
          <CardHeader>
            <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">
              This generates a professional custody and transfer contract between GIO Capital Group SA and the specified
              client. The contract includes all necessary legal clauses, terms, and conditions for financial services in
              Costa Rica.
            </p>
          </CardContent>
        </Card>

        {/* Download Section */}
        {contractGenerated && pdfUrl && (
          <Card className="bg-green-900/20 backdrop-blur-xl border-green-600/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-green-400 text-lg font-semibold">Contract Generated Successfully!</div>
                <Button
                  onClick={downloadContract}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Contract PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
