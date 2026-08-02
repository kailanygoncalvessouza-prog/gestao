import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, ListChecks } from 'lucide-react'

export interface ChecklistItemInput {
  id?: string
  descricao: string
  ordem: number
}

interface ChecklistEditorProps {
  items: ChecklistItemInput[]
  onChange: (items: ChecklistItemInput[]) => void
}

export function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
  const handleAdd = () => {
    onChange([...items, { descricao: '', ordem: items.length + 1 }])
  }

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index).map((item, i) => ({ ...item, ordem: i + 1 })))
  }

  const handleChange = (index: number, descricao: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, descricao } : item)))
  }

  return (
    <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium flex items-center gap-1.5">
            <ListChecks className="h-4 w-4" /> Checklist
          </p>
          <p className="text-xs text-muted-foreground">Itens que o colaborador deve conferir</p>
        </div>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
          <Input
            value={item.descricao}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder="Ex: Fechar caixa"
            className="h-8 text-sm"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => handleRemove(index)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="gap-1.5 w-full"
      >
        <Plus className="h-3.5 w-3.5" /> Adicionar item
      </Button>
    </div>
  )
}
