import { NavLink, Route, Routes } from 'react-router-dom';
import MissingItemsPage from './pages/MissingItemsPage';
import DatabasePage from './pages/DatabasePage';
import OrdersPage from './pages/orders/OrdersPage';
import ManageOrdersPage from './pages/orders/ManageOrdersPage';
import CreateOrderPage from './pages/orders/CreateOrderPage';
import OrderCreatedPage from './pages/orders/OrderCreatedPage';

function App() {
  return (
    <div className="app-root">
      <div className="page-content">
        <Routes>
          <Route path="/" element={<MissingItemsPage />} />
          <Route path="/database" element={<DatabasePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/create" element={<CreateOrderPage />} />
          <Route path="/orders/manage" element={<ManageOrdersPage />} />
          <Route path="/orders/created/:id" element={<OrderCreatedPage />} />
        </Routes>
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
