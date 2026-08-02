import { useState } from 'react'
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
import { Colaborador } from '@/types'

interface ColaboradorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colaborador?: Colaborador | null
  onSave: (data: { nome: string; funcao: string; telefone: string }) => Promise<void>
}

export function ColaboradorModal({
  open,
  onOpenChange,
  colaborador,
  onSave,
}: ColaboradorModalProps) {
  const [nome, setNome] = useState(colaborador?.nome || '')
  const [funcao, setFuncao] = useState(colaborador?.funcao || '')
  const [telefone, setTelefone] = useState(colaborador?.telefone || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome) return
    setSaving(true)
    try {
      await onSave({ nome, funcao, telefone })
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
