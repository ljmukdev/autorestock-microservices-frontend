/**
 * Test script for order extraction functionality
 */

const emailContent = `From: eBay <noreply@ebay.com>
To: test@example.com
Subject: Your item sold! Order details - 146397193069
Date: Mon, 06 Oct 2025 15:30:00 GMT
Content-Type: text/html; charset=UTF-8

<html>
<body>
<h2>Congratulations! Your item sold</h2>
<p>Order number: 146397193069</p>
<p>Buyer: John Smith</p>
<p>Item: AirPod Pro 2nd gen MagSafe Charging Case USB-C A2968</p>
<p>Order total: £50.00</p>
<p>Shipping: £10.67</p>
<p>Quantity: 1</p>
</body>
</html>`;

async function testOrderExtraction() {
  const url = 'https://stockpilot-email-ingest-service-production-production.up.railway.app/inbound/inbound/process';
  
  const testData = {
    alias: 'ebay-test',
    forwardTo: 'test@example.com',
    userId: '507f1f77bcf86cd799439011', // Valid ObjectId string
    tenantId: '507f1f77bcf86cd799439012', // Valid ObjectId string
    headers: {},
    rawEmail: emailContent,
    from: 'noreply@ebay.com',
    to: 'test@example.com',
    subject: 'Your item sold! Order details - 146397193069'
  };

  try {
    console.log('🧪 Testing order extraction...');
    console.log('📧 Email content:', testData.rawEmail.substring(0, 100) + '...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('✅ Response:', JSON.stringify(result, null, 2));
    
    if (result.extracted) {
      console.log('🎉 Order extraction successful!');
    } else {
      console.log('⚠️ No order extraction occurred');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOrderExtraction();
