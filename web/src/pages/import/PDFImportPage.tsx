import React from 'react';
import logo from '../../assets/logo.png';
import PDFImportPanel from '../../components/import/PDFImportPanel';

function PDFImportPage() {
  return (
    <main className="page settings-page">
      <header className="page-header">
        <div className="page-logo-wrapper">
          <img src={logo} alt="Barnode" className="page-logo" />
        </div>
        <h1 className="page-title">Importa da PDF (Beta)</h1>
      </header>
      <section className="list">
        <PDFImportPanel />
      </section>
    </main>
  );
}

export default PDFImportPage;
