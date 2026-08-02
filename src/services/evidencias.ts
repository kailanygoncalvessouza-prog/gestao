import pb from '@/lib/pocketbase/client'
import { Evidencia } from '@/types'

export const getEvidenciasGestor = (empresaId: string, statusFilter?: string) => {
  const parts: string[] = [`empresa_id = '${empresaId}'`]
  if (statusFilter && statusFilter !== 'TODAS') {
    parts.push(`status = '${statusFilter}'`)
  }
  return pb.collection('evidencias').getFullList<Evidencia>({
    filter: parts.join(' && '),
    expand: 'atividade_id,colaborador_id',
    sort: '-created',
  })
}

export const updateEvidenciaStatus = (id: string, status: 'APROVADA' | 'REPROVADA') =>
  pb.collection('evidencias').update<Evidencia>(id, { status })
