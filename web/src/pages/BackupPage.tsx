import { useState } from 'react';
import logo from '../assets/logo.png';
import { AppIcon } from '../components/AppIcon';
import { restoreBackupSnapshot } from '../shared/repositories/backupRepository';

function BackupPage() {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (isRestoring) return;
    setIsRestoring(true);

    const { error } = await restoreBackupSnapshot();

    setIsRestoring(false);

    if (error) {
      window.alert(error.message || 'Errore durante il ripristino del backup.');
      return;
    }

    window.alert("Backup ripristinato con successo. L'app verrà ricaricata.");
    window.location.reload();
  };

  return (
    <main className="page archive-page">
      <header className="archive-header">
        <div className="page-logo-wrapper">
          <img src={logo} alt="Barnode" className="page-logo" />
        </div>
        <h1 className="page-title">Backup dati</h1>
      </header>

      <div className="archive-scroll">
        <section className="list backup-page-section">
          <p>
            Il backup viene aggiornato automaticamente quando modifichi articoli, tipologie o
            articoli mancanti.
          </p>
          <p>
            In caso di problemi premi Ripristina Backup per ripristinare l&apos;ultimo salvataggio.
          </p>

          <div className="settings-grid backup-actions">
            <button
              type="button"
              className="db-box settings-button backup-restore-button"
              onClick={handleRestore}
              disabled={isRestoring}
            >
              <span className="settings-button-icon">
                <AppIcon name="cloud" size={18} />
              </span>
              <span className="settings-button-label">
                {isRestoring ? 'Ripristino in corso…' : 'Ripristina Backup'}
              </span>
            </button>
          </div>

          <p className="backup-warning-text">
            Operazione da effettuare con connessione Wi-Fi stabile.
          </p>
        </section>
      </div>
    </main>
  );
}

export default BackupPage;
