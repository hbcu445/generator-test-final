
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
  const [testResults, setTestResults] = useState(null)
  const [showAiHelp, setShowAiHelp] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Filter and prepare questions
  const questions = questionsData.filter(q => q.question && q.options && q.options.length > 0)

  // Timer effect
  useEffect(() => {
    if (testStarted && timeRemaining > 0 && currentScreen === 'test') {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && currentScreen === 'test') {
      handleTestSubmit()
    }
  }, [testStarted, timeRemaining, currentScreen])

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
      // Assuming correct_answer_letter is 'A', 'B', 'C', 'D'
      // And options are 'A- ...', 'B- ...'
      const correctOptionPrefix = question.correct_answer_letter + '-'
      const isCorrect = userAnswer && userAnswer === question.correct_answer_letter
      if (isCorrect) {
        correctAnswers++
      }
    })

    const percentage = Math.round((correctAnswers / questions.length) * 100)
    let level = 'Beginner'
    if (percentage >= 80) level = 'Advanced'
    else if (percentage >= 60) level = 'Intermediate'

    setTestResults({
      correctAnswers,
      totalQuestions: questions.length,
      percentage,
      level,
      completionDate: new Date().toLocaleDateString()
    })
    setCurrentScreen('results')
  }

  const generateCertificate = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      // Set up the certificate design
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      
      // Background border
      doc.setDrawColor(0, 51, 102)
      doc.setLineWidth(3)
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
      
      // Inner border
      doc.setLineWidth(1)
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

      // Title
      doc.setFontSize(28)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 51, 102)
      doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 40, { align: 'center' })

      // Subtitle
      doc.setFontSize(18)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text('Generator Technician Knowledge Test', pageWidth / 2, 55, { align: 'center' })
      doc.text('Tès Konesans Teknisyen Jeneratè', pageWidth / 2, 65, { align: 'center' })

      // Certificate text
      doc.setFontSize(14)
      doc.text('This certifies that / Sa a sètifye ke', pageWidth / 2, 85, { align: 'center' })

      // Applicant name
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 102, 51)
      doc.text(applicantName, pageWidth / 2, 105, { align: 'center' })

      // Achievement text
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text('has successfully completed the Generator Technician Knowledge Test', pageWidth / 2, 125, { align: 'center' })
      doc.text('te fini ak siksè tès konesans teknisyen jeneratè a', pageWidth / 2, 135, { align: 'center' })

      // Score details
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 51, 102)
      doc.text(`Score: ${testResults.percentage}% (${testResults.correctAnswers} of ${testResults.totalQuestions} questions correct)`, pageWidth / 2, 155, { align: 'center' })
      doc.text(`Skill Level: ${testResults.level}`, pageWidth / 2, 170, { align: 'center' })

      // Date and location
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(`Date: ${testResults.completionDate}`, 30, pageHeight - 30)
      doc.text('Location: Jacksonville', pageWidth - 80, pageHeight - 30)

      // Signature line
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.5)
      doc.line(pageWidth - 80, pageHeight - 50, pageWidth - 30, pageHeight - 50)
      doc.text('Authorized Signature', pageWidth - 80, pageHeight - 45)

      // Save the PDF
      doc.save(`${applicantName.replace(/\s+/g, '_')}_Generator_Technician_Certificate.pdf`)
    }).catch(error => {
      console.error('Error generating certificate:', error)
      // Fallback to text certificate
      const certificateContent = `
CERTIFICATE OF COMPLETION

Generator Technician Knowledge Test

This certifies that ${applicantName} has successfully completed the Generator Technician Knowledge Test
with a score of ${testResults.percentage}% (${testResults.correctAnswers} of ${testResults.totalQuestions} questions correct)

Skill Level: ${testResults.level}
Date: ${testResults.completionDate}
Location: Jacksonville
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

  const restartTest = () => {
    setCurrentScreen('welcome')
    setApplicantName('')
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

  const handleAiHelp = async () => {
    if (!aiQuestion.trim()) return
    setAiLoading(true)
    setAiAnswer('')

    try {
      const response = await fetch('/api/ai-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: aiQuestion, currentQuestion: questions[currentQuestionIndex].question }),
      })
      const data = await response.json()
      setAiAnswer(data.answer)
    } catch (error) {
      console.error('Error fetching AI help:', error)
      setAiAnswer('Sorry, I could not fetch an answer at this time. Please try again later.')
    } finally {
      setAiLoading(false)
    }
  }

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
              Generator Technician Knowledge Test
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Bienvini nan tès konesans teknisyen jeneratè a
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Test Instructions / Enstriksyon Tès</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You have 75 minutes to complete {questions.length} questions</li>
                <li>• Ou gen 75 minit pou reponn {questions.length} kesyon</li>
                <li>• Select the best answer for each question</li>
                <li>• Chwazi pi bon repons lan pou chak kesyon</li>
                <li>• You will receive your results immediately</li>
                <li>• W ap resevwa rezilta yo imedyatman</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium">
                Enter your full name / Antre non konple ou:
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name / Non konple ou"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="text-lg p-3"
              />
            </div>

            <Button 
              onClick={startTest}
              disabled={!applicantName.trim()}
              className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700"
            >
              <User className="mr-2 h-5 w-5" />
              Start Test / Kòmanse Tès
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <User className="h-5 w-5 text-gray-600" />
                <span className="font-medium">{applicantName}</span>
              </div>
              <div className="flex items-center space-x-2 text-lg font-mono">
                <Clock className="h-5 w-5 text-red-500" />
                <span className={timeRemaining < 300 ? 'text-red-500' : 'text-gray-700'}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="text-sm text-blue-600 font-medium mb-2">
                {currentQuestion.category}
              </div>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQuestionIndex] || ''}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                      <RadioGroupItem value={optionLetter} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                        <span className="font-medium text-blue-600 mr-2">{optionLetter}.</span>
                        {option}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation and Submit */}
          <div className="flex justify-between items-center">
            <Button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="px-6"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowAiHelp(true)}
                variant="ghost"
                className="px-4 text-blue-600 hover:text-blue-800"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                AI Help
              </Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleTestSubmit}
                  className="px-8 bg-green-600 hover:bg-green-700"
                >
                  Submit Test
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  className="px-6"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* AI Help Modal */}
          {showAiHelp && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5" /> AI Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">Ask a question related to the current topic. Do not ask for direct answers.</p>
                  <Input
                    placeholder="Your question..."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                  />
                  <Button onClick={handleAiHelp} disabled={aiLoading || !aiQuestion.trim()} className="w-full">
                    {aiLoading ? 'Getting Answer...' : 'Get Answer'}
                  </Button>
                  {aiAnswer && (
                    <div className="bg-gray-100 p-3 rounded-md text-sm">
                      <p className="font-semibold">AI Response:</p>
                      <p>{aiAnswer}</p>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => setShowAiHelp(false)} className="w-full">
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Test Simulator for Demo */}
          <TestSimulator onComplete={simulateTestCompletion} />
        </div>
      </div>
    )
  }

  // Results Screen
  if (currentScreen === 'results') {
    const passed = testResults.percentage >= 70

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {passed ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <Award className="h-16 w-16 text-orange-500" />
              )}
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Test Completed'}
            </CardTitle>
            <p className="text-xl text-gray-600">
              {passed ? 'Felisitasyon!' : 'Tès la fini'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-center mb-4">
                Generator Technician Knowledge Test Results
              </h3>
              
              <div className="space-y-3 text-center">
                <p className="text-lg">
                  <span className="font-medium">{applicantName}</span>
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {testResults.correctAnswers} of {testResults.totalQuestions} Questions Correct
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {testResults.percentage}%
                </p>
                <p className="text-lg">
                  Skill Level: <span className="font-semibold text-purple-600">{testResults.level}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Completed on {testResults.completionDate}
                </p>
                <p className="text-sm text-gray-600">
                  Jacksonville
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={generateCertificate}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Award className="mr-2 h-4 w-4" />
                Download Certificate
              </Button>
              <Button
                onClick={restartTest}
                variant="outline"
                className="flex-1"
              >
                Take Test Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

export default App

