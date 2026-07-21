import { IoLogoWhatsapp } from 'react-icons/io5'

// Link pubblico dell'app (produzione). Condiviso sempre questo, anche se aperto da localhost.
const APP_URL = 'https://barnode-8gbl.onrender.com'
const SHARE_TEXT = `BARnode - gestione inventario bar: ${APP_URL}`

function ShareWhatsAppButton() {
  const handleShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      className="share-whatsapp-button"
      onClick={handleShare}
      aria-label="Condividi BARnode su WhatsApp"
      title="Condividi su WhatsApp"
    >
      <IoLogoWhatsapp size={26} />
    </button>
  )
}

export default ShareWhatsAppButton
