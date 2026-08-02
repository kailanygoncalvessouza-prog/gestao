import pb from '@/lib/pocketbase/client'
import { Atividade } from '@/types'

export const getAtividadesGestor = (empresaId: string, filterStr?: string) => {
  let filter = `empresa_id = '${empresaId}'`
  if (filterStr) filter += ` && (${filterStr})`
  return pb.collection('atividades').getFullList<Atividade>({
    filter,
    expand: 'colaborador_id',
    sort: '-prazo,horario',
  })
}

export const createAtividade = (data: Partial<Atividade>) =>
  pb.collection('atividades').create<Atividade>(data)

export const updateAtividade = (id: string, data: Partial<Atividade>) =>
  pb.collection('atividades').update<Atividade>(id, data)

export const deleteAtividade = (id: string) => pb.collection('atividades').delete(id)

export const getColaboradorAgenda = (token: string, dateStr?: string) => {
  const query = new URLSearchParams({ token })
  if (dateStr) query.append('data', dateStr)
  return pb.send(`/backend/v1/colaborador/agenda?${query.toString()}`, { method: 'GET' })
}

export const updateColaboradorStatus = (
  id: string,
  token: string,
  status: string,
  observacao?: string,
) =>
  pb.send(`/backend/v1/colaborador/atividades/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ token, status, observacao }),
    headers: { 'Content-Type': 'application/json' },
  })

export const submitColaboradorEvidencia = async (
  id: string,
  token: string,
  fotoFile: File,
  consentimento: boolean,
  localizacao?: string,
  observacao?: string,
) => {
  const formData = new FormData()
  formData.append('token', token)
  formData.append('consentimento', String(consentimento))
  formData.append('foto', fotoFile)
  if (localizacao) formData.append('localizacao', localizacao)
  if (observacao) formData.append('observacao', observacao)

  return pb.send(`/backend/v1/colaborador/atividades/${id}/evidencia`, {
    method: 'POST',
    body: formData,
  })
}
