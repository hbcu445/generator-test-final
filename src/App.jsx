import { useState, useEffect } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Clock, User, Award, CheckCircle, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import questionsData from './assets/questions.json'
import TestSimulator from './TestSimulator.jsx'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome') // welcome, test, results
  const [applicantName, setApplicantName] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')
  const [applicantPhone, setApplicantPhone] = useState('')
  const [branch, setBranch] = useState('') // Brighton, Jacksonville, Austin, Pensacola
  const [skillLevel, setSkillLevel] = useState('') // Level 1-4
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
    console.log('startTest called');
    console.log('Name:', applicantName);
    console.log('Email:', applicantEmail);
    console.log('Phone:', applicantPhone);
    console.log('Branch:', branch);
    console.log('Skill Level:', skillLevel);
    if (applicantName.trim() && applicantEmail.trim() && applicantPhone.trim() && branch && skillLevel) {
      console.log('All validation passed, starting test');
      setCurrentScreen('test')
      setTestStarted(true)
    } else {
      console.log('Validation failed');
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

  const handleTestSubmit = async () => {
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
    
    // Determine actual performance level
    let actualLevel = 'Beginner'
    if (percentage >= 90) actualLevel = 'Master'
    else if (percentage >= 75) actualLevel = 'Pro'
    else if (percentage >= 60) actualLevel = 'Advanced'
    else if (percentage >= 40) actualLevel = 'Beginner'
    
    // Compare self-evaluation with actual performance
    const skillLevelMap = { '1': 'Beginner', '2': 'Advanced', '3': 'Pro', '4': 'Master' }
    const selfEvaluation = skillLevelMap[skillLevel]
    let assessment = ''
    
    if (actualLevel === selfEvaluation) {
      assessment = 'Accurate self-assessment'
    } else if ((skillLevel === '4' && actualLevel !== 'Master') || (skillLevel === '3' && !['Master', 'Pro'].includes(actualLevel))) {
      assessment = 'Overestimated skill level'
    } else {
      assessment = 'Underestimated skill level'
    }

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

    const results = {
      correctAnswers,
      totalQuestions: questions.length,
      percentage,
      level: actualLevel,
      selfEvaluation,
      assessment,
      detailedResults
    };
    
    setTestResults(results);
    setCurrentScreen('results');
    setTestStarted(false);
    
    // Submit results to backend for storage and email delivery
    try {
      const response = await fetch('/api/submit-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantName,
          applicantEmail,
          applicantPhone,
          branch,
          skillLevel: selfEvaluation,
          score: correctAnswers,
          totalQuestions: questions.length,
          percentage,
          performanceLevel: actualLevel,
          selfEvaluation,
          assessment,
          detailedResults
        })
      });
      
      if (response.ok) {
        console.log('Test results submitted and emails sent successfully');
      } else {
        console.error('Failed to submit test results');
      }
    } catch (error) {
      console.error('Error submitting test results:', error);
    }
  }

  const generateCertificate = async () => {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default
    
    const certificateHTML = document.createElement('div')
    certificateHTML.style.width = '1000px'
    certificateHTML.style.padding = '60px'
    certificateHTML.style.fontFamily = 'Arial, sans-serif'
    certificateHTML.style.backgroundColor = '#ffffff'
    certificateHTML.innerHTML = `
      <div style="border: 15px solid #1e40af; padding: 40px; text-align: center;">
        <h1 style="color: #1e40af; font-size: 48px; margin-bottom: 20px;">Certificate of Completion</h1>
        <p style="font-size: 24px; margin: 20px 0;">This certifies that</p>
        <h2 style="color: #1e40af; font-size: 36px; margin: 20px 0; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">${applicantName}</h2>
        <p style="font-size: 20px; margin: 20px 0;">has successfully completed the</p>
        <h3 style="color: #1e40af; font-size: 28px; margin: 20px 0;">Generator Technician Knowledge Test</h3>
        <p style="font-size: 18px; margin: 30px 0;">Score: ${testResults.correctAnswers} out of ${testResults.totalQuestions} (${testResults.percentage}%)</p>
        <p style="font-size: 18px; margin: 20px 0;">Skill Level: ${testResults.level}</p>
        <p style="font-size: 16px; margin-top: 40px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
      </div>
    `
    document.body.appendChild(certificateHTML)
    
    const canvas = await html2canvas(certificateHTML)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('landscape', 'mm', 'a4')
    const imgWidth = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`${applicantName.replace(/\s+/g, '_')}_Certificate.pdf`)
    
    document.body.removeChild(certificateHTML)
  }

  const generateResultsReport = async () => {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF()
    
    pdf.setFontSize(20)
    pdf.text('Generator Technician Knowledge Test - Detailed Report', 20, 20)
    
    pdf.setFontSize(12)
    pdf.text(`Applicant: ${applicantName}`, 20, 35)
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42)
    pdf.text(`Score: ${testResults.correctAnswers}/${testResults.totalQuestions} (${testResults.percentage}%)`, 20, 49)
    pdf.text(`Skill Level: ${testResults.level}`, 20, 56)
    
    let yPosition = 70
    pdf.setFontSize(14)
    pdf.text('Question-by-Question Results:', 20, yPosition)
    yPosition += 10
    
    pdf.setFontSize(10)
    testResults.detailedResults.forEach((result, index) => {
      if (yPosition > 270) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.text(`Q${index + 1}: ${result.question.substring(0, 80)}${result.question.length > 80 ? '...' : ''}`, 20, yPosition)
      yPosition += 7
      pdf.text(`Your Answer: ${result.userAnswer}`, 25, yPosition)
      yPosition += 7
      if (!result.isCorrect) {
        pdf.setTextColor(255, 0, 0)
        pdf.text(`Correct Answer: ${result.correctAnswer}`, 25, yPosition)
        pdf.setTextColor(0, 0, 0)
        yPosition += 7
      }
      yPosition += 3
    })
    
    pdf.save(`${applicantName.replace(/\s+/g, '_')}_Test_Report.pdf`)
  }

  const restartTest = () => {
    setCurrentScreen('welcome')
    setApplicantName('')
    setApplicantEmail('')
    setApplicantPhone('')
    setBranch('')
    setSkillLevel('')
    setCurrentQuestionIndex(0)
    setAnswers({})
    setTimeRemaining(75 * 60)
    setTestStarted(false)
    setIsPaused(false)
    setTestResults(null)
  }

  const simulateTestCompletion = () => {
    const simulatedAnswers = {}
    questions.forEach((question, index) => {
      simulatedAnswers[index] = question.correct_answer_letter
    })
    setAnswers(simulatedAnswers)
    handleTestSubmit()
  }

  const currentQuestion = questions[currentQuestionIndex]

  // Header component used across all screens
  const Header = () => (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Generator Source Logo - Upper Left */}
        <div className="flex items-center">
          <img src="/GSBlue180x55.jpg" alt="Generator Source" className="h-14" />
        </div>
        
        {/* Timer and Status - Upper Right (only during test) */}
        {currentScreen === 'test' && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="h-5 w-5" />
              <span className="font-medium">{applicantName}</span>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              {!isPaused && (
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              )}
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-xl font-bold text-blue-900">{formatTime(timeRemaining)}</span>
              <Button
                onClick={() => setIsPaused(!isPaused)}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Footer component used across all screens
  const Footer = () => (
    <div className="fixed bottom-0 right-0 p-4 z-50">
      <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
        <span className="text-[10px] text-gray-400">© Created with DaVinci.AI</span>
      </div>
    </div>
  )

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <Header />
        <div className="pt-24 pb-20 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-2xl border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-8">
                <CardTitle className="text-4xl font-bold text-center">
                  Generator Technician Knowledge Test
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">Test Purpose</h3>
                  <p className="text-gray-700 mb-4 italic">This assessment is designed to establish and verify your knowledge and expertise as a generator technician.</p>
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Test Instructions</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>You have <strong>75 minutes</strong> to complete <strong>100 questions</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Select the best answer for each question</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>You will receive your results immediately after submission</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-lg font-semibold text-gray-900">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="h-14 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-lg mt-2 px-4"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-lg font-semibold text-gray-900">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="h-14 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-lg mt-2 px-4"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-lg font-semibold text-gray-900">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="h-14 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-lg mt-2 px-4"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900">
                    Select Your Branch *
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setBranch('Brighton, CO')}
                      style={{
                        backgroundColor: branch === 'Brighton, CO' ? '#f0fdf4' : 'white',
                        borderColor: branch === 'Brighton, CO' ? '#16a34a' : '#d1d5db',
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}
                      className="p-4 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="font-bold text-lg text-blue-900">Brighton, CO</div>
                      <div className="text-sm text-gray-600">Colorado Branch</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranch('Jacksonville, FL')}
                      style={{
                        backgroundColor: branch === 'Jacksonville, FL' ? '#f0fdf4' : 'white',
                        borderColor: branch === 'Jacksonville, FL' ? '#16a34a' : '#d1d5db',
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}
                      className="p-4 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="font-bold text-lg text-blue-900">Jacksonville, FL</div>
                      <div className="text-sm text-gray-600">Florida Branch</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranch('Austin, TX')}
                      style={{
                        backgroundColor: branch === 'Austin, TX' ? '#f0fdf4' : 'white',
                        borderColor: branch === 'Austin, TX' ? '#16a34a' : '#d1d5db',
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}
                      className="p-4 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="font-bold text-lg text-blue-900">Austin, TX</div>
                      <div className="text-sm text-gray-600">Texas Branch</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranch('Pensacola, FL')}
                      style={{
                        backgroundColor: branch === 'Pensacola, FL' ? '#f0fdf4' : 'white',
                        borderColor: branch === 'Pensacola, FL' ? '#16a34a' : '#d1d5db',
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}
                      className="p-4 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="font-bold text-lg text-blue-900">Pensacola, FL</div>
                      <div className="text-sm text-gray-600">Florida Branch</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900">
                    Select Your Skill Level
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSkillLevel('1')}
                      style={{
                        backgroundColor: skillLevel === '1' ? '#f0fdf4' : 'white',
                        borderColor: skillLevel === '1' ? '#16a34a' : '#d1d5db',
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}
                      className="p-4 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="font-bold text-lg text-blue-900">Level 1</div>
                      <div className="text-sm text-gray-600">Beginner</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkillLevel('2')}
                      style={{
                        backgroundColor: skillLevel === '2' ? '#f0fdf4' : 'white',
                        borderColor: skillLevel === '2' ? '#16a34a' : '#d1d5db',
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}
                      className="p-4 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="font-bold text-lg text-blue-900">Level 2</div>
                      <div className="text-sm text-gray-600">Advanced</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkillLevel('3')}
                      style={{
                        backgroundColor: skillLevel === '3' ? '#f0fdf4' : 'white',
                        borderColor: skillLevel === '3' ? '#16a34a' : '#d1d5db',
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}
                      className="p-4 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="font-bold text-lg text-blue-900">Level 3</div>
                      <div className="text-sm text-gray-600">Pro</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkillLevel('4')}
                      style={{
                        backgroundColor: skillLevel === '4' ? '#f0fdf4' : 'white',
                        borderColor: skillLevel === '4' ? '#16a34a' : '#d1d5db',
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}
                      className="p-4 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="font-bold text-lg text-blue-900">Level 4</div>
                      <div className="text-sm text-gray-600">Master</div>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={startTest}
                  disabled={!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim() || !branch || !skillLevel}
                  className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                >
                  <Play className="mr-3 h-6 w-6" />
                  Begin Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
        <SpeedInsights />
      </div>
    )
  }

  // Test Screen
  if (currentScreen === 'test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <Header />
        <div className="pt-28 pb-24 px-8">
          <div className="max-w-5xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-3" />
            </div>

            {/* Question Card */}
            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold">
                    {currentQuestion.category}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Question Text */}
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-600">
                  <p className="text-2xl font-medium text-gray-900 leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Answer Options */}
                <RadioGroup
                  value={answers[currentQuestionIndex] || ''}
                  onValueChange={handleAnswerChange}
                  className="space-y-4"
                >
                  {['A', 'B', 'C', 'D'].map((letter) => (
                    <div
                      key={letter}
                      className={`relative flex items-center space-x-4 p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                        answers[currentQuestionIndex] === letter
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                          : 'bg-white border-gray-300 hover:border-blue-400'
                      }`}
                      onClick={() => handleAnswerChange(letter)}
                    >
                      <RadioGroupItem
                        value={letter}
                        id={`option-${letter}`}
                        className="sr-only"
                      />
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold flex-shrink-0 ${
                          answers[currentQuestionIndex] === letter
                            ? 'bg-white text-blue-600'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {letter}
                      </div>
                      <label
                        htmlFor={`option-${letter}`}
                        className={`flex-1 text-xl cursor-pointer ${
                          answers[currentQuestionIndex] === letter
                            ? 'text-white font-semibold'
                            : 'text-gray-900'
                        }`}
                      >
                        {currentQuestion.options[letter.charCodeAt(0) - 65]}
                      </label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="flex-1 h-14 text-lg font-semibold border-2"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Previous
                  </Button>
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleTestSubmit}
                      className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      Submit Test
                      <CheckCircle className="ml-2 h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={nextQuestion}
                      className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      Next
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
        <TestSimulator onSimulate={simulateTestCompletion} />
        <SpeedInsights />
      </div>
    )
  }

  // Results Screen (keeping existing results screen for now)
  if (currentScreen === 'results' && testResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <Header />
        <div className="pt-24 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-8">
                <CardTitle className="text-4xl font-bold text-center">Test Results</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-2xl">
                    <User className="h-8 w-8" />
                    <span className="font-semibold">{applicantName}</span>
                  </div>
                  <div className="text-6xl font-bold text-blue-600">
                    {testResults.percentage}%
                  </div>
                  <p className="text-2xl text-gray-700">
                    {testResults.correctAnswers} out of {testResults.totalQuestions} correct
                  </p>
                  <div className="inline-block px-6 py-3 bg-blue-100 rounded-full">
                    <span className="text-xl font-semibold text-blue-900">
                      Performance Level: {testResults.level}
                    </span>
                  </div>
                </div>

                {/* Self-Evaluation Comparison */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mt-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4 text-center">Self-Assessment Analysis</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">Your Self-Evaluation</div>
                      <div className="text-3xl font-bold text-blue-700">{testResults.selfEvaluation}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">Actual Performance</div>
                      <div className="text-3xl font-bold text-green-700">{testResults.level}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className={`inline-block px-6 py-3 rounded-full font-semibold text-lg ${
                      testResults.assessment === 'Accurate self-assessment'
                        ? 'bg-green-100 text-green-800'
                        : testResults.assessment === 'Overestimated skill level'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {testResults.assessment}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-8">
                  <h3 className="text-2xl font-bold text-gray-900">Detailed Results</h3>
                  {testResults.detailedResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        result.isCorrect
                          ? 'bg-green-50 border-green-300'
                          : 'bg-red-50 border-red-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                            result.isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">{result.question}</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              <span className="font-semibold">Your Answer:</span> {result.userAnswer}
                            </p>
                            {!result.isCorrect && (
                              <p className="text-gray-700">
                                <span className="font-semibold">Correct Answer:</span> {result.correctAnswer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button onClick={generateCertificate} className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700">
                    <Award className="mr-2 h-5 w-5" />
                    Download Certificate
                  </Button>
                  <Button onClick={generateResultsReport} className="flex-1 h-14 text-lg font-semibold" variant="outline">
                    Download Detailed Report
                  </Button>
                  <Button onClick={restartTest} variant="outline" className="flex-1 h-14 text-lg font-semibold">
                    Take Test Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
        <TestSimulator onSimulate={simulateTestCompletion} />
        <SpeedInsights />
      </div>
    )
  }
}

export default App
