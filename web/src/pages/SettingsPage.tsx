import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { AppIcon } from '../components/AppIcon';

function SettingsPage() {
  const navigate = useNavigate();
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
            <span className="settings-button-icon">
              <AppIcon name="upload" size={18} />
            </span>
            <span className="settings-button-label">IMPORTA</span>
          </button>
          <button
            type="button"
            className="db-box settings-button"
            onClick={() => navigate('/settings/tipologie')}
          >
            <span className="settings-button-icon">
              <AppIcon name="tag" size={18} />
            </span>
            <span className="settings-button-label">TIPOLOGIE</span>
          </button>
          <button
            type="button"
            className="db-box settings-button"
            onClick={() => {
              // TODO: collegare azione BACKUP quando disponibile
            }}
          >
            <span className="settings-button-icon">
              <AppIcon name="cloud" size={18} />
            </span>
            <span className="settings-button-label">BACKUP</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default SettingsPage;
