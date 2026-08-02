import pb from '@/lib/pocketbase/client'
import { Evidencia } from '@/types'

export const getEvidenciasGestor = (statusFilter?: string) => {
  let filter = ''
  if (statusFilter && statusFilter !== 'TODAS') {
    filter = `status = '${statusFilter}'`
  }
  return pb.collection('evidencias').getFullList<Evidencia>({
    filter,
    expand: 'atividade_id,colaborador_id',
    sort: '-created',
  })
}

export const updateEvidenciaStatus = (id: string, status: 'APROVADA' | 'REPROVADA') =>
  pb.collection('evidencias').update<Evidencia>(id, { status })
