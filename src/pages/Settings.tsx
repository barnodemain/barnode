import { useNavigate } from 'react-router-dom'
import { IoDocumentTextOutline, IoCopyOutline, IoAnalyticsOutline, IoShareOutline } from 'react-icons/io5'
import { useArticoli } from '../hooks/useArticoli'

function Settings() {
  const navigate = useNavigate()
  const { articoli, loading } = useArticoli()

  const handleExport = () => {
    if (typeof window === 'undefined') return

    const lines = articoli
      .map((a) => a.nome?.trim())
      .filter((nome): nome is string => Boolean(nome && nome.length > 0))

    const content = lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'barnode-articoli.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

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

          <button
            className="settings-big-button settings-big-button-tertiary"
            onClick={() => navigate('/settings/analysis')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <IoAnalyticsOutline size={32} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>ANALYSIS</span>
            </span>
          </button>

          <button
            className="settings-big-button settings-big-button-export"
            type="button"
            onClick={handleExport}
            disabled={loading}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <IoShareOutline size={32} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>ESPORTA ARTICOLI</span>
            </span>
          </button>

          <button
            className="settings-big-button settings-big-button-notes"
            type="button"
            onClick={() => navigate('/settings/notes')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <IoDocumentTextOutline size={32} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>NOTE</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
