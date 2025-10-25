# Generator Technician Knowledge Test

A comprehensive web-based knowledge test for power generation technicians featuring 97 questions, AI-powered help, timer functionality, and certificate generation.

## Features

- **97 Comprehensive Questions** covering electrical systems, generator maintenance, troubleshooting, and safety
- **Timer with Pause/Resume** - 60-minute test with ability to pause
- **3 AI Lifelines** - Get hints without direct answers (points deducted when used)
- **Progress Tracking** - Visual progress bar and question counter
- **Scoring System** - Detailed results with correct/incorrect answers
- **Certificate Generation** - Downloadable PDF certificate upon completion
- **Modern Industrial Design** - Blue/yellow color scheme with Generator Source branding
- **Mobile Responsive** - Large touch targets (56-60px) optimized for mobile devices

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI Integration**: OpenAI API (gpt-4.1-mini)
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: Radix UI
- **PDF Generation**: jsPDF + html2canvas

## Deployment to Vercel

### Step 1: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Import from GitHub: `hbcu445/generator-technician-test`
4. Select the repository

### Step 2: Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset**: Other
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### Step 3: Add Environment Variables

Add the following environment variable in Vercel:

- **Key**: `OPENAI_API_KEY`
- **Value**: Your OpenAI API key

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

Your app will be live at: `https://your-project-name.vercel.app`

## Environment Variables

The following environment variable is required:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/hbcu445/generator-technician-test.git
cd generator-technician-test
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Build the frontend:
```bash
pnpm run build
```

5. Start the server:
```bash
pnpm start
```

6. Open your browser to `http://localhost:3000`

## Project Structure

```
├── src/
│   ├── App.jsx           # Main application component
│   ├── App.css           # Custom styling
│   ├── assets/           # Images and question data
│   └── components/       # Reusable UI components
├── dist/                 # Production build output
├── server.js             # Express backend with AI API
├── package.json          # Dependencies and scripts
└── vercel.json          # Vercel deployment configuration
```

## License

This project is proprietary software for Generator Source.

## Support

For questions or issues, please contact the development team.

