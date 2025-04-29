import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Excel file
const excelPath = path.join(__dirname, '../attached_assets/A Sales board - Belle Property Mawson Lakes (1).xlsx');

// Function to read Excel file and convert to JSON
async function readExcelFile() {
  try {
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    return jsonData;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return [];
  }
}

// Function to map Excel data to our schema format
function mapExcelData(data) {
  return data.map(row => {
    // Log the keys to help understand the structure
    if (data.indexOf(row) === 0) {
      console.log('Excel columns:', Object.keys(row));
    }
    
    // Extract agent info
    const agentName = row['Agent'] || 'Unknown';
    let agentId = 1;
    let agentEmail = `${agentName.toLowerCase().replace(/\s+/g, '.')}@belleproperty.com`;
    let agentPhone = '04' + Math.floor(10000000 + Math.random() * 90000000);
    
    // Extract property info
    const address = row['Address'] || '';
    const suburb = row['Suburb'] || '';
    const propertyType = mapPropertyType(row['Type'] || '');
    const price = parsePrice(row['Price'] || '0');
    const status = mapStatus(row['Status'] || '');
    const bedrooms = parseInt(row['Bed'] || '0', 10);
    const bathrooms = parseInt(row['Bath'] || '0', 10);
    
    // Extract dates
    const listedDate = parseDate(row['Listed'] || '');
    const soldDate = status === 'Sold' ? parseDate(row['Settlement Date'] || '') : new Date();
    
    return {
      agent: {
        name: agentName,
        email: agentEmail,
        phone: agentPhone
      },
      transaction: {
        propertyAddress: address,
        propertySuburb: suburb,
        propertyType,
        bedrooms,
        bathrooms,
        price,
        status,
        transactionDate: soldDate,
        listedDate
      }
    };
  });
}

// Helper function to map property types
function mapPropertyType(type) {
  const typeMap = {
    'H': 'House',
    'L': 'Land',
    'TH': 'Townhouse',
    'A': 'Apartment',
    'U': 'Unit'
  };
  
  return typeMap[type] || 'Other';
}

// Helper function to map status
function mapStatus(status) {
  const statusMap = {
    'S': 'Sold',
    'U': 'Under Contract',
    'A': 'Available',
    'L': 'Leased'
  };
  
  return statusMap[status] || 'Unknown';
}

// Helper function to parse price
function parsePrice(priceString) {
  if (!priceString) return 0;
  
  // Remove non-numeric characters except decimal point
  const cleanedPrice = priceString.toString().replace(/[^0-9.]/g, '');
  return parseFloat(cleanedPrice) || 0;
}

// Helper function to parse date
function parseDate(dateString) {
  if (!dateString) return new Date();
  
  try {
    // Try to parse Excel date format
    if (typeof dateString === 'number') {
      // Excel stores dates as number of days since 1900-01-01
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch);
      date.setDate(excelEpoch.getDate() + dateString - 2); // -2 adjustment for Excel date system
      return date;
    }
    
    // Otherwise try to parse as string
    return new Date(dateString);
  } catch (e) {
    console.error('Error parsing date:', e);
    return new Date();
  }
}

// Main function to import data
async function importData() {
  try {
    // Read Excel file
    const excelData = await readExcelFile();
    console.log(`Read ${excelData.length} rows from Excel file`);
    
    // Map data to our schema
    const mappedData = mapExcelData(excelData);
    
    // Create unique agents
    const uniqueAgents = {};
    mappedData.forEach(item => {
      if (!uniqueAgents[item.agent.name]) {
        uniqueAgents[item.agent.name] = item.agent;
      }
    });
    
    // Insert agents first
    for (const agentName in uniqueAgents) {
      const agent = uniqueAgents[agentName];
      try {
        const response = await fetch('http://localhost:5000/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(agent)
        });
        
        if (response.ok) {
          const data = await response.json();
          // Store the created agent ID for transactions
          uniqueAgents[agentName].id = data.id;
          console.log(`Created agent: ${agentName} with ID ${data.id}`);
        } else {
          console.error(`Failed to create agent ${agentName}:`, await response.text());
        }
      } catch (error) {
        console.error(`Error creating agent ${agentName}:`, error);
      }
    }
    
    // Insert transactions
    for (const item of mappedData) {
      try {
        // Get agent ID
        const agentId = uniqueAgents[item.agent.name].id || 1;
        
        // Prepare transaction data
        const transaction = {
          ...item.transaction,
          agentId,
          agentName: item.agent.name
        };
        
        const response = await fetch('http://localhost:5000/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transaction)
        });
        
        if (response.ok) {
          console.log(`Created transaction for property: ${transaction.propertyAddress}`);
        } else {
          console.error(`Failed to create transaction for ${transaction.propertyAddress}:`, await response.text());
        }
      } catch (error) {
        console.error(`Error creating transaction for ${item.transaction.propertyAddress}:`, error);
      }
    }
    
    // Update sales stats
    try {
      const response = await fetch('http://localhost:5000/api/stats/update', {
        method: 'POST'
      });
      
      if (response.ok) {
        console.log('Updated sales statistics successfully');
      } else {
        console.error('Failed to update sales statistics:', await response.text());
      }
    } catch (error) {
      console.error('Error updating sales statistics:', error);
    }
    
    console.log('Data import completed');
  } catch (error) {
    console.error('Error importing data:', error);
  }
}

// Run the import
importData();