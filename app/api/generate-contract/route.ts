import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    const contractHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Servicios - ${formData.clientName}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
            /* Remove browser headers and footers */
            @top-left { content: ""; }
            @top-center { content: ""; }
            @top-right { content: ""; }
            @bottom-left { content: ""; }
            @bottom-center { content: ""; }
            @bottom-right { content: ""; }
        }

        @media print {
            @page {
                size: A4;
                margin: 20mm;
            }
            body {
                font-size: 11pt;
                line-height: 1.2;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none !important;
            }
            /* Ensure no browser headers/footers */
            html, body {
                height: 100%;
                margin: 0;
                padding: 0;
            }
        }
        
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        
        .contract-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .contract-number {
            font-size: 14px;
            color: #666;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
            border-left: 4px solid #2563eb;
            padding-left: 10px;
        }
        
        .party-info {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        
        .party-title {
            font-weight: bold;
            color: #374151;
            margin-bottom: 8px;
        }
        
        .terms-list {
            list-style-type: decimal;
            padding-left: 20px;
        }
        
        .terms-list li {
            margin-bottom: 10px;
        }
        
        .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            gap: 40px;
        }
        
        .signature-block {
            flex: 1;
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 60px;
            padding-top: 10px;
        }
        
        .date-location {
            margin-top: 40px;
            text-align: right;
            font-style: italic;
        }
        
        .amount-highlight {
            background-color: #fef3c7;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">GALILEO CAPITAL</div>
        <div class="contract-title">CONTRATO DE SERVICIOS PROFESIONALES</div>
        <div class="contract-number">Contrato No. ${Date.now()}</div>
    </div>

    <div class="section">
        <div class="section-title">PARTES CONTRATANTES</div>
        
        <div class="party-info">
            <div class="party-title">PRESTADOR DE SERVICIOS:</div>
            <strong>GALILEO CAPITAL</strong><br>
            Cédula Jurídica: 3-101-123456<br>
            Teléfono: +506 2222-3333<br>
            Email: info@galileocapital.com<br>
            Dirección: San José, Costa Rica
        </div>
        
        <div class="party-info">
            <div class="party-title">CLIENTE:</div>
            <strong>${formData.clientName}</strong><br>
            ${formData.idType}: ${formData.clientId}<br>
            Teléfono: ${formData.phone}<br>
            Email: ${formData.email}<br>
            Dirección: ${formData.address}
        </div>
    </div>

    <div class="section">
        <div class="section-title">OBJETO DEL CONTRATO</div>
        <p><strong>Servicio:</strong> ${formData.serviceType}</p>
        <p><strong>Descripción:</strong> ${formData.serviceDescription}</p>
        <p><strong>Monto Total:</strong> <span class="amount-highlight">₡${Number.parseFloat(formData.amount).toLocaleString("es-CR")}</span></p>
        <p><strong>Fecha de Inicio:</strong> ${new Date(formData.startDate).toLocaleDateString("es-CR")}</p>
        <p><strong>Fecha de Finalización:</strong> ${new Date(formData.endDate).toLocaleDateString("es-CR")}</p>
    </div>

    <div class="section">
        <div class="section-title">TÉRMINOS Y CONDICIONES</div>
        <ol class="terms-list">
            <li><strong>Servicios:</strong> GALILEO CAPITAL se compromete a prestar los servicios descritos con la máxima diligencia y profesionalismo.</li>
            <li><strong>Pago:</strong> El cliente se compromete a pagar el monto acordado según los términos establecidos.</li>
            <li><strong>Confidencialidad:</strong> Ambas partes se comprometen a mantener la confidencialidad de la información intercambiada.</li>
            <li><strong>Modificaciones:</strong> Cualquier modificación a este contrato debe ser acordada por escrito por ambas partes.</li>
            <li><strong>Terminación:</strong> Este contrato puede ser terminado por cualquiera de las partes con previo aviso de 30 días.</li>
            <li><strong>Ley Aplicable:</strong> Este contrato se rige por las leyes de Costa Rica.</li>
            <li><strong>Resolución de Conflictos:</strong> Cualquier disputa será resuelta mediante arbitraje en Costa Rica.</li>
        </ol>
    </div>

    <div class="date-location">
        San José, Costa Rica<br>
        ${new Date().toLocaleDateString("es-CR")}
    </div>

    <div class="signature-section">
        <div class="signature-block">
            <div class="signature-line">
                <strong>GALILEO CAPITAL</strong><br>
                Representante Legal
            </div>
        </div>
        
        <div class="signature-block">
            <div class="signature-line">
                <strong>${formData.clientName}</strong><br>
                Cliente
            </div>
        </div>
    </div>
</body>
</html>`

    const filename = `Contrato_${formData.clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`

    return new NextResponse(contractHTML, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error generating contract:", error)
    return NextResponse.json({ error: "Error generating contract" }, { status: 500 })
  }
}
