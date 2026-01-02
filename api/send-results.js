import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { applicantName, applicantEmail, branch, skillLevel, score, totalQuestions, timeSpent, pdfDataUrl } = req.body;

    if (!applicantName || !applicantEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Convert base64 PDF to buffer
    let pdfBuffer = null;
    if (pdfDataUrl) {
      const base64Data = pdfDataUrl.replace(/^data:application\/pdf;base64,/, '');
      pdfBuffer = Buffer.from(base64Data, 'base64');
    }

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;

    // Email content
    const emailHtml = `
      <h2>Generator Technician Knowledge Test Results</h2>
      <p><strong>Applicant:</strong> ${applicantName}</p>
      <p><strong>Email:</strong> ${applicantEmail}</p>
      <p><strong>Branch:</strong> ${branch}</p>
      <p><strong>Skill Level:</strong> ${skillLevel}</p>
      <p><strong>Score:</strong> ${score} / ${totalQuestions} (${percentage}%)</p>
      <p><strong>Time Spent:</strong> ${timeSpent}</p>
      <p><strong>Status:</strong> ${passed ? 'PASSED ✓' : 'FAILED ✗'}</p>
      ${passed ? '<p>Certificate attached.</p>' : ''}
    `;

    const msg = {
      to: [applicantEmail, process.env.SENDGRID_FROM_EMAIL],
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Generator Source'
      },
      subject: `Test Results - ${applicantName} - ${passed ? 'PASSED' : 'FAILED'}`,
      html: emailHtml,
    };

    // Attach PDF if provided and passed
    if (pdfBuffer && passed) {
      msg.attachments = [{
        content: pdfBuffer.toString('base64'),
        filename: `certificate-${applicantName.replace(/\s+/g, '-')}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      }];
    }

    await sgMail.send(msg);

    res.status(200).json({ success: true, message: 'Results sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send results', details: error.message });
  }
}
