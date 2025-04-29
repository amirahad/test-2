import { read, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/db';
import { agents, transactions } from '../shared/schema';
import { PropertyType, TransactionStatus } from '../shared/schema';

// Get current file location for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Excel file
const excelFilePath = path.join(__dirname, '../attached_assets/A Sales board - Belle Property Mawson Lakes (1).xlsx');

async function importExcelData() {
  try {
    console.log('Reading Excel file:', excelFilePath);
    
    // Read Excel file
    const fileData = fs.readFileSync(excelFilePath);
    const workbook = read(fileData);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = utils.sheet_to_json(worksheet);
    console.log(`Found ${data.length} records in Excel file.`);
    
    // Process data
    const processedData = await processExcelData(data);
    console.log(`Successfully processed ${processedData.length} records.`);

    console.log('Data import completed successfully.');
  } catch (error) {
    console.error('Error importing Excel data:', error);
  }
}

async function processExcelData(data: any[]) {
  // First, check if we have any agents
  const existingAgents = await db.select().from(agents);
  console.log(`Found ${existingAgents.length} existing agents`);
  
  // Keep track of agents we've created
  const agentCache: Record<string, number> = {};
  existingAgents.forEach(agent => {
    agentCache[agent.name] = agent.id;
  });
  
  // Process each row from Excel
  const processedData = [];
  
  try {
    for (const row of data) {
      const agentName = row['Agent'] || 'Unknown Agent';
      
      // Check if we've already processed this agent
      let agentId: number;
      if (agentCache[agentName]) {
        agentId = agentCache[agentName];
      } else {
        // Create a new agent
        const email = `${agentName.toLowerCase().replace(/\s+/g, '.')}@belleproperty.com`;
        const [newAgent] = await db.insert(agents)
          .values({
            name: agentName,
            email: email,
            phone: null
          })
          .returning();
        
        agentId = newAgent.id;
        agentCache[agentName] = agentId;
        console.log(`Created new agent: ${agentName} with ID ${agentId}`);
      }
      
      // Map property type
      let propertyType = row['Property Type'] || row['Type'] || 'House';
      if (typeof propertyType === 'string') {
        // Try to match to our enum values
        const matchedType = Object.values(PropertyType).find(type => 
          propertyType.toLowerCase().includes(type.toLowerCase())
        );
        propertyType = matchedType || PropertyType.HOUSE;
      } else {
        propertyType = PropertyType.HOUSE;
      }
      
      // Map status
      let status = row['Status'] || 'Pending';
      if (typeof status === 'string') {
        if (status.toLowerCase().includes('sold') || status.toLowerCase().includes('settle')) {
          status = TransactionStatus.SETTLED;
        } else if (status.toLowerCase().includes('cancel')) {
          status = TransactionStatus.CANCELLED;
        } else {
          status = TransactionStatus.PENDING;
        }
      } else {
        status = TransactionStatus.PENDING;
      }
      
      // Parse dates
      const transactionDate = row['Date Sold'] || row['Transaction Date'] || new Date();
      const listedDate = row['Date Listed'] || row['Listed Date'] || new Date();
      
      // Parse price
      let price = row['Sale Price'] || row['Price'] || '0';
      if (typeof price === 'string') {
        // Remove any non-numeric characters
        price = price.replace(/[^0-9.]/g, '');
      }
      
      // Create transaction
      const transaction = {
        propertyAddress: row['Address'] || row['Property Address'] || 'Unknown Address',
        propertySuburb: row['Suburb'] || 'Unknown Suburb',
        propertyType,
        bedrooms: Number(row['Beds'] || row['Bedrooms'] || 0),
        bathrooms: Number(row['Baths'] || row['Bathrooms'] || 0),
        price: String(price),
        agentId,
        agentName,
        status,
        transactionDate: new Date(transactionDate),
        listedDate: new Date(listedDate)
      };
      
      // Insert transaction
      await db.insert(transactions).values(transaction);
      processedData.push(transaction);
      
      console.log(`Inserted transaction: ${transaction.propertyAddress}`);
    }
  } catch (err) {
    console.error('Error processing data:', err);
  }
  
  return processedData;
}

// Run the import
importExcelData().then(() => {
  console.log('Excel import completed');
  process.exit(0);
}).catch(err => {
  console.error('Error running import:', err);
  process.exit(1);
});