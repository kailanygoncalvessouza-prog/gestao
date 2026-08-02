import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getAtividadesGestor,
  createAtividade,
  updateAtividade,
  deleteAtividade,
} from '@/services/atividades'
import { getColaboradores } from '@/services/colaboradores'
import { getSetores } from '@/services/setores'
import {
  getChecklistByAtividade,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from '@/services/itens-checklist'
import { createRecorrencia, getRecorrenciasByAtividade } from '@/services/recorrencias'
import { Atividade, Colaborador, Setor, Priority, AttributionType } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AtividadeModal } from '@/components/atividades/AtividadeModal'
import { Plus, Camera, Trash2, Calendar, Clock, Pencil, UserCheck, Repeat } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import useRealtime from '@/hooks/use-realtime'

const priorityColor = (p: Priority) => {
  switch (p) {
    case 'critica':
      return 'border-l-red-500'
    case 'alta':
      return 'border-l-orange-500'
    case 'media':
      return 'border-l-amber-500'
    default:
      return 'border-l-blue-500'
  }
}

const atribuicaoLabel: Record<AttributionType, string> = {
  QUALQUER_UM: 'Qualquer um',
  SETOR: 'Setor',
  COLABORADOR: 'Individual',
}

export default function AtividadesPage() {
  const { user } = useAuth()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAtiv, setEditingAtiv] = useState<Atividade | null>(null)
  const [modalMode, setModalMode] = useState<'avulsa' | 'recorrente'>('avulsa')

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

  const handleSave = async (data: any) => {
    if (!user?.id || !user?.empresa_id) return
    const { checklist, recorrencia, ...ativData } = data

    let ativId: string
    if (editingAtiv) {
      await updateAtividade(editingAtiv.id, ativData)
      ativId = editingAtiv.id
      toast({ title: 'Atividade atualizada!' })
    } else {
      const newAtiv = await createAtividade({
        ...ativData,
        gestor_id: user.id,
        empresa_id: user.empresa_id,
        status: 'pendente',
      })
      ativId = newAtiv.id
      toast({ title: 'Atividade criada com sucesso!' })
    }

    const existingItems = await getChecklistByAtividade(ativId)
    const existingIds = existingItems.map((i) => i.id)
    const keptIds: string[] = []

    for (const item of checklist) {
      if (item.id) {
        await updateChecklistItem(item.id, {
          descricao: item.descricao,
          ordem: item.ordem,
        })
        keptIds.push(item.id)
      } else {
        const created = await createChecklistItem({
          atividade_id: ativId,
          descricao: item.descricao,
          ordem: item.ordem,
          feito: false,
          empresa_id: user.empresa_id,
        })
        keptIds.push(created.id)
      }
    }

    for (const oldId of existingIds) {
      if (!keptIds.includes(oldId)) {
        await deleteChecklistItem(oldId)
      }
    }

    if (recorrencia && !editingAtiv) {
      await createRecorrencia({
        ...recorrencia,
        atividade_id: ativId,
        ativa: true,
      })
    }

    setEditingAtiv(null)
    loadData()
  }

  const handleEdit = async (a: Atividade) => {
    setEditingAtiv(a)
    let mode: 'avulsa' | 'recorrente' = 'avulsa'
    if (a.recorrencia_origem) {
      mode = 'recorrente'
    } else {
      try {
        const recs = await getRecorrenciasByAtividade(a.id)
        if (recs.length > 0) mode = 'recorrente'
      } catch {
        /* intentionally ignored */
      }
    }
    setModalMode(mode)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteAtividade(id)
    toast({ title: 'Atividade excluída' })
    loadData()
  }

  const getAttributionTarget = (a: Atividade) => {
    if (a.atribuicao === 'SETOR') return a.expand?.setor_alvo_id?.nome || '—'
    if (a.atribuicao === 'COLABORADOR') return a.expand?.colaborador_alvo_id?.nome || '—'
    return 'Todos'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atividades</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre e distribua tarefas para a equipe.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditingAtiv(null)
              setModalMode('recorrente')
              setModalOpen(true)
            }}
            className="gap-2"
          >
            <Repeat className="h-4 w-4" /> Criar Recorrente
          </Button>
          <Button
            onClick={() => {
              setEditingAtiv(null)
              setModalMode('avulsa')
              setModalOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Nova Atividade
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {atividades.map((a) => (
          <Card key={a.id} className={`border-l-4 shadow-sm ${priorityColor(a.prioridade)}`}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base">{a.titulo}</h3>
                  {a.exige_foto && <Camera className="h-4 w-4 text-primary" />}
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {a.prioridade}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {atribuicaoLabel[a.atribuicao || 'QUALQUER_UM']}: {getAttributionTarget(a)}
                  </Badge>
                  {a.recorrencia_origem && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Repeat className="h-3 w-3" /> Recorrente
                    </Badge>
                  )}
                </div>
                {a.descricao && <p className="text-xs text-muted-foreground">{a.descricao}</p>}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {a.prazo}
                  </span>
                  {a.horario && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {a.horario}
                    </span>
                  )}
                  {a.concluida_por_id && a.expand?.concluida_por_id && (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <UserCheck className="h-3.5 w-3.5" /> Concluída por{' '}
                      {a.expand.concluida_por_id.nome}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Badge className="capitalize">{(a.status || 'pendente').replace('_', ' ')}</Badge>
                <Button size="icon" variant="ghost" onClick={() => handleEdit(a)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(a.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AtividadeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        colaboradores={colaboradores.filter((c) => c.token_ativo)}
        setores={setores}
        atividade={editingAtiv}
        mode={modalMode}
        onSave={handleSave}
      />
    </div>
  )
}
