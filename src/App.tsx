import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

import Index from './pages/Index'
import Layout from './components/Layout'

import VisaoGeral from './pages/gestor/VisaoGeral'
import ColaboradoresPage from './pages/gestor/ColaboradoresPage'
import AtividadesPage from './pages/gestor/AtividadesPage'
import CalendarioPage from './pages/gestor/CalendarioPage'
import EvidenciasPage from './pages/gestor/EvidenciasPage'
import MetricasPage from './pages/gestor/MetricasPage'
import NotificacoesPage from './pages/gestor/NotificacoesPage'

import AgendaPage from './pages/colaborador/AgendaPage'
import MetricasColaboradorPage from './pages/colaborador/MetricasPage'
import NotificacoesColaboradorPage from './pages/colaborador/NotificacoesPage'

function RoleRoute({
  allowedRole,
  children,
}: {
  allowedRole: 'GESTOR' | 'COLABORADOR'
  children: JSX.Element
}) {
  const { role } = useAuth()
  if (role !== allowedRole) {
    return (
      <Navigate to={role === 'GESTOR' ? '/gestor/visao-geral' : '/colaborador/agenda'} replace />
    )
  }
  return children
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<Layout />}>
            <Route
              path="/gestor/visao-geral"
              element={
                <RoleRoute allowedRole="GESTOR">
                  <VisaoGeral />
                </RoleRoute>
              }
            />
            <Route
              path="/gestor/colaboradores"
              element={
                <RoleRoute allowedRole="GESTOR">
                  <ColaboradoresPage />
                </RoleRoute>
              }
            />
            <Route
              path="/gestor/atividades"
              element={
                <RoleRoute allowedRole="GESTOR">
                  <AtividadesPage />
                </RoleRoute>
              }
            />
            <Route
              path="/gestor/calendario"
              element={
                <RoleRoute allowedRole="GESTOR">
                  <CalendarioPage />
                </RoleRoute>
              }
            />
            <Route
              path="/gestor/evidencias"
              element={
                <RoleRoute allowedRole="GESTOR">
                  <EvidenciasPage />
                </RoleRoute>
              }
            />
            <Route
              path="/gestor/metricas"
              element={
                <RoleRoute allowedRole="GESTOR">
                  <MetricasPage />
                </RoleRoute>
              }
            />
            <Route
              path="/gestor/notificacoes"
              element={
                <RoleRoute allowedRole="GESTOR">
                  <NotificacoesPage />
                </RoleRoute>
              }
            />

            <Route
              path="/colaborador/agenda"
              element={
                <RoleRoute allowedRole="COLABORADOR">
                  <AgendaPage />
                </RoleRoute>
              }
            />
            <Route
              path="/colaborador/metricas"
              element={
                <RoleRoute allowedRole="COLABORADOR">
                  <MetricasColaboradorPage />
                </RoleRoute>
              }
            />
            <Route
              path="/colaborador/notificacoes"
              element={
                <RoleRoute allowedRole="COLABORADOR">
                  <NotificacoesColaboradorPage />
                </RoleRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
