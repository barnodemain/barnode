import { useState } from 'react'
import Modal from './Modal'

interface PinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const SECRET_PIN = '1909'

function PinModal({ isOpen, onClose, onSuccess }: PinModalProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleDigitPress = (digit: string) => {
    setError('')

    if (pin.length >= 4) return

    const nextPin = pin + digit
    setPin(nextPin)
  }

  const handleBackspace = () => {
    setError('')
    setPin((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    setError('')
    setPin('')
  }

  const handleClose = () => {
    setPin('')
    setError('')
    onClose()
  }

  const handleConfirm = () => {
    if (pin.length !== 4) {
      setError('Inserisci il PIN completo (4 cifre)')
      return
    }

    if (pin === SECRET_PIN) {
      setPin('')
      setError('')
      onSuccess()
      return
    }

    setPin('')
    setError('PIN errato, riprova')
  }

  const dots = Array.from({ length: 4 }).map((_, index) => (
    <span
      key={index}
      className={`pin-dot ${index < pin.length ? 'filled' : ''}`}
    />
  ))

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="PIN impostazioni">
      <div className="pin-modal-body">
        <div className="pin-dots-row" aria-label="Stato inserimento PIN">
          {dots}
        </div>

        {error && <div className="pin-error-message">{error}</div>}

        <div className="pin-keypad" aria-label="Tastierino numerico">
          {['1','2','3','4','5','6','7','8','9'].map((digit) => (
            <button
              key={digit}
              type="button"
              className="pin-key"
              onClick={() => handleDigitPress(digit)}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            className="pin-key pin-key-secondary"
            onClick={handleClear}
          >
            C
          </button>
          <button
            type="button"
            className="pin-key"
            onClick={() => handleDigitPress('0')}
          >
            0
          </button>
          <button
            type="button"
            className="pin-key pin-key-secondary"
            onClick={handleBackspace}
          >
            ←
          </button>
        </div>

        <div className="pin-actions">
          <button
            type="button"
            className="btn btn-danger pin-actions-button"
            onClick={handleClose}
          >
            Annulla
          </button>
          <button
            type="button"
            className="btn btn-primary pin-actions-button"
            onClick={handleConfirm}
          >
            Conferma
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default PinModal
