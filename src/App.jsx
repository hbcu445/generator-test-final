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
          <img src="/GSBlue180x55.jpg" alt="Generator Source" className="h-18" style={{height: '70px'}} />
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
    <div style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.95)', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
        <img 
          src="/DaVinciFinalLogo.PNG" 
          alt="DaVinci.AI Logo" 
          style={{width: '60px', height: 'auto', maxWidth: '60px', display: 'block'}}
        />
        <span style={{fontSize: '10px', color: '#666', fontWeight: '500'}}>© Created with DaVinci.AI</span>
      </div>
    </div>
  )

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-24 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white py-12">
                <CardTitle className="text-3xl font-bold text-center" style={{fontSize: '1.75rem', lineHeight: '1.3'}}>
                  Generator Technician Knowledge Test
                </CardTitle>
              </CardHeader>
              <CardContent className="p-12 space-y-10">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-8 rounded-xl">
                  <h3 className="text-2xl font-bold text-indigo-900 mb-4">Test Purpose</h3>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">This assessment is designed to establish and verify your knowledge and expertise as a generator technician.</p>
                  <h3 className="text-2xl font-bold text-indigo-900 mb-5">Test Instructions</h3>
                  <ul className="space-y-4 text-gray-700 text-lg">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                      <span>You have <strong className="text-indigo-900">75 minutes</strong> to complete <strong className="text-indigo-900">100 questions</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                      <span>Select the best answer for each question</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                      <span>You will receive your results immediately after submission</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-8">
                  <div>
                    <Label htmlFor="name" className="text-base font-semibold text-gray-900 mb-2 block">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="rounded-xl border-2 border-blue-700"
                      style={{fontSize: '1rem', padding: '0.6rem 0.9rem', backgroundColor: '#dbeafe', height: '45px'}}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-base font-semibold text-gray-900 mb-2 block">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="rounded-xl border-2 border-blue-700"
                      style={{fontSize: '1rem', padding: '0.6rem 0.9rem', backgroundColor: '#dbeafe', height: '45px'}}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-base font-semibold text-gray-900 mb-2 block">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="rounded-xl border-2 border-blue-700"
                      style={{fontSize: '1rem', padding: '0.6rem 0.9rem', backgroundColor: '#dbeafe', height: '45px'}}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex gap-4 justify-center">
                    <button
                      type="button"
                      onClick={() => setBranch('Brighton, CO')}
                      className="rounded-2xl text-center transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                      style={{
                        width: '170px',
                        height: '75px',
                        backgroundColor: branch === 'Brighton, CO' ? '#1e40af' : '#fef08a',
                        borderColor: '#1e40af',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        padding: '1.25rem'
                      }}
                    >
                      <div className="font-bold text-xl" style={{color: branch === 'Brighton, CO' ? 'white' : '#312e81'}}>Brighton, CO</div>
                      <div className="text-base mt-1" style={{color: branch === 'Brighton, CO' ? '#e5e7eb' : '#4b5563'}}>Colorado Branch</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranch('Jacksonville, FL')}
                      className="rounded-2xl text-center transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                      style={{
                        width: '170px',
                        height: '75px',
                        backgroundColor: branch === 'Jacksonville, FL' ? '#1e40af' : '#fef08a',
                        borderColor: '#1e40af',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        padding: '1.25rem'
                      }}
                    >
                      <div className="font-bold text-xl" style={{color: branch === 'Jacksonville, FL' ? 'white' : '#312e81'}}>Jacksonville, FL</div>
                      <div className="text-base mt-1" style={{color: branch === 'Jacksonville, FL' ? '#e5e7eb' : '#4b5563'}}>Florida Branch</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranch('Austin, TX')}
                      className="rounded-2xl text-center transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                      style={{
                        width: '170px',
                        height: '75px',
                        backgroundColor: branch === 'Austin, TX' ? '#1e40af' : '#fef08a',
                        borderColor: '#1e40af',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        padding: '1.25rem'
                      }}
                    >
                      <div className="font-bold text-xl" style={{color: branch === 'Austin, TX' ? 'white' : '#312e81'}}>Austin, TX</div>
                      <div className="text-base mt-1" style={{color: branch === 'Austin, TX' ? '#e5e7eb' : '#4b5563'}}>Texas Branch</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranch('Pensacola, FL')}
                      className="rounded-2xl text-center transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                      style={{
                        width: '170px',
                        height: '75px',
                        backgroundColor: branch === 'Pensacola, FL' ? '#1e40af' : '#fef08a',
                        borderColor: '#1e40af',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        padding: '1.25rem'
                      }}
                    >
                      <div className="font-bold text-xl" style={{color: branch === 'Pensacola, FL' ? 'white' : '#312e81'}}>Pensacola, FL</div>
                      <div className="text-base mt-1" style={{color: branch === 'Pensacola, FL' ? '#e5e7eb' : '#4b5563'}}>Florida Branch</div>
                    </button>
                  </div>
                </div>

                <div style={{marginTop: '2.5rem'}}>
                  <div className="flex gap-4 items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setSkillLevel('1')}
                      className="rounded-2xl text-center transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                      style={{
                        width: '170px',
                        height: '75px',
                        backgroundColor: skillLevel === '1' ? '#fef08a' : '#1e3a8a',
                        borderColor: '#fef08a',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        padding: '1.25rem'
                      }}
                    >
                      <div className="font-bold text-xl" style={{color: skillLevel === '1' ? '#312e81' : 'white'}}>Level 1</div>
                      <div className="text-base mt-1" style={{color: skillLevel === '1' ? '#4b5563' : '#e5e7eb'}}>Beginner</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkillLevel('2')}
                      className="rounded-2xl text-center transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                      style={{
                        width: '170px',
                        height: '75px',
                        backgroundColor: skillLevel === '2' ? '#fef08a' : '#1e3a8a',
                        borderColor: '#fef08a',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        padding: '1.25rem'
                      }}
                    >
                      <div className="font-bold text-xl" style={{color: skillLevel === '2' ? '#312e81' : 'white'}}>Level 2</div>
                      <div className="text-base mt-1" style={{color: skillLevel === '2' ? '#4b5563' : '#e5e7eb'}}>Advanced</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkillLevel('3')}
                      className="rounded-2xl text-center transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                      style={{
                        width: '170px',
                        height: '75px',
                        backgroundColor: skillLevel === '3' ? '#fef08a' : '#1e3a8a',
                        borderColor: '#fef08a',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        padding: '1.25rem'
                      }}
                    >
                      <div className="font-bold text-xl" style={{color: skillLevel === '3' ? '#312e81' : 'white'}}>Level 3</div>
                      <div className="text-base mt-1" style={{color: skillLevel === '3' ? '#4b5563' : '#e5e7eb'}}>Pro</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkillLevel('4')}
                      className="rounded-2xl text-center transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                      style={{
                        width: '170px',
                        height: '75px',
                        backgroundColor: skillLevel === '4' ? '#fef08a' : '#1e3a8a',
                        borderColor: '#fef08a',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        padding: '1.25rem'
                      }}
                    >
                      <div className="font-bold text-xl" style={{color: skillLevel === '4' ? '#312e81' : 'white'}}>Level 4</div>
                      <div className="text-base mt-1" style={{color: skillLevel === '4' ? '#4b5563' : '#e5e7eb'}}>Master</div>
                    </button>
                    <Button
                      type="button"
                      onClick={startTest}
                      disabled={!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim() || !branch || !skillLevel}
                      style={{
                        backgroundColor: '#22c55e',
                        borderColor: '#166534',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        color: 'white',
                        width: '104px',
                        height: '104px',
                        borderRadius: '50%',
                        marginLeft: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        padding: '0'
                      }}
                      className="text-sm font-bold transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:scale-110"
                    >
                      <Play style={{width: '24px', height: '24px', marginBottom: '4px'}} />
                      <span>Begin Test</span>
                    </Button>
                  </div>
                </div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8 bg-white p-6 rounded-2xl shadow-xl border-0">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <span className="text-lg font-bold text-gray-900">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-4" />
            </div>

            {/* Question Card */}
            <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white py-8">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    {currentQuestion.category}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {/* Question Text */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border-l-4 border-indigo-500">
                  <p className="text-2xl font-semibold text-gray-900 leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Answer Options */}
                <RadioGroup
                  value={answers[currentQuestionIndex] || ''}
                  onValueChange={handleAnswerChange}
                  className="space-y-5"
                >
                  {['A', 'B', 'C', 'D'].map((letter) => (
                    <div
                      key={letter}
                      className={`relative flex items-center space-x-5 p-7 rounded-2xl border-3 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-[1.02] ${
                        answers[currentQuestionIndex] === letter
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-600 text-white shadow-2xl shadow-indigo-500/50'
                          : 'bg-white border-gray-300 hover:border-indigo-400'
                      }`}
                      onClick={() => handleAnswerChange(letter)}
                    >
                      <RadioGroupItem
                        value={letter}
                        id={`option-${letter}`}
                        className="sr-only"
                      />
                      <div
                        className={`flex items-center justify-center w-14 h-14 rounded-full text-2xl font-bold flex-shrink-0 ${
                          answers[currentQuestionIndex] === letter
                            ? 'bg-white text-indigo-600'
                            : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                        }`}
                      >
                        {letter}
                      </div>
                      <label
                        htmlFor={`option-${letter}`}
                        className={`flex-1 text-xl cursor-pointer leading-relaxed ${
                          answers[currentQuestionIndex] === letter
                            ? 'text-white font-bold'
                            : 'text-gray-900 font-medium'
                        }`}
                      >
                        {currentQuestion.options[letter.charCodeAt(0) - 65]}
                      </label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Navigation Buttons */}
                <div className="flex gap-6 pt-8 border-t-2 border-gray-200">
                  <Button
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="flex-1 h-16 text-xl font-bold border-3 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl transition-all duration-300"
                  >
                    <ChevronLeft className="mr-3 h-6 w-6" />
                    Previous
                  </Button>
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleTestSubmit}
                      className="flex-1 h-16 text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl shadow-xl hover:shadow-teal-500/50 transition-all duration-300"
                    >
                      Submit Test
                      <CheckCircle className="ml-3 h-6 w-6" />
                    </Button>
                  ) : (
                    <Button
                      onClick={nextQuestion}
                      className="flex-1 h-16 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-xl hover:shadow-indigo-500/50 transition-all duration-300"
                    >
                      Next
                      <ChevronRight className="ml-3 h-6 w-6" />
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
