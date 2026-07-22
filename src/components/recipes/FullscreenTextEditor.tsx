import { useState, useEffect } from 'react'

interface Props {
  title: string
  value: string
  placeholder?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

// Editor di testo a tutta pagina (per campi lunghi, es. Procedimento/Metodo).
// Modifica una copia locale: "Fatto" conferma, "Annulla" scarta. Sta sopra il
// form (usa .sheet-overlay/z-index alto). Textarea che riempie lo spazio.
function FullscreenTextEditor({ title, value, placeholder, onConfirm, onCancel }: Props) {
  const [draft, setDraft] = useState(value)
  // riallinea se cambia il valore in ingresso (apertura su record diverso)
  useEffect(() => { setDraft(value) }, [value])

  return (
    <div className="text-editor-overlay">
      <div className="text-editor-panel">
        <div className="text-editor-head">
          <button type="button" className="text-editor-cancel" onClick={onCancel}>Annulla</button>
          <span className="text-editor-title">{title}</span>
          <button type="button" className="text-editor-done" onClick={() => onConfirm(draft)}>Fatto</button>
        </div>
        <textarea
          className="text-editor-area"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
      </div>
    </div>
  )
}

export default FullscreenTextEditor
