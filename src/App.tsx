import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import AppShell from './components/AppShell'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import AccountsPage from './pages/Accounts'
import AccountDetail from './pages/AccountDetail'
import ContactsPage from './pages/Contacts'
import ProspectingPage from './pages/Prospecting'
import PipelinePage from './pages/Pipeline'
import AgendaPage from './pages/Agenda'
import ManagementDashboard from './pages/ManagementDashboard'
import ReportsPage from './pages/Reports'
import IntegrationsPage from './pages/Integrations'
import SettingsPage from './pages/Settings'
import NotFound from './pages/NotFound'

// Protected Route Component
const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/entrar" replace />
  }

  return <AppShell />
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/entrar" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Authenticated Application Shell */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contas" element={<AccountsPage />} />
            <Route path="/contas/:id" element={<AccountDetail />} />
            <Route path="/contatos" element={<ContactsPage />} />
            <Route path="/prospeccao" element={<ProspectingPage />} />
            <Route path="/oportunidades" element={<PipelinePage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/gestao" element={<ManagementDashboard />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/integrações" element={<IntegrationsPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
