import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getColaboradores,
  createColaborador,
  updateColaborador,
  toggleStatusColaborador,
  generateNewToken,
} from '@/services/colaboradores'
import { getSetores } from '@/services/setores'
import { Colaborador, Setor } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ColaboradorModal } from '@/components/colaboradores/ColaboradorModal'
import { TokenModal } from '@/components/colaboradores/TokenModal'
import { Plus, Search, Key, UserCheck, UserX, Pencil } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import useRealtime from '@/hooks/use-realtime'

export default function ColaboradoresPage() {
  const { user } = useAuth()
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [tokenModalOpen, setTokenModalOpen] = useState(false)
  const [selectedColab, setSelectedColab] = useState<Colaborador | null>(null)
  const [editingColab, setEditingColab] = useState<Colaborador | null>(null)

  const loadData = async () => {
    if (!user?.empresa_id) return
    try {
      const [list, sets] = await Promise.all([getColaboradores(user.empresa_id), getSetores()])
      setColaboradores(list)
      setSetores(sets)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('colaboradores', loadData)

  const handleSave = async (data: {
    nome: string
    funcao: string
    telefone: string
    setor_id: string
  }) => {
    if (!user?.empresa_id) return
    if (editingColab) {
      await updateColaborador(editingColab.id, data)
      toast({ title: 'Colaborador atualizado!' })
    } else {
      const newColab = await createColaborador({ ...data, empresa_id: user.empresa_id })
      toast({ title: 'Colaborador criado', description: 'Código de acesso gerado!' })
      setSelectedColab(newColab)
      setTokenModalOpen(true)
    }
    setEditingColab(null)
    loadData()
  }

  const handleToggleStatus = async (colab: Colaborador) => {
    await toggleStatusColaborador(colab.id, colab.token_ativo)
    toast({
      title: colab.token_ativo ? 'Colaborador desativado' : 'Colaborador ativado',
      description: colab.token_ativo ? 'O código foi revogado.' : 'Novo código gerado.',
    })
    loadData()
  }

  const filtered = colaboradores.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.funcao && c.funcao.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-sm text-muted-foreground">Gerencie a equipe e códigos de acesso.</p>
        </div>
        <Button
          onClick={() => {
            setEditingColab(null)
            setModalOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Colaborador
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou função..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-base">{c.nome}</h3>
                  <p className="text-xs text-muted-foreground">{c.funcao || 'Sem função'}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">
                    {c.expand?.setor_id?.nome || 'Sem setor'}
                  </Badge>
                </div>
                <Badge variant={c.token_ativo ? 'default' : 'secondary'}>
                  {c.token_ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              {c.telefone && (
                <p className="text-xs text-muted-foreground">WhatsApp: {c.telefone}</p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => {
                    setSelectedColab(c)
                    setTokenModalOpen(true)
                  }}
                >
                  <Key className="h-3.5 w-3.5" /> Ver Código
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingColab(c)
                    setModalOpen(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={c.token_ativo ? 'ghost' : 'outline'}
                  className={
                    c.token_ativo ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-600'
                  }
                  onClick={() => handleToggleStatus(c)}
                >
                  {c.token_ativo ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ColaboradorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        colaborador={editingColab}
        setores={setores}
        onSave={handleSave}
      />
      <TokenModal
        open={tokenModalOpen}
        onOpenChange={setTokenModalOpen}
        colaborador={selectedColab}
        onRegenerateToken={
          selectedColab
            ? async () => {
                const updated = await generateNewToken(selectedColab.id)
                setSelectedColab(updated)
                toast({ title: 'Novo código gerado!' })
              }
            : undefined
        }
      />
    </div>
  )
}
