import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getColaboradorAgenda,
  updateColaboradorStatus,
  submitColaboradorEvidencia,
} from '@/services/atividades'
import { Atividade } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PhotoUploadModal } from '@/components/evidencias/PhotoUploadModal'
import { ChecklistList } from '@/components/colaborador/ChecklistList'
import { Check, Camera, Clock, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function AgendaPage() {
  const { colaborador } = useAuth()
  const [geralAtivs, setGeralAtivs] = useState<Atividade[]>([])
  const [setorAtivs, setSetorAtivs] = useState<Atividade[]>([])
  const [individualAtivs, setIndividualAtivs] = useState<Atividade[]>([])
  const [selectedAtiv, setSelectedAtiv] = useState<Atividade | null>(null)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('geral')
  const [checklistReady, setChecklistReady] = useState<Record<string, boolean>>({})

  const loadData = async () => {
    if (!colaborador?.token) return
    try {
      const [geral, setor, individual] = await Promise.all([
        getColaboradorAgenda(colaborador.token, 'GERAL'),
        getColaboradorAgenda(colaborador.token, 'SETOR'),
        getColaboradorAgenda(colaborador.token, 'INDIVIDUAL'),
      ])
      setGeralAtivs(geral.atividades || [])
      setSetorAtivs(setor.atividades || [])
      setIndividualAtivs(individual.atividades || [])
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [colaborador])

  const handleComplete = async (ativ: Atividade) => {
    if (!colaborador?.token) return
    if (ativ.exige_foto) {
      setSelectedAtiv(ativ)
      setPhotoModalOpen(true)
    } else {
      try {
        await updateColaboradorStatus(ativ.id, colaborador.token, 'concluida')
        toast({ title: 'Atividade concluída com sucesso!' })
        loadData()
      } catch (error) {
        toast({ title: 'Erro', description: getErrorMessage(error), variant: 'destructive' })
      }
    }
  }

  const handlePhotoSubmit = async (file: File, lgpdConsent: boolean, obs?: string) => {
    if (!colaborador?.token || !selectedAtiv) return
    try {
      await submitColaboradorEvidencia(
        selectedAtiv.id,
        colaborador.token,
        file,
        lgpdConsent,
        '',
        obs,
      )
      toast({ title: 'Comprovação enviada para análise!' })
      setSelectedAtiv(null)
      loadData()
    } catch (error) {
      toast({ title: 'Erro', description: getErrorMessage(error), variant: 'destructive' })
    }
  }

  const allAtivs = [...geralAtivs, ...setorAtivs, ...individualAtivs]
  const concluidasCount = allAtivs.filter(
    (a) => a.status === 'concluida' || a.status === 'concluida_com_atraso',
  ).length
  const pct = allAtivs.length > 0 ? Math.round((concluidasCount / allAtivs.length) * 100) : 100

  const renderList = (ativs: Atividade[]) => (
    <div className="space-y-3">
      {ativs.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma atividade nesta seção.
        </p>
      )}
      {ativs.map((a) => (
        <Card key={a.id} className="shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-semibold text-base ${a.status === 'concluida' ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {a.titulo}
                  </h3>
                  {a.exige_foto && <Camera className="h-4 w-4 text-primary" />}
                </div>
                {a.descricao && <p className="text-xs text-muted-foreground">{a.descricao}</p>}
                {a.horario && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {a.horario}
                  </p>
                )}
              </div>
              {a.status === 'pendente' ? (
                <Button
                  size="sm"
                  onClick={() => handleComplete(a)}
                  className="gap-1"
                  disabled={checklistReady[a.id] === false}
                >
                  <Check className="h-4 w-4" /> Concluir
                </Button>
              ) : (
                <Badge variant="outline" className="capitalize">
                  {a.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
            {a.status === 'pendente' && (
              <ChecklistList
                atividadeId={a.id}
                token={colaborador?.token || ''}
                onAllCheckedChange={(allChecked) =>
                  setChecklistReady((prev) => ({ ...prev, [a.id]: allChecked }))
                }
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Olá, {colaborador?.nome}!</h1>
        <p className="text-sm text-muted-foreground">Sua agenda de atividades para hoje.</p>
      </div>

      <Card className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <p className="text-xs opacity-80 uppercase tracking-wider font-semibold">
            Progresso do Dia
          </p>
          <p className="text-3xl font-extrabold mt-1">{pct}%</p>
          <p className="text-xs opacity-90 mt-1">
            {concluidasCount} de {allAtivs.length} tarefas concluídas
          </p>
        </div>
        <CheckCircle className="h-12 w-12 opacity-80" />
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="setor">Setor</TabsTrigger>
          <TabsTrigger value="individual">Individual</TabsTrigger>
        </TabsList>
        <TabsContent value="geral" className="mt-4">
          {renderList(geralAtivs)}
        </TabsContent>
        <TabsContent value="setor" className="mt-4">
          {renderList(setorAtivs)}
        </TabsContent>
        <TabsContent value="individual" className="mt-4">
          {renderList(individualAtivs)}
        </TabsContent>
      </Tabs>

      <PhotoUploadModal
        open={photoModalOpen}
        onOpenChange={setPhotoModalOpen}
        onSubmit={handlePhotoSubmit}
      />
    </div>
  )
}
