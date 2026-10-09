import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AuthProvider } from './features/auth/AuthProvider';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';

import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProductsPage } from './features/products/ProductsPage';
import { AddProductPage } from './features/products/AddProductPage';
import { ProductDetailPage } from './features/products/ProductDetailPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { SalesPage } from './features/sales/SalesPage';
import { NewSalePage } from './features/sales/NewSalePage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ProfilePage } from './features/profile/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/new" element={<AddProductPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                
                <Route path="/inventory" element={<InventoryPage />} />
                
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/sales/new" element={<NewSalePage />} />
                
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
