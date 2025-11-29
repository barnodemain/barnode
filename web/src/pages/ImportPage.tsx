import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { AppIcon } from '../components/AppIcon';

function ImportPage() {
  const navigate = useNavigate();

  return (
    <main className="page settings-page">
      <header className="page-header">
        <div className="page-logo-wrapper">
          <img src={logo} alt="Barnode" className="page-logo" />
        </div>
        <h1 className="page-title">Importa</h1>
      </header>
      <section className="list">
        <div className="settings-grid">
          <button
            type="button"
            className="db-box settings-button"
            onClick={() => navigate('/settings/import/text')}
          >
            <span className="settings-button-icon">
              <AppIcon name="upload" size={18} />
            </span>
            <span className="settings-button-label">TESTO</span>
          </button>
          <button
            type="button"
            className="db-box settings-button"
            onClick={() => navigate('/settings/import/csv')}
          >
            <span className="settings-button-icon">
              <AppIcon name="archive" size={18} />
            </span>
            <span className="settings-button-label">CSV</span>
          </button>
          <button
            type="button"
            className="db-box settings-button"
            onClick={() => navigate('/settings/import/pdf')}
          >
            <span className="settings-button-icon">
              <AppIcon name="cloud" size={18} />
            </span>
            <span className="settings-button-label">PDF (Beta)</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default ImportPage;
