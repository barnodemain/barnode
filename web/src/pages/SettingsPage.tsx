import React from 'react';
import logo from '../assets/logo.png';

function SettingsPage() {
  return (
    <main className="page settings-page">
      <header className="page-header">
        <div className="page-logo-wrapper">
          <img src={logo} alt="Barnode" className="page-logo" />
        </div>
        <h1 className="page-title">Impostazioni</h1>
      </header>
      <section className="list">
        <div className="settings-grid">
          <button type="button" className="db-box settings-button">
            IMPORTA
          </button>
          <button type="button" className="db-box settings-button">
            ARTICOLI
          </button>
          <button type="button" className="db-box settings-button">
            TIPOLOGIE
          </button>
          <button
            type="button"
            className="db-box settings-button"
            onClick={() => {
              // TODO: collegare azione BACKUP quando disponibile
            }}
          >
            BACKUP
          </button>
        </div>
      </section>
    </main>
  );
}

export default SettingsPage;
