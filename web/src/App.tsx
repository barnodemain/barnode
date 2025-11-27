import { Suspense, lazy } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';

const MissingItemsPage = lazy(() => import('./pages/MissingItemsPage'));
const DatabasePage = lazy(() => import('./pages/DatabasePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App() {
  return (
    <div className="app-root">
      <div className="page-content">
        <Suspense fallback={<div className="page-loading">Caricamento...</div>}>
          <Routes>
            <Route path="/" element={<MissingItemsPage />} />
            <Route path="/database" element={<DatabasePage />} />
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
          Home
        </NavLink>
        <NavLink
          to="/database"
          className={({ isActive }) => (isActive ? 'nav-item nav-item-active' : 'nav-item')}
        >
          Archivio
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? 'nav-item nav-item-active' : 'nav-item')}
        >
          Impostazioni
        </NavLink>
      </nav>
    </div>
  );
}

export default App;
