import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { IoHomeOutline, IoArchiveOutline, IoSettingsOutline } from 'react-icons/io5'
import PinModal from './PinModal'

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isPinOpen, setIsPinOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('settingsPinUnlocked') === 'true'
  })

  const handleSettingsClick = () => {
    if (isUnlocked) {
      navigate('/settings')
      return
    }

    setIsPinOpen(true)
  }

  const handlePinSuccess = () => {
    setIsPinOpen(false)
    setIsUnlocked(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('settingsPinUnlocked', 'true')
    }
    navigate('/settings')
  }

  const isSettingsActive = location.pathname.startsWith('/settings')

  return (
    <>
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <IoHomeOutline className="nav-icon" />
            <span className="nav-label">Home</span>
          </NavLink>
          
          <NavLink 
            to="/archivio" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <IoArchiveOutline className="nav-icon" />
            <span className="nav-label">Archivio</span>
          </NavLink>
          
          <button
            type="button"
            className={`nav-item ${isSettingsActive ? 'active' : ''}`}
            onClick={handleSettingsClick}
          >
            <IoSettingsOutline className="nav-icon" />
            <span className="nav-label">Impostazioni</span>
          </button>
        </div>
      </nav>
      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onSuccess={handlePinSuccess}
      />
    </>
  )
}

export default BottomNav
