import { useState, useEffect, useRef } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { getColaboradorChecklist, toggleColaboradorChecklistItem } from '@/services/itens-checklist'
import { ItemChecklist } from '@/types'
import { ListChecks } from 'lucide-react'

interface ChecklistListProps {
  atividadeId: string
  token: string
  onAllCheckedChange: (allChecked: boolean) => void
}

export function ChecklistList({ atividadeId, token, onAllCheckedChange }: ChecklistListProps) {
  const [items, setItems] = useState<ItemChecklist[]>([])
  const [loading, setLoading] = useState(true)
  const callbackRef = useRef(onAllCheckedChange)
  callbackRef.current = onAllCheckedChange

  const loadItems = async () => {
    try {
      const res = await getColaboradorChecklist(atividadeId, token)
      setItems(res.items || [])
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [atividadeId])

  useEffect(() => {
    if (items.length === 0) {
      callbackRef.current(true)
    } else {
      callbackRef.current(items.every((i) => i.feito))
    }
  }, [items])

  const handleToggle = async (item: ItemChecklist) => {
    const newFeito = !item.feito
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, feito: newFeito } : i)))
    try {
      await toggleColaboradorChecklistItem(item.id, token, newFeito)
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, feito: !newFeito } : i)))
    }
  }

  if (loading || items.length === 0) return null

  return (
    <div className="space-y-1.5 pt-2 border-t">
      <p className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
        <ListChecks className="h-3.5 w-3.5" /> Checklist
      </p>
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Checkbox
            checked={item.feito}
            onCheckedChange={() => handleToggle(item)}
            className="h-4 w-4"
          />
          <span className={`text-sm ${item.feito ? 'line-through text-muted-foreground' : ''}`}>
            {item.descricao}
          </span>
        </div>
      ))}
    </div>
  )
}
