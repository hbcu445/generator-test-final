import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Clock, User, Award, CheckCircle, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import questionsData from './assets/questions.json'
import TestSimulator from './TestSimulator.jsx'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome') // welcome, test, results
  const [applicantName, setApplicantName] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(75 * 60) // 75 minutes in seconds
  const [testStarted, setTestStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false) // New state for pause functionality
  const [testResults, setTestResults] = useState(null)
  const [lifelinesRemaining, setLifelinesRemaining] = useState(3) // Initialize with 3 lifelines
  const [lifelinesUsed, setLifelinesUsed] = useState(0)
  const [showAiHelpModal, setShowAiHelpModal] = useState(false)
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiAnswer, setAiAnswer] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiExplanationQuestionIndex, setAiExplanationQuestionIndex] = useState(null) // To store which question AI is explaining

  // Filter and prepare questions
  const questions = questionsData.filter(q => q.question && q.options && q.options.length > 0)

  // Timer effect
  useEffect(() => {
    if (testStarted && !isPaused && timeRemaining > 0 && currentScreen === 'test') {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && currentScreen === 'test') {
      handleTestSubmit()
    }
  }, [testStarted, timeRemaining, currentScreen, isPaused])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const startTest = () => {
    if (applicantName.trim()) {
      setCurrentScreen('test')
      setTestStarted(true)
    }
  }

  const handleAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value
    })
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleTestSubmit = () => {
    // Calculate results
    let correctAnswers = 0
    questions.forEach((question, index) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer && userAnswer === question.correct_answer_letter
      if (isCorrect) {
        correctAnswers++
      }
    })

    let finalScore = correctAnswers;
    if (lifelinesUsed > 0) {
      finalScore = Math.max(0, correctAnswers - lifelinesUsed); // Deduct 1 point per lifeline used
    }

    const percentage = Math.round((finalScore / questions.length) * 100)
    let level = 'Beginner'
    if (percentage >= 80) level = 'Advanced'
    else if (percentage >= 60) level = 'Intermediate'

    const detailedResults = questions.map((question, index) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer && userAnswer === question.correct_answer_letter
      return {
        question: question.question,
        category: question.category,
        userAnswer: userAnswer ? `${userAnswer}. ${question.options[userAnswer.charCodeAt(0) - 65]}` : 'No Answer',
        correctAnswer: `${question.correct_answer_letter}. ${question.options[question.correct_answer_letter.charCodeAt(0) - 65]}`, 
        isCorrect: isCorrect,
        aiExplanation: null, // Placeholder for AI explanation
        showExplanation: false // Flag to show/hide explanation
      }
    })

    setTestResults({
      correctAnswers,
      totalQuestions: questions.length,
      finalScore,
      percentage,
      level,
      completionDate: new Date().toLocaleDateString(),
      lifelinesUsed,
      detailedResults: detailedResults
    })
    setCurrentScreen("results")
  }

  const generateCertificate = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      doc.setFontSize(56)
      doc.setFont("Playfair Display", "bold")
      doc.setTextColor("#6a0dad")
      doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 40, { align: "center" })

      doc.setFontSize(24)
      doc.setFont("Roboto", "normal")
      doc.setTextColor("#2c3e50")
      doc.text("Generator Technician Knowledge Test", pageWidth / 2, 65, { align: "center" })

      doc.setFontSize(18)
      doc.text("This certifies that", pageWidth / 2, 95, { align: "center" })

      doc.setFontSize(48)
      doc.setFont("Playfair Display", "bold")
      doc.setTextColor("#ff6f61")
      doc.text(applicantName, pageWidth / 2, 120, { align: "center" })

      doc.setFontSize(18)
      doc.setFont("Roboto", "normal")
      doc.setTextColor("#2c3e50")
      doc.text("has successfully completed the", pageWidth / 2, 140, { align: "center" })
      doc.text("Generator Technician Knowledge Test", pageWidth / 2, 150, { align: "center" })

      doc.setFontSize(32)
      doc.setFont("Playfair Display", "bold")
      doc.setTextColor("#2ecc71")
      doc.text(`Score: ${testResults.percentage}% (${testResults.correctAnswers} of ${testResults.totalQuestions} questions correct)`, pageWidth / 2, 175, { align: "center" })
      doc.setFontSize(22)
      doc.setTextColor("#8d52d9")
      doc.text(`Skill Level: ${testResults.level}`, pageWidth / 2, 185, { align: "center" })

      doc.setFontSize(16)
      doc.setFont("Roboto", "normal")
      doc.setTextColor("#2c3e50")
      doc.text(`Date: ${testResults.completionDate}`, pageWidth / 2, pageHeight - 40, { align: "center" })

      doc.setDrawColor("#dcdcdc")
      doc.setLineWidth(0.8)
      doc.line(pageWidth / 2 - 50, pageHeight - 25, pageWidth / 2 + 50, pageHeight - 25)
      doc.text("Authorized Signature", pageWidth / 2, pageHeight - 20, { align: "center" })

      doc.save(`${applicantName.replace(/\s+/g, '_')}_Generator_Technician_Certificate.pdf`)
    }).catch(error => {
      console.error('Error generating certificate:', error)
      const certificateContent = `
CERTIFICATE OF COMPLETION

Generator Technician Knowledge Test

This certifies that ${applicantName} has successfully completed the Generator Technician Knowledge Test
with a score of ${testResults.percentage}% (${testResults.correctAnswers} of ${testResults.totalQuestions} questions correct)

Skill Level: ${testResults.level}
Date: ${testResults.completionDate}
      `
      
      const blob = new Blob([certificateContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${applicantName.replace(/\s+/g, '_')}_Certificate.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  const generateResultsReport = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Generator Technician Knowledge Test - Detailed Results', 10, 10);
      doc.setFontSize(12);
      doc.text(`Applicant: ${applicantName}`, 10, 20);
      doc.text(`Score: ${testResults.percentage}% (${testResults.correctAnswers}/${testResults.totalQuestions})`, 10, 25);
      doc.text(`Skill Level: ${testResults.level}`, 10, 30);
      doc.text(`Date: ${testResults.completionDate}`, 10, 35);

      let y = 45;
      testResults.detailedResults.forEach((result, index) => {
        if (y > 280) { // Check if new page is needed
          doc.addPage();
          y = 10;
        }
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${result.question}`, 10, y);
        y += 5;
        doc.text(`Your Answer: ${result.userAnswer}`, 15, y);
        y += 5;
        doc.setTextColor(result.isCorrect ? 0 : 255, result.isCorrect ? 100 : 0, 0); // Green for correct, Red for incorrect
        doc.text(`Correct Answer: ${result.correctAnswer}`, 15, y);
        y += 7;

        if (!result.isCorrect && result.aiExplanation) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100); // Gray for AI explanation
          doc.text(`AI Explanation: ${result.aiExplanation}`, 20, y);
          y += 5;
        }
      });

      doc.save(`${applicantName.replace(/\s+/g, '_')}_Detailed_Results.pdf`);
    }).catch(error => {
      console.error('Error generating results report:', error);
      alert('Failed to generate results report.');
    });
  }

  const restartTest = () => {
    setCurrentScreen("welcome")
    setApplicantName("")
    setCurrentQuestionIndex(0)
    setAnswers({})
    setTimeRemaining(75 * 60)
    setTestStarted(false)
    setTestResults(null)
    setLifelinesRemaining(3)
    setLifelinesUsed(0)
    setShowAiHelpModal(false)
    setAiQuestion("")
    setAiAnswer("")
    setAiLoading(false)
    setAiExplanationQuestionIndex(null)
  }

  const simulateTestCompletion = (mockResults) => {
    setTestResults(mockResults)
    setCurrentScreen('results')
  }

  const handleAiHelp = async (questionText, isLifeline = false, questionIndex = null) => {
    if (!questionText.trim()) return
    setAiLoading(true)
    setAiAnswer("")

    if (isLifeline) {
      setLifelinesRemaining(prev => prev - 1)
      setLifelinesUsed(prev => prev + 1)
    }

    try {
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        setAiAnswer("AI Help is not configured. Please provide an OpenAI API key.");
        setAiLoading(false);
        return;
      }

      let prompt = `The user is taking a power generation technician knowledge test. They asked: "${questionText}".`;
      if (questionIndex !== null) {
        prompt = `The user answered a question incorrectly. The question was: "${questions[questionIndex].question}". The correct answer was: "${questions[questionIndex].correct_answer_letter}. ${questions[questionIndex].options[questions[questionIndex].correct_answer_letter.charCodeAt(0) - 65]}". Explain why the correct answer is correct in a concise and educational manner, without being condescending.`;
      } else {
        prompt = `The user is taking a power generation technician knowledge test. They asked: "${questionText}". The current question they are on is: "${questions[currentQuestionIndex].question}". Provide a concise and helpful explanation (max 150 words) without giving away the direct answer to the current test question. Focus on explaining concepts or providing relevant background information.`;
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
        }),
      });
      const data = await response.json();
      if (response.ok && data.choices && data.choices.length > 0) {
        setAiAnswer(data.choices[0].message.content);
      } else {
        setAiAnswer(data.error ? `Error: ${data.error.message}` : "Failed to get AI help. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching AI help:", error)
      setAiAnswer("Sorry, I could not fetch an answer at this time. Please try again later.")
    } finally {
      setAiLoading(false)
    }
  }

  const useLifeline = () => {
    if (lifelinesRemaining > 0) {
      setShowAiHelpModal(true);
      setAiQuestion("Explain the concept related to this question."); // Default question for lifeline
      handleAiHelp("Explain the concept related to this question.", true);
    } else {
      alert("No lifelines remaining!");
    }
  };

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl card animate-fade-in">
          <CardHeader className="card-header">
            <div className="flex flex-col items-center justify-center mb-4">
              <img src="/src/assets/generator_source_logo.jpg" alt="Generator Source Logo" className="h-20 mb-2" />
              <CardTitle className="card-title-header">
                GENERATOR SOURCE
              </CardTitle>
            </div>
            <h2 className="text-xl font-semibold text-color-text-light">Generator Technician Knowledge Test</h2>
          </CardHeader>
          <CardContent className="card-content space-y-6">
            <div className="instruction-box p-4 rounded-lg border border-color-border bg-color-background-light">
              <h3 className="font-semibold text-color-primary mb-2 text-lg">Test Instructions</h3>
              <ul className="text-sm text-color-text-dark space-y-1">
                <li>• You have 75 minutes to complete {questions.length} questions.</li>
                <li>• Select the best answer for each question.</li>
                <li>• You will receive your results immediately after submission.</li>
                <li>• You have 3 AI Lifelines to help you with questions. Using a lifeline will deduct 1 point from your final score.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium text-color-text-dark">
                Enter your full name:
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="input-field text-lg p-3 border-color-border focus:border-color-primary focus:ring focus:ring-color-secondary focus:ring-opacity-50"
              />
            </div>

            <Button 
              onClick={startTest}
              disabled={!applicantName.trim()}
              className="w-full button button-primary"
            >
              <User className="mr-2 h-5 w-5" />
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Test Screen
  if (currentScreen === 'test') {
    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="test-header mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4 text-color-text-dark">
                <User className="h-5 w-5" />
                <span className="font-medium">{applicantName}</span>
              </div>
              <div className="flex items-center space-x-4 text-color-text-dark">
                <Clock className="h-5 w-5" />
                <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
                <Button
                  onClick={() => setIsPaused(!isPaused)}
                  className="button button-secondary button-sm ml-4"
                >
                  {isPaused ? "Resume" : "Pause"}
                </Button>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center mt-2 text-color-text-light">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>

          {/* Question Card */}
          <Card className="card animate-fade-in">
            <CardHeader className="card-header">
              <CardTitle className="text-center text-3xl font-bold text-color-text-light">
                {currentQuestion.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content space-y-6">
              <p className="text-lg font-medium text-color-text-dark">{currentQuestion.question}</p>
                  <RadioGroup
                    value={answers[currentQuestionIndex] || ''} // Ensure value is empty string if no answer selected
                    onValueChange={handleAnswerChange}
                    className="radio-group-container">
                    {currentQuestion.options.map((option, index) => {
                      const optionLetter = String.fromCharCode(65 + index)
                      const isSelected = answers[currentQuestionIndex] === optionLetter
                      return (
                        <div key={index}>
                          <RadioGroupItem
                            value={optionLetter}
                            id={`option-${optionLetter}`}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={`option-${optionLetter}`}
                            className={`radio-group-item-label ${isSelected ? 'selected' : ''}`}
                          >
                            <span className="option-letter">{optionLetter}</span>
                            <span className="option-text">{option}</span>
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation and Lifeline */}
          <div className="mt-6 flex justify-between items-center">
            <Button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="button button-outline"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={useLifeline}
              disabled={lifelinesRemaining === 0 || aiLoading}
              className="button button-secondary"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              AI Lifeline ({lifelinesRemaining} LEFT)
            </Button>
            <Button
              onClick={currentQuestionIndex === questions.length - 1 ? handleTestSubmit : nextQuestion}
              className="button button-primary"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit Test' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* AI Help Modal */}
        {showAiHelpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md card animate-fade-in">
              <CardHeader className="card-header">
                <CardTitle className="text-center text-2xl font-bold text-color-text-light">AI Help</CardTitle>
              </CardHeader>
              <CardContent className="card-content space-y-4">
                <p className="text-color-text-dark">{aiQuestion}</p>
                <Input
                  type="text"
                  placeholder="Ask AI for a hint or explanation... (e.g., 'Explain Ohm's Law')"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  className="input-field"
                  disabled={aiLoading}
                />
                <Button
                  onClick={() => handleAiHelp(aiQuestion)}
                  disabled={aiLoading || !aiQuestion.trim()}
                  className="w-full button button-primary"
                >
                  {aiLoading ? 'Getting Help...' : 'Get AI Help'}
                </Button>
                {aiAnswer && (
                  <div className="ai-answer-box p-3 rounded-lg bg-color-background-light border border-color-border">
                    <p className="text-sm text-color-text-dark">{aiAnswer}</p>
                  </div>
                )}
                <Button onClick={() => setShowAiHelpModal(false)} className="w-full button button-secondary">
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // Results Screen
  if (currentScreen === 'results') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl card animate-fade-in">
          <CardHeader className="card-header">
            <div className="flex flex-col items-center justify-center mb-4">
              <img src="/src/assets/generator_source_logo.jpg" alt="Generator Source Logo" className="h-20 mb-2" />
              <CardTitle className="card-title-header">
                GENERATOR SOURCE
              </CardTitle>
            </div>
            <h2 className="text-xl font-semibold text-color-text-light">Test Results for {applicantName}</h2>
          </CardHeader>
          <CardContent className="card-content space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-color-text-dark">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-color-primary" />
                <span>Score: {testResults.percentage}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-color-success" />
                <span>Correct Answers: {testResults.correctAnswers} / {testResults.totalQuestions}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-color-secondary" />
                <span>Lifelines Used: {testResults.lifelinesUsed}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-color-text-dark" />
                <span>Skill Level: {testResults.level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-color-text-dark" />
                <span>Date: {testResults.completionDate}</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <Button onClick={generateCertificate} className="button button-primary">
                Download Certificate
              </Button>
              <Button onClick={generateResultsReport} className="button button-secondary">
                Download Report
              </Button>
              <Button onClick={restartTest} className="button button-outline">
                Retake Test
              </Button>
            </div>

            <h3 className="text-xl font-semibold text-color-primary mt-8">Detailed Results</h3>
            <div className="space-y-4">
              {testResults.detailedResults.map((result, index) => (
                <Card key={index} className="card-item p-4 border border-color-border rounded-lg">
                  <p className="font-medium text-color-text-dark">{index + 1}. {result.question}</p>
                  <p className="text-sm text-color-text-dark">Your Answer: <span className={result.isCorrect ? 'text-color-success' : 'text-color-danger'}>{result.userAnswer}</span></p>
                  <p className="text-sm text-color-text-dark">Correct Answer: <span className="text-color-success font-semibold">{result.correctAnswer}</span></p>
                  {!result.isCorrect && (
                    <Button
                      onClick={() => handleAiHelp(questions[index].question, false, index)}
                      className="button button-tertiary button-sm mt-2"
                      disabled={aiLoading}
                    >
                      {aiLoading && aiExplanationQuestionIndex === index ? 'Getting Explanation...' : 'Explain Incorrect Answer'}
                    </Button>
                  )}
                  {aiExplanationQuestionIndex === index && aiAnswer && (
                    <div className="ai-explanation-box p-3 rounded-lg bg-color-background-light border border-color-border mt-2">
                      <p className="text-sm text-color-text-dark">{aiAnswer}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

export default App

