import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SalesPage from './pages/SalesPage';
import NewSalePage from './pages/NewSalePage';
import ViewBillPage from './pages/ViewBillPage';
import EditBillPage from './pages/EditBillPage';
import BillReturnPage from './pages/BillReturnPage';
import ReturnsPage from './pages/ReturnsPage';
import NewReturnPage from './pages/NewReturnPage';
import PurchasePage from './pages/PurchasePage';
import NewPurchasePage from './pages/NewPurchasePage';
import StockPage from './pages/StockPage';
import NewStockPage from './pages/NewStockPage';
import AdminPage from './pages/AdminPage';
import PermissionsPage from './pages/PermissionsPage';
import NotFoundPage from './pages/NotFoundPage';

function PrivateRoute({ children, perm }) {
  const { currentUser, hasPerm, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (perm && !isAdmin() && !hasPerm(perm)) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppShell />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="sales/new" element={<NewSalePage />} />
              <Route path="sales/:id" element={<ViewBillPage />} />
              <Route path="sales/:id/edit" element={<AdminRoute><EditBillPage /></AdminRoute>} />
              <Route path="sales/:id/return" element={<PrivateRoute perm="returns"><BillReturnPage /></PrivateRoute>} />
              <Route path="returns" element={<ReturnsPage />} />
              <Route path="returns/new" element={<PrivateRoute perm="returns"><NewReturnPage /></PrivateRoute>} />
              <Route path="purchase" element={<PrivateRoute perm="purchase"><PurchasePage /></PrivateRoute>} />
              <Route path="purchase/new" element={<PrivateRoute perm="purchase"><NewPurchasePage /></PrivateRoute>} />
              <Route path="stock" element={<PrivateRoute perm="inventory"><StockPage /></PrivateRoute>} />
              <Route path="stock/new" element={<AdminRoute><NewStockPage /></AdminRoute>} />
              <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="admin/permissions/:userId" element={<AdminRoute><PermissionsPage /></AdminRoute>} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
