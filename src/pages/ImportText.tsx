import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArticoli } from '../hooks/useArticoli'

type WizardState = 'input' | 'reviewing' | 'complete'

interface CandidateItem {
  originalName: string
  editedName: string
  status: 'pending' | 'confirmed' | 'skipped'
}

function ImportText() {
  const navigate = useNavigate()
  const [textInput, setTextInput] = useState('')
  const [wizardState, setWizardState] = useState<WizardState>('input')
  const [candidates, setCandidates] = useState<CandidateItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState({ created: 0, skipped: 0 })
  
  const { articoli, createArticolo, error } = useArticoli()

  const handleAnalyze = () => {
    const lines = textInput.split('\n')
    const trimmedLines = lines.map(l => l.trim()).filter(l => l.length > 0)
    
    const uniqueNames = new Map<string, string>()
    trimmedLines.forEach(name => {
      const lowerName = name.toLowerCase()
      if (!uniqueNames.has(lowerName)) {
        uniqueNames.set(lowerName, name)
      }
    })

    const existingNames = new Set(articoli.map(a => a.nome.toLowerCase()))
    
    const newItems: CandidateItem[] = []
    uniqueNames.forEach((originalName, lowerName) => {
      if (!existingNames.has(lowerName)) {
        newItems.push({
          originalName,
          editedName: originalName,
          status: 'pending'
        })
      }
    })

    if (newItems.length === 0) {
      setCandidates([])
      setStats({ created: 0, skipped: 0 })
      setWizardState('complete')
      return
    }

    setCandidates(newItems)
    setCurrentIndex(0)
    setWizardState('reviewing')
  }

  const handleConfirm = async () => {
    const current = candidates[currentIndex]
    if (!current.editedName.trim()) return

    setIsSubmitting(true)
    try {
      const success = await createArticolo(current.editedName.trim())
      
      setCandidates(prev => prev.map((c, i) => 
        i === currentIndex ? { ...c, status: success ? 'confirmed' : 'skipped' } : c
      ))
      
      moveToNext()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    setCandidates(prev => prev.map((c, i) => 
      i === currentIndex ? { ...c, status: 'skipped' } : c
    ))
    moveToNext()
  }

  const moveToNext = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      const finalCandidates = candidates.map((c, i) => {
        if (i === currentIndex && c.status === 'pending') {
          return c
        }
        return c
      })
      
      const created = finalCandidates.filter(c => c.status === 'confirmed').length + 
        (candidates[currentIndex]?.status === 'pending' ? 1 : 0)
      const skipped = finalCandidates.filter(c => c.status === 'skipped').length

      setStats({ created, skipped })
      setWizardState('complete')
    }
  }

  const handleEditName = (value: string) => {
    setCandidates(prev => prev.map((c, i) => 
      i === currentIndex ? { ...c, editedName: value } : c
    ))
  }

  const handleReset = () => {
    setTextInput('')
    setCandidates([])
    setCurrentIndex(0)
    setStats({ created: 0, skipped: 0 })
    setWizardState('input')
  }

  const currentCandidate = candidates[currentIndex]

  return (
    <div className="page-wrapper">
      <div className="page-header-fixed">
        <div className="page-header">
          <img src="/logo.png" alt="BARnode" className="logo" />
          <h1 className="page-title">Importa da testo</h1>
        </div>
      </div>

      <div className="page-content-scrollable">
        {error && <div className="error-message">{error}</div>}

        {wizardState === 'input' && (
          <div>
            <p className="import-description">
              Incolla qui l'elenco di articoli, uno per riga.<br />
              Righe vuote o non valide verranno ignorate.
            </p>
            <textarea
              className="import-textarea"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Es. latte intero
Pasta integrale
Biscotti senza zucchero"
            />
            <button
              className="btn btn-primary btn-full"
              onClick={handleAnalyze}
              disabled={!textInput.trim()}
            >
              ANALIZZA TESTO
            </button>
          </div>
        )}

        {wizardState === 'reviewing' && currentCandidate && (
          <div>
            <div className="wizard-progress">
              Articolo {currentIndex + 1} di {candidates.length}
            </div>
            <div className="wizard-card">
              <div className="wizard-item-name">{currentCandidate.originalName}</div>
              <input
                type="text"
                className="wizard-input"
                value={currentCandidate.editedName}
                onChange={(e) => handleEditName(e.target.value)}
                placeholder="Modifica nome se necessario"
              />
              <div className="wizard-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                >
                  Salta
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirm}
                  disabled={isSubmitting || !currentCandidate.editedName.trim()}
                >
                  {isSubmitting ? '...' : 'Conferma'}
                </button>
              </div>
            </div>
          </div>
        )}

        {wizardState === 'complete' && (
          <div className="summary-card">
            <h2 className="summary-title">Importazione completata</h2>
            {candidates.length === 0 ? (
              <p className="summary-stats">
                Nessun nuovo articolo da importare.<br />
                Tutti gli articoli esistono già nell'archivio.
              </p>
            ) : (
              <p className="summary-stats">
                {stats.created} articoli creati<br />
                {stats.skipped} articoli saltati
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={handleReset}>
                Nuova importazione
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/archivio')}>
                Vai all'archivio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportText
