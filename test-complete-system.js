/**
 * Complete System Test for AutoRestock
 * Tests both the frontend and user service
 */

const https = require('https');

// Service URLs
const FRONTEND_URL = 'https://stockpilot-production-5caa.up.railway.app';
const USER_SERVICE_URL = 'https://autorestock-user-service-production.up.railway.app';

// Test results
let results = {
    frontend: { working: false, details: null },
    userService: { working: false, details: null },
    userServiceTests: { passed: 0, failed: 0, total: 0, details: [] }
};

// Utility function for HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: 10000
        };

        const req = https.request(url, requestOptions, (res) => {
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

// Test frontend service
async function testFrontend() {
    console.log('🔍 Testing Frontend Service...');
    console.log(`URL: ${FRONTEND_URL}`);
    
    try {
        const response = await makeRequest(`${FRONTEND_URL}/health`);
        
        if (response.status === 200 && response.data.status === 'ok') {
            results.frontend.working = true;
            results.frontend.details = response.data;
            console.log('✅ Frontend Service: WORKING');
            console.log('   Service:', response.data.service);
            console.log('   Timestamp:', response.data.timestamp);
            return true;
        } else {
            console.log('❌ Frontend Service: FAILED');
            console.log('   Status:', response.status);
            console.log('   Response:', response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Frontend Service: ERROR');
        console.log('   Error:', error.message);
        return false;
    }
}

// Test user service health
async function testUserServiceHealth() {
    console.log('\n🔍 Testing User Service Health...');
    console.log(`URL: ${USER_SERVICE_URL}`);
    
    try {
        const response = await makeRequest(`${USER_SERVICE_URL}/health`);
        
        if (response.status === 200 && response.data.status === 'ok') {
            results.userService.working = true;
            results.userService.details = response.data;
            console.log('✅ User Service: WORKING');
            console.log('   Service:', response.data.service);
            console.log('   Database:', response.data.database);
            return true;
        } else {
            console.log('❌ User Service: FAILED');
            console.log('   Status:', response.status);
            console.log('   Response:', response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ User Service: ERROR');
        console.log('   Error:', error.message);
        return false;
    }
}

// Test user registration
async function testUserRegistration() {
    results.userServiceTests.total++;
    console.log('\n🧪 Testing User Registration...');
    
    try {
        const userData = {
            email: 'test@autorestock.com',
            password: 'TestPassword123!',
            firstName: 'Test',
            lastName: 'User'
        };
        
        const response = await makeRequest(`${USER_SERVICE_URL}/api/v1/users/register`, {
            method: 'POST',
            body: userData
        });
        
        if (response.status === 201 && response.data.success) {
            results.userServiceTests.passed++;
            console.log('✅ User Registration: PASSED');
            results.userServiceTests.details.push({ test: 'User Registration', status: 'PASSED' });
            return { success: true, token: response.data.token };
        } else {
            results.userServiceTests.failed++;
            console.log('❌ User Registration: FAILED');
            console.log('   Status:', response.status);
            console.log('   Response:', response.data);
            results.userServiceTests.details.push({ test: 'User Registration', status: 'FAILED', error: response.data.message });
            return { success: false };
        }
    } catch (error) {
        results.userServiceTests.failed++;
        console.log('❌ User Registration: ERROR');
        console.log('   Error:', error.message);
        results.userServiceTests.details.push({ test: 'User Registration', status: 'ERROR', error: error.message });
        return { success: false };
    }
}

// Test user login
async function testUserLogin() {
    results.userServiceTests.total++;
    console.log('\n🧪 Testing User Login...');
    
    try {
        const loginData = {
            email: 'test@autorestock.com',
            password: 'TestPassword123!'
        };
        
        const response = await makeRequest(`${USER_SERVICE_URL}/api/v1/users/login`, {
            method: 'POST',
            body: loginData
        });
        
        if (response.status === 200 && response.data.success) {
            results.userServiceTests.passed++;
            console.log('✅ User Login: PASSED');
            results.userServiceTests.details.push({ test: 'User Login', status: 'PASSED' });
            return { success: true, token: response.data.token };
        } else {
            results.userServiceTests.failed++;
            console.log('❌ User Login: FAILED');
            console.log('   Status:', response.status);
            console.log('   Response:', response.data);
            results.userServiceTests.details.push({ test: 'User Login', status: 'FAILED', error: response.data.message });
            return { success: false };
        }
    } catch (error) {
        results.userServiceTests.failed++;
        console.log('❌ User Login: ERROR');
        console.log('   Error:', error.message);
        results.userServiceTests.details.push({ test: 'User Login', status: 'ERROR', error: error.message });
        return { success: false };
    }
}

// Test invalid login
async function testInvalidLogin() {
    results.userServiceTests.total++;
    console.log('\n🧪 Testing Invalid Login (should fail)...');
    
    try {
        const loginData = {
            email: 'test@autorestock.com',
            password: 'WrongPassword123!'
        };
        
        const response = await makeRequest(`${USER_SERVICE_URL}/api/v1/users/login`, {
            method: 'POST',
            body: loginData
        });
        
        if (response.status === 401 && !response.data.success) {
            results.userServiceTests.passed++;
            console.log('✅ Invalid Login Test: PASSED (correctly rejected)');
            results.userServiceTests.details.push({ test: 'Invalid Login', status: 'PASSED' });
            return { success: true };
        } else {
            results.userServiceTests.failed++;
            console.log('❌ Invalid Login Test: FAILED (should have been rejected)');
            console.log('   Status:', response.status);
            console.log('   Response:', response.data);
            results.userServiceTests.details.push({ test: 'Invalid Login', status: 'FAILED', error: 'Should have been rejected' });
            return { success: false };
        }
    } catch (error) {
        results.userServiceTests.failed++;
        console.log('❌ Invalid Login Test: ERROR');
        console.log('   Error:', error.message);
        results.userServiceTests.details.push({ test: 'Invalid Login', status: 'ERROR', error: error.message });
        return { success: false };
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 AutoRestock Complete System Test');
    console.log('=' * 60);
    
    // Test services
    const frontendWorking = await testFrontend();
    const userServiceWorking = await testUserServiceHealth();
    
    if (!userServiceWorking) {
        console.log('\n❌ User Service not working, skipping user tests');
        return;
    }
    
    // Test user service functionality
    await testUserRegistration();
    await testUserLogin();
    await testInvalidLogin();
    
    // Print results
    console.log('\n' + '=' * 60);
    console.log('📊 COMPLETE SYSTEM TEST RESULTS');
    console.log('=' * 60);
    
    console.log('\n🔧 SERVICE STATUS:');
    console.log(`Frontend Service: ${results.frontend.working ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`User Service: ${results.userService.working ? '✅ WORKING' : '❌ FAILED'}`);
    
    if (results.userService.working) {
        console.log('\n🧪 USER SERVICE TESTS:');
        console.log(`Total Tests: ${results.userServiceTests.total}`);
        console.log(`✅ Passed: ${results.userServiceTests.passed}`);
        console.log(`❌ Failed: ${results.userServiceTests.failed}`);
        console.log(`Success Rate: ${((results.userServiceTests.passed / results.userServiceTests.total) * 100).toFixed(1)}%`);
        
        if (results.userServiceTests.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            results.userServiceTests.details
                .filter(test => test.status !== 'PASSED')
                .forEach(test => {
                    console.log(`  - ${test.test}: ${test.error || 'Unknown error'}`);
                });
        }
    }
    
    console.log('\n🎯 SYSTEM STATUS:');
    if (results.frontend.working && results.userService.working) {
        console.log('✅ COMPLETE SYSTEM: WORKING');
        console.log('   Both frontend and user service are operational');
    } else {
        console.log('❌ COMPLETE SYSTEM: ISSUES DETECTED');
        if (!results.frontend.working) console.log('   - Frontend service needs attention');
        if (!results.userService.working) console.log('   - User service needs attention');
    }
    
    console.log('\n🔗 SERVICE URLS:');
    console.log(`Frontend: ${FRONTEND_URL}`);
    console.log(`User Service: ${USER_SERVICE_URL}`);
    
    console.log('\n🎉 Test completed!');
}

// Run the tests
runAllTests().catch(error => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
});
