/**
 * eBay CSV Import
 * Handles importing eBay transaction CSV files
 */

import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Extend NextApiRequest to include multer file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Helper function to run multer middleware
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

interface EbayTransaction {
  date: string;
  itemTitle: string;
  itemId: string;
  transactionId: string;
  buyerUsername: string;
  quantity: number;
  salePrice: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus: string;
  notes?: string;
}

export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('csv'));

    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    const results: EbayTransaction[] = [];
    const errors: string[] = [];

    // Parse CSV file
    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file!.buffer);
      
      stream
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Normalize and validate the row data
            const transaction: EbayTransaction = {
              date: row.Date || row.date || '',
              itemTitle: row['Item Title'] || row.itemTitle || row['Item title'] || '',
              itemId: row['Item ID'] || row.itemId || row['Item ID'] || '',
              transactionId: row['Transaction ID'] || row.transactionId || row['Transaction ID'] || '',
              buyerUsername: row['Buyer Username'] || row.buyerUsername || row['Buyer username'] || '',
              quantity: parseInt(row.Quantity || row.quantity || '1') || 1,
              salePrice: parseFloat(row['Sale Price'] || row.salePrice || row['Sale price'] || '0') || 0,
              shippingCost: parseFloat(row['Shipping Cost'] || row.shippingCost || row['Shipping cost'] || '0') || 0,
              total: parseFloat(row.Total || row.total || '0') || 0,
              paymentMethod: row['Payment Method'] || row.paymentMethod || row['Payment method'] || '',
              paymentStatus: row['Payment Status'] || row.paymentStatus || row['Payment status'] || '',
              shippingStatus: row['Shipping Status'] || row.shippingStatus || row['Shipping status'] || '',
              notes: row.Notes || row.notes || ''
            };

            // Basic validation
            if (!transaction.date || !transaction.itemTitle || !transaction.transactionId) {
              errors.push(`Row ${results.length + 1}: Missing required fields (Date, Item Title, Transaction ID)`);
              return;
            }

            // Validate date format
            const dateObj = new Date(transaction.date);
            if (isNaN(dateObj.getTime())) {
              errors.push(`Row ${results.length + 1}: Invalid date format`);
              return;
            }

            results.push(transaction);
          } catch (error) {
            errors.push(`Row ${results.length + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    // Process and save transactions
    const successfulImports = [];
    const failedImports = [];

    for (const transaction of results) {
      try {
        // In a real implementation, you would:
        // 1. Check if transaction already exists
        // 2. Save to your database
        // 3. Update inventory if needed
        // 4. Create order records
        
        // For now, we'll simulate the import
        await simulateTransactionImport(transaction);
        successfulImports.push(transaction);
      } catch (error) {
        failedImports.push(transaction);
        errors.push(`Failed to import transaction ${transaction.transactionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Return results
    res.json({
      success: true,
      totalTransactions: results.length,
      successfulImports: successfulImports.length,
      failedImports: failedImports.length,
      errors: errors.slice(0, 10), // Limit errors to first 10
      importedData: successfulImports.slice(0, 5), // Return first 5 as sample
      summary: {
        totalValue: successfulImports.reduce((sum, t) => sum + t.total, 0),
        averageOrderValue: successfulImports.length > 0 ? successfulImports.reduce((sum, t) => sum + t.total, 0) / successfulImports.length : 0,
        dateRange: {
          earliest: successfulImports.length > 0 ? Math.min(...successfulImports.map(t => new Date(t.date).getTime())) : null,
          latest: successfulImports.length > 0 ? Math.max(...successfulImports.map(t => new Date(t.date).getTime())) : null
        }
      }
    });

  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({ 
      error: 'Failed to import CSV file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Simulate transaction import
async function simulateTransactionImport(transaction: EbayTransaction): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  
  // Simulate occasional failures
  if (Math.random() < 0.05) { // 5% failure rate
    throw new Error('Simulated import failure');
  }
  
  // In a real implementation, this would:
  // 1. Check if transaction already exists in database
  // 2. Create order record
  // 3. Update inventory
  // 4. Create order items
  // 5. Update analytics
}

