import express from 'express';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/ai-help', async (req, res) => {
  try {
    const { question, currentQuestion } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'No question provided' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for a power generation technician knowledge test. Provide helpful hints or explanations related to the test questions, but NEVER give direct answers. Encourage the user to think critically. Keep responses concise and educational.'
        },
        {
          role: 'user',
          content: `The current test question is: "${currentQuestion}". The user is asking: "${question}". Provide a hint or explanation without giving the direct answer.`
        }
      ],
      max_tokens: 200,
    });

    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: 'Failed to get AI help' });
  }
});

// Branch to manager email mapping
const branchEmails = {
  'Brighton, CO': 'emett@generatorsource.com',
  'Jacksonville, FL': 'chad@generatorsource.com',
  'Austin, TX': 'jbrown@generatorsource.com',
  'Pensacola, FL': 'oliver@generatorsource.com'
};

// Submit test results and send email
app.post('/api/submit-test', async (req, res) => {
  try {
    const {
      applicantName,
      applicantEmail,
      applicantPhone,
      branch,
      skillLevel,
      score,
      totalQuestions,
      percentage,
      performanceLevel,
      selfEvaluation,
      assessment,
      detailedResults
    } = req.body;

    // Validate required fields
    if (!applicantName || !applicantEmail || !applicantPhone || !branch || !skillLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Determine email recipients
    const branchManager = branchEmails[branch];
    const recipients = [branchManager, 'emett@generatorsource.com']; // Branch manager + Emett (master copy)
    const uniqueRecipients = [...new Set(recipients)]; // Remove duplicates if branch manager is Emett

    // Insert test results into Supabase
    const { data, error } = await supabase
      .from('test_results')
      .insert([
        {
          applicant_name: applicantName,
          applicant_email: applicantEmail,
          applicant_phone: applicantPhone,
          branch: branch,
          skill_level: skillLevel,
          test_date: new Date().toISOString(),
          score: score,
          total_questions: totalQuestions,
          percentage: percentage,
          performance_level: performanceLevel,
          self_evaluation: selfEvaluation,
          assessment: assessment,
          detailed_results: detailedResults
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to save test results', details: error.message });
    }

    // Send email with results to all recipients
    try {
      const emailPromises = uniqueRecipients.map(recipient => {
        const isApplicant = recipient === applicantEmail;
        const subject = isApplicant 
          ? `Your Generator Technician Test Results - ${percentage}%`
          : `Test Results: ${applicantName} - ${branch} - ${percentage}%`;
        
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .result-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
              .score { font-size: 48px; font-weight: bold; color: #1e40af; text-align: center; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .label { font-weight: bold; color: #6b7280; }
              .value { color: #111827; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Generator Technician Knowledge Test</h1>
                <p>Official Test Results</p>
              </div>
              <div class="content">
                ${isApplicant ? `<p>Dear ${applicantName},</p><p>Thank you for completing the Generator Technician Knowledge Test. Here are your results:</p>` : `<p>Test results for applicant from ${branch}:</p>`}
                
                <div class="score">${percentage}%</div>
                
                <div class="result-box">
                  <h3>Test Summary</h3>
                  <div class="detail-row">
                    <span class="label">Applicant Name:</span>
                    <span class="value">${applicantName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Branch:</span>
                    <span class="value">${branch}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Test Date:</span>
                    <span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Score:</span>
                    <span class="value">${score} out of ${totalQuestions} (${percentage}%)</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Self-Evaluation:</span>
                    <span class="value">${selfEvaluation}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Performance Level:</span>
                    <span class="value">${performanceLevel}</span>
                  </div>
                </div>
                
                <div class="result-box">
                  <h3>Assessment</h3>
                  <p>${assessment}</p>
                </div>
                
                ${isApplicant ? '<p>If you have any questions about your results, please contact the hiring team.</p>' : ''}
                
                <div class="footer">
                  <p><strong>Generator Source</strong></p>
                  <p>Professional Generator Services</p>
                  <p>Contact: ${applicantEmail} | Phone: ${applicantPhone}</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;
        
        return sgMail.send({
          to: recipient,
          from: {
            email: process.env.SENDGRID_FROM_EMAIL,
            name: process.env.SENDGRID_FROM_NAME
          },
          subject: subject,
          html: htmlContent
        });
      });
      
      await Promise.all(emailPromises);
      console.log(`Emails sent successfully to: ${uniqueRecipients.join(', ')}`);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the request if email fails - results are already saved
    }

    res.json({ 
      success: true, 
      message: 'Test results saved and emails sent successfully',
      data: data[0]
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Failed to submit test results' });
  }
});

// Serve static files from dist
app.use(express.static(join(__dirname, 'dist')));

// Serve index.html for all other routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

