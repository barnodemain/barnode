import { useNavigate } from 'react-router-dom'
import { IoDocumentTextOutline, IoCopyOutline } from 'react-icons/io5'

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
          <button
            className="settings-big-button settings-big-button-primary"
            onClick={() => navigate('/settings/import/text')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <IoDocumentTextOutline size={32} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>IMPORTA</span>
            </span>
          </button>

          <button
            className="settings-big-button settings-big-button-secondary"
            onClick={() => navigate('/settings/backup')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <IoCopyOutline size={32} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>BACKUP</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
