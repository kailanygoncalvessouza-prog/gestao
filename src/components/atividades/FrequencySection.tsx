import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RecurrenceType } from '@/types'

interface FrequencySectionProps {
  frequencia: RecurrenceType
  onFrequenciaChange: (v: RecurrenceType) => void
  diaSemana: string
  onDiaSemanaChange: (v: string) => void
  diaMes: number | ''
  onDiaMesChange: (v: number | '') => void
  horario: string
  onHorarioChange: (v: string) => void
}

export function FrequencySection({
  frequencia,
  onFrequenciaChange,
  diaSemana,
  onDiaSemanaChange,
  diaMes,
  onDiaMesChange,
  horario,
  onHorarioChange,
}: FrequencySectionProps) {
  return (
    <div className="space-y-3 p-3 border rounded-lg bg-primary/5">
      <div>
        <p className="text-sm font-medium">Frequência</p>
        <p className="text-xs text-muted-foreground">Define a repetição da atividade</p>
      </div>
      <div className="space-y-1.5">
        <Label>Tipo de recorrência *</Label>
        <Select value={frequencia} onValueChange={(v) => onFrequenciaChange(v as RecurrenceType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DIARIA">Diária</SelectItem>
            <SelectItem value="SEMANAL">Semanal</SelectItem>
            <SelectItem value="MENSAL">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {frequencia === 'SEMANAL' && (
        <div className="space-y-1.5">
          <Label>Dia da semana *</Label>
          <Select value={diaSemana} onValueChange={onDiaSemanaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dom">Domingo</SelectItem>
              <SelectItem value="seg">Segunda</SelectItem>
              <SelectItem value="ter">Terça</SelectItem>
              <SelectItem value="qua">Quarta</SelectItem>
              <SelectItem value="qui">Quinta</SelectItem>
              <SelectItem value="sex">Sexta</SelectItem>
              <SelectItem value="sab">Sábado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {frequencia === 'MENSAL' && (
        <div className="space-y-1.5">
          <Label>Dia do mês *</Label>
          <Input
            type="number"
            min={1}
            max={31}
            value={diaMes}
            onChange={(e) => onDiaMesChange(e.target.value === '' ? '' : parseInt(e.target.value))}
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Horário *</Label>
        <Input type="time" value={horario} onChange={(e) => onHorarioChange(e.target.value)} />
      </div>
    </div>
  )
}
