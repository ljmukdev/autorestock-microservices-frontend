/**
 * Test SMTP Configuration
 * Simple test to verify SMTP credentials work
 */

const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🧪 Testing SMTP configuration...');
  
  // Use the same configuration as the email-ingestion-service
  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'noreply@autorestock.app',
      pass: 'Yb21xzl!'
    }
  });

  try {
    console.log('📧 Attempting to send test email...');
    
    const info = await transporter.sendMail({
      from: 'AutoRestock <noreply@autorestock.app>',
      to: 'ebay@ljmuk.co.uk',
      subject: 'AutoRestock SMTP Test',
      text: 'This is a test email to verify SMTP configuration is working.',
      html: '<p>This is a test email to verify SMTP configuration is working.</p>'
    });

    console.log('✅ SMTP Test Successful!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('❌ SMTP Test Failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    console.error('Response:', error.response);
  }
}

testSMTP();




