import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getAtividadesGestor, createAtividade, deleteAtividade } from '@/services/atividades'
import { getColaboradores } from '@/services/colaboradores'
import { Atividade, Colaborador, Priority } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AtividadeModal } from '@/components/atividades/AtividadeModal'
import { Plus, Camera, Trash2, Calendar, Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import useRealtime from '@/hooks/use-realtime'

export default function AtividadesPage() {
  const { user } = useAuth()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [modalOpen, setModalOpen] = useState(false)

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

  const handleCreate = async (data: any) => {
    if (!user?.id || !user?.empresa_id) return
    await createAtividade({ ...data, gestor_id: user.id, empresa_id: user.empresa_id })
    toast({ title: 'Atividade criada com sucesso!' })
    loadData()
  }

  const handleDelete = async (id: string) => {
    await deleteAtividade(id)
    toast({ title: 'Atividade excluída' })
    loadData()
  }

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atividades</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre e distribua tarefas para a equipe.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Atividade
        </Button>
      </div>

      <div className="space-y-3">
        {atividades.map((a) => (
          <Card key={a.id} className={`border-l-4 shadow-sm ${priorityColor(a.prioridade)}`}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">{a.titulo}</h3>
                  {a.exige_foto && <Camera className="h-4 w-4 text-primary" title="Exige Foto" />}
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {a.prioridade}
                  </Badge>
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
                  <span>
                    Resp: <strong>{a.expand?.colaborador_id?.nome || 'Não atribuído'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Badge className="capitalize">{a.status.replace('_', ' ')}</Badge>
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
        onSave={handleCreate}
      />
    </div>
  )
}
