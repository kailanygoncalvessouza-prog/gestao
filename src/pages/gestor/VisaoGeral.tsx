import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getAtividadesGestor } from '@/services/atividades'
import { getColaboradores } from '@/services/colaboradores'
import { getSetores } from '@/services/setores'
import { Atividade, Colaborador, Setor } from '@/types'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { RankingCard } from '@/components/dashboard/RankingCard'
import { TendenciaChart } from '@/components/dashboard/TendenciaChart'
import { PrioridadeChart } from '@/components/dashboard/PrioridadeChart'
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AtividadesAtribuidasTable } from '@/components/metricas/AtividadesAtribuidasTable'
import useRealtime from '@/hooks/use-realtime'

export default function VisaoGeral() {
  const { user } = useAuth()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [nivel, setNivel] = useState('individual')

  const loadData = async () => {
    if (!user?.empresa_id) return
    try {
      const [ativs, colabs, sets] = await Promise.all([
        getAtividadesGestor(user.empresa_id),
        getColaboradores(user.empresa_id),
        getSetores(),
      ])
      setAtividades(ativs)
      setColaboradores(colabs)
      setSetores(sets)
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

  const individualRanking = colaboradores
    .map((c) => {
      const colabAtivs = atividades.filter(
        (a) =>
          a.colaborador_alvo_id === c.id ||
          a.colaborador_id === c.id ||
          a.atribuicao === 'QUALQUER_UM',
      )
      const conc = colabAtivs.filter(
        (a) => a.status === 'concluida' || a.status === 'concluida_com_atraso',
      ).length
      const total = colabAtivs.length
      return {
        id: c.id,
        nome: c.nome,
        concluidas: conc,
        total,
        pct: total > 0 ? Math.round((conc / total) * 100) : 100,
      }
    })
    .sort((a, b) => b.pct - a.pct)

  const setorRanking = setores
    .map((s) => {
      const colabIds = colaboradores.filter((c) => c.setor_id === s.id).map((c) => c.id)
      const setorAtivs = atividades.filter(
        (a) =>
          a.atribuicao === 'QUALQUER_UM' ||
          (a.atribuicao === 'SETOR' && a.setor_alvo_id === s.id) ||
          (a.atribuicao === 'COLABORADOR' &&
            a.colaborador_alvo_id &&
            colabIds.includes(a.colaborador_alvo_id)),
      )
      const conc = setorAtivs.filter(
        (a) => a.status === 'concluida' || a.status === 'concluida_com_atraso',
      ).length
      const total = setorAtivs.length
      return {
        id: s.id,
        nome: s.nome,
        concluidas: conc,
        total,
        pct: total > 0 ? Math.round((conc / total) * 100) : 100,
      }
    })
    .filter((s) => s.total > 0)
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

      <AtividadesAtribuidasTable
        atividades={atividades}
        colaboradores={colaboradores}
        setores={setores}
      />

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

      <Tabs value={nivel} onValueChange={setNivel}>
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="setor">Setor</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <RankingCard ranking={nivel === 'individual' ? individualRanking : setorRanking} />
        </div>
        <div className="md:col-span-2 space-y-6">
          <TendenciaChart items={tendenciaData} />
          <PrioridadeChart counts={prioridades} />
        </div>
      </div>
    </div>
  )
}
