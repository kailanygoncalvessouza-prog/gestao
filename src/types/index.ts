export type Priority = 'baixa' | 'media' | 'alta' | 'critica'
export type ActivityStatus =
  | 'pendente'
  | 'em_andamento'
  | 'concluida'
  | 'concluida_com_atraso'
  | 'nao_feita'
export type EvidenceStatus = 'PENDENTE' | 'APROVADA' | 'REPROVADA'
export type RecurrenceType = 'DIARIA' | 'SEMANAL' | 'MENSAL' | 'NENHUMA'
export type AttributionType = 'QUALQUER_UM' | 'SETOR' | 'COLABORADOR'

export interface Setor {
  id: string
  nome: string
  ordem?: number
  created: string
  updated: string
}

export interface Empresa {
  id: string
  nome: string
  created: string
  updated: string
}

export interface User {
  id: string
  email: string
  nome: string
  perfil: 'GESTOR'
  empresa_id: string
  avatar?: string
  created: string
  updated: string
}

export interface Colaborador {
  id: string
  empresa_id: string
  nome: string
  funcao?: string
  telefone?: string
  token_acesso: string
  token_ativo: boolean
  desativado_em?: string
  setor_id: string
  expand?: {
    setor_id?: Setor
  }
  created: string
  updated: string
}

export interface Atividade {
  id: string
  empresa_id: string
  gestor_id: string
  colaborador_id?: string
  titulo: string
  descricao?: string
  categoria?: string
  prioridade: Priority
  prazo: string
  horario?: string
  exige_foto: boolean
  status: ActivityStatus
  concluida_em?: string
  observacao?: string
  recorrencia_origem?: string
  atribuicao: AttributionType
  setor_alvo_id?: string
  colaborador_alvo_id?: string
  concluida_por_id?: string
  expand?: {
    colaborador_id?: Colaborador
    gestor_id?: User
    setor_alvo_id?: Setor
    colaborador_alvo_id?: Colaborador
    concluida_por_id?: Colaborador
  }
  created: string
  updated: string
}

export interface Evidencia {
  id: string
  atividade_id: string
  colaborador_id: string
  empresa_id?: string
  url_foto?: string
  localizacao_gps?: string
  status: EvidenceStatus
  enviada_em: string
  expand?: {
    atividade_id?: Atividade
    colaborador_id?: Colaborador
  }
  created: string
  updated: string
}

export interface Notificacao {
  id: string
  usuario_id?: string
  colaborador_id?: string
  tipo: 'PUSH' | 'WHATSAPP' | 'INAPP'
  mensagem: string
  lida: boolean
  enviada_em: string
  created: string
}

export interface ColaboradorSession {
  colaborador_id: string
  nome: string
  funcao?: string
  empresa_id: string
  empresa_nome?: string
  token: string
}

export interface Recorrencia {
  id: string
  frequencia: RecurrenceType
  dia_semana?: string[]
  dia_mes?: number
  ativa: boolean
  horario?: string
  atividade_id: string
  created: string
  updated: string
}

export interface ItemChecklist {
  id: string
  atividade_id: string
  descricao: string
  ordem: number
  feito: boolean
  marcado_por_id?: string
  marcado_em?: string
  empresa_id: string
  created: string
  updated: string
}
