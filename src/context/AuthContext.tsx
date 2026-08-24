import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User, Company, Role } from '@/types'
import { storageService, CompanyData, buildDemoCompanyData } from '@/services/storage'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  currentUser: User | null
  currentCompany: Company | null
  userList: User[]
  allCompanies: Company[]
  companyData: CompanyData
  isAuthenticated: boolean
  role: Role | null
  // Actions
  login: (email: string, senha?: string) => { success: boolean; message?: string }
  loginAsDemo: () => void
  logout: () => void
  switchCompany: (companyId: string) => void
  registerCompanyAndAdmin: (
    companyData: Partial<Company>,
    adminData: Partial<User>,
  ) => { success: boolean }
  // Multi-user management (Admin only)
  createUser: (user: Omit<User, 'id' | 'empresaId' | 'criadoEm'>) => boolean
  updateUser: (id: string, updates: Partial<User>) => boolean
  deleteUser: (id: string) => boolean
  // Company management
  updateCurrentCompany: (updates: Partial<Company>) => void
  // Scoped Data mutations
  updateCompanyData: (updater: (prev: CompanyData) => CompanyData) => void
  reloadAllData: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [userList, setUserList] = useState<User[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [companyData, setCompanyData] = useState<CompanyData>({
    accounts: [],
    contacts: [],
    opportunities: [],
    meetings: [],
    activities: [],
    timeline: [],
    drafts: [],
  })
  const { toast } = useToast()

  const loadStateFromStorage = useCallback(() => {
    const session = storageService.getSession()
    const users = storageService.getUsers()
    const companies = storageService.getCompanies()

    setUserList(users)
    setAllCompanies(companies)

    if (session) {
      const foundUser = users.find((u) => u.id === session.userId)
      const foundCompany = companies.find((c) => c.id === session.companyId)

      if (foundUser && foundCompany) {
        setCurrentUser(foundUser)
        setCurrentCompany(foundCompany)
        const data = storageService.getCompanyData(foundCompany.id)
        setCompanyData(data)
        return
      }
    }

    // Default: if no session or invalid, don't auto log in unless demo requested
    setCurrentUser(null)
    setCurrentCompany(null)
  }, [])

  useEffect(() => {
    loadStateFromStorage()
  }, [loadStateFromStorage])

  const login = (email: string, senha?: string) => {
    const users = storageService.getUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())

    if (!user) {
      return { success: false, message: 'Usuário não encontrado. Verifique o e-mail informado.' }
    }

    if (user.senha && senha && user.senha !== senha) {
      return { success: false, message: 'Senha incorreta.' }
    }

    if (!user.ativo) {
      return {
        success: false,
        message: 'Usuário inativo. Entre em contato com o administrador da empresa.',
      }
    }

    const companies = storageService.getCompanies()
    const company = companies.find((c) => c.id === user.empresaId)

    if (!company) {
      return { success: false, message: 'Empresa associada a este usuário não foi localizada.' }
    }

    storageService.setSession(user.id, company.id)
    setCurrentUser(user)
    setCurrentCompany(company)
    const data = storageService.getCompanyData(company.id)
    setCompanyData(data)

    toast({
      title: 'Acesso realizado com sucesso',
      description: `Bem-vindo(a), ${user.nome} (${company.nome})`,
    })

    return { success: true }
  }

  const loginAsDemo = () => {
    storageService.resetToDemo()
    loadStateFromStorage()
    toast({
      title: 'Ambiente de Demonstração Carregado',
      description: 'Conectado como Carlos Mendes (Admin) na empresa Aurora Soluções.',
    })
  }

  const logout = () => {
    storageService.clearSession()
    setCurrentUser(null)
    setCurrentCompany(null)
    toast({
      title: 'Sessão encerrada',
      description: 'Você saiu da plataforma.',
    })
  }

  const switchCompany = (companyId: string) => {
    const companies = storageService.getCompanies()
    const targetComp = companies.find((c) => c.id === companyId)
    if (!targetComp) return

    // Find first user of this company or adapt current
    const users = storageService.getUsers()
    let compUser = users.find((u) => u.empresaId === companyId)

    if (!compUser && currentUser) {
      // Create user link for this company
      compUser = {
        ...currentUser,
        id: `usr_${Date.now()}`,
        empresaId: companyId,
        role: 'admin',
      }
      storageService.addUser(compUser)
    }

    if (compUser) {
      storageService.setSession(compUser.id, targetComp.id)
      setCurrentUser(compUser)
      setCurrentCompany(targetComp)
      const data = storageService.getCompanyData(targetComp.id)
      setCompanyData(data)
      toast({
        title: 'Empresa alterada',
        description: `Ambiente ativo: ${targetComp.nome}`,
      })
    }
  }

  const registerCompanyAndAdmin = (companyInput: Partial<Company>, adminInput: Partial<User>) => {
    const newCompanyId = `comp_${Date.now()}`
    const newUserId = `usr_${Date.now()}`

    const newCompany: Company = {
      id: newCompanyId,
      nome: companyInput.nome || 'Nova Empresa Comercial',
      nomeFantasia: companyInput.nomeFantasia || companyInput.nome || '',
      segmentosPrioritarios: companyInput.segmentosPrioritarios || ['B2B Geral'],
      produtosServicos: companyInput.produtosServicos || ['Soluções Empresariais'],
      perfilClienteIdeal: companyInput.perfilClienteIdeal || 'Empresas B2B em crescimento',
      diferenciais: companyInput.diferenciais || ['Atendimento consultivo'],
      regiaoAtuacao: companyInput.regiaoAtuacao || 'Brasil',
      criadoEm: new Date().toISOString(),
    }

    const newAdmin: User = {
      id: newUserId,
      empresaId: newCompanyId,
      nome: adminInput.nome || 'Administrador',
      email: adminInput.email || 'admin@empresa.com',
      senha: adminInput.senha || '123456',
      cargo: adminInput.cargo || 'Diretor Comercial',
      role: 'admin',
      ativo: true,
      criadoEm: new Date().toISOString(),
    }

    storageService.addCompany(newCompany)
    storageService.addUser(newAdmin)
    storageService.setSession(newUserId, newCompanyId)

    setCurrentUser(newAdmin)
    setCurrentCompany(newCompany)
    setCompanyData(storageService.getCompanyData(newCompanyId))
    setAllCompanies(storageService.getCompanies())
    setUserList(storageService.getUsers())

    toast({
      title: 'Empresa cadastrada com sucesso!',
      description: `Seja bem-vindo(a) à Central Comercial IA, ${newAdmin.nome}.`,
    })

    return { success: true }
  }

  const createUser = (userData: Omit<User, 'id' | 'empresaId' | 'criadoEm'>): boolean => {
    if (!currentCompany || !currentUser || currentUser.role !== 'admin') {
      toast({
        title: 'Permissão negada',
        description: 'Apenas Administradores podem cadastrar novos usuários.',
        variant: 'destructive',
      })
      return false
    }

    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      empresaId: currentCompany.id,
      ativo: true,
      criadoEm: new Date().toISOString(),
    }

    storageService.addUser(newUser)
    setUserList(storageService.getUsers())

    toast({
      title: 'Usuário cadastrado',
      description: `${newUser.nome} (${newUser.cargo}) adicionado(a) com perfil ${newUser.role.toUpperCase()}.`,
    })
    return true
  }

  const updateUser = (id: string, updates: Partial<User>): boolean => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== id)) {
      toast({
        title: 'Ação não permitida',
        description: 'Você não tem permissão para alterar este usuário.',
        variant: 'destructive',
      })
      return false
    }

    // Protect self privilege escalation: non-admin cannot change their own role
    if (
      currentUser.id === id &&
      currentUser.role !== 'admin' &&
      updates.role &&
      updates.role !== currentUser.role
    ) {
      toast({
        title: 'Operação bloqueada',
        description: 'Usuários não podem alterar os próprios privilégios.',
        variant: 'destructive',
      })
      return false
    }

    storageService.updateUser(id, updates)
    const updatedUsers = storageService.getUsers()
    setUserList(updatedUsers)

    if (currentUser.id === id) {
      const me = updatedUsers.find((u) => u.id === id)
      if (me) setCurrentUser(me)
    }

    toast({
      title: 'Usuário atualizado com sucesso',
    })
    return true
  }

  const deleteUser = (id: string): boolean => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast({
        title: 'Permissão negada',
        description: 'Apenas Administradores podem remover usuários.',
        variant: 'destructive',
      })
      return false
    }

    if (currentUser.id === id) {
      toast({
        title: 'Operação inválida',
        description: 'Você não pode excluir o próprio usuário ativo.',
        variant: 'destructive',
      })
      return false
    }

    storageService.deleteUser(id)
    setUserList(storageService.getUsers())
    toast({
      title: 'Usuário removido',
      description: 'O acesso do usuário à empresa foi cancelado.',
    })
    return true
  }

  const updateCurrentCompany = (updates: Partial<Company>) => {
    if (!currentCompany || !currentUser || currentUser.role !== 'admin') {
      toast({
        title: 'Permissão negada',
        description: 'Apenas Administradores podem alterar os dados institucionais da empresa.',
        variant: 'destructive',
      })
      return
    }

    storageService.updateCompany(currentCompany.id, updates)
    const updated = { ...currentCompany, ...updates }
    setCurrentCompany(updated)
    setAllCompanies(storageService.getCompanies())
    toast({
      title: 'Dados da Empresa Atualizados',
      description: 'As novas diretrizes e diferenciais foram salvos e já alimentam a IA.',
    })
  }

  const updateCompanyData = (updater: (prev: CompanyData) => CompanyData) => {
    if (!currentCompany) return
    setCompanyData((prev) => {
      const next = updater(prev)
      storageService.saveCompanyData(currentCompany.id, next)
      return next
    })
  }

  const reloadAllData = () => {
    loadStateFromStorage()
  }

  const role = currentUser?.role || null
  const isAuthenticated = !!currentUser && !!currentCompany

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentCompany,
        userList: userList.filter((u) => u.empresaId === currentCompany?.id),
        allCompanies,
        companyData,
        isAuthenticated,
        role,
        login,
        loginAsDemo,
        logout,
        switchCompany,
        registerCompanyAndAdmin,
        createUser,
        updateUser,
        deleteUser,
        updateCurrentCompany,
        updateCompanyData,
        reloadAllData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
