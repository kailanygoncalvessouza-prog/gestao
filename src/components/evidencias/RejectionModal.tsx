import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface RejectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => Promise<void>
}

export function RejectionModal({ open, onOpenChange, onConfirm }: RejectionModalProps) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onConfirm(reason)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reprovar Evidência</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <p className="text-xs text-muted-foreground">
            Informe o motivo da reprovação para orientar o colaborador:
          </p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Ex: Foto tremida ou fora de enquadramento..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Reprovando...' : 'Confirmar Reprovação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
