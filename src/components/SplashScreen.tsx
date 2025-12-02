import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src="/logo.png" alt="BARnode" className="splash-logo" />
        <p className="splash-credit">by DERO</p>
      </div>
    </div>
  )
}

export default SplashScreen
