import express from 'express';
import { OpenAI } from 'openai';
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

// Serve static files from dist
app.use(express.static(join(__dirname, 'dist')));

// Serve index.html for all other routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

