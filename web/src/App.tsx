import { Suspense, lazy } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';

const MissingItemsPage = lazy(() => import('./pages/MissingItemsPage'));
const DatabasePage = lazy(() => import('./pages/DatabasePage'));
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const ManageOrdersPage = lazy(() => import('./pages/orders/ManageOrdersPage'));
const CreateOrderPage = lazy(() => import('./pages/orders/CreateOrderPage'));
const OrderCreatedPage = lazy(() => import('./pages/orders/OrderCreatedPage'));

function App() {
  return (
    <div className="app-root">
      <div className="page-content">
        <Suspense fallback={<div className="page-loading">Caricamento...</div>}>
          <Routes>
            <Route path="/" element={<MissingItemsPage />} />
            <Route path="/database" element={<DatabasePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/create" element={<CreateOrderPage />} />
            <Route path="/orders/manage" element={<ManageOrdersPage />} />
            <Route path="/orders/created/:id" element={<OrderCreatedPage />} />
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
          Database
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) => (isActive ? 'nav-item nav-item-active' : 'nav-item')}
        >
          Ordini
        </NavLink>
      </nav>
    </div>
  );
}

export default App;
