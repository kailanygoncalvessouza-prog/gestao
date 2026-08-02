import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: number
  icon: ReactNode
  colorClass: string
  bgClass: string
}

export function KpiCard({ title, value, icon, colorClass, bgClass }: KpiCardProps) {
  return (
    <Card
      className={cn('border-l-4 shadow-sm transition-all duration-300 hover:shadow-md', colorClass)}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl text-card-foreground', bgClass)}>{icon}</div>
      </CardContent>
    </Card>
  )
}
