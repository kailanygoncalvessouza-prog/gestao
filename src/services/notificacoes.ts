import pb from '@/lib/pocketbase/client'
import { Notificacao } from '@/types'

export const getNotificacoesGestor = (userId: string) =>
  pb.collection('notificacoes').getFullList<Notificacao>({
    filter: `usuario_id = '${userId}'`,
    sort: '-enviada_em',
  })

export const markNotificacaoGestorRead = (id: string) =>
  pb.collection('notificacoes').update(id, { lida: true })

export const getNotificacoesColaborador = (token: string) =>
  pb.send(`/backend/v1/colaborador/notificacoes?token=${token}`, { method: 'GET' })

export const markNotificacaoColaboradorRead = (id: string, token: string) =>
  pb.send(`/backend/v1/colaborador/notificacoes/${id}/lida`, {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: { 'Content-Type': 'application/json' },
  })
