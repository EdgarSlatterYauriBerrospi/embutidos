import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import GuestRoute from './GuestRoute.jsx'
import MainLayout from '../layouts/MainLayout.jsx'
import ModulePlaceholderPage from '../pages/ModulePlaceholderPage.jsx'
import MorePage from '../pages/MorePage.jsx'
import { mainNavigation } from './navigation.js'
import ProductsPage from '../pages/ProductsPage.jsx'
import ProductEditorPage from '../pages/ProductEditorPage.jsx'
import RootRedirect from './RootRedirect.jsx'
import SalesPage from '../pages/SalesPage.jsx'
import NewSalePage from '../pages/NewSalePage.jsx'
import ConfirmSalePage from '../pages/ConfirmSalePage.jsx'
import SaleDetailPage from '../pages/SaleDetailPage.jsx'
import StockPage from '../pages/StockPage.jsx'
import StockDetailPage from '../pages/StockDetailPage.jsx'
import PurchasesPage from '../pages/PurchasesPage.jsx'
import NewPurchasePage from '../pages/NewPurchasePage.jsx'
import PurchaseDetailPage from '../pages/PurchaseDetailPage.jsx'
import SuppliersPage from '../pages/SuppliersPage.jsx'
import SupplierEditorPage from '../pages/SupplierEditorPage.jsx'
import ExpirationsPage from '../pages/ExpirationsPage.jsx'
import UsersPage from '../pages/UsersPage.jsx'
import UserEditorPage from '../pages/UserEditorPage.jsx'
import AdminRoute from './AdminRoute.jsx'
import NotificationsPage from '../pages/NotificationsPage.jsx'
import ReportsPage from '../pages/ReportsPage.jsx'

const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx'))

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<RootRedirect />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={
              <Suspense fallback={<p role="status" className="py-8 text-sm text-stone-500">Cargando resumen…</p>}>
                <DashboardPage />
              </Suspense>
            } />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductEditorPage />} />
            <Route path="products/:id/edit" element={<ProductEditorPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="sales/new" element={<NewSalePage />} />
            <Route path="sales/confirm" element={<ConfirmSalePage />} />
            <Route path="sales/:id" element={<SaleDetailPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="stock/:productId" element={<StockDetailPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="purchases/new" element={<NewPurchasePage />} />
            <Route path="purchases/:id" element={<PurchaseDetailPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="suppliers/new" element={<SupplierEditorPage />} />
            <Route path="suppliers/:id/edit" element={<SupplierEditorPage />} />
            <Route path="expirations" element={<ExpirationsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route element={<AdminRoute />}>
              <Route path="users" element={<UsersPage />} />
              <Route path="users/new" element={<UserEditorPage />} />
              <Route path="users/:id/edit" element={<UserEditorPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            {mainNavigation.slice(1).filter(({ path }) => !['/products', '/sales', '/stock', '/purchases', '/suppliers', '/expirations', '/users', '/reports'].includes(path)).map(({ path, label }) => (
              <Route key={path} path={path} element={<ModulePlaceholderPage title={label} />} />
            ))}
            <Route path="more" element={<MorePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
