import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Key, Copy, Check } from 'lucide-react'
import { Colaborador } from '@/types'

interface TokenModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colaborador: Colaborador | null
  onRegenerateToken?: () => void
}

export function TokenModal({
  open,
  onOpenChange,
  colaborador,
  onRegenerateToken,
}: TokenModalProps) {
  const [copied, setCopied] = useState(false)

  if (!colaborador) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(colaborador.token_acesso)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Código de Acesso
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Envie este código para <strong>{colaborador.nome}</strong> acessar o aplicativo:
          </p>
          <div className="p-4 rounded-xl bg-muted font-mono text-2xl font-bold tracking-widest text-primary border flex items-center justify-center gap-3">
            {colaborador.token_acesso}
          </div>
          <Button onClick={handleCopy} className="w-full gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado!' : 'Copiar Código'}
          </Button>
          {onRegenerateToken && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={onRegenerateToken}
            >
              Gerar novo código
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
