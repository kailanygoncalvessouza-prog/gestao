import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'

export default function MetricasColaboradorPage() {
  const { colaborador } = useAuth()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (colaborador?.token) {
      pb.send(`/backend/v1/colaborador/metricas?token=${colaborador.token}`, { method: 'GET' })
        .then(setStats)
        .catch(() => {})
    }
  }, [colaborador])

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Minhas Métricas</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe seu histórico individual de desempenho.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-sm p-4 text-center">
            <p className="text-xs text-muted-foreground">Cumprimento Hoje</p>
            <p className="text-3xl font-bold text-primary mt-1">{stats.cumprimentoHoje}%</p>
          </Card>
          <Card className="shadow-sm p-4 text-center">
            <p className="text-xs text-muted-foreground">Pontualidade Total</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.pontualidadeTotal}%</p>
          </Card>
          <Card className="shadow-sm p-4 text-center">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.totalPendentes}</p>
          </Card>
          <Card className="shadow-sm p-4 text-center">
            <p className="text-xs text-muted-foreground">Concluídas</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalConcluidas}</p>
          </Card>
        </div>
      )}
    </div>
  )
}
