// CR Banks Processing - n8n Code Node
// Processes Google Sheets data for Costa Rica banking transfers

const sheetData = $input.all();
const processedData = [];

console.log(`Processing ${sheetData.length} rows from CR sheet`);

// Process each row from Google Sheets
for (const item of sheetData) {
  const json = item.json;
  
  // Skip header row and empty rows
  if (!json.A || json.A === 'Transaction Number' || json.A === 'Número de transacción') {
    continue;
  }
  
  // Extract data from columns A, B, C, D
  const transactionNumber = json.A?.toString().trim() || '';
  const issuer = json.B?.toString().trim() || '';
  const date = json.C?.toString().trim() || '';
  const amount = parseFloat(json.D?.toString().replace(/[,$]/g, '') || '0');
  
  // Skip rows with missing essential data
  if (!transactionNumber || !issuer || !date || amount <= 0) {
    console.log(`Skipping invalid row: ${transactionNumber}, ${issuer}, ${date}, ${amount}`);
    continue;
  }
  
  // Validate date format (DD/MM/YYYY)
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(date)) {
    console.log(`Skipping row with invalid date format: ${date}`);
    continue;
  }
  
  // Create processed transaction record
  const processedTransaction = {
    'Número de transacción': transactionNumber,
    'Emisor': issuer,
    'Fecha': date,
    'Monto de Ingreso (USD)': amount
  };
  
  processedData.push(processedTransaction);
}

console.log(`Successfully processed ${processedData.length} CR transactions`);

// Calculate summary statistics
const totalAmount = processedData.reduce((sum, t) => sum + t['Monto de Ingreso (USD)'], 0);
const totalTransactions = processedData.length;

// $17M limit calculations
const YEARLY_LIMIT = 17000000;
const remainingLimit = Math.max(0, YEARLY_LIMIT - totalAmount);
const limitPercentage = (totalAmount / YEARLY_LIMIT) * 100;

console.log(`Total amount: $${totalAmount.toLocaleString()}`);
console.log(`Percentage of $17M limit used: ${limitPercentage.toFixed(1)}%`);
console.log(`Remaining limit: $${remainingLimit.toLocaleString()}`);

// Prepare data for webhook
const webhookData = {
  processedData: processedData,
  summary: {
    totalTransactions,
    totalAmount,
    yearlyLimit: YEARLY_LIMIT,
    remainingLimit,
    limitPercentage,
    processedAt: new Date().toISOString()
  },
  source: 'CR Banking Sheet',
  timestamp: new Date().toISOString()
};

// Email notification content
const emailSubject = `CR Banking Update - ${processedData.length} transactions processed`;
const emailBody = `
CR Banking Dashboard Update

📊 Transaction Summary:
• Total Transactions: ${totalTransactions}
• Total Amount: $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}

🎯 $17M Limit Tracking:
• Percentage Used: ${limitPercentage.toFixed(1)}%
• Remaining: $${remainingLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
• Status: ${limitPercentage >= 95 ? '🚨 NEAR LIMIT' : limitPercentage >= 80 ? '⚠️ WARNING' : '✅ NORMAL'}

📅 Processed: ${new Date().toLocaleString()}

Dashboard: https://v0-new-project-cg1bmbszqsx.vercel.app/cr-banks
`;

// Return both webhook data and email data
return [
  {
    json: webhookData
  },
  {
    json: {
      to: 'alberto@galileocapital.io',
      cc: 'hiram@galileocapital.io',
      subject: emailSubject,
      body: emailBody,
      type: 'email'
    }
  }
];
