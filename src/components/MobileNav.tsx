import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Camera,
  MoreHorizontal,
  BarChart2,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  onOpenMore: () => void
}

export function MobileNav({ onOpenMore }: MobileNavProps) {
  const { role } = useAuth()
  const location = useLocation()

  if (role === 'GESTOR') {
    const items = [
      { label: 'Visão geral', path: '/gestor/visao-geral', icon: LayoutDashboard },
      { label: 'Atividades', path: '/gestor/atividades', icon: CheckSquare },
      { label: 'Calendário', path: '/gestor/calendario', icon: Calendar },
      { label: 'Evidências', path: '/gestor/evidencias', icon: Camera },
    ]

    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around z-30">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-md',
                isActive ? 'text-primary font-bold' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
        <button
          onClick={onOpenMore}
          className="flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 text-muted-foreground"
        >
          <MoreHorizontal className="h-5 w-5" />
          Mais
        </button>
      </div>
    )
  }

  const colabItems = [
    { label: 'Agenda', path: '/colaborador/agenda', icon: CheckSquare },
    { label: 'Métricas', path: '/colaborador/metricas', icon: BarChart2 },
    { label: 'Notificações', path: '/colaborador/notificacoes', icon: Bell },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around z-30">
      {colabItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-md',
              isActive ? 'text-primary font-bold' : 'text-muted-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
