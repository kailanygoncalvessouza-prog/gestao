import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Colaborador, Priority, Setor, AttributionType, Atividade } from '@/types'

interface AtividadeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colaboradores: Colaborador[]
  setores: Setor[]
  atividade?: Atividade | null
  onSave: (data: any) => Promise<void>
}

export function AtividadeModal({
  open,
  onOpenChange,
  colaboradores,
  setores,
  atividade,
  onSave,
}: AtividadeModalProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [prioridade, setPrioridade] = useState<Priority>('media')
  const [prazo, setPrazo] = useState(new Date().toISOString().split('T')[0])
  const [horario, setHorario] = useState('09:00')
  const [exigeFoto, setExigeFoto] = useState(false)
  const [atribuicao, setAtribuicao] = useState<AttributionType>('QUALQUER_UM')
  const [setorAlvoId, setSetorAlvoId] = useState('')
  const [colabAlvoId, setColabAlvoId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (atividade) {
      setTitulo(atividade.titulo)
      setDescricao(atividade.descricao || '')
      setCategoria(atividade.categoria || '')
      setPrioridade(atividade.prioridade)
      setPrazo(atividade.prazo)
      setHorario(atividade.horario || '09:00')
      setExigeFoto(atividade.exige_foto)
      setAtribuicao(atividade.atribuicao || 'QUALQUER_UM')
      setSetorAlvoId(atividade.setor_alvo_id || '')
      setColabAlvoId(atividade.colaborador_alvo_id || atividade.colaborador_id || '')
    } else {
      setTitulo('')
      setDescricao('')
      setCategoria('')
      setPrioridade('media')
      setPrazo(new Date().toISOString().split('T')[0])
      setHorario('09:00')
      setExigeFoto(false)
      setAtribuicao('QUALQUER_UM')
      setSetorAlvoId('')
      setColabAlvoId('')
    }
  }, [atividade, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo || !prazo) return
    if (atribuicao === 'SETOR' && !setorAlvoId) return
    if (atribuicao === 'COLABORADOR' && !colabAlvoId) return
    setSaving(true)
    try {
      const data: any = {
        titulo,
        descricao,
        categoria,
        prioridade,
        prazo,
        horario,
        exige_foto: exigeFoto,
        atribuicao,
        setor_alvo_id: null,
        colaborador_alvo_id: null,
        colaborador_id: null,
      }
      if (atribuicao === 'SETOR') data.setor_alvo_id = setorAlvoId
      if (atribuicao === 'COLABORADOR') {
        data.colaborador_alvo_id = colabAlvoId
        data.colaborador_id = colabAlvoId
      }
      await onSave(data)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{atividade ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Ex: Limpeza de vidros"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={prioridade} onValueChange={(v) => setPrioridade(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Input
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: Manutenção"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Atribuição *</Label>
            <Select value={atribuicao} onValueChange={(v) => setAtribuicao(v as AttributionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QUALQUER_UM">Qualquer um</SelectItem>
                <SelectItem value="SETOR">Setor específico</SelectItem>
                <SelectItem value="COLABORADOR">Colaborador específico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {atribuicao === 'SETOR' && (
            <div className="space-y-1.5">
              <Label>Setor *</Label>
              <Select value={setorAlvoId} onValueChange={setSetorAlvoId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor..." />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {atribuicao === 'COLABORADOR' && (
            <div className="space-y-1.5">
              <Label>Colaborador *</Label>
              <Select value={colabAlvoId} onValueChange={setColabAlvoId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data Prazo *</Label>
              <Input
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Horário Limite</Label>
              <Input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
            <div>
              <p className="text-sm font-medium">Exigir foto de comprovação</p>
              <p className="text-xs text-muted-foreground">
                O colaborador precisará enviar foto ao concluir
              </p>
            </div>
            <Switch checked={exigeFoto} onCheckedChange={setExigeFoto} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : atividade ? 'Salvar' : 'Criar Atividade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
