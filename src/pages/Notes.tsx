import { useEffect, useMemo, useState } from 'react'
import { IoCopyOutline } from 'react-icons/io5'
import { useArticoli } from '../hooks/useArticoli'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

function Notes() {
  const { articoli } = useArticoli()

  const [copied, setCopied] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const [hasEdited, setHasEdited] = useState(false)
  const [notesId, setNotesId] = useState<string | null>(null)
  const [isSyncedWithSupabase, setIsSyncedWithSupabase] = useState(false)
  const [hasLoadedNotes, setHasLoadedNotes] = useState(false)

  const noteText = useMemo(
    () =>
      articoli
        .map((a) => a.nome?.trim())
        .filter((nome): nome is string => Boolean(nome && nome.length > 0))
        .join('\n'),
    [articoli],
  )

  const displayText = isSyncedWithSupabase
    ? notesValue
    : hasEdited
      ? notesValue
      : noteText

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      return
    }

    if (hasLoadedNotes) return
    const loadOrCreateNotes = async () => {
      try {
        if (!supabase) {
          return
        }
        const { data, error } = await supabase
          .from('notes')
          .select('id, content')
          .limit(1)

        if (error) {
          console.error('Errore nel caricamento delle note da Supabase', error)
          setHasLoadedNotes(true)
          return
        }

        if (data && data.length > 0) {
          const row = data[0]
          setNotesId(row.id as string)
          setNotesValue((row.content as string) ?? '')
          setIsSyncedWithSupabase(true)
          setHasLoadedNotes(true)
          return
        }

        const initialContent = noteText
        const { data: insertData, error: insertError } = await supabase
          .from('notes')
          .insert([{ content: initialContent }])
          .select('id, content')
          .single()

        if (insertError) {
          console.error('Errore nella creazione iniziale delle note su Supabase', insertError)
          setHasLoadedNotes(true)
          return
        }

        setNotesId(insertData.id as string)
        setNotesValue((insertData.content as string) ?? '')
        setIsSyncedWithSupabase(true)
        setHasLoadedNotes(true)
      } catch (error) {
        console.error('Errore inatteso nella gestione delle note su Supabase', error)
        setHasLoadedNotes(true)
      }
    }

    void loadOrCreateNotes()
  }, [hasEdited, hasLoadedNotes, noteText])

  useEffect(() => {
    if (!isSyncedWithSupabase || !notesId || !hasLoadedNotes) return
    if (!isSupabaseConfigured() || !supabase) return

    const handler = setTimeout(async () => {
      if (!supabase) {
        return
      }
      try {
        const { error } = await supabase
          .from('notes')
          .update({ content: notesValue })
          .eq('id', notesId)

        if (error) {
          console.error('Errore nell\'aggiornamento delle note su Supabase', error)
        }
      } catch (error) {
        console.error('Errore inatteso nell\'aggiornamento delle note su Supabase', error)
      }
    }, 500)

    return () => clearTimeout(handler)
  }, [hasLoadedNotes, isSyncedWithSupabase, notesId, notesValue])

  const handleCopyAll = () => {
    if (!displayText) return

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(displayText).catch((error) => {
        console.error('Clipboard write failed', error)
      })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }

    if (typeof document === 'undefined') return

    const textarea = document.createElement('textarea')
    textarea.value = displayText
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
            value={displayText}
            onChange={(e) => {
              setHasEdited(true)
              setNotesValue(e.target.value)
            }}
            placeholder="Le note verranno generate automaticamente in base agli articoli presenti."
          />
          <div className="notes-copy-row">
            {copied && <span className="notes-copy-feedback">testo copiato</span>}
            <button
              type="button"
              className="notes-copy-icon"
              onClick={handleCopyAll}
              disabled={!displayText}
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
