import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Archivio from './pages/Archivio'
import Settings from './pages/Settings'
import ImportText from './pages/ImportText'
import BackupPage from './pages/BackupPage'

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archivio" element={<Archivio />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/import/text" element={<ImportText />} />
        <Route path="/settings/backup" element={<BackupPage />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default App
