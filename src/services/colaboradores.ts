import pb from '@/lib/pocketbase/client'
import { Colaborador } from '@/types'

export const getColaboradores = (empresaId: string) =>
  pb.collection('colaboradores').getFullList<Colaborador>({
    filter: `empresa_id = '${empresaId}'`,
    expand: 'setor_id',
    sort: 'nome',
  })

export const createColaborador = async (data: {
  empresa_id: string
  nome: string
  funcao?: string
  telefone?: string
  setor_id: string
}) => {
  const token = Math.random().toString(36).substring(2, 10).toUpperCase()
  return pb.collection('colaboradores').create<Colaborador>({
    ...data,
    token_acesso: token,
    token_ativo: true,
  })
}

export const updateColaborador = (id: string, data: Partial<Colaborador>) =>
  pb.collection('colaboradores').update<Colaborador>(id, data)

export const toggleStatusColaborador = async (id: string, currentStatus: boolean) => {
  const newStatus = !currentStatus
  const updateData: Partial<Colaborador> = { token_ativo: newStatus }
  if (!newStatus) {
    updateData.desativado_em = new Date().toISOString()
  } else {
    updateData.token_acesso = Math.random().toString(36).substring(2, 10).toUpperCase()
  }
  return pb.collection('colaboradores').update<Colaborador>(id, updateData)
}

export const generateNewToken = (id: string) => {
  const token = Math.random().toString(36).substring(2, 10).toUpperCase()
  return pb.collection('colaboradores').update<Colaborador>(id, {
    token_acesso: token,
    token_ativo: true,
  })
}
