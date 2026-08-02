import { useState, useEffect } from 'react'
import { getEvidenciasGestor, updateEvidenciaStatus } from '@/services/evidencias'
import { Evidencia } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RejectionModal } from '@/components/evidencias/RejectionModal'
import { Check, X, Camera, MapPin } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function EvidenciasPage() {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([])
  const [rejectingEvid, setRejectingEvid] = useState<Evidencia | null>(null)

  const loadData = async () => {
    try {
      const list = await getEvidenciasGestor()
      setEvidencias(list)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApprove = async (id: string) => {
    await updateEvidenciaStatus(id, 'APROVADA')
    toast({ title: 'Evidência aprovada!' })
    loadData()
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingEvid) return
    await updateEvidenciaStatus(rejectingEvid.id, 'REPROVADA')
    toast({ title: 'Evidência reprovada' })
    setRejectingEvid(null)
    loadData()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fila de Evidências</h1>
        <p className="text-sm text-muted-foreground">
          Analise as fotos enviadas pelos colaboradores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidencias.map((e) => {
          const photoUrl = e.url_foto ? pb.files.getURL(e, e.url_foto) : null
          return (
            <Card key={e.id} className="shadow-sm overflow-hidden">
              <div className="h-48 bg-slate-100 dark:bg-slate-900 relative flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Comprovação" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-12 w-12 text-muted-foreground/30" />
                )}
                <Badge className="absolute top-2 right-2">{e.status}</Badge>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm">
                    {e.expand?.atividade_id?.titulo || 'Atividade'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Por: {e.expand?.colaborador_id?.nome}
                  </p>
                </div>

                {e.localizacao_gps && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> {e.localizacao_gps}
                  </p>
                )}

                {e.status === 'PENDENTE' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApprove(e.id)}
                    >
                      <Check className="h-4 w-4" /> Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 gap-1"
                      onClick={() => setRejectingEvid(e)}
                    >
                      <X className="h-4 w-4" /> Reprovar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <RejectionModal
        open={!!rejectingEvid}
        onOpenChange={(open) => !open && setRejectingEvid(null)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  )
}
