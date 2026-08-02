import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getAtividadesGestor } from '@/services/atividades'
import { getColaboradores } from '@/services/colaboradores'
import { Atividade, Colaborador } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'

export default function MetricasPage() {
  const { user } = useAuth()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])

  useEffect(() => {
    if (user?.empresa_id) {
      Promise.all([getAtividadesGestor(user.empresa_id), getColaboradores(user.empresa_id)])
        .then(([ativs, colabs]) => {
          setAtividades(ativs)
          setColaboradores(colabs)
        })
        .catch(() => {})
    }
  }, [user])

  const metrics = colaboradores.map((c) => {
    const colabAtivs = atividades.filter((a) => a.colaborador_id === c.id)
    const concluidasprazo = colabAtivs.filter((a) => a.status === 'concluida').length
    const concluidasAtraso = colabAtivs.filter((a) => a.status === 'concluida_com_atraso').length
    const total = colabAtivs.length
    const pctCumprimento =
      total > 0 ? Math.round(((concluidasprazo + concluidasAtraso) / total) * 100) : 100
    const pctPontualidade =
      concluidasprazo + concluidasAtraso > 0
        ? Math.round((concluidasprazo / (concluidasprazo + concluidasAtraso)) * 100)
        : 100

    return {
      nome: c.nome,
      funcao: c.funcao || '-',
      total,
      concluidasprazo,
      concluidasAtraso,
      pctCumprimento,
      pctPontualidade,
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Métricas e Desempenho</h1>
        <p className="text-sm text-muted-foreground">
          Relatório consolidado de tarefas por colaborador.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Tabela de Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-center">Total Tarefas</TableHead>
                <TableHead className="text-center">No Prazo</TableHead>
                <TableHead className="text-center">Com Atraso</TableHead>
                <TableHead className="text-center">Cumprimento %</TableHead>
                <TableHead className="text-center">Pontualidade %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((m, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold">{m.nome}</TableCell>
                  <TableCell>{m.funcao}</TableCell>
                  <TableCell className="text-center">{m.total}</TableCell>
                  <TableCell className="text-center text-emerald-600 font-medium">
                    {m.concluidasprazo}
                  </TableCell>
                  <TableCell className="text-center text-amber-600 font-medium">
                    {m.concluidasAtraso}
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
