import { useMemo, useState } from 'react'
import { IoCopyOutline } from 'react-icons/io5'
import { useArticoli } from '../hooks/useArticoli'

function Notes() {
  const { articoli } = useArticoli()

  const [copied, setCopied] = useState(false)

  const noteText = useMemo(
    () =>
      articoli
        .map((a) => a.nome?.trim())
        .filter((nome): nome is string => Boolean(nome && nome.length > 0))
        .join('\n'),
    [articoli],
  )

  const handleCopyAll = () => {
    if (!noteText) return

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(noteText).catch((error) => {
        console.error('Clipboard write failed', error)
      })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }

    if (typeof document === 'undefined') return

    const textarea = document.createElement('textarea')
    textarea.value = noteText
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
    } catch (error) {
      console.error('Fallback copy failed', error)
    }
    document.body.removeChild(textarea)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header-fixed">
        <div className="page-header">
          <img src="/logo.png" alt="BARnode" className="logo" />
          <h1 className="page-title">Note</h1>
        </div>
      </div>

      <div className="page-content-scrollable">
        <div className="notes-box-wrapper">
          <textarea
            className="import-textarea"
            value={noteText}
            readOnly
            placeholder="Le note verranno generate automaticamente in base agli articoli presenti."
          />
          <div className="notes-copy-row">
            {copied && <span className="notes-copy-feedback">testo copiato</span>}
            <button
              type="button"
              className="notes-copy-icon"
              onClick={handleCopyAll}
              disabled={!noteText}
              aria-label="Copia tutte le note"
            >
              <IoCopyOutline size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notes
