import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

// Test simulator component to quickly demonstrate the results screen
function TestSimulator({ onComplete }) {
  const [isSimulating, setIsSimulating] = useState(false)

  const simulateTest = () => {
    setIsSimulating(true)
    
    // Simulate answering questions quickly
    setTimeout(() => {
      const mockResults = {
        correctAnswers: 58,
        totalQuestions: 77,
        percentage: 75,
        level: 'Intermediate',
        completionDate: new Date().toLocaleDateString()
      }
      
      onComplete(mockResults)
      setIsSimulating(false)
    }, 2000)
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={simulateTest}
        disabled={isSimulating}
        variant="outline"
        className="bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200"
      >
        {isSimulating ? 'Simulating...' : 'Quick Demo'}
      </Button>
    </div>
  )
}

export default TestSimulator
