import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Bell, Menu, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getNotificacoesGestor,
  getNotificacoesColaborador,
  markNotificacaoGestorRead,
  markNotificacaoColaboradorRead,
} from '@/services/notificacoes'
import { Notificacao } from '@/types'
import { Link } from 'react-router-dom'

interface TopbarProps {
  onOpenMobileMenu: () => void
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const { user, colaborador, role } = useAuth()
  const [notifications, setNotifications] = useState<Notificacao[]>([])

  const fetchNotifs = async () => {
    try {
      if (role === 'GESTOR' && user?.id) {
        const list = await getNotificacoesGestor(user.id)
        setNotifications(list)
      } else if (role === 'COLABORADOR' && colaborador?.token) {
        const res = await getNotificacoesColaborador(colaborador.token)
        if (res.notificacoes) setNotifications(res.notificacoes)
      }
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [role, user, colaborador])

  const unreadCount = notifications.filter((n) => !n.lida).length

  const handleMarkRead = async (id: string) => {
    if (role === 'GESTOR') {
      await markNotificacaoGestorRead(id)
    } else if (colaborador?.token) {
      await markNotificacaoColaboradorRead(id, colaborador.token)
    }
    fetchNotifs()
  }

  const companyTitle = role === 'GESTOR' ? 'Empresa' : colaborador?.empresa_nome || 'Minha Agenda'

  return (
    <header className="h-16 border-b bg-card px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileMenu}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-sm md:text-base text-foreground">{companyTitle}</span>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="font-semibold text-sm">Notificações</span>
              <span className="text-xs text-muted-foreground">{unreadCount} não lidas</span>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs flex items-start justify-between gap-2 ${!n.lida ? 'bg-muted/40 font-medium' : ''}`}
                  >
                    <p className="flex-1">{n.mensagem}</p>
                    {!n.lida && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleMarkRead(n.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t text-center">
              <Link
                to={role === 'GESTOR' ? '/gestor/notificacoes' : '/colaborador/notificacoes'}
                className="text-xs text-primary font-medium hover:underline"
              >
                Ver todas
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
