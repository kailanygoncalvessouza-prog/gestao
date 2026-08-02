import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  Camera,
  BarChart2,
  LogOut,
  Bell,
  ListTodo,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  onNavClick?: () => void
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const { user, colaborador, role, signOut } = useAuth()
  const location = useLocation()

  const gestorNav = [
    { label: 'Visão geral', path: '/gestor/visao-geral', icon: LayoutDashboard },
    { label: 'Colaboradores', path: '/gestor/colaboradores', icon: Users },
    { label: 'Atividades', path: '/gestor/atividades', icon: CheckSquare },
    { label: 'Calendário', path: '/gestor/calendario', icon: Calendar },
    { label: 'Evidências', path: '/gestor/evidencias', icon: Camera },
    { label: 'Métricas', path: '/gestor/metricas', icon: BarChart2 },
  ]

  const colaboradorNav = [
    { label: 'Minha Agenda', path: '/colaborador/agenda', icon: CheckSquare },
    { label: 'Minhas Métricas', path: '/colaborador/metricas', icon: BarChart2 },
    { label: 'Notificações', path: '/colaborador/notificacoes', icon: Bell },
  ]

  const navItems = role === 'GESTOR' ? gestorNav : colaboradorNav
  const displayName =
    role === 'GESTOR' ? user?.nome || user?.name || 'Gestor' : colaborador?.nome || 'Colaborador'
  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <aside className="w-[260px] bg-card border-r flex flex-col h-full min-h-screen">
      <div className="p-6 border-b flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary text-primary-foreground">
          <ListTodo className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">Gestão de Pessoas</h1>
          <span className="text-xs text-muted-foreground font-medium">Equipes & Atividades</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate leading-tight">{displayName}</p>
              <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary mt-0.5">
                {role === 'GESTOR' ? 'Gestor' : 'Colaborador'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            title="Sair"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
