import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Award, Trophy } from 'lucide-react'

interface ColabRank {
  id: string
  nome: string
  concluidas: number
  total: number
  pct: number
}

export function RankingCard({ ranking }: { ranking: ColabRank[] }) {
  const getMedal = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-amber-500 fill-amber-500" />
    if (index === 1) return <Award className="h-4 w-4 text-slate-400 fill-slate-400" />
    if (index === 2) return <Award className="h-4 w-4 text-amber-700 fill-amber-700" />
    return (
      <span className="text-xs font-bold text-muted-foreground w-4 text-center">#{index + 1}</span>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Ranking de Cumprimento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ranking.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhum colaborador cadastrado
          </p>
        ) : (
          ranking.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6">{getMedal(idx)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold truncate">{item.nome}</span>
                  <span className="font-bold text-primary">{item.pct}%</span>
                </div>
                <Progress value={item.pct} className="h-2" />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
