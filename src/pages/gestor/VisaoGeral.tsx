import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getAtividadesGestor } from '@/services/atividades'
import { getColaboradores } from '@/services/colaboradores'
import { Atividade, Colaborador } from '@/types'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { RankingCard } from '@/components/dashboard/RankingCard'
import { TendenciaChart } from '@/components/dashboard/TendenciaChart'
import { PrioridadeChart } from '@/components/dashboard/PrioridadeChart'
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'
import useRealtime from '@/hooks/use-realtime'

export default function VisaoGeral() {
  const { user } = useAuth()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])

  const loadData = async () => {
    if (!user?.empresa_id) return
    try {
      const [ativs, colabs] = await Promise.all([
        getAtividadesGestor(user.empresa_id),
        getColaboradores(user.empresa_id),
      ])
      setAtividades(ativs)
      setColaboradores(colabs)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('atividades', loadData)

  const concluidas = atividades.filter(
    (a) => a.status === 'concluida' || a.status === 'concluida_com_atraso',
  ).length
  const pendentes = atividades.filter(
    (a) => a.status === 'pendente' || a.status === 'em_andamento',
  ).length
  const emAtraso = atividades.filter((a) => {
    if (a.status === 'concluida' || a.status === 'concluida_com_atraso' || a.status === 'nao_feita')
      return false
    return new Date(a.prazo) < new Date()
  }).length
  const naoFeitas = atividades.filter((a) => a.status === 'nao_feita').length

  const ranking = colaboradores
    .map((c) => {
      const colabAtivs = atividades.filter((a) => a.colaborador_id === c.id)
      const conc = colabAtivs.filter(
        (a) => a.status === 'concluida' || a.status === 'concluida_com_atraso',
      ).length
      const total = colabAtivs.length
      const pct = total > 0 ? Math.round((conc / total) * 100) : 100
      return { id: c.id, nome: c.nome, concluidas: conc, total, pct }
    })
    .sort((a, b) => b.pct - a.pct)

  const prioridades = {
    baixa: atividades.filter((a) => a.prioridade === 'baixa').length,
    media: atividades.filter((a) => a.prioridade === 'media').length,
    alta: atividades.filter((a) => a.prioridade === 'alta').length,
    critica: atividades.filter((a) => a.prioridade === 'critica').length,
  }

  const tendenciaData = [6, 5, 4, 3, 2, 1, 0].map((daysAgo) => {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    const dateStr = d.toISOString().split('T')[0]
    const count = atividades.filter(
      (a) =>
        (a.status === 'concluida' || a.status === 'concluida_com_atraso') &&
        a.prazo.startsWith(dateStr),
    ).length
    return { data: dateStr, count }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe as métricas e o desempenho da equipe em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Concluídas"
          value={concluidas}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          colorClass="border-l-emerald-500"
          bgClass="bg-emerald-50 dark:bg-emerald-950/20"
        />
        <KpiCard
          title="Pendentes"
          value={pendentes}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          colorClass="border-l-blue-500"
          bgClass="bg-blue-50 dark:bg-blue-950/20"
        />
        <KpiCard
          title="Em Atraso"
          value={emAtraso}
          icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
          colorClass="border-l-amber-500"
          bgClass="bg-amber-50 dark:bg-amber-950/20"
        />
        <KpiCard
          title="Não Feitas"
          value={naoFeitas}
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          colorClass="border-l-red-500"
          bgClass="bg-red-50 dark:bg-red-950/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <RankingCard ranking={ranking} />
        </div>
        <div className="md:col-span-2 space-y-6">
          <TendenciaChart items={tendenciaData} />
          <PrioridadeChart counts={prioridades} />
        </div>
      </div>
    </div>
  )
}
