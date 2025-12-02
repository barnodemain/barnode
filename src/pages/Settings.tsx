import { useNavigate } from 'react-router-dom'
import { IoChevronForward, IoDocumentTextOutline } from 'react-icons/io5'

function Settings() {
  const navigate = useNavigate()

  return (
    <div className="page-wrapper">
      <div className="page-header-fixed">
        <div className="page-header">
          <img src="/logo.png" alt="BARnode" className="logo" />
          <h1 className="page-title">Impostazioni</h1>
        </div>
      </div>

      <div className="page-content-scrollable">
        <button 
          className="settings-button"
          onClick={() => navigate('/settings/import/text')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IoDocumentTextOutline size={22} />
            Importa da testo
          </span>
          <IoChevronForward size={20} style={{ opacity: 0.5 }} />
        </button>
      </div>
    </div>
  )
}

export default Settings
