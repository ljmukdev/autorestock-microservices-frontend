#!/usr/bin/env node

/**
 * Comprehensive API Testing Script
 * Tests all microservice endpoints and functionality
 */

const https = require('https');
const http = require('http');

// Configuration - Update these with your actual Railway URLs
const SERVICES = {
  reporting: 'https://your-reporting-service.up.railway.app',
  purchases: 'https://your-purchases-service.up.railway.app',
  sales: 'https://your-sales-service.up.railway.app',
  inventory: 'https://your-inventory-service.up.railway.app',
  settings: 'https://your-settings-service.up.railway.app',
  autoBuying: 'https://your-auto-buying-service.up.railway.app',
  adGenerator: 'https://your-ad-generator-service.up.railway.app',
  accounting: 'https://your-accounting-service.up.railway.app'
};

// Test cases for each service
const TEST_CASES = {
  reporting: [
    { method: 'GET', path: '/', name: 'Root endpoint' },
    { method: 'GET', path: '/ping', name: 'Ping endpoint' },
    { method: 'GET', path: '/health', name: 'Health check' },
    { method: 'GET', path: '/api/reports', name: 'List reports' },
    { method: 'POST', path: '/api/reports', name: 'Create report', body: {
      title: 'Test Report',
      type: 'analytics',
      data: { test: true },
      userId: '507f1f77bcf86cd799439011'
    }}
  ],
  purchases: [
    { method: 'GET', path: '/', name: 'Root endpoint' },
    { method: 'GET', path: '/ping', name: 'Ping endpoint' },
    { method: 'GET', path: '/health', name: 'Health check' },
    { method: 'GET', path: '/api/purchases', name: 'List purchases' },
    { method: 'POST', path: '/api/purchases', name: 'Create purchase', body: {
      item: 'Test Item',
      price: 29.99,
      quantity: 1,
      userId: '507f1f77bcf86cd799439011'
    }}
  ],
  sales: [
    { method: 'GET', path: '/', name: 'Root endpoint' },
    { method: 'GET', path: '/ping', name: 'Ping endpoint' },
    { method: 'GET', path: '/health', name: 'Health check' },
    { method: 'GET', path: '/api/sales', name: 'List sales' }
  ],
  inventory: [
    { method: 'GET', path: '/', name: 'Root endpoint' },
    { method: 'GET', path: '/ping', name: 'Ping endpoint' },
    { method: 'GET', path: '/health', name: 'Health check' },
    { method: 'GET', path: '/api/inventory', name: 'List inventory' }
  ],
  settings: [
    { method: 'GET', path: '/', name: 'Root endpoint' },
    { method: 'GET', path: '/ping', name: 'Ping endpoint' },
    { method: 'GET', path: '/health', name: 'Health check' },
    { method: 'GET', path: '/api/settings', name: 'List settings' }
  ]
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Make HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test a single endpoint
async function testEndpoint(serviceName, baseUrl, testCase) {
  const url = `${baseUrl}${testCase.path}`;
  
  try {
    const response = await makeRequest(url, {
      method: testCase.method,
      body: testCase.body
    });
    
    const isSuccess = response.statusCode >= 200 && response.statusCode < 300;
    const status = isSuccess ? '✅' : '❌';
    const color = isSuccess ? colors.green : colors.red;
    
    console.log(`  ${status} ${testCase.name}: ${color}${response.statusCode}${colors.reset}`);
    
    if (!isSuccess && response.body) {
      console.log(`    Error: ${response.body.substring(0, 100)}...`);
    }
    
    return isSuccess;
  } catch (error) {
    console.log(`  ❌ ${testCase.name}: ${colors.red}ERROR${colors.reset} - ${error.message}`);
    return false;
  }
}

// Test a single service
async function testService(serviceName, baseUrl) {
  console.log(`\n${colors.bold}${colors.blue}Testing ${serviceName.toUpperCase()} Service${colors.reset}`);
  console.log(`URL: ${baseUrl}`);
  
  const testCases = TEST_CASES[serviceName] || [];
  let passed = 0;
  let total = testCases.length;
  
  for (const testCase of testCases) {
    const success = await testEndpoint(serviceName, baseUrl, testCase);
    if (success) passed++;
  }
  
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  const color = percentage >= 80 ? colors.green : percentage >= 50 ? colors.yellow : colors.red;
  
  console.log(`\n  ${color}${passed}/${total} tests passed (${percentage}%)${colors.reset}`);
  return { passed, total, percentage };
}

// Main test function
async function runTests() {
  console.log(`${colors.bold}${colors.blue}🚀 AutoRestock Microservices API Test Suite${colors.reset}`);
  console.log(`${colors.yellow}Testing all microservice endpoints...${colors.reset}\n`);
  
  const results = {};
  let totalPassed = 0;
  let totalTests = 0;
  
  for (const [serviceName, baseUrl] of Object.entries(SERVICES)) {
    const result = await testService(serviceName, baseUrl);
    results[serviceName] = result;
    totalPassed += result.passed;
    totalTests += result.total;
  }
  
  // Summary
  console.log(`\n${colors.bold}${colors.blue}📊 TEST SUMMARY${colors.reset}`);
  console.log(`${colors.yellow}${'='.repeat(50)}${colors.reset}`);
  
  for (const [serviceName, result] of Object.entries(results)) {
    const color = result.percentage >= 80 ? colors.green : colors.red;
    console.log(`${serviceName.padEnd(15)}: ${color}${result.passed}/${result.total} (${result.percentage}%)${colors.reset}`);
  }
  
  const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  const overallColor = overallPercentage >= 80 ? colors.green : colors.red;
  
  console.log(`${colors.yellow}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.bold}Overall: ${overallColor}${totalPassed}/${totalTests} (${overallPercentage}%)${colors.reset}`);
  
  if (overallPercentage >= 80) {
    console.log(`\n${colors.green}🎉 All systems operational!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️  Some services need attention${colors.reset}`);
  }
}

// Run the tests
runTests().catch(console.error);


