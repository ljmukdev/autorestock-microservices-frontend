/**
 * Test DMARC and M365 Delivery
 */

const nodemailer = require('nodemailer');

async function testDMARCAndM365() {
  console.log('🧪 Testing DMARC and M365 delivery...');
  
  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'noreply@autorestock.app',
      pass: 'Yb21xzl!'
    }
  });

  const timestamp = new Date().toISOString();
  
  try {
    // Test 1: Gmail (for DMARC verification)
    console.log('📧 Sending test email to Gmail...');
    const gmailResult = await transporter.sendMail({
      from: 'AutoRestock <noreply@autorestock.app>',
      to: 'jacob.loynes@gmail.com',
      subject: `DMARC Test - ${timestamp}`,
      text: 'This is a test email to verify DMARC authentication is working correctly.',
      html: '<p>This is a test email to verify DMARC authentication is working correctly.</p>'
    });
    console.log('✅ Gmail test sent:', gmailResult.messageId);

    // Test 2: M365 (for delivery verification)
    console.log('📧 Sending test email to M365...');
    const m365Result = await transporter.sendMail({
      from: 'AutoRestock <noreply@autorestock.app>',
      to: 'ebay@ljmuk.co.uk',
      subject: `M365 Delivery Test - ${timestamp}`,
      text: 'This is a test email to verify M365 delivery is working correctly.',
      html: '<p>This is a test email to verify M365 delivery is working correctly.</p>'
    });
    console.log('✅ M365 test sent:', m365Result.messageId);

    console.log('🎉 Both test emails sent successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDMARCAndM365();




