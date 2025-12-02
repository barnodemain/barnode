import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import SplashScreen from './components/SplashScreen'
import Home from './pages/Home'
import Archivio from './pages/Archivio'
import Settings from './pages/Settings'
import ImportText from './pages/ImportText'
import BackupPage from './pages/BackupPage'
import Analysis from './pages/Analysis'

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash')
    return !hasSeenSplash
  })

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true')
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archivio" element={<Archivio />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/import/text" element={<ImportText />} />
        <Route path="/settings/backup" element={<BackupPage />} />
        <Route path="/settings/analysis" element={<Analysis />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default App
