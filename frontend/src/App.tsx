import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardRedirect, GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { HomePage } from './pages/HomePage';
import { ListingsPage } from './pages/ListingsPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { GisPage } from './pages/GisPage';
import { MarketPage } from './pages/MarketPage';
import { MarketDetailPage } from './pages/MarketDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { AgentListingsPage } from './pages/agent/AgentListingsPage';
import { AgentListingFormPage } from './pages/agent/AgentListingFormPage';
import { AgentGisPage } from './pages/agent/AgentGisPage';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ManagerListingsPage } from './pages/manager/ManagerListingsPage';
import { ManagerMarketPage } from './pages/manager/ManagerMarketPage';
import { ManagerServicesPage } from './pages/manager/ManagerServicesPage';
import { ManagerGisPage } from './pages/manager/ManagerGisPage';
import { ManagerJobsPage } from './pages/manager/ManagerJobsPage';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientMarketPage } from './pages/client/ClientMarketPage';
import { ClientMarketFormPage } from './pages/client/ClientMarketFormPage';
import { ClientJobsPage } from './pages/client/ClientJobsPage';
import { ClientJobFormPage } from './pages/client/ClientJobFormPage';
import { ClientApplicationsPage } from './pages/client/ClientApplicationsPage';
import { ClientGisPage } from './pages/client/ClientGisPage';
import { ClientServicePage } from './pages/client/ClientServicePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCreateUserPage } from './pages/admin/AdminCreateUserPage';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="listings" element={<ListingsPage />} />
              <Route path="listings/:id" element={<ListingDetailPage />} />
              <Route path="gis" element={<GisPage />} />
              <Route path="market" element={<MarketPage />} />
              <Route path="market/:id" element={<MarketDetailPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/:id" element={<JobDetailPage />} />

              <Route element={<GuestRoute />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>

              <Route path="dashboard" element={<ProtectedRoute />}>
                <Route index element={<DashboardRedirect />} />

                <Route path="agent" element={<ProtectedRoute roles={['AGENT']} />}>
                  <Route index element={<AgentDashboard />} />
                  <Route path="listings" element={<AgentListingsPage />} />
                  <Route path="listings/new" element={<AgentListingFormPage />} />
                  <Route path="listings/:id/edit" element={<AgentListingFormPage />} />
                  <Route path="gis" element={<AgentGisPage />} />
                </Route>

                <Route path="manager" element={<ProtectedRoute roles={['MANAGER', 'ADMIN']} />}>
                  <Route index element={<ManagerDashboard />} />
                  <Route path="listings" element={<ManagerListingsPage />} />
                  <Route path="market" element={<ManagerMarketPage />} />
                  <Route path="services" element={<ManagerServicesPage />} />
                  <Route path="gis" element={<ManagerGisPage />} />
                  <Route path="jobs" element={<ManagerJobsPage />} />
                </Route>

                <Route path="client" element={<ProtectedRoute roles={['CLIENT']} />}>
                  <Route index element={<ClientDashboard />} />
                  <Route path="market" element={<ClientMarketPage />} />
                  <Route path="market/new" element={<ClientMarketFormPage />} />
                  <Route path="jobs" element={<ClientJobsPage />} />
                  <Route path="jobs/new" element={<ClientJobFormPage />} />
                  <Route path="applications" element={<ClientApplicationsPage />} />
                  <Route path="gis" element={<ClientGisPage />} />
                  <Route path="services" element={<ClientServicePage />} />
                </Route>

                <Route path="admin" element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="users/new" element={<AdminCreateUserPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
