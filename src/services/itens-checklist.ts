import pb from '@/lib/pocketbase/client'
import { ItemChecklist } from '@/types'

export const getChecklistByAtividade = (atividadeId: string) =>
  pb.collection('itens_checklist').getFullList<ItemChecklist>({
    filter: `atividade_id = '${atividadeId}'`,
    sort: 'ordem',
  })

export const createChecklistItem = (data: Partial<ItemChecklist>) =>
  pb.collection('itens_checklist').create<ItemChecklist>(data)

export const updateChecklistItem = (id: string, data: Partial<ItemChecklist>) =>
  pb.collection('itens_checklist').update<ItemChecklist>(id, data)

export const deleteChecklistItem = (id: string) => pb.collection('itens_checklist').delete(id)

export const getColaboradorChecklist = (atividadeId: string, token: string) =>
  pb.send(`/backend/v1/colaborador/atividades/${atividadeId}/checklist`, {
    method: 'GET',
    query: { token },
  })

export const toggleColaboradorChecklistItem = (itemId: string, token: string, feito: boolean) =>
  pb.send(`/backend/v1/colaborador/checklist/${itemId}/toggle`, {
    method: 'POST',
    body: { token, feito },
  })
