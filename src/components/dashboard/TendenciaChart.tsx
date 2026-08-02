import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface TendenciaData {
  data: string
  count: number
}

export function TendenciaChart({ items }: { items: TendenciaData[] }) {
  const maxCount = Math.max(...items.map((i) => i.count), 5)
  const height = 120
  const width = 300

  const points = items
    .map((item, idx) => {
      const x = (idx / (items.length - 1 || 1)) * width
      const y = height - (item.count / maxCount) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Tendência de Entregas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-36">
            <polyline
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            {items.map((item, idx) => {
              const x = (idx / (items.length - 1 || 1)) * width
              const y = height - (item.count / maxCount) * height
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="4" className="fill-primary stroke-background stroke-2" />
                  <text
                    x={x}
                    y={height + 15}
                    fontSize="9"
                    textAnchor="middle"
                    className="fill-muted-foreground"
                  >
                    {item.data.slice(5)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
