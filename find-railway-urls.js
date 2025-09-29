/**
 * Script to help find Railway URLs for AutoRestock services
 * This script will attempt to discover the deployed service URLs
 */

const https = require('https');

// Common Railway URL patterns for AutoRestock services
const POSSIBLE_URLS = [
    'https://autorestock-user-service-production.up.railway.app',
    'https://autorestock-user-service-production-production.up.railway.app',
    'https://stockpilot-user-service-production.up.railway.app',
    'https://stockpilot-user-service-production-production.up.railway.app',
    'https://user-service-production.up.railway.app',
    'https://user-service-production-production.up.railway.app'
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        const req = https.request(url + '/health', { timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ url, status: res.statusCode, data: jsonData, success: true });
                } catch (e) {
                    resolve({ url, status: res.statusCode, data: data, success: false });
                }
            });
        });
        
        req.on('error', () => resolve({ url, success: false, error: 'Connection failed' }));
        req.on('timeout', () => resolve({ url, success: false, error: 'Timeout' }));
        req.end();
    });
}

async function findServiceUrl() {
    console.log('🔍 Searching for AutoRestock-User-Service Railway URL...\n');
    
    const results = [];
    
    for (const url of POSSIBLE_URLS) {
        console.log(`Testing: ${url}`);
        const result = await checkUrl(url);
        results.push(result);
        
        if (result.success && result.status === 200) {
            console.log(`✅ FOUND: ${url}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Service: ${result.data.service || 'Unknown'}`);
            console.log(`   Database: ${result.data.database || 'Unknown'}`);
            return url;
        } else {
            console.log(`❌ Failed: ${url} (${result.error || `Status: ${result.status}`})`);
        }
    }
    
    console.log('\n❌ No working URL found. The service might not be deployed yet.');
    console.log('💡 Check your Railway dashboard for the correct URL.');
    
    return null;
}

// Run the search
findServiceUrl().then(url => {
    if (url) {
        console.log(`\n🎯 Use this URL for testing: ${url}`);
        console.log(`\nTo run the test suite:`);
        console.log(`node test-user-service.js ${url}`);
    }
}).catch(error => {
    console.error('Error:', error);
});
