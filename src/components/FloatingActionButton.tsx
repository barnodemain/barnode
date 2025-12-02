import { IoAdd } from 'react-icons/io5'

interface FloatingActionButtonProps {
  onClick: () => void
}

function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button className="fab" onClick={onClick} aria-label="Aggiungi">
      <IoAdd />
    </button>
  )
}

export default FloatingActionButton
