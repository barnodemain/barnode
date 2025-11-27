import React from 'react';

function SettingsPage() {
  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">Impostazioni</h1>
      </header>
      <section className="list">
        <div className="settings-grid">
          <button type="button" className="db-box">
            IMPORTA
          </button>
          <button type="button" className="db-box">
            ARTICOLI
          </button>
          <button type="button" className="db-box">
            TIPOLOGIE
          </button>
        </div>
      </section>
    </main>
  );
}

export default SettingsPage;
