import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface PrioridadeCounts {
  baixa: number
  media: number
  alta: number
  critica: number
}

export function PrioridadeChart({ counts }: { counts: PrioridadeCounts }) {
  const total = counts.baixa + counts.media + counts.alta + counts.critica || 1

  const items = [
    { label: 'Baixa', count: counts.baixa, color: 'bg-blue-500' },
    { label: 'Média', count: counts.media, color: 'bg-amber-500' },
    { label: 'Alta', count: counts.alta, color: 'bg-orange-500' },
    { label: 'Crítica', count: counts.critica, color: 'bg-red-500' },
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Distribuição por Prioridade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-4 rounded-full bg-muted flex overflow-hidden my-4">
          {items.map((item) => {
            const pct = (item.count / total) * 100
            if (pct === 0) return null
            return <div key={item.label} style={{ width: `${pct}%` }} className={item.color} />
          })}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              <span className="text-muted-foreground">{item.label}:</span>
              <span className="font-bold">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
