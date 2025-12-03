import React, { Suspense, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import SplashScreen from './components/SplashScreen'
import Settings from './pages/Settings'

const HomePage = React.lazy(() => import('./pages/Home'))
const ArchivioPage = React.lazy(() => import('./pages/Archivio'))
const ImportPage = React.lazy(() => import('./pages/ImportText'))
const BackupPage = React.lazy(() => import('./pages/BackupPage'))
const AnalysisPage = React.lazy(() => import('./pages/Analysis'))

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
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/archivio" element={<ArchivioPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/import/text" element={<ImportPage />} />
          <Route path="/settings/backup" element={<BackupPage />} />
          <Route path="/settings/analysis" element={<AnalysisPage />} />
        </Routes>
      </Suspense>
      <BottomNav />
    </div>
  )
}

export default App
