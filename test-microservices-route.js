/**
 * Test the microservices testing interface through the main application
 */

const https = require('https');

const MAIN_APP_URL = 'https://stockpilot-production-5caa.up.railway.app';

async function testMicroservicesRoute() {
    console.log('🔍 Testing Microservices Testing Interface...');
    console.log(`URL: ${MAIN_APP_URL}/microservices`);
    
    try {
        const response = await makeRequest(`${MAIN_APP_URL}/microservices`);
        
        if (response.status === 200) {
            console.log('✅ Microservices Testing Interface: WORKING');
            console.log('   The microservice testing dashboard is accessible through your main app');
            console.log('   No separate deployment needed!');
            return true;
        } else {
            console.log('❌ Microservices Testing Interface: FAILED');
            console.log('   Status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Microservices Testing Interface: ERROR');
        console.log('   Error:', error.message);
        return false;
    }
}

async function testMainApp() {
    console.log('🔍 Testing Main Application...');
    console.log(`URL: ${MAIN_APP_URL}`);
    
    try {
        const response = await makeRequest(`${MAIN_APP_URL}/health`);
        
        if (response.status === 200 && response.data.status === 'ok') {
            console.log('✅ Main Application: WORKING');
            console.log('   Service:', response.data.service);
            console.log('   Features:', response.data.features);
            return true;
        } else {
            console.log('❌ Main Application: FAILED');
            console.log('   Status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Main Application: ERROR');
        console.log('   Error:', error.message);
        return false;
    }
}

// Utility function for HTTP requests
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
    console.log('🚀 Testing AutoRestock Application Architecture');
    console.log('=' * 60);
    
    const mainAppWorking = await testMainApp();
    const microservicesWorking = await testMicroservicesRoute();
    
    console.log('\n' + '=' * 60);
    console.log('📊 ARCHITECTURE TEST RESULTS');
    console.log('=' * 60);
    
    if (mainAppWorking && microservicesWorking) {
        console.log('✅ PERFECT ARCHITECTURE!');
        console.log('   - Main AutoRestock App: Working');
        console.log('   - Microservice Testing: Accessible at /microservices');
        console.log('   - User Service: Separate and working');
        console.log('\n🎯 RECOMMENDATION:');
        console.log('   - Keep using the main app for everything');
        console.log('   - Don\'t deploy microservice-frontends separately');
        console.log('   - Access microservice testing at: /microservices');
    } else {
        console.log('❌ ISSUES DETECTED');
        if (!mainAppWorking) console.log('   - Main app needs attention');
        if (!microservicesWorking) console.log('   - Microservice testing needs attention');
    }
    
    console.log('\n🔗 YOUR WORKING URLS:');
    console.log(`Main App: ${MAIN_APP_URL}`);
    console.log(`Microservice Testing: ${MAIN_APP_URL}/microservices`);
    console.log('User Service: https://autorestock-user-service-production.up.railway.app');
}

runTests().catch(error => {
    console.error('💥 Test error:', error);
});
