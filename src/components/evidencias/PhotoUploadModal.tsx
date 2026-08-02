import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Camera, Upload } from 'lucide-react'

interface PhotoUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (file: File, lgpdConsent: boolean, obs?: string) => Promise<void>
}

export function PhotoUploadModal({ open, onOpenChange, onSubmit }: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [lgpd, setLgpd] = useState(false)
  const [obs, setObs] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleFormSubmit = async () => {
    if (!selectedFile || !lgpd) return
    setSubmitting(true)
    try {
      await onSubmit(selectedFile, lgpd, obs)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Enviar Comprovação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="border-2 border-dashed rounded-xl p-4 text-center hover:bg-muted/50 transition-colors">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 rounded-lg mx-auto object-cover"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 text-xs"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                  }}
                >
                  Trocar foto
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Tirar ou selecionar foto</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Observação (opcional)</label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
              placeholder="Ex: Limpeza finalizada..."
            />
          </div>

          <div className="flex items-start gap-2 pt-2 border-t">
            <Checkbox
              id="lgpd"
              checked={lgpd}
              onCheckedChange={(c) => setLgpd(!!c)}
              className="mt-0.5"
            />
            <label
              htmlFor="lgpd"
              className="text-xs text-muted-foreground leading-tight cursor-pointer"
            >
              Autorizo o uso da imagem como comprovação de execução, conforme a LGPD.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleFormSubmit} disabled={!selectedFile || !lgpd || submitting}>
            {submitting ? 'Enviando...' : 'Enviar Evidência'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
