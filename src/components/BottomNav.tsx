import { NavLink } from 'react-router-dom'
import { IoHomeOutline, IoArchiveOutline, IoSettingsOutline } from 'react-icons/io5'

function BottomNav() {
  return (
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
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <IoSettingsOutline className="nav-icon" />
          <span className="nav-label">Impostazioni</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default BottomNav
