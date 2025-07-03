'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, FileText, Save } from 'lucide-react'

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
    companyName: '',
    companyId: '',
    companyAddress: '',
    legalRepName: '',
    legalRepId: '',
    legalRepAddress: '',
    legalRepGender: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: keyof ContractData, value: string) => {
    setContractData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateContract = async () => {
    setIsGenerating(true)
    try {
      // This will call your contract generation API
      const response = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData)
      })

      if (response.ok) {
        // Download the generated PDF
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Contrato_${contractData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error('Failed to generate contract')
      }
    } catch (error) {
      console.error('Error generating contract:', error)
      alert('Failed to generate contract. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const isFormValid = Object.values(contractData).every(value => value.trim() !== '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Contract</h1>
          <p className="text-gray-300">Generate professional contracts with client information</p>
        </div>

        {/* Contract Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Information
              </CardTitle>
              <CardDescription className="text-gray-300">
                Fill in the client details to generate the contract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Company Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium text-gray-300">
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      value={contractData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="companyId" className="text-sm font-medium text-gray-300">
                      Company ID *
                    </Label>
                    <Input
                      id="companyId"
                      value={contractData.companyId}
                      onChange={(e) => handleInputChange('companyId', e.target.value)}
                      placeholder="Enter company ID"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="companyAddress" className="text-sm font-medium text-gray-300">
                    Company Address *
                  </Label>
                  <Input
                    id="companyAddress"
                    value={contractData.companyAddress}
                    onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                    placeholder="Enter complete company address"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Legal Representative Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Legal Representative Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legalRepName" className="text-sm font-medium text-gray-300">
                      Legal Representative Name *
                    </Label>
                    <Input
                      id="legalRepName"
                      value={contractData.legalRepName}
                      onChange={(e) => handleInputChange('legalRepName', e.target.value)}
                      placeholder="Enter legal rep name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="legalRepId" className="text-sm font-medium text-gray-300">
                      Legal Representative ID *
                    </Label>
                    <Input
                      id="legalRepId"
                      value={contractData.legalRepId}
                      onChange={(e) => handleInputChange('legalRepId', e.target.value)}
                      placeholder="Enter legal rep ID"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legalRepAddress" className="text-sm font-medium text-gray-300">
                      Legal Representative Address *
                    </Label>
                    <Input
                      id="legalRepAddress"
                      value={contractData.legalRepAddress}
                      onChange={(e) => handleInputChange('legalRepAddress', e.target.value)}
                      placeholder="Enter legal rep address"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="legalRepGender" className="text-sm font-medium text-gray-300">
                      Gender *
                    </Label>
                    <Select value={contractData.legalRepGender} onValueChange={(value) => handleInputChange('legalRepGender', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Señor</SelectItem>
                        <SelectItem value="female">Señora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={generateContract}
                  disabled={!isFormValid || isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate & Download PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
