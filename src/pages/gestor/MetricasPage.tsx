import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getAtividadesGestor } from '@/services/atividades'
import { getColaboradores } from '@/services/colaboradores'
import { getSetores } from '@/services/setores'
import { Atividade, Colaborador, Setor } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MetricasPage() {
  const { user } = useAuth()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [nivel, setNivel] = useState('individual')

  useEffect(() => {
    if (user?.empresa_id) {
      Promise.all([
        getAtividadesGestor(user.empresa_id),
        getColaboradores(user.empresa_id),
        getSetores(),
      ])
        .then(([ativs, colabs, sets]) => {
          setAtividades(ativs)
          setColaboradores(colabs)
          setSetores(sets)
        })
        .catch(() => {})
    }
  }, [user])

  const individualMetrics = colaboradores.map((c) => {
    const colabAtivs = atividades.filter(
      (a) =>
        a.colaborador_alvo_id === c.id ||
        a.colaborador_id === c.id ||
        a.atribuicao === 'QUALQUER_UM',
    )
    const noPrazo = colabAtivs.filter((a) => a.status === 'concluida').length
    const comAtraso = colabAtivs.filter((a) => a.status === 'concluida_com_atraso').length
    const total = colabAtivs.length
    return {
      nome: c.nome,
      funcao: c.funcao || '-',
      total,
      noPrazo,
      comAtraso,
      pctCumprimento: total > 0 ? Math.round(((noPrazo + comAtraso) / total) * 100) : 100,
      pctPontualidade:
        noPrazo + comAtraso > 0 ? Math.round((noPrazo / (noPrazo + comAtraso)) * 100) : 100,
    }
  })

  const setorMetrics = setores
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
      const noPrazo = setorAtivs.filter((a) => a.status === 'concluida').length
      const comAtraso = setorAtivs.filter((a) => a.status === 'concluida_com_atraso').length
      const total = setorAtivs.length
      return {
        nome: s.nome,
        funcao: `${colabIds.length} colaboradores`,
        total,
        noPrazo,
        comAtraso,
        pctCumprimento: total > 0 ? Math.round(((noPrazo + comAtraso) / total) * 100) : 100,
        pctPontualidade:
          noPrazo + comAtraso > 0 ? Math.round((noPrazo / (noPrazo + comAtraso)) * 100) : 100,
      }
    })
    .filter((s) => s.total > 0)

  const metrics = nivel === 'individual' ? individualMetrics : setorMetrics

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Métricas e Desempenho</h1>
        <p className="text-sm text-muted-foreground">
          Relatório consolidado de tarefas por {nivel === 'individual' ? 'colaborador' : 'setor'}.
        </p>
      </div>

      <Tabs value={nivel} onValueChange={setNivel}>
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="setor">Setor</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Tabela de Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{nivel === 'individual' ? 'Colaborador' : 'Setor'}</TableHead>
                <TableHead>{nivel === 'individual' ? 'Função' : 'Equipe'}</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">No Prazo</TableHead>
                <TableHead className="text-center">Com Atraso</TableHead>
                <TableHead className="text-center">Cumprimento</TableHead>
                <TableHead className="text-center">Pontualidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((m, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold">{m.nome}</TableCell>
                  <TableCell>{m.funcao}</TableCell>
                  <TableCell className="text-center">{m.total}</TableCell>
                  <TableCell className="text-center text-emerald-600 font-medium">
                    {m.noPrazo}
                  </TableCell>
                  <TableCell className="text-center text-amber-600 font-medium">
                    {m.comAtraso}
                  </TableCell>
                  <TableCell className="text-center font-bold">{m.pctCumprimento}%</TableCell>
                  <TableCell className="text-center font-bold">{m.pctPontualidade}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
