/**
 * Direct SMTP Test
 */

const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🧪 Testing SMTP directly...');
  
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
    console.log('📧 Sending test email...');
    
    const info = await transporter.sendMail({
      from: 'Test Sender <noreply@autorestock.app>',
      to: 'jake@ljmuk.co.uk',
      subject: 'SMTP Direct Test - ' + new Date().toISOString(),
      text: 'This is a direct SMTP test to verify credentials work.',
      html: '<p>This is a direct SMTP test to verify credentials work.</p>'
    });

    console.log('✅ SMTP Test SUCCESS!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('❌ SMTP Test FAILED:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    console.error('Response:', error.response);
  }
}

testSMTP();
