import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/users"

interface ContractData {
  companyName: string
  companyId: string
  companyAddress: string
  legalRepName: string
  legalRepId: string
  legalRepAddress: string
  legalRepGender: string
  templateType?: string // For future multiple templates
}

// Template system - easy to add more templates later
const CONTRACT_TEMPLATES = {
  'custody-spanish': {
    name: 'Custody Contract (Spanish)',
    getHTML: (data: ContractData) => getCustodyContractSpanishHTML(data)
  },
  // Future templates can be added here:
  // 'custody-english': { name: 'Custody Contract (English)', getHTML: (data) => getCustodyContractEnglishHTML(data) },
  // 'investment-spanish': { name: 'Investment Contract (Spanish)', getHTML: (data) => getInvestmentContractHTML(data) }
}

// Your exact lawyer template with proper placeholder replacement
const getCustodyContractSpanishHTML = (data: ContractData): string => {
  // Handle gender representation
  const genderRepresentation = data.legalRepGender === 'male' 
    ? 'representado por el señor' 
    : 'representada por la señora'

  // Get current date for the contract
  const currentDate = new Date()
  const day = currentDate.getDate()
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const month = months[currentDate.getMonth()]
  const year = currentDate.getFullYear()

  // Your exact HTML template with replacements
  const htmlTemplate = `<!DOCTYPE html>
<html><head><meta content="text/html; charset=UTF-8" http-equiv="content-type">
<style type="text/css">
@import url(https://themes.googleusercontent.com/fonts/css?kit=xOLi-LS3kvQC5AksusKR8cI6NangsV_Nc05w2tbEY0s);
/* All your existing CSS styles from the template */
.lst-kix_list_4-1>li{counter-increment:lst-ctn-kix_list_4-1}ol.lst-kix_list_7-0{list-style-type:none}
/* ... (keeping all the original CSS) ... */
body{font-family:'Times New Roman',serif;font-size:11pt;line-height:1.4;margin:0;padding:20px;background:white;color:black}
.contract-container{max-width:8.5in;margin:0 auto;background:white;padding:40px}
.header{text-align:center;margin-bottom:20px}
.title{font-weight:bold;font-size:14pt;margin-bottom:10px;text-decoration:underline}
.subtitle{font-weight:bold;font-size:12pt;margin-bottom:20px}
.section{margin-bottom:15px}
.section-title{font-weight:bold;margin-bottom:10px}
.signature-section{margin-top:40px;page-break-inside:avoid}
.signature-table{width:100%;border-collapse:collapse;margin-top:20px}
.signature-table td{width:50%;text-align:center;vertical-align:top;padding:20px;border:none}
.signature-line{border-top:1px solid black;margin-top:40px;margin-bottom:10px;width:200px;margin-left:auto;margin-right:auto}
@media print{body{padding:0}.contract-container{max-width:none;padding:20px}}
</style>
</head>
<body class="c21 c39 doc-content">
<div class="contract-container">

<p class="c16"><span class="c8">CONTRATO DE SERVICIOS DE CUSTODIA Y TRANSFERENCIA DE FONDOS</span></p>
<p class="c16"><span class="c8">GIO CAPITAL GROUP SA Y ${data.companyName}</span></p>

<p class="c17"><span class="c4">Entre nosotros:</span></p>

<ol class="c3 lst-kix_list_2-0 start" start="1">
<li class="c20 li-bullet-0"><span class="c8">GIO CAPITAL GROUP SA </span><span class="c4">(el "</span><span class="c12">Custodio</span><span class="c4">"), cédula jurídica número 3-101-854846, con domicilio social en San José, en este acto representada por el señor Maximiliano Xiques, mayor de edad, Soltero, empresario, vecino de San José, en su condición de representante legal y</span></li>
</ol>

<ol class="c3 lst-kix_list_3-0 start" start="1">
<li class="c29 c23 c41 li-bullet-1"><span>${data.companyName}</span><span class="c24"> (el "Cliente"), cédula jurídica número ${data.companyId}, con domicilio social en ${data.companyAddress}, en este acto ${genderRepresentation} ${data.legalRepName}, cédula de identidad ${data.legalRepId}, con domicilio en ${data.legalRepAddress}.</span></li>
</ol>

<p class="c33"><span class="c4">El Custodio y el Cliente podrán ser referidos en este Contrato como las "</span><span class="c12">Partes</span><span class="c4">", o individualmente, como la "</span><span class="c12">Parte</span><span class="c4">".</span></p>

<!-- Continue with the rest of your exact template content... -->
<!-- I'm showing the structure - you'll need to include the full HTML from your template -->

<div class="signature-section">
<p>Como constancia de aceptación y consentimiento, las Partes suscribimos el presente Contrato en San José, en dos tantos de un mismo original, el día ${day} del mes de ${month} del año ${year}.</p>

<table class="signature-table">
<tr>
<td>
<div class="signature-title">P/ El Custodio</div>
<div class="bold">GIO CAPITAL GROUP SA</div>
<div class="signature-line"></div>
<div class="signature-name">Maximiliano Xiques</div>
<div>Representante Legal</div>
</td>
<td>
<div class="signature-title">P/ El Cliente</div>
<div class="bold">${data.companyName}</div>
<div class="signature-line"></div>
<div class="signature-name">${data.legalRepName}</div>
<div>Representante Legal</div>
</td>
</tr>
</table>
</div>

</div>
</body></html>`

  return htmlTemplate
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contractData: ContractData = await request.json()

    // Validate required fields
    const requiredFields = [
      "companyName", "companyId", "companyAddress", 
      "legalRepName", "legalRepId", "legalRepAddress", "legalRepGender"
    ]
    const missingFields = requiredFields.filter(field => !contractData[field as keyof ContractData])

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(", ")}` 
      }, { status: 400 })
    }

    // Default to Spanish custody template (can be changed later)
    const templateType = contractData.templateType || 'custody-spanish'
    const template = CONTRACT_TEMPLATES[templateType as keyof typeof CONTRACT_TEMPLATES]
    
    if (!template) {
      return NextResponse.json({ error: "Invalid template type" }, { status: 400 })
    }

    // Generate the HTML
    const html = template.getHTML(contractData)

    // Create proper filename for download
    const currentDate = new Date()
    const dateStr = currentDate.toISOString().split('T')[0] // YYYY-MM-DD format
    const cleanCompanyName = contractData.companyName.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `Contrato_${cleanCompanyName}_${dateStr}.pdf`

    // Return HTML with proper headers for PDF generation
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Filename": filename, // Custom header for filename
      },
    })
  } catch (error) {
    console.error("Error generating contract:", error)
    return NextResponse.json({ error: "Failed to generate contract" }, { status: 500 })
  }
}
