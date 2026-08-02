import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { ColaboradorSession } from '@/types'

interface AuthContextType {
  user: any
  colaborador: ColaboradorSession | null
  role: 'GESTOR' | 'COLABORADOR' | null
  isAuthenticated: boolean
  loading: boolean
  signInGestor: (email: string, password: string) => Promise<{ error: any }>
  signUpGestor: (data: {
    email: string
    password: string
    nome: string
    empresa_nome: string
  }) => Promise<{ error: any }>
  signInColaborador: (token: string) => Promise<{ error: any }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [colaborador, setColaborador] = useState<ColaboradorSession | null>(() => {
    const saved = localStorage.getItem('gestao_colaborador_session')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
    })

    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const role: 'GESTOR' | 'COLABORADOR' | null = user ? 'GESTOR' : colaborador ? 'COLABORADOR' : null
  const isAuthenticated = !!(user || colaborador)

  const signInGestor = async (email: string, password: string) => {
    try {
      localStorage.removeItem('gestao_colaborador_session')
      setColaborador(null)
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signUpGestor = async (data: {
    email: string
    password: string
    nome: string
    empresa_nome: string
  }) => {
    try {
      await pb.send('/backend/v1/gestor/signup', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      })
      return await signInGestor(data.email, data.password)
    } catch (error) {
      return { error }
    }
  }

  const signInColaborador = async (token: string) => {
    try {
      pb.authStore.clear()
      setUser(null)
      const res: ColaboradorSession = await pb.send('/backend/v1/colaborador/login', {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: { 'Content-Type': 'application/json' },
      })
      localStorage.setItem('gestao_colaborador_session', JSON.stringify(res))
      setColaborador(res)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
    localStorage.removeItem('gestao_colaborador_session')
    setUser(null)
    setColaborador(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        colaborador,
        role,
        isAuthenticated,
        loading,
        signInGestor,
        signUpGestor,
        signInColaborador,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
