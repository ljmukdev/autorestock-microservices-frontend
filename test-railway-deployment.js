/**
 * Test Railway deployment status
 * This script will test the main AutoRestock service and help identify the User Service URL
 */

const https = require('https');

// Test the main service first
const MAIN_SERVICE_URL = 'https://stockpilot-production-5caa.up.railway.app';

async function testMainService() {
    console.log('🔍 Testing main AutoRestock service...');
    console.log(`URL: ${MAIN_SERVICE_URL}`);
    
    try {
        const response = await makeRequest(`${MAIN_SERVICE_URL}/health`);
        console.log('✅ Main service health check:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Main service failed:', error.message);
        return false;
    }
}

// Test potential User Service URLs
const USER_SERVICE_CANDIDATES = [
    'https://autorestock-user-service-production.up.railway.app',
    'https://autorestock-user-service-production-production.up.railway.app',
    'https://stockpilot-user-service-production.up.railway.app',
    'https://stockpilot-user-service-production-production.up.railway.app',
    'https://user-service-production.up.railway.app',
    'https://user-service-production-production.up.railway.app'
];

async function findUserService() {
    console.log('\n🔍 Searching for AutoRestock-User-Service...');
    
    for (const url of USER_SERVICE_CANDIDATES) {
        try {
            console.log(`Testing: ${url}`);
            const response = await makeRequest(`${url}/health`);
            
            if (response.status === 200 && response.data.service === 'user-service') {
                console.log('✅ FOUND User Service:', url);
                console.log('   Status:', response.data);
                return url;
            }
        } catch (error) {
            console.log(`❌ Failed: ${url} (${error.message})`);
        }
    }
    
    console.log('❌ User Service not found. It may not be deployed yet.');
    return null;
}

// Utility function to make HTTP requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { timeout: 10000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        req.end();
    });
}

// Run tests
async function runTests() {
    console.log('🚀 Testing Railway Deployments');
    console.log('=' * 50);
    
    const mainServiceWorking = await testMainService();
    
    if (mainServiceWorking) {
        console.log('\n✅ Main service is working! Railway deployment fixed.');
    } else {
        console.log('\n❌ Main service still failing. Check Railway logs.');
    }
    
    const userServiceUrl = await findUserService();
    
    if (userServiceUrl) {
        console.log(`\n🎯 User Service URL: ${userServiceUrl}`);
        console.log('\nTo test the User Service:');
        console.log(`node test-user-service.js ${userServiceUrl}`);
    } else {
        console.log('\n💡 The User Service may need to be deployed separately on Railway.');
        console.log('   Check your Railway dashboard for the AutoRestock-User-Service deployment.');
    }
}

runTests().catch(error => {
    console.error('💥 Test error:', error);
});
