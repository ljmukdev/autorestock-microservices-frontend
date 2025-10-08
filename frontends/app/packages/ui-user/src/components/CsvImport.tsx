/**
 * CsvImport.tsx
 * Component for importing eBay transaction CSV files
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@autorestock/ui-kit';
import { Button } from '@autorestock/ui-kit';
import { Progress } from '@autorestock/ui-kit';
import { FileText, Upload, CheckCircle, AlertCircle, Download } from 'lucide-react';

interface ImportResult {
  totalTransactions: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  importedData: any[];
}

interface CsvImportProps {
  onImportComplete?: (result: ImportResult) => void;
  onImportStart?: () => void;
}

export default function CsvImport({ onImportComplete, onImportStart }: CsvImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setImportResults(null);
    onImportStart?.();

    try {
      const formData = new FormData();
      formData.append('csv', file);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch('/api/import/ebay-csv', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();
      setImportResults(result);
      onImportComplete?.(result);
    } catch (error) {
      console.error('CSV import error:', error);
      setImportResults({
        totalTransactions: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: ['Failed to upload file. Please try again.'],
        importedData: []
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Date,Item Title,Item ID,Transaction ID,Buyer Username,Quantity,Sale Price,Shipping Cost,Total,Payment Method,Payment Status,Shipping Status,Notes
2024-01-15,"iPhone 12 Pro Max 128GB",123456789,987654321,buyer123,1,£450.00,£10.00,£460.00,PayPal,Completed,Shipped,"Good condition"
2024-01-16,"Samsung Galaxy S21 Ultra",234567890,876543210,buyer456,1,£380.00,£8.00,£388.00,PayPal,Completed,Delivered,"Excellent condition"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ebay-transactions-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Import eBay Transactions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How to export from eBay:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to eBay Seller Hub → Orders</li>
            <li>Click "Download orders" or "Export to CSV"</li>
            <li>Select your desired date range</li>
            <li>Download the CSV file</li>
            <li>Upload it here</li>
          </ol>
        </div>

        {/* Upload Area */}
        {!importResults && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="csv-upload"
              className={`cursor-pointer flex flex-col items-center space-y-4 ${
                isUploading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium">
                  {isUploading ? 'Processing...' : 'Upload CSV File'}
                </p>
                <p className="text-sm text-gray-500">
                  Click to select or drag and drop
                </p>
              </div>
            </label>

            {isUploading && (
              <div className="mt-4 w-full max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-2 mb-2" />
                <p className="text-sm text-gray-600">
                  {uploadProgress < 50 ? 'Uploading...' : 
                   uploadProgress < 90 ? 'Processing...' : 'Finalizing...'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {importResults && (
          <div className="space-y-4">
            <div className={`border rounded-lg p-4 ${
              importResults.errors.length > 0 
                ? 'border-red-200 bg-red-50' 
                : 'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {importResults.errors.length > 0 ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <h4 className={`font-semibold ${
                  importResults.errors.length > 0 ? 'text-red-900' : 'text-green-900'
                }`}>
                  Import {importResults.errors.length > 0 ? 'Completed with Issues' : 'Successful'}
                </h4>
              </div>
              
              <div className="text-sm space-y-1">
                <p>• Total transactions: {importResults.totalTransactions}</p>
                <p>• Successfully imported: {importResults.successfulImports}</p>
                <p>• Failed imports: {importResults.failedImports}</p>
              </div>

              {importResults.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-900 mb-1">Issues found:</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setImportResults(null);
                  setUploadProgress(0);
                }}
                variant="outline"
              >
                Import Another File
              </Button>
              <Button onClick={downloadTemplate} variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        )}

        {/* Template Download */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Need a template?</p>
              <p className="text-xs text-gray-500">
                Download our CSV template to see the expected format
              </p>
            </div>
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

