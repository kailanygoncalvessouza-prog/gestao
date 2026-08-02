import pb from '@/lib/pocketbase/client'
import { Recorrencia } from '@/types'

export const createRecorrencia = (data: Partial<Recorrencia>) =>
  pb.collection('recorrencias').create<Recorrencia>(data)

export const updateRecorrencia = (id: string, data: Partial<Recorrencia>) =>
  pb.collection('recorrencias').update<Recorrencia>(id, data)

export const getRecorrenciasByAtividade = (atividadeId: string) =>
  pb.collection('recorrencias').getFullList<Recorrencia>({
    filter: `atividade_id = '${atividadeId}'`,
  })
