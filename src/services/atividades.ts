import pb from '@/lib/pocketbase/client'
import { Atividade } from '@/types'

const EXPAND = 'colaborador_id,gestor_id,colaborador_alvo_id,setor_alvo_id,concluida_por_id'

export const getAtividadesGestor = (
  empresaId: string,
  filters?: { status?: string; colaborador_id?: string },
) => {
  const parts: string[] = [`empresa_id = '${empresaId}'`]
  if (filters?.status) parts.push(`status = '${filters.status}'`)
  if (filters?.colaborador_id) parts.push(`colaborador_id = '${filters.colaborador_id}'`)
  return pb.collection('atividades').getFullList<Atividade>({
    filter: parts.join(' && '),
    expand: EXPAND,
    sort: '-created',
  })
}

export const createAtividade = (data: Partial<Atividade>) =>
  pb.collection('atividades').create<Atividade>(data)

export const updateAtividade = (id: string, data: Partial<Atividade>) =>
  pb.collection('atividades').update<Atividade>(id, data)

export const deleteAtividade = (id: string) => pb.collection('atividades').delete(id)

export const getColaboradorAgenda = (token: string, tipo: string = 'GERAL') =>
  pb.send('/backend/v1/colaborador/agenda', {
    method: 'GET',
    query: { token, tipo },
  })

export const updateColaboradorStatus = (atividadeId: string, token: string, status: string) =>
  pb.send(`/backend/v1/colaborador/atividades/${atividadeId}/status`, {
    method: 'POST',
    body: { token, status },
  })

export const submitColaboradorEvidencia = (
  atividadeId: string,
  token: string,
  file: File,
  consentimento: boolean,
  localizacao: string,
  observacao?: string,
) => {
  const formData = new FormData()
  formData.append('token', token)
  formData.append('consentimento', String(consentimento))
  formData.append('localizacao', localizacao)
  if (observacao) formData.append('observacao', observacao)
  formData.append('foto', file)

  return pb.send(`/backend/v1/colaborador/atividades/${atividadeId}/evidencia`, {
    method: 'POST',
    body: formData,
  })
}
