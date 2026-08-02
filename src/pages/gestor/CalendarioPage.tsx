import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getAtividadesGestor } from '@/services/atividades'
import { Atividade } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrazo } from '@/lib/utils'

export default function CalendarioPage() {
  const { user } = useAuth()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    if (user?.empresa_id) {
      getAtividadesGestor(user.empresa_id)
        .then(setAtividades)
        .catch(() => {})
    }
  }, [user])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendário da Equipe</h1>
          <p className="text-sm text-muted-foreground">Visão mensal das atividades distribuídas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-muted-foreground mb-2">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-muted/10 rounded-lg" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayAtivs = atividades.filter((a) => a.prazo.startsWith(dateStr))
              const isToday = new Date().toISOString().startsWith(dateStr)

              return (
                <div
                  key={day}
                  className={`h-24 p-1.5 border rounded-lg flex flex-col justify-between ${
                    isToday ? 'bg-primary/5 border-primary font-bold' : 'bg-card'
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {day}
                  </span>
                  <div className="space-y-1 overflow-y-auto max-h-16">
                    {dayAtivs.map((a) => (
                      <div
                        key={a.id}
                        className="text-[10px] truncate p-1 rounded bg-primary/10 text-primary font-medium"
                        title={`${formatPrazo(a.prazo, a.horario)} — ${a.titulo}`}
                      >
                        {formatPrazo(a.prazo, a.horario)} {a.titulo}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
