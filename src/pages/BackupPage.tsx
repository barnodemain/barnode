import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import ConfirmationDialog from '../components/ConfirmationDialog'

function BackupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleRestore = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmRestore = async () => {
    setShowConfirmDialog(false)

    if (!isSupabaseConfigured() || !supabase) {
      setMessage({ type: 'error', text: 'Supabase non configurato' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.rpc('restore_last_backup')

      if (error) throw error

      setMessage({ type: 'success', text: 'Backup ripristinato con successo' })

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch {
      setMessage({
        type: 'error',
        text: 'Ripristino del backup fallito. Riprova più tardi.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-header-fixed">
        <div className="page-header">
          <img src="/logo.png" alt="BARnode" className="logo" />
          <h1 className="page-title">Backup</h1>
        </div>
      </div>

      <div className="page-content-scrollable">
        <div style={{ marginBottom: '24px' }}>
          <p className="import-description" style={{ marginBottom: '20px' }}>
            L'app salva automaticamente i backup di tutti i dati. Puoi ripristinare l'ultimo backup se qualcosa va storto.
          </p>

          {message && (
            <div
              className={`error-message ${message.type === 'success' ? 'success' : ''}`}
              style={{
                backgroundColor: message.type === 'success' ? '#e8f5e9' : '#fee',
                color: message.type === 'success' ? '#2e7d32' : undefined,
                marginBottom: '20px'
              }}
            >
              {message.text}
            </div>
          )}

          <button
            className="btn btn-primary btn-full btn-danger"
            onClick={handleRestore}
            disabled={isLoading}
            style={{ marginBottom: '80px' }}
          >
            {isLoading ? 'In corso...' : 'Ripristina ultimo backup'}
          </button>

          <ConfirmationDialog
            isOpen={showConfirmDialog}
            title="Ripristina backup"
            message="Sei sicuro di voler ripristinare l'ultimo backup? Questa operazione sovrascriverà i dati attuali."
            cancelText="Annulla"
            confirmText="Conferma"
            isDangerous={true}
            onCancel={() => setShowConfirmDialog(false)}
            onConfirm={handleConfirmRestore}
          />
        </div>
      </div>
    </div>
  )
}

export default BackupPage
