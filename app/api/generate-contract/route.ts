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
}

// Complete HTML template with all sections
const getContractHTML = (data: ContractData): string => {
  // Handle gender representation
  const genderRepresentation =
    data.legalRepGender === "male" ? "representado por el señor" : "representada por la señora"

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Servicios de Custodia y Transferencia de Fondos</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
        }
        
        .contract-container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .title {
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 10px;
            text-decoration: underline;
        }
        
        .subtitle {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 20px;
        }
        
        .section {
            margin-bottom: 15px;
        }
        
        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .subsection {
            margin-left: 20px;
            margin-bottom: 10px;
        }
        
        .numbered-list {
            margin-left: 20px;
        }
        
        .numbered-list li {
            margin-bottom: 8px;
        }
        
        .underline {
            text-decoration: underline;
        }
        
        .bold {
            font-weight: bold;
        }
        
        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }
        
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .signature-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 20px;
            border: none;
        }
        
        .signature-line {
            border-top: 1px solid black;
            margin-top: 40px;
            margin-bottom: 10px;
            width: 200px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .signature-name {
            font-weight: bold;
            margin-top: 10px;
        }
        
        .signature-title {
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            .contract-container {
                max-width: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="contract-container">
        <div class="header">
            <div class="title">CONTRATO DE SERVICIOS DE CUSTODIA Y TRANSFERENCIA DE FONDOS</div>
            <div class="subtitle">GIO CAPITAL GROUP SA Y ${data.companyName}</div>
        </div>

        <div class="section">
            <p><strong>Entre nosotros:</strong></p>
            
            <p>(a) <strong>GIO CAPITAL GROUP SA</strong> (el "<span class="underline bold">Custodio</span>"), cédula jurídica número 3-101-854846, con domicilio social en San José, en este acto representada por el señor Maximiliano Xiques, mayor de edad, Soltero, empresario, vecino de San José, en su condición de representante legal y</p>
            
            <p>(b) <strong>${data.companyName}</strong> (el "<span class="underline bold">Cliente</span>"), cédula jurídica número ${data.companyId}, con domicilio social en ${data.companyAddress}, en este acto ${genderRepresentation} ${data.legalRepName}, cédula de identidad ${data.legalRepId}, con domicilio en ${data.legalRepAddress}.</p>
            
            <p>El Custodio y el Cliente podrán ser referidos en este Contrato como las "<span class="underline bold">Partes</span>", o individualmente, como la "<span class="underline bold">Parte</span>".</p>
        </div>

        <div class="section">
            <div class="section-title bold">ANTECEDENTES:</div>
            
            <div class="numbered-list">
                <p><strong>I.</strong> El Custodio está debidamente inscrito ante la Superintendencia General de Entidades Financieras ("SUGEF") para su debida supervisión en materia de prevención de legitimación de capitales, financiamiento al terrorismo y financiamiento de la proliferación de armas de destrucción masiva, según lo dispuesto en la Ley N° 7786, "Ley sobre estupefacientes, sustancias psicotrópicas, drogas de uso no autorizado, actividades conexas, legitimación de capitales y financiamiento al terrorismo", y ostenta la inscripción para realizar las siguientes actividades: administración de recursos financieros por medio de fideicomisos o cualquier otro tipo de administración de recursos, efectuada por personas jurídicas que no sean intermediarios financieros; las operaciones sistemáticas y sustanciales de canje de dinero y transferencias, mediante cheques, giros bancarios, letras de cambio o similares; y las transferencias sistemáticas sustanciales de fondos, realizadas por cualquier medio.</p>
                
                <p><strong>II.</strong> El Cliente requiere contratar del Custodio, los servicios de custodia de los fondos económicos que reciba producto de la prestación de los servicios de GIO, los cuales se recibirán posterior a que GIO realice las inversiones que el Cliente le instruirá y que en todo momento deberán ser de conformidad con la legislación aplicable a la actividad regulada para GIO, sea las leyes de los Estados Unidos de América, y su posterior transferencia bancaria dentro de las entidades del sistema bancario nacional a las cuentas del Cliente, y en las cantidades, que oportunamente el Cliente le instruirá al Custodio.</p>
            </div>
        </div>

        <div class="section">
            <p><strong>POR TANTO</strong>, con el propósito de consignar en un documento los acuerdos de las Partes, las Partes han convenido en suscribir el presente Contrato de servicios de custodia y transferencia de fondos dentro del territorio de Costa Rica (en adelante el "<span class="underline bold">Contrato</span>"), que se regirá por las siguientes cláusulas y estipulaciones:</p>
        </div>

        <div class="section">
            <div class="section-title bold">PRIMERA: OBJETO DEL CONTRATO</div>
            <p>Por medio del presente Contrato, el Cliente contrata del Custodio los servicios de custodia y transferencia de fondos, los cuales consisten en:</p>
            <div class="numbered-list">
                <p><strong>a)</strong> Recibir y custodiar los fondos que el Cliente deposite en las cuentas bancarias del Custodio.</p>
                <p><strong>b)</strong> Transferir dichos fondos a las cuentas bancarias que el Cliente designe, siguiendo las instrucciones específicas del Cliente.</p>
                <p><strong>c)</strong> Mantener registros detallados de todas las transacciones realizadas.</p>
                <p><strong>d)</strong> Proporcionar reportes periódicos sobre el estado de los fondos custodiados.</p>
            </div>
        </div>

        <div class="section">
            <div class="section-title bold">SEGUNDA: OBLIGACIONES DEL CUSTODIO</div>
            <p>El Custodio se obliga a:</p>
            <div class="numbered-list">
                <p><strong>a)</strong> Custodiar los fondos del Cliente con la debida diligencia y cuidado.</p>
                <p><strong>b)</strong> Ejecutar las instrucciones de transferencia del Cliente de manera oportuna y precisa.</p>
                <p><strong>c)</strong> Mantener la confidencialidad de toda la información relacionada con los fondos del Cliente.</p>
                <p><strong>d)</strong> Cumplir con todas las regulaciones aplicables en materia de prevención de legitimación de capitales.</p>
                <p><strong>e)</strong> Proporcionar al Cliente acceso a la información sobre el estado de sus fondos.</p>
            </div>
        </div>

        <div class="section">
            <div class="section-title bold">TERCERA: OBLIGACIONES DEL CLIENTE</div>
            <p>El Cliente se obliga a:</p>
            <div class="numbered-list">
                <p><strong>a)</strong> Proporcionar instrucciones claras y precisas para las transferencias de fondos.</p>
                <p><strong>b)</strong> Mantener actualizada su información de contacto y datos bancarios.</p>
                <p><strong>c)</strong> Cumplir con todas las regulaciones aplicables en materia financiera.</p>
                <p><strong>d)</strong> Pagar oportunamente las comisiones y gastos acordados.</p>
                <p><strong>e)</strong> Notificar inmediatamente cualquier cambio en su situación legal o financiera.</p>
            </div>
        </div>

        <div class="section">
            <div class="section-title bold">CUARTA: COMISIONES Y GASTOS</div>
            <p>El Cliente pagará al Custodio las siguientes comisiones:</p>
            <div class="numbered-list">
                <p><strong>a)</strong> Comisión por custodia: 0.5% mensual sobre el saldo promedio custodiado.</p>
                <p><strong>b)</strong> Comisión por transferencia: $25.00 por cada transferencia realizada.</p>
                <p><strong>c)</strong> Gastos bancarios: Los gastos bancarios serán por cuenta del Cliente.</p>
            </div>
        </div>

        <div class="section">
            <div class="section-title bold">QUINTA: VIGENCIA Y TERMINACIÓN</div>
            <p>Este Contrato tendrá una vigencia de un (1) año a partir de la fecha de firma, renovándose automáticamente por períodos iguales, salvo que cualquiera de las Partes notifique por escrito su intención de no renovar con al menos treinta (30) días de anticipación.</p>
        </div>

        <div class="section">
            <div class="section-title bold">SEXTA: CONFIDENCIALIDAD</div>
            <p>Las Partes se comprometen a mantener estricta confidencialidad sobre toda la información intercambiada en el marco de este Contrato, incluyendo pero no limitándose a montos, transacciones, y datos personales.</p>
        </div>

        <div class="section">
            <div class="section-title bold">SÉPTIMA: RESOLUCIÓN DE CONFLICTOS</div>
            <p>Cualquier controversia que surja de este Contrato será resuelta mediante arbitraje de conformidad con el Reglamento de Arbitraje del Centro de Conciliación y Arbitraje de la Cámara de Comercio de Costa Rica.</p>
        </div>

        <div class="section">
            <div class="section-title bold">OCTAVA: LEY APLICABLE</div>
            <p>Este Contrato se regirá por las leyes de la República de Costa Rica.</p>
        </div>
        
        <div class="signature-section">
            <p>Como constancia de aceptación y consentimiento, las Partes suscribimos el presente Contrato en San José, en dos tantos de un mismo original, el día _____ del mes de _____________ del año _______.</p>
            
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
</body>
</html>`
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
      "companyName",
      "companyId",
      "companyAddress",
      "legalRepName",
      "legalRepId",
      "legalRepAddress",
      "legalRepGender",
    ]
    const missingFields = requiredFields.filter((field) => !contractData[field as keyof ContractData])

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Generate the HTML with the contract data
    const html = getContractHTML(contractData)

    // Return clean HTML without extra headers for printing
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Error generating contract:", error)
    return NextResponse.json({ error: "Failed to generate contract" }, { status: 500 })
  }
}
