import { db } from '../server/db';
import { transactions, PropertyType, TransactionStatus } from '../shared/schema';

async function insertSampleData() {
  try {
    console.log('Inserting sample transactions...');
    
    // Agent ID from our migration
    const agentId = 1;
    const agentName = 'John Smith';
    
    // Sample property data
    const sampleProperties = [
      {
        address: '12 Main Street',
        suburb: 'Mawson Lakes',
        type: PropertyType.HOUSE,
        bedrooms: 4,
        bathrooms: 2,
        price: '850000',
        status: TransactionStatus.SETTLED,
        transactionDate: new Date('2025-01-15'),
        listedDate: new Date('2024-12-01')
      },
      {
        address: '45 Park Avenue',
        suburb: 'Mawson Lakes',
        type: PropertyType.APARTMENT,
        bedrooms: 2,
        bathrooms: 1,
        price: '420000',
        status: TransactionStatus.SETTLED,
        transactionDate: new Date('2025-02-10'),
        listedDate: new Date('2025-01-05')
      },
      {
        address: '78 Lake Boulevard',
        suburb: 'Mawson Lakes',
        type: PropertyType.TOWNHOUSE,
        bedrooms: 3,
        bathrooms: 2,
        price: '620000',
        status: TransactionStatus.PENDING,
        transactionDate: new Date('2025-03-20'),
        listedDate: new Date('2025-02-15')
      },
      {
        address: '23 University Drive',
        suburb: 'Mawson Lakes',
        type: PropertyType.HOUSE,
        bedrooms: 5,
        bathrooms: 3,
        price: '980000',
        status: TransactionStatus.SETTLED,
        transactionDate: new Date('2025-01-30'),
        listedDate: new Date('2024-11-15')
      },
      {
        address: '56 Technology Park',
        suburb: 'Mawson Lakes',
        type: PropertyType.APARTMENT,
        bedrooms: 1,
        bathrooms: 1,
        price: '380000',
        status: TransactionStatus.SETTLED,
        transactionDate: new Date('2025-02-05'),
        listedDate: new Date('2024-12-20')
      },
      {
        address: '89 Elder Smith Road',
        suburb: 'Mawson Lakes',
        type: PropertyType.HOUSE,
        bedrooms: 4,
        bathrooms: 2,
        price: '750000',
        status: TransactionStatus.CANCELLED,
        transactionDate: new Date('2025-03-01'),
        listedDate: new Date('2024-12-15')
      },
      {
        address: '34 Shearwater Drive',
        suburb: 'Mawson Lakes',
        type: PropertyType.TOWNHOUSE,
        bedrooms: 3,
        bathrooms: 2,
        price: '580000',
        status: TransactionStatus.SETTLED,
        transactionDate: new Date('2025-02-28'),
        listedDate: new Date('2025-01-15')
      },
      {
        address: '67 Garden Terrace',
        suburb: 'Mawson Lakes',
        type: PropertyType.HOUSE,
        bedrooms: 4,
        bathrooms: 2,
        price: '820000',
        status: TransactionStatus.PENDING,
        transactionDate: new Date('2025-04-10'),
        listedDate: new Date('2025-03-01')
      },
      {
        address: '90 Lakefront Way',
        suburb: 'Mawson Lakes',
        type: PropertyType.APARTMENT,
        bedrooms: 2,
        bathrooms: 1,
        price: '450000',
        status: TransactionStatus.SETTLED,
        transactionDate: new Date('2025-01-20'),
        listedDate: new Date('2024-12-01')
      },
      {
        address: '123 Cascade Boulevard',
        suburb: 'Mawson Lakes',
        type: PropertyType.HOUSE,
        bedrooms: 5,
        bathrooms: 3,
        price: '950000',
        status: TransactionStatus.SETTLED,
        transactionDate: new Date('2025-02-15'),
        listedDate: new Date('2024-12-10')
      }
    ];
    
    // Insert each transaction
    for (const property of sampleProperties) {
      const transaction = {
        propertyAddress: property.address,
        propertySuburb: property.suburb,
        propertyType: property.type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        price: property.price,
        agentId: agentId,
        agentName: agentName,
        status: property.status,
        transactionDate: property.transactionDate,
        listedDate: property.listedDate
      };
      
      const result = await db.insert(transactions).values(transaction).returning();
      console.log(`Inserted transaction: ${property.address}`);
    }
    
    console.log('Sample data insertion completed successfully.');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Execute the function
insertSampleData().then(() => {
  console.log('All sample data has been inserted.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});