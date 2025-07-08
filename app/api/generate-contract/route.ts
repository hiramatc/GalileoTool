import { NextResponse } from "next/server"
import puppeteer from "puppeteer"

type ContractData = {
  companyName: string
  companyId: string
  companyAddress: string
  legalRepName: string
  legalRepId: string
  legalRepAddress: string
  legalRepGender: string
}

export async function POST(request: Request) {
  try {
    const data: ContractData = await request.json()

    if (!data) {
      return NextResponse.json({ error: "Missing contract data" }, { status: 400 })
    }

    // Generate HTML content
    const contractHTML = getContractHTML(data)

    // Convert HTML to PDF using Puppeteer with enhanced configuration
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    })

    const page = await browser.newPage()

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 1600 })

    // Set content with proper wait conditions
    await page.setContent(contractHTML, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    })

    // Wait a bit more to ensure fonts are loaded
    await page.waitForTimeout(1000)

    // Generate PDF with enhanced settings
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
      timeout: 30000,
    })

    await browser.close()

    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("Generated PDF is empty")
    }

    // Return PDF as response with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length.toString(),
        "Content-Disposition": `attachment; filename="Contrato_${data.companyName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error generating contract:", error)
    return NextResponse.json(
      {
        error: "Failed to generate contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

const getContractHTML = (data: ContractData): string => {
  // Handle gender representation exactly as in machote
  const genderRepresentation =
    data.legalRepGender === "male" ? "representado por el señor" : "representada por la señora"

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato - ${data.companyName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman:wght@400;700&display=swap');
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', 'Times', serif;
            font-size: 11pt;
            line-height: 1.2;
            margin: 0;
            padding: 0;
            background: white;
            color: black;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .contract-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 20mm;
            min-height: 297mm;
        }
        
        .center {
            text-align: center;
            margin-bottom: 12pt;
        }
        
        .left {
            text-align: left;
            margin-bottom: 12pt;
        }
        
        .section {
            margin-bottom: 12pt;
            text-align: justify;
            text-justify: inter-word;
        }
        
        .numbered-section {
            margin-left: 18pt;
            padding-left: 17.5pt;
            margin-right: 2.4pt;
            text-align: justify;
            text-justify: inter-word;
            margin-bottom: 12pt;
        }
        
        .subsection {
            margin-left: 36pt;
            padding-left: 3.6pt;
            text-align: justify;
            text-justify: inter-word;
            margin-bottom: 12pt;
        }
        
        .sub-subsection {
            margin-left: 54pt;
            padding-left: 7.2pt;
            text-align: justify;
            text-justify: inter-word;
            margin-bottom: 12pt;
        }
        
        .bold {
            font-weight: bold;
        }
        
        .underline {
            text-decoration: underline;
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
            padding: 20pt 10pt;
            text-align: center;
            vertical-align: top;
            border: none;
        }
        
        .signature-line {
            border-top: 1px solid black;
            margin: 40px auto 10px auto;
            width: 200px;
        }
        
        @page {
            size: A4;
            margin: 20mm;
        }
        
        @media print {
            body {
                font-size: 11pt;
            }
            .contract-container {
                max-width: none;
                padding: 0;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="contract-container">
        <div class="center">
            <div class="bold">CONTRATO DE SERVICIOS DE CUSTODIA Y TRANSFERENCIA DE FONDOS</div>
        </div>
        <div class="center">
            <div class="bold">GIO CAPITAL GROUP SA Y ${data.companyName}</div>
        </div>

        <div class="left">
            <div>Entre nosotros:</div>
        </div>

        <div class="numbered-section">
            <strong>GIO CAPITAL GROUP SA</strong> (el "<span class="underline bold">Custodio</span>"), cédula jurídica número 3-101-854846, con domicilio social en San José, en este acto representada por el señor Maximiliano Xiques, mayor de edad, Soltero, empresario, vecino de San José, en su condición de representante legal y
        </div>

        <div class="numbered-section">
            <strong>${data.companyName}</strong> (el "Cliente"), cédula jurídica número ${data.companyId}, con domicilio social en ${data.companyAddress}, en este acto ${genderRepresentation} ${data.legalRepName}, cédula de identidad ${data.legalRepId}, con domicilio en ${data.legalRepAddress}.
        </div>

        <div class="section">
            El Custodio y el Cliente podrán ser referidos en este Contrato como las "<span class="underline bold">Partes</span>", o individualmente, como la "<span class="underline bold">Parte</span>".
        </div>

        <div class="center">
            <div class="bold">ANTECEDENTES:</div>
        </div>

        <div class="subsection">
            <strong>I.</strong> El Custodio está debidamente inscrito ante la Superintendencia General de Entidades Financieras ("SUGEF") para su debida supervisión en materia de prevención de legitimación de capitales, financiamiento al terrorismo y financiamiento de la proliferación de armas de destrucción masiva, según lo dispuesto en la Ley N° 7786, "Ley sobre estupefacientes, sustancias psicotrópicas, drogas de uso no autorizado, actividades conexas, legitimación de capitales y financiamiento al terrorismo", y ostenta la inscripción para realizar las siguientes actividades: administración de recursos financieros por medio de fideicomisos o cualquier otro tipo de administración de recursos, efectuada por personas jurídicas que no sean intermediarios financieros; las operaciones sistemáticas y sustanciales de canje de dinero y transferencias, mediante cheques, giros bancarios, letras de cambio o similares; y las transferencias sistemáticas sustanciales de fondos, realizadas por cualquier medio.
        </div>

        <div class="subsection">
            <strong>II.</strong> El Cliente requiere contratar del Custodio, los servicios de custodia de los fondos económicos que reciba producto de la prestación de los servicios de GIO, los cuales se recibirán posterior a que GIO realice las inversiones que el Cliente le instruirá y que en todo momento deberán ser de conformidad con la legislación aplicable a la actividad regulada para GIO, sea las leyes de los Estados Unidos de América, y su posterior transferencia bancaria dentro de las entidades del sistema bancario nacional a las cuentas del Cliente, y en las cantidades, que oportunamente el Cliente le instruirá al Custodio.
        </div>

        <div class="left">
            <strong>POR TANTO</strong>, con el propósito de consignar en un documento los acuerdos de las Partes, las Partes han convenido en suscribir el presente Contrato de servicios de custodia y transferencia de fondos dentro del territorio de Costa Rica (en adelante el "<span class="underline bold">Contrato</span>"), que se regirá por las siguientes cláusulas y estipulaciones:
        </div>

        <div class="numbered-section">
            <strong>1. OBJETO DEL CONTRATO.</strong>
        </div>

        <div class="subsection">
            1.1. Sujeto a los términos y condiciones del presente Contrato, el Custodio se obliga a prestar los servicios de custodia y transferencia de fondos al Cliente (los "<span class="underline bold">Servicios</span>"). Este servicio recaerá únicamente sobre aquellos fondos que provengan de una operación de intercambio de dineros o numerario (o inversiones en general) que GIO haya realizado legalmente en Estados Unidos de América de conformidad con la autorización de MSB que ostenta, y que por instrucciones del Cliente -y en atención a este Contrato- le sean remitidos al Custodio por cuenta del Cliente.
        </div>

        <div class="subsection">
            1.2. Una vez recibidos los fondos, el Custodio lo comunicará al Cliente a través de la aplicación o medio que oportunamente decida el Custodio, para lo cual el Cliente acepta que, en caso que se le requiera por parte del Custodio, deberá generar un usuario único y una contraseña para ingresar a la plataforma en donde podrá visibilizar los fondos a su disposición que estén bajo custodia del Custodio. En cualquier momento, el Cliente podrá instruir al Custodio para que le transfiera parte o todos los fondos tenidos en custodia a las cuentas bancarias propiedad del Cliente que estén abiertas en el sistema bancario nacional, y queda así autorizado el Custodio para revelar la existencia de este Contrato a la entidad financiera que así lo requiera como parte de su proceso de verificación del origen de los fondos a transferir.
        </div>

        <div class="subsection">
            1.3. En virtud del contrato de custodia de los fondos del Cliente aquí acordado, el Custodio abrirá una cuenta de orden dedicada exclusivamente a los fondos del Cliente, bajo la administración del Custodio de conformidad con las instrucciones que el Cliente le gire al respecto a través de los sistemas electrónicos propiedad de GIO que han sido puestos a disposición del del Cliente por su titular únicamente para estos propósitos.
        </div>

        <div class="subsection">
            1.4. EL cliente entiende y reconoce que la inscripción del Custodio en SUGEF esta no es una autorización para operar, y la supervisión que ejerce esa Superintendencia es sólo en materia de prevención de legitimación de capitales, financiamiento al terrorismo y financiamiento de la proliferación de armas de destrucción masiva, según lo dispuesto en la Ley N° 7786, "Ley sobre estupefacientes, sustancias psicotrópicas, drogas de uso no autorizado, actividades conexas, legitimación de capitales y financiamiento al terrorismo". Por lo tanto, la SUGEF no supervisa los negocios que ofrece y realiza el Custodio, ni su seguridad, estabilidad o solvencia. Las personas que contraten sus productos y servicios lo hacen bajo su cuenta y riesgo.
        </div>

        <div class="numbered-section">
            <strong>2. PLAZO.</strong>
        </div>

        <div class="subsection">
            2.1. Por su naturaleza, este contrato es de duración indefinida.
        </div>

        <div class="subsection">
            2.2. No obstante, el Custodio podrá de dar por terminado unilateralmente el presente contrato en cualquier momento sin responsabilidad alguna, siempre que le comunique al Cliente su decisión de terminarlo con al menos siete (7) días naturales de anticipación a la fecha en que desea darlo por finalizado, así como el medio por el cual le entregará los fondos propiedad del Cliente que a dicha fecha conserve bajo su custodia.
        </div>

        <div class="subsection">
            2.3. Por su parte, el Cliente podrá dar por terminado este contrato sin antelación alguna, para lo cual deberá instruir al Custodio para que realice la transferencia de los fondos de su propiedad que aún mantenga en custodia a una cuenta bancaria costarricense de este último, la cual se deberá ejecutar en un plazo máximo de siete (7) días naturales.
        </div>

        <div class="subsection">
            2.4. En virtud de la normativa aplicable de prevención de lavado de dinero y narcotráfico, en particular la Ley 7786, usted entiende que su información personal y transaccional permanecerá bajo resguardo del Custodio aún terminado este contrato por un plazo mínimo de cinco años.
        </div>

        <div class="subsection">
            2.5. Bajo ninguna circunstancia el Custodio o el Cliente estarán obligados a indemnizar a la contraparte por la terminación de este Contrato de conformidad con la presente cláusula.
        </div>

        <div class="numbered-section">
            <strong>3. HONORARIOS Y FORMA DE PAGO.</strong>
        </div>

        <div class="subsection">
            3.1. El Cliente reconoce y acepta que deberá pagar al Custodio un porcentaje por cada transferencia que realice a favor del Cliente, el cual se define en el tarifario que en cada momento el Custodio tenga vigente.
        </div>

        <div class="subsection">
            3.2. Así mismo, el Cliente pagará al Custodio cualesquiera honorarios o multas resultantes en comisiones bancarias por transferencias, así como cualesquiera otros honorarios, costos, cargos, tributos u otros que en general que deriven o tengan causa directa en las acciones u omisiones del Cliente y que por mandato legal deba retener el Custodio por el procesamiento de las transferencias, incluidos los honorarios que pueda cobrar el Custodio al Cliente la prestación de los servicios aquí contratados.
        </div>

        <div class="subsection">
            3.3. El Custodio realizará los pagos desde varias cuentas dentro de Costa Rica o USA. Esto lo notificará al cliente con antelación. El cliente podrá solicitar una carta de comprobación por parte del custodia que la cuenta de banco que se utilizo pertenece a al custodio o socios comerciales.
        </div>

        <div class="numbered-section">
            <strong>4. DECLARACIONES Y GARANTÍAS DEL CLIENTE.</strong>
        </div>

        <div class="subsection">
            4.1. El Cliente en este acto declara y garantiza lo siguiente:
        </div>

        <div class="sub-subsection">
            4.1.1. Cuenta con capacidad legal para firmar el Contrato y tiene pleno poder y autoridad para ejecutar y aceptar este Contrato y cumplir con las obligaciones aquí adquiridas.
        </div>

        <div class="sub-subsection">
            4.1.2. Es mayor de edad;
        </div>

        <div class="sub-subsection">
            4.1.3. Es residente legal de la República de Costa Rica;
        </div>

        <div class="sub-subsection">
            4.1.4. Que el uso que hará de los fondos que mantenga bajo el resguardo del Custodio será legal y de conformidad con la normativa aplicables; y que no se usarán bajo ningún concepto para la comisión de ilícitos o pago de actividades sospechosas.
        </div>

        <div class="sub-subsection">
            4.1.5. Cumplirá en todo momento con las políticas de conozca a su cliente, la información suministrada para el proceso de Conozca su cliente, toda la cual debe actualizarse al menos una vez al año y cuando se presenten cambios significativos en la información proporcionada por él.
        </div>

        <div class="sub-subsection">
            4.1.6. El correo electrónico que registrará ante el Custodio debe ser cierto y verdadero, siendo que autoriza al Custodio para remitirle cualquier tipo de notificaciones. Por lo tanto, acepta que toda comunicación enviada a dicho correo electrónico será tenida como recibida y válida por el USUARIO, incluso si el correo electrónico proporcionado es defectuoso, devuelto, ingresa a la carpeta de SPAM – JUNK MAIL – NO DESEADO, no es leído y/o de alguna forma no es visto a pesar de haberse ingresado la dirección de forma correcta.
        </div>

        <div class="sub-subsection">
            4.1.7. Solo mantendrá fondos provenientes de las transacciones que realice GIO en su nombre en la cuenta de orden que el Custodio aperture en su beneficio;
        </div>

        <div class="sub-subsection">
            4.1.8. Será responsable de toda la actividad y por el uso que haga de los fondos transfiera al Custodio en virtud de la prestación de los servicios aquí contratados una vez liquidados los costos y honorarios correspondientes;
        </div>

        <div class="sub-subsection">
            4.1.9. Se compromete a mantener en todo momento de forma segura y secreta su nombre de usuario y contraseña de las aplicaciones de GIO o cualquier otra que el Custodio use como canal de comunicación y conexión con el Cliente, en el entendido de que el uso y resguardo de dichos datos es responsabilidad del Cliente. En este sentido, en caso de que realice un uso inapropiado de la misma y terceros no autorizados realicen gestiones utilizando su clave, estas se tomarán como transacciones realizadas por el Cliente sin responsabilidad alguna para el Custodio;
        </div>

        <div class="sub-subsection">
            4.1.10. Mantendrá la información de la cuenta de custodia y suya propia de forma exacta, completa y actualizada, y mantendrá registrada una cuenta bancaria válida y vigente dentro del territorio de Costa Rica. Lo contrario podría resultar en su imposibilidad de beneficiarse de los servicios aquí contratados a plenitud, sin responsabilidad alguna por parte del Custodio o GIO;
        </div>

        <div class="sub-subsection">
            4.1.11. No transferirá su cuenta de usuario en virtud de que la misma es personalísima;
        </div>

        <div class="sub-subsection">
            4.1.12. Informará inmediatamente al Custodio en caso de olvido o usurpación de sus datos o de su cuenta, o cuando tenga sospechas de que ha habido movimientos no autorizados en la cuenta de orden;
        </div>

        <div class="sub-subsection">
            4.1.13. Autorizará al Custodio, o cualquier otra persona relacionada directa o indirectamente con el Custodio, para que tengan acceso a la base de datos personales para efectos de reportería, cumplimiento, seguimiento y atención de quejas, reclamos, y cualquier otro (según aplique), así como la divulgación de dicha información a cualquier autoridad judicial o administrativa que con competencia que lo requiera, siempre y cuando dicha información o dichos datos fueran necesarios para resolver una investigación administrativa, judicial, una queja, disputa o conflicto del usuario; y a remitir la información adicional que le sea requerida por el Custodio en el plazo máximo de 3 días hábiles contados a partir del día siguiente en que se le remita el requerimiento por vía electrónica, por lo que el Cliente manifiesta entender y aceptar que el incumplimiento de presentar dicha información será causal para la suspensión o el retiro del Servicio y la cancelación de su cuenta de usuario sin responsabilidad alguna para el Custodio o GIO;
        </div>

        <div class="sub-subsection">
            4.1.14. No simulará la compra de un bien o servicio y que el mismo sea pagado mediante transferencia electrónica haciendo uso de los fondos de su propiedad en la cuenta del Custodio, o bien, realizar cualquier tipo de actividad que directa y/o indirectamente pueda ser considerada un delito o bien una actividad ilícita según el ordenamiento costarricense; y
        </div>

        <div class="sub-subsection">
            4.1.15. Cumplirá a cabalidad, en todo momento de vigencia del Contrato, con las disposiciones contenidas en la Ley 7786, sus reformas y demás normativa aplicable. En caso de que exista error u omisión de información real, exonera al Custodio de toda responsabilidad, y asumirá el Cliente, así como su propietario o su representante legal (si aplica), toda la responsabilidad civil y penal por la omisión de datos reales y veraces. El Custodio se reserva el derecho de suspender o terminar los Servicios o pedir información adicional del cliente y su actividad.
        </div>

        <div class="sub-subsection">
            4.1.16. Informar al Custodio de cualquier situación anómala, queja o inconformidad que tenga con los Servicios.
        </div>

        <div class="subsection">
            4.2. Las declaraciones y garantías establecidas en esta cláusula se estimarán que son válidas, firmes, valederas y repetidas en cualquier fecha subsecuente a la firma de este Contrato.
        </div>

        <div class="numbered-section">
            <strong>5. DECLARACIONES Y GARANTÍAS DEL CUSTODIO.</strong> El Custodio en este acto declara y garantiza lo siguiente:
        </div>

        <div class="subsection">
            5.1. Está debidamente inscrito como sujeto obligado en la Superintendencia General de Entidades Financieras para la prestación de servicios de administración de recursos financieros por medio de fideicomisos o cualquier otro tipo de administración de recursos (como por ejemplo la custodia), y para la transferencia sistemática de dichos recursos de conformidad con la ley aplicable y este Contrato.
        </div>

        <div class="subsection">
            5.2. Generará un reporte semanal electrónico de transferencias recibidas, órdenes de transferencias y saldo en custodia.
        </div>

        <div class="subsection">
            5.3. Remitirá los reportes requeridos por las autoridades competentes con la información del Cliente que sea indispensable para estos reportes
        </div>

        <div class="numbered-section">
            <strong>6. ACTIVIDADES PROHIBIDAS.</strong>
        </div>

        <div class="subsection">
            6.1. Las siguientes son actividades prohibidas para el girar órdenes de transferencia electrónica al Custodio:
        </div>

        <div class="sub-subsection">
            6.1.1. Compra, distribución, producción, o financiamiento de pornografía o cualquier actividad relacionada con explotación sexual o pornografía infantil.
        </div>

        <div class="sub-subsection">
            6.1.2. Casinos y juegos de azar.
        </div>

        <div class="sub-subsection">
            6.1.3. Drogas y sustancias estupefacientes sin autorización de las autoridades competentes y/o cualquier actividad relacionada con Narcotráfico.
        </div>

        <div class="sub-subsection">
            6.1.4. Comercialización de Medicamentos o suplementos alimenticios sin los permisos de salud requeridos.
        </div>

        <div class="sub-subsection">
            6.1.5. Bienes o servicios ilícitos.
        </div>

        <div class="sub-subsection">
            6.1.6. Bienes o servicios que promuevan la violación de derechos humanos de otras personas, incluida la discriminación por cualquier causa, el lavado de dinero, financiamiento o cualquier otra actividad relacionada con terrorismo, y actividades relacionadas con armamento ilegal.
        </div>

        <div class="sub-subsection">
            6.1.7. Copias falsificadas o replicas o cualquier Bien o servicios que atenten contra la propiedad industrial o intelectual de terceras personas.
        </div>

        <div class="sub-subsection">
            6.1.8. Y en general para el pago de bienes o servicios, o realización de transferencias de actividades sujetas a inscripción de conformidad con los artículos 15 y 15 bis de la Ley 7786.
        </div>

        <div class="subsection">
            6.2. El Cliente entiende y acepta que esta lista podrá ser modificada por el Custodio en cualquier momento de conformidad con la ley aplicable, por lo que reconoce y acepta que el Custodio podrá cancelar su usuario, cerrar la cuenta y retirar la prestación de los Servicios en caso de que detecte un uso no autorizado de los fondos por financiar actividades prohibidas por el Custodio o por la ley, sin que por ello este último incurra en responsabilidad alguna ni tenga deber de indemnizar al Cliente.
        </div>

        <div class="subsection">
            6.3. El Custodio no responderá por el mal uso de los fondos del usuario siempre que estos se hayan realizado a través del sistema electrónico de GIO, y asumirá que toda transferencia u orden recibida por los sistemas de GIO son auténticas y válidas. No obstante, el Custodio facilitará la información a su disposición a las autoridades competentes para determinar si el uso fue fraudulento o mediante la comisión de delito, siempre que dicha información esté razonablemente a su disposición.
        </div>

        <div class="numbered-section">
            <strong>7. POLÍTICA CONOZCA A SU CLIENTE.</strong> El Cliente entiende y acepta que la contratación de los Servicios deberá regirse por las políticas de conozca a su cliente tanto de GIO como del Custodio, así como por todas aquellas normas de la ley aplicable relacionadas a la prevención de lavado de dinero, financiamiento de terrorismo, narcotráfico y armas de destrucción masiva que en cada momento estén vigentes, por lo que suministrará la información que le requiera el Custodio de forma inmediata y quedará a discreción de este último el suspender/terminar los Servicios o pedir información adicional del cliente y su actividad, sin que esto le genere responsabilidad alguna al Custodio frente al Cliente.
        </div>

        <div class="numbered-section">
            <strong>8. CONSENTIMIENTO INFORMADO.</strong>
        </div>

        <div class="subsection">
            8.1. Por este Contrato el Custodio se compromete a custodiar y administrar su propia base de datos de carácter personal (la "<span class="underline bold">Base de Datos</span>") en la cual se almacena, entre otra, la siguiente información: nombre completo, domicilio exacto, números de teléfono personales, lugar de trabajo, fecha de nacimiento, récord crediticio y perfil financiero que corresponda al Cliente como parte del cumplimiento de identificación. La información podrá ser usada por el Custodio para validar con terceros y otras fuentes y bases de datos la veracidad de datos personales y crediticios, introducir mejoras al servicio existente y desarrollar nuevos productos, hacer un perfil financiero del Cliente y cualquier otro que sea requerido por la normativa aplicable.
        </div>

        <div class="subsection">
            8.2. El Cliente entiende que distintos funcionarios, empleados, representantes y asesores (externos e internos) del Custodio tendrán acceso a dicha información, para el cumplimiento de sus compromisos contractuales. Así mismo, entiende y reconoce que el Custodio podrá revelar a la Superintendencia General de Entidades Financieras, Instituto Costarricense sobre las Drogas, autoridades judiciales, Ministerio Público, Banco Central, Banco Nacional, su oficial de cumplimiento, sus asesores en materia de cumplimiento de la normativa regulatoria aplicable, los burós de crédito, empresas protectoras y gestionadoras de crédito, a sus asesores legales y a cualquier empresa relacionada al Custodio, la información sobre su persona y sus representantes, así como datos atinentes a sus relaciones comerciales y financieras. Asimismo, consiente libre y expresamente para que la información sea traspasada a dichas entidades con fines de información y cumplimiento con la Ley 7786 y normativa aplicable.
        </div>

        <div class="subsection">
            8.3. El Custodio reconoce que el Cliente podrá ejercer el derecho de solicitar la rectificación, acceso, actualización y eliminación de la Información en los términos que indica la "Ley de Protección de la Persona Frente al Tratamiento de sus Datos Personales" y su reglamento mediante el mismo medio de notificaciones establecido en el presente documento. El Cliente entiende a su vez, y acepta, que la eliminación de información requerida por la Política de Conozca a su Cliente, las políticas de operación, y cualquier otra que regulatoriamente sea indispensable para el Custodio, podría conllevar la inactivación de su cuenta.
        </div>

        <div class="numbered-section">
            <strong>9. INCUMPLIMIENTO POR PARTE DEL CLIENTE.</strong> En caso de no incumplimiento con alguna de las obligaciones a cargo del Cliente, el Custodio tiene la potestad de suspender temporalmente o incluso dar por terminados los Servicios hasta que se proporcione la documentación requerida, sin que se garantice la rehabilitación de los Servicios, lo cual quedará a criterio único y exclusivo del Custodio y sin que esto le genere responsabilidad alguna más allá de hacerle entrega de los fondos que en dicho momento estén bajo custodia.
        </div>

        <div class="numbered-section">
            <strong>10. CASO FORTUITO O FUERZA MAYOR.</strong> Por cualquier causa de fuerza mayor que obligue a él Custodio a cerrar y/o interrumpir sus operaciones al público por razones de intervención interna y/o externa, guerras, tumultos, huelgas y/o desastres naturales, el Custodio quedaría inmediatamente liberado de cualquier responsabilidad financiera y a su vez dará derecho al Cliente a dar por terminado el contrato de forma inmediata sin responsabilidad alguna. En ninguna circunstancia, el Custodio estará obligado a indemnizar a la contraparte por la terminación de este Contrato de conformidad con la presente cláusula.
        </div>

        <div class="numbered-section">
            <strong>11. LIBERACIÓN RESPONSABILIDAD DEL CUSTODIO.</strong>
        </div>

        <div class="subsection">
            11.1. Por este Contrato, el Cliente acepta defender, indemnizar y eximir de responsabilidad al Custodio, sus empresas relacionadas, oficiales, directores, miembros, empleados, abogados, y aliados comerciales para la prestación de los Servicios contra todos y cada uno de los reclamos, costos, daños, pérdidas, responsabilidades y gastos (incluidos los honorarios y costos de abogados o acciones judiciales o administrativas) que surjan de o en conexión con:
        </div>

        <div class="sub-subsection">
            11.1.1. Mal uso de los fondos;
        </div>

        <div class="sub-subsection">
            11.1.2. Mal uso de los Servicios por traslado de otros fondos no remitidos por GIO
        </div>

        <div class="sub-subsection">
            11.1.3. Cuestionamientos de las autoridades respecto al origen o uso de los fondos;
        </div>

        <div class="sub-subsection">
            11.1.4. Incumplimiento o violación de cualquiera de los acuerdos de este Contrato por parte del Cliente;
        </div>

        <div class="sub-subsection">
            11.1.5. Uso por parte del Custodio de la información del Cliente dentro de los criterios aquí definidos.
        </div>

        <div class="subsection">
            11.2. El Cliente libera al Custodio de toda y cualquier responsabilidad derivada directa o indirectamente con transferencias de dinero erróneas o que no resulten exitosas por causa de los errores en la información del Cliente que éste último le suministre al Custodio para su operación y contratación de los Servicios.
        </div>

        <div class="subsection">
            11.3. En virtud de la obligación del Custodio de recopilar y conservar la información necesaria del Cliente para cumplir con la legislación vigente, específicamente la Ley 7786, el Cliente entiende y acepta que dicha información permanecerá bajo custodia del Custodio aún terminado este contrato por un plazo mínimo de cinco años.
        </div>

        <div class="numbered-section">
            <strong>12. DE LOS TRIBUTOS.</strong> El Cliente acepta que los Servicios estarán sujetos a todos los tributos, comisiones y cargos vigentes, independientemente de cómo se denomine, y en relación con cualquier otro que pueda introducirse en el futuro en cualquier momento, y que el Custodio podrá retener dichos tributos, comisiones o cargos en la fuente y hacer las liquidaciones respectivas ante las autoridades competentes según le sea legalmente requerido, por lo cual realizará las rebajas respectivas para su pago contra la acreditación de cada transferencia de fondos en la cuenta de orden asignada al Cliente; y que en caso que estos fondos no sean suficientes, los fondos transferidos se mantendrán en su cuenta de orden hasta que sean suficientes para el cumplimiento del deber de retención y liquidación respectiva sin que esto pueda interpretarse como una retención indebida, injustificada, o causa de reclamo civil o penal alguno en contra del Custodio.
        </div>

        <div class="numbered-section">
            <strong>13. NOTIFICACIONES.</strong>
        </div>

        <div class="subsection">
            13.1. Toda comunicación bajo este Contrato será hecha por escrito y enviadas o entregadas a mano con razón de recibido a cada una de las partes aquí contratantes, a las direcciones indicadas a continuación:
        </div>

        <div class="sub-subsection">
            13.1.1. A el Custodio:
        </div>

        <div style="margin-left: 72pt; text-align: left; margin-bottom: 12pt;">
            Correo Electrónico: alberto@galileo.finance.com
        </div>

        <div class="subsection">
            13.2. Cualquier cambio vinculado con las direcciones físicas y de correo electrónico aquí establecidos se estimarán como válidos una vez que éstos sean notificados por escrito y confirmados previamente por la Parte a quien se le hiciere la notificación, sin lo cual dichas modificaciones no surtirán sus efectos y se tendrán como válidas las últimas direcciones utilizados por las Partes.
        </div>

        <div class="numbered-section">
            <strong>14. LEY APLICABLE Y JURISDICCIÓN COMPETENTE</strong>
        </div>

        <div class="subsection">
            14.1. El Contrato está sometido a las leyes de la República de Costa Rica.
        </div>

        <div class="subsection">
            14.2. En caso de diferencias, conflictos o disputas relacionadas con la ejecución, incumplimiento, interpretación o cualquier otro aspecto derivado del presente contrato acuerdan resolver el conflicto mediante un proceso arbitral por medio de cual se dictará un laudo definitivo e inapelable de conformidad con los el Reglamento de Arbitraje del Centro Internacional de Conciliación y Arbitraje ("CICA") de la Cámara Costarricense Norteamericana de Comercio (AMCHAM), a cuyas normas procesales, en todo lo que no contravenga lo establecido en esta cláusula, las partes se someten de forma voluntaria e incondicional. El conflicto se dilucidará de acuerdo con la ley sustantiva de la República de Costa Rica y el idioma del arbitraje será el castellano. El lugar del arbitraje será el Centro Internacional de Conciliación y Arbitraje ("CICA") de la Cámara Costarricense Norteamericana de Comercio (AMCHAM), República de Costa Rica. El arbitraje será resuelto por un tribunal arbitral compuesto por tres árbitros designado por el CICA. El CICA será la institución encargada de administrar el proceso arbitral y en ausencia de regla procedimental expresa en su Reglamento, las partes delegan en el Tribunal Arbitral el señalamiento de esta. El laudo arbitral se dictará por escrito, será definitivo, vinculante para las partes e inapelable. Los procesos y su contenido serán absolutamente confidenciales. Queda entendido que el arbitraje podrá ser solicitado por cualquiera de las partes de este contrato. En caso de que en el momento en que deba resolverse el conflicto, el Centro aquí asignado no esté prestando los servicios anteriormente referidos, el conflicto se resolverá mediante un proceso arbitral que se tramitará de conformidad con la ley aplicable vigente a dicho momento en la República de Costa Rica. En el proceso de resolución alternativa de conflictos correspondiente se determinará a cuál o cuáles partes les corresponde pagar los gastos y honorarios de dicho proceso y en qué proporción, en principio el perdidoso pagará los gastos.
        </div>

        <div class="numbered-section">
            <strong>15. CESIÓN.</strong> El Custodio podrá ceder o transferir sus obligaciones bajo este Contrato sin necesidad de autorización previa por parte del Cliente. Por la naturaleza de este Contrato, el Cliente entiende, acepta y reconoce que su cuenta es personalísima, y que no podrá cederla total ni parcialmente, así como tampoco lo podrá hacer con ninguno de los derechos que aquí se le conceden.
        </div>

        <div class="numbered-section">
            <strong>16. MISCELÁNEAS</strong>
        </div>

        <div class="subsection">
            16.1. <span class="underline">Buena fe</span>: El presente documento refleja la voluntad de las partes, debidamente otorgada bajo los principios de buena fe y responsabilidad en los negocios, por lo tanto, ningún error material o de forma que pudiera contener el presente documento será impedimento para el cumplimiento de los fines que se deduzcan del mismo. Las partes manifiestan conocer y entender el valor y consecuencias legales de sus renuncias y estipulaciones de este Contrato, y manifiestan expresamente que es su voluntad su formalización.
        </div>

        <div class="subsection">
            16.2. <span class="underline">Anexos</span>: Los Anexos se incorporan por referencia y son parte integral de este contrato para todos los efectos.
        </div>

        <div class="subsection">
            16.3. <span class="underline">Acuerdo completo</span>: Las Partes dejan constancia expresa de que este Contrato es el resultado de negociaciones y de concesiones mutuas entre ellas, que a todas beneficia y aprovecha, que han sido realizadas de forma voluntaria y con la asesoría que cada cual ha considerado necesarias a efecto de tomar decisiones informadas. Igualmente declaran que cualesquiera discusiones, promesas, representaciones y entendimientos previos pero relacionados con los asuntos aquí contratados han sido sustituidos en su totalidad por este Contrato y por lo tanto son inaplicables a partir de su firma.
        </div>

        <div class="subsection">
            16.4. <span class="underline">Ambigüedad</span>: En caso de cualquier ambigüedad, cuestionamiento de intención o interpretación de sus disposiciones, se entenderá que este Contrato ha sido revisado y negociado por las Partes y ninguna presunción o carga de la prueba podrá beneficiar o cargarse a ninguna de las Partes en virtud de la autoría de cualquiera de las disposiciones de este Contrato.
        </div>

        <div class="subsection">
            16.5. <span class="underline">Modificaciones</span>: Cualquier acuerdo de modificación, cambio o nuevas garantías que acuerden las Partes a este Contrato, sea total o parcial, será válido en el tanto sea documentado por escrito y suscrito por todas ellas.
        </div>

        <div class="subsection">
            16.6. <span class="underline">Divisibilidad</span>: Si alguna disposición de este Contrato resultare inválida o ilegal se tendrá por no puesta, pero la legalidad y validez del resto del Contrato no se verá afectada o limitada por dicha omisión.
        </div>

        <div class="subsection">
            16.7. <span class="underline">Renuncia</span>: Ningún incumplimiento de los términos de este Contrato podrá ser desestimado de no ser por escrito por la parte que pueda desestimarlo. La desestimación y renuncia de cualquiera de las partes, o el hecho de no reclamar el incumplimiento de cualquier cláusula de este Contrato, no será entendido como la renuncia a cualquier reclamo por incumplimiento subsiguiente.
        </div>

        <div class="subsection">
            16.8. <span class="underline">Protocolización</span>: Cualquiera de las Partes podrá comparecer ante Notario Público a protocolizar, autenticar su firma o poner razón de fecha cierta a este documento, sin que para ello requiera la participación, notificación o autorización de la otra.
        </div>

        <div class="subsection">
            16.9. <span class="underline">Títulos y encabezados</span>: Los títulos y encabezados contenidos en este Contrato son para facilidad de referencia únicamente y no deberán ser empleados en su interpretación
        </div>

        <div class="section">
            Como constancia de aceptación y consentimiento, las Partes suscribimos el presente Contrato en San José, en dos tantos de un mismo original, en las fechas que se indica en el bloque de firmas, en dos tantos de un mismo original.
        </div>

        <div class="signature-section">
            <table class="signature-table">
                <tr>
                    <td>
                        <div style="text-align: center;">
                            <div class="bold">P/ El Custodio</div>
                            <div class="bold">GIO CAPITAL GROUP SA</div>
                            <br><br><br><br>
                            <div class="bold">_________________________</div>
                            <div class="bold">Maximiliano Xiques</div>
                        </div>
                    </td>
                    <td>
                        <div style="text-align: center;">
                            <div class="bold">P/ El Cliente</div>
                            <div class="bold">${data.companyName}</div>
                            <br><br><br><br>
                            <div class="bold">_________________________</div>
                            <div class="bold">${data.legalRepName}</div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>`
}
