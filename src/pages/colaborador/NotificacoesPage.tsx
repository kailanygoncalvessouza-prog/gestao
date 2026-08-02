import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getNotificacoesColaborador, markNotificacaoColaboradorRead } from '@/services/notificacoes'
import { Notificacao } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default function NotificacoesColaboradorPage() {
  const { colaborador } = useAuth()
  const [notifications, setNotifications] = useState<Notificacao[]>([])

  useEffect(() => {
    if (colaborador?.token) {
      getNotificacoesColaborador(colaborador.token)
        .then((res) => {
          if (res.notificacoes) setNotifications(res.notificacoes)
        })
        .catch(() => {})
    }
  }, [colaborador])

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
        <p className="text-sm text-muted-foreground">Alertas de aprovação e novas atribuições.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className="shadow-sm">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs space-y-1">
                <p className="font-medium">{n.mensagem}</p>
                <p className="text-muted-foreground">
                  {new Date(n.enviada_em).toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
