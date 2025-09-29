/**
 * Comprehensive Test Suite for AutoRestock-User-Service
 * Tests all endpoints and functionality on Railway
 */

const https = require('https');
const http = require('http');

// Configuration
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'https://autorestock-user-service-production.up.railway.app';
const TEST_EMAIL = 'test@autorestock.com';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_FIRST_NAME = 'Test';
const TEST_LAST_NAME = 'User';

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
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
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
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

// Test function wrapper
async function runTest(testName, testFunction) {
    testResults.total++;
    console.log(`\n🧪 Running: ${testName}`);
    
    try {
        const result = await testFunction();
        if (result.success) {
            testResults.passed++;
            console.log(`✅ PASSED: ${testName}`);
            testResults.details.push({ test: testName, status: 'PASSED', result });
        } else {
            testResults.failed++;
            console.log(`❌ FAILED: ${testName} - ${result.error}`);
            testResults.details.push({ test: testName, status: 'FAILED', error: result.error });
        }
    } catch (error) {
        testResults.failed++;
        console.log(`❌ ERROR: ${testName} - ${error.message}`);
        testResults.details.push({ test: testName, status: 'ERROR', error: error.message });
    }
}

// Test 1: Health Check
async function testHealthCheck() {
    const response = await makeRequest(`${USER_SERVICE_URL}/health`);
    
    if (response.status !== 200) {
        return { success: false, error: `Expected status 200, got ${response.status}` };
    }
    
    if (!response.data.status || response.data.status !== 'ok') {
        return { success: false, error: 'Health check did not return status: ok' };
    }
    
    if (!response.data.service || response.data.service !== 'user-service') {
        return { success: false, error: 'Health check did not return correct service name' };
    }
    
    return { success: true, data: response.data };
}

// Test 2: User Registration
async function testUserRegistration() {
    const userData = {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: TEST_FIRST_NAME,
        lastName: TEST_LAST_NAME
    };
    
    const response = await makeRequest(`${USER_SERVICE_URL}/api/v1/users/register`, {
        method: 'POST',
        body: userData
    });
    
    if (response.status !== 201) {
        return { success: false, error: `Expected status 201, got ${response.status}. Response: ${JSON.stringify(response.data)}` };
    }
    
    if (!response.data.success) {
        return { success: false, error: `Registration failed: ${response.data.message}` };
    }
    
    if (!response.data.token) {
        return { success: false, error: 'No token returned in registration response' };
    }
    
    if (!response.data.user || response.data.user.email !== TEST_EMAIL) {
        return { success: false, error: 'User data not returned correctly' };
    }
    
    return { success: true, data: response.data, token: response.data.token };
}

// Test 3: Duplicate Registration (should fail)
async function testDuplicateRegistration() {
    const userData = {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: TEST_FIRST_NAME,
        lastName: TEST_LAST_NAME
    };
    
    const response = await makeRequest(`${USER_SERVICE_URL}/api/v1/users/register`, {
        method: 'POST',
        body: userData
    });
    
    if (response.status !== 400) {
        return { success: false, error: `Expected status 400 for duplicate registration, got ${response.status}` };
    }
    
    if (response.data.success !== false) {
        return { success: false, error: 'Duplicate registration should return success: false' };
    }
    
    return { success: true, data: response.data };
}

// Test 4: User Login
async function testUserLogin() {
    const loginData = {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    };
    
    const response = await makeRequest(`${USER_SERVICE_URL}/api/v1/users/login`, {
        method: 'POST',
        body: loginData
    });
    
    if (response.status !== 200) {
        return { success: false, error: `Expected status 200, got ${response.status}. Response: ${JSON.stringify(response.data)}` };
    }
    
    if (!response.data.success) {
        return { success: false, error: `Login failed: ${response.data.message}` };
    }
    
    if (!response.data.token) {
        return { success: false, error: 'No token returned in login response' };
    }
    
    return { success: true, data: response.data, token: response.data.token };
}

// Test 5: Invalid Login (wrong password)
async function testInvalidLogin() {
    const loginData = {
        email: TEST_EMAIL,
        password: 'WrongPassword123!'
    };
    
    const response = await makeRequest(`${USER_SERVICE_URL}/api/v1/users/login`, {
        method: 'POST',
        body: loginData
    });
    
    if (response.status !== 401) {
        return { success: false, error: `Expected status 401 for invalid login, got ${response.status}` };
    }
    
    if (response.data.success !== false) {
        return { success: false, error: 'Invalid login should return success: false' };
    }
    
    return { success: true, data: response.data };
}

// Test 6: Missing Fields Registration
async function testMissingFieldsRegistration() {
    const userData = {
        email: TEST_EMAIL,
        // Missing password, firstName, lastName
    };
    
    const response = await makeRequest(`${USER_SERVICE_URL}/api/v1/users/register`, {
        method: 'POST',
        body: userData
    });
    
    if (response.status !== 400) {
        return { success: false, error: `Expected status 400 for missing fields, got ${response.status}` };
    }
    
    if (response.data.success !== false) {
        return { success: false, error: 'Missing fields should return success: false' };
    }
    
    return { success: true, data: response.data };
}

// Test 7: Database Connection Check
async function testDatabaseConnection() {
    const response = await makeRequest(`${USER_SERVICE_URL}/health`);
    
    if (response.status !== 200) {
        return { success: false, error: `Health check failed with status ${response.status}` };
    }
    
    if (response.data.database !== 'connected') {
        return { success: false, error: `Database not connected. Status: ${response.data.database}` };
    }
    
    return { success: true, data: response.data };
}

// Test 8: Service Response Time
async function testResponseTime() {
    const startTime = Date.now();
    const response = await makeRequest(`${USER_SERVICE_URL}/health`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.status !== 200) {
        return { success: false, error: `Health check failed with status ${response.status}` };
    }
    
    if (responseTime > 5000) {
        return { success: false, error: `Response time too slow: ${responseTime}ms` };
    }
    
    return { success: true, data: { responseTime, status: response.status } };
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting AutoRestock-User-Service Tests');
    console.log(`📍 Testing URL: ${USER_SERVICE_URL}`);
    console.log('=' * 60);
    
    // Run all tests
    await runTest('Health Check', testHealthCheck);
    await runTest('Database Connection', testDatabaseConnection);
    await runTest('User Registration', testUserRegistration);
    await runTest('Duplicate Registration (should fail)', testDuplicateRegistration);
    await runTest('User Login', testUserLogin);
    await runTest('Invalid Login (should fail)', testInvalidLogin);
    await runTest('Missing Fields Registration (should fail)', testMissingFieldsRegistration);
    await runTest('Response Time Check', testResponseTime);
    
    // Print results
    console.log('\n' + '=' * 60);
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' * 60);
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        testResults.details
            .filter(test => test.status !== 'PASSED')
            .forEach(test => {
                console.log(`  - ${test.test}: ${test.error || test.result}`);
            });
    }
    
    console.log('\n🎯 Test completed!');
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle command line arguments
if (process.argv.length > 2) {
    USER_SERVICE_URL = process.argv[2];
    console.log(`Using custom URL: ${USER_SERVICE_URL}`);
}

// Run the tests
runAllTests().catch(error => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
});
