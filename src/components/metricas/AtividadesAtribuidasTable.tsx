import { Atividade, Colaborador, Setor } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Download, Repeat } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'

function getDisplayStatus(a: Atividade): string {
  if (a.status === 'concluida' || a.status === 'concluida_com_atraso') return 'Concluído'
  if (a.prazo) {
    const today = new Date().toISOString().split('T')[0]
    if (a.prazo < today) return 'Em atraso'
  }
  return 'Pendente'
}

function getAttributionTarget(
  a: Atividade,
  colaboradores: Colaborador[],
  setores: Setor[],
): string {
  if (a.atribuicao === 'SETOR') {
    const setor = setores.find((s) => s.id === a.setor_alvo_id)
    return setor?.nome || '—'
  }
  if (a.atribuicao === 'COLABORADOR') {
    const colab = colaboradores.find((c) => c.id === (a.colaborador_alvo_id || a.colaborador_id))
    return colab?.nome || '—'
  }
  return 'Todos'
}

function getPrazoDisplay(a: Atividade): string {
  if (a.recorrencia_origem) return 'Recorrente'
  return a.prazo || '—'
}

const statusColor: Record<string, string> = {
  Pendente: 'bg-blue-100 text-blue-700',
  'Em atraso': 'bg-amber-100 text-amber-700',
  Concluído: 'bg-emerald-100 text-emerald-700',
}

interface Props {
  atividades: Atividade[]
  colaboradores: Colaborador[]
  setores: Setor[]
}

export function AtividadesAtribuidasTable({ atividades, colaboradores, setores }: Props) {
  const handleExport = () => {
    const headers = ['Atividade', 'Atribuição', 'Prazo', 'Status']
    const rows = atividades.map((a) => [
      a.titulo,
      getAttributionTarget(a, colaboradores, setores),
      getPrazoDisplay(a),
      getDisplayStatus(a),
    ])
    exportToExcel(headers, rows, 'atividades-atribuidas')
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">Atividades Atribuídas</CardTitle>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Exportar Excel
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atividade</TableHead>
              <TableHead>Atribuição</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atividades.map((a) => {
              const status = getDisplayStatus(a)
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.titulo}</TableCell>
                  <TableCell>{getAttributionTarget(a, colaboradores, setores)}</TableCell>
                  <TableCell>
                    {a.recorrencia_origem ? (
                      <span className="flex items-center gap-1 text-xs">
                        <Repeat className="h-3 w-3" /> {a.prazo}
                      </span>
                    ) : (
                      a.prazo || '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColor[status]}>
                      {status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
