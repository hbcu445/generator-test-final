import express from 'express';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
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

    // TODO: Send email with results and certificate
    // This will be implemented in the next phase

    res.json({ 
      success: true, 
      message: 'Test results saved successfully',
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

