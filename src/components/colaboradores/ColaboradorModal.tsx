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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Colaborador, Setor } from '@/types'

interface ColaboradorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colaborador?: Colaborador | null
  setores: Setor[]
  onSave: (data: {
    nome: string
    funcao: string
    telefone: string
    setor_id: string
  }) => Promise<void>
}

export function ColaboradorModal({
  open,
  onOpenChange,
  colaborador,
  setores,
  onSave,
}: ColaboradorModalProps) {
  const [nome, setNome] = useState('')
  const [funcao, setFuncao] = useState('')
  const [telefone, setTelefone] = useState('')
  const [setorId, setSetorId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (colaborador) {
      setNome(colaborador.nome)
      setFuncao(colaborador.funcao || '')
      setTelefone(colaborador.telefone || '')
      setSetorId(colaborador.setor_id || '')
    } else {
      setNome('')
      setFuncao('')
      setTelefone('')
      setSetorId('')
    }
  }, [colaborador, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !setorId) return
    setSaving(true)
    try {
      await onSave({ nome, funcao, telefone, setor_id: setorId })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="setor">Setor *</Label>
            <Select value={setorId} onValueChange={setSetorId} required>
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
          <div className="space-y-1.5">
            <Label htmlFor="funcao">Função / Cargo</Label>
            <Input
              id="funcao"
              value={funcao}
              onChange={(e) => setFuncao(e.target.value)}
              placeholder="Ex: Recepcionista"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telefone">Telefone (WhatsApp)</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 98765-4321"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
