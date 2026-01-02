import sgMail from '@sendgrid/mail';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testSendGrid() {
  try {
    console.log('Testing SendGrid configuration...');
    console.log('From Email:', process.env.SENDGRID_FROM_EMAIL);
    console.log('From Name:', process.env.SENDGRID_FROM_NAME);
    
    // Send a test email
    const msg = {
      to: process.env.SENDGRID_FROM_EMAIL, // Send to self for testing
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME
      },
      subject: 'SendGrid Test - Generator Test System',
      text: 'This is a test email from the Generator Technician Knowledge Test system.',
      html: '<p>This is a test email from the <strong>Generator Technician Knowledge Test</strong> system.</p><p>If you received this, SendGrid is configured correctly!</p>',
    };

    const response = await sgMail.send(msg);
    console.log('✅ SendGrid test email sent successfully!');
    console.log('Response status:', response[0].statusCode);
    return true;
  } catch (error) {
    console.error('❌ SendGrid test failed:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
    return false;
  }
}

testSendGrid();
