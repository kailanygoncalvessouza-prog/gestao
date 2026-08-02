import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getNotificacoesGestor, markNotificacaoGestorRead } from '@/services/notificacoes'
import { Notificacao } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Check } from 'lucide-react'

export default function NotificacoesPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notificacao[]>([])

  const loadData = async () => {
    if (user?.id) {
      try {
        const list = await getNotificacoesGestor(user.id)
        setNotifications(list)
      } catch {
        /* intentionally ignored */
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.lida) await markNotificacaoGestorRead(n.id)
    }
    loadData()
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
          <p className="text-sm text-muted-foreground">
            Histórico de alertas e eventos do sistema.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-1.5">
          <Check className="h-4 w-4" /> Marcar lidas
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            Nenhuma notificação registrada.
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`shadow-sm ${!n.lida ? 'bg-primary/5 border-primary/20' : ''}`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs space-y-1">
                  <p className="font-medium text-foreground">{n.mensagem}</p>
                  <p className="text-muted-foreground">
                    {new Date(n.enviada_em).toLocaleString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
