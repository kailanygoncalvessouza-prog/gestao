import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ListCheck, Key, Lock, Mail, Building, User as UserIcon } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Index() {
  const { signInGestor, signUpGestor, signInColaborador } = useAuth()
  const navigate = useNavigate()

  // Gestor State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingGestor, setLoadingGestor] = useState(false)

  // Sign Up Modal State
  const [signUpOpen, setSignUpOpen] = useState(false)
  const [suNome, setSuNome] = useState('')
  const [suEmpresa, setSuEmpresa] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [loadingSignUp, setLoadingSignUp] = useState(false)

  // Colaborador State
  const [token, setToken] = useState('')
  const [loadingColab, setLoadingColab] = useState(false)

  const handleGestorLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingGestor(true)
    const { error } = await signInGestor(email, password)
    setLoadingGestor(false)
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: 'Credenciais inválidas.',
        variant: 'destructive',
      })
    } else {
      navigate('/gestor/visao-geral')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingSignUp(true)
    const { error } = await signUpGestor({
      email: suEmail,
      password: suPassword,
      nome: suNome,
      empresa_nome: suEmpresa,
    })
    setLoadingSignUp(false)
    if (error) {
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Falha ao criar conta.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Conta de gestor criada com sucesso!' })
      setSignUpOpen(false)
      navigate('/gestor/visao-geral')
    }
  }

  const handleColaboradorLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingColab(true)
    const { error } = await signInColaborador(token)
    setLoadingColab(false)
    if (error) {
      toast({
        title: 'Acesso negado',
        description: 'Código inválido ou desativado. Fale com seu gestor.',
        variant: 'destructive',
      })
    } else {
      navigate('/colaborador/agenda')
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left panel gradient branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
            <ListCheck className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Gestão de Pessoas</span>
        </div>

        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight">
            Organize sua equipe, acompanhe tarefas e resultados.
          </h1>
          <p className="text-indigo-100 text-lg">
            Atribuição de atividades, acompanhamento por fotos em tempo real e ranking de
            pontualidade.
          </p>
        </div>

        <div className="text-xs text-indigo-200">
          © {new Date().getFullYear()} Gestão de Pessoas. Todos os direitos reservados.
        </div>
      </div>

      {/* Right login container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader className="text-center pb-4">
            <div className="lg:hidden flex justify-center mb-2">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <ListCheck className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Acesse a Plataforma</CardTitle>
            <CardDescription>Escolha o seu perfil para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gestor" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="gestor">Sou Gestor</TabsTrigger>
                <TabsTrigger value="colaborador">Sou Colaborador</TabsTrigger>
              </TabsList>

              <TabsContent value="gestor">
                <form onSubmit={handleGestorLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="gestor@empresa.com"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loadingGestor}>
                    {loadingGestor ? 'Entrando...' : 'Entrar como Gestor'}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setSignUpOpen(true)}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Criar nova conta de gestor
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="colaborador">
                <form onSubmit={handleColaboradorLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="token">Código de Acesso</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="token"
                        type="text"
                        placeholder="Ex: ABC12345"
                        className="pl-9 tracking-widest font-mono uppercase"
                        value={token}
                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Use o código fornecido pelo seu gestor.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loadingColab}>
                    {loadingColab ? 'Acessando...' : 'Acessar Minha Agenda'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sign Up Modal */}
      <Dialog open={signUpOpen} onOpenChange={setSignUpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Conta de Gestor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSignUp} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Nome Completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={suNome}
                  onChange={(e) => setSuNome(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Nome da Empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={suEmpresa}
                  onChange={(e) => setSuEmpresa(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  className="pl-9"
                  value={suEmail}
                  onChange={(e) => setSuEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-9"
                  value={suPassword}
                  onChange={(e) => setSuPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={loadingSignUp}>
              {loadingSignUp ? 'Criando...' : 'Cadastrar Gestor'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
