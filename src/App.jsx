import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Clock, User, Award, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [isPaused, setIsPaused] = useState(false)
  const [testResults, setTestResults] = useState(null)

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

    const percentage = Math.round((correctAnswers / questions.length) * 100)
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
        isCorrect: isCorrect
      }
    })

    setTestResults({
      correctAnswers,
      totalQuestions: questions.length,
      percentage,
      level,
      completionDate: new Date().toLocaleDateString(),
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
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${result.question}`, 10, y);
        y += 5;
        doc.text(`Your Answer: ${result.userAnswer}`, 15, y);
        y += 5;
        doc.setTextColor(result.isCorrect ? 0 : 255, result.isCorrect ? 100 : 0, 0);
        doc.text(`Correct Answer: ${result.correctAnswer}`, 15, y);
        y += 7;
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
  }

  const simulateTestCompletion = (mockResults) => {
    setTestResults(mockResults)
    setCurrentScreen('results')
  }

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl card animate-fade-in">
          <CardHeader className="card-header">
            <div className="flex flex-col items-center justify-center mb-4">
              <img src="/src/assets/generator_source_logo.jpg" alt="Generator Source Logo" className="h-20 mb-2" />
              <CardTitle className="card-title-header">
                GENERATOR SOURCE
              </CardTitle>
            </div>
            <h2 className="text-2xl font-semibold text-color-text-light">Generator Technician Knowledge Test</h2>
          </CardHeader>
          <CardContent className="card-content space-y-6">
            <div className="instruction-box p-6 rounded-lg border border-color-border bg-color-background-light">
              <h3 className="font-semibold text-color-primary mb-3 text-xl">Test Instructions</h3>
              <ul className="text-base text-color-text-dark space-y-2">
                <li>• You have 75 minutes to complete {questions.length} questions.</li>
                <li>• Select the best answer for each question.</li>
                <li>• You will receive your results immediately after submission.</li>
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
              className="w-full button button-primary text-lg py-6"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="test-header mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4 text-color-text-dark text-lg">
                <User className="h-6 w-6" />
                <span className="font-medium">{applicantName}</span>
              </div>
              <div className="flex items-center space-x-4 text-color-text-dark text-lg">
                <Clock className="h-6 w-6" />
                <span className="font-mono font-medium text-xl">{formatTime(timeRemaining)}</span>
                <Button
                  onClick={() => setIsPaused(!isPaused)}
                  className="button button-secondary button-sm ml-4"
                >
                  {isPaused ? "Resume" : "Pause"}
                </Button>
              </div>
            </div>
            <Progress value={progress} className="w-full h-3" />
            <p className="text-base text-center mt-3 text-color-text-light font-medium">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>

          {/* Question Card */}
          <Card className="card animate-fade-in shadow-lg">
            <CardHeader className="card-header py-6">
              <CardTitle className="text-center text-2xl font-bold text-color-text-light uppercase tracking-wide">
                {currentQuestion.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content space-y-8 p-8">
              <p className="text-2xl font-medium text-color-text-dark leading-relaxed">{currentQuestion.question}</p>
              <RadioGroup
                value={answers[currentQuestionIndex] || ''}
                onValueChange={handleAnswerChange}
                className="radio-group-container space-y-4">
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
                        className={`radio-group-item-label cursor-pointer ${isSelected ? 'selected' : ''}`}
                      >
                        <span className="option-letter text-2xl font-bold">{optionLetter}</span>
                        <span className="option-text text-xl">{option}</span>
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center gap-4">
            <Button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="button button-outline text-lg py-6 px-8"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>
            <Button
              onClick={currentQuestionIndex === questions.length - 1 ? handleTestSubmit : nextQuestion}
              className="button button-primary text-lg py-6 px-8"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit Test' : 'Next'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Results Screen
  if (currentScreen === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="card animate-fade-in">
            <CardHeader className="card-header">
              <CardTitle className="text-center text-3xl font-bold text-color-text-light flex items-center justify-center">
                <Award className="mr-3 h-8 w-8" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-semibold text-color-text-dark">Congratulations, {applicantName}!</h3>
                <div className="flex justify-center items-center space-x-8">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-color-primary">{testResults.percentage}%</p>
                    <p className="text-sm text-color-text-light">Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-color-secondary">{testResults.correctAnswers}/{testResults.totalQuestions}</p>
                    <p className="text-sm text-color-text-light">Correct Answers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-color-accent">{testResults.level}</p>
                    <p className="text-sm text-color-text-light">Skill Level</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-color-border pt-6">
                <h4 className="text-xl font-semibold mb-4 text-color-text-dark">Detailed Results</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testResults.detailedResults.map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-start">
                        <CheckCircle className={`h-5 w-5 mr-2 mt-1 ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`} />
                        <div className="flex-1">
                          <p className="font-medium text-color-text-dark">{index + 1}. {result.question}</p>
                          <p className="text-sm text-color-text-light mt-1">Your Answer: {result.userAnswer}</p>
                          {!result.isCorrect && (
                            <p className="text-sm text-green-700 mt-1">Correct Answer: {result.correctAnswer}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={generateCertificate} className="flex-1 button button-primary">
                  <Award className="mr-2 h-5 w-5" />
                  Download Certificate
                </Button>
                <Button onClick={generateResultsReport} className="flex-1 button button-secondary">
                  Download Detailed Report
                </Button>
                <Button onClick={restartTest} variant="outline" className="flex-1 button button-outline">
                  Take Test Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <TestSimulator onSimulate={simulateTestCompletion} />
      </div>
    )
  }
}

export default App
