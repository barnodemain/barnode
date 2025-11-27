import { Suspense, lazy } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AppIcon } from './components/AppIcon';

const MissingItemsPage = lazy(() => import('./pages/MissingItemsPage'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App() {
  return (
    <div className="app-root">
      <div className="page-content">
        <Suspense fallback={<div className="page-loading">Caricamento...</div>}>
          <Routes>
            <Route path="/" element={<MissingItemsPage />} />
            <Route path="/archivio" element={<ArchivePage />} />
            <Route path="/database" element={<Navigate to="/archivio" replace />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<MissingItemsPage />} />
          </Routes>
        </Suspense>
      </div>
      <nav className="bottom-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'nav-item nav-item-active' : 'nav-item')}
        >
          <AppIcon name="home" size={18} />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/archivio"
          className={({ isActive }) => (isActive ? 'nav-item nav-item-active' : 'nav-item')}
        >
          <AppIcon name="archive" size={18} />
          <span>Archivio</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? 'nav-item nav-item-active' : 'nav-item')}
        >
          <AppIcon name="settings" size={18} />
          <span>Impostazioni</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default App;
