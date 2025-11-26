import type { ReactNode } from 'react';

interface AppModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

function AppModal({ isOpen, title, onClose, children }: AppModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-container">
        <header className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default AppModal;
