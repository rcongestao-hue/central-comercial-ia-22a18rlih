import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  User,
  Company,
  CompanyUser,
  Role,
  CommercialAccount,
  Contact,
  Opportunity,
  Meeting,
  Activity,
  TimelineEvent,
  ProspectingDraft,
} from '@/types'
import { crmService } from '@/services/crm-service'
import { useToast } from '@/hooks/use-toast'

export interface CompanyData {
  accounts: CommercialAccount[]
  contacts: Contact[]
  opportunities: Opportunity[]
  meetings: Meeting[]
  activities: Activity[]
  timeline: TimelineEvent[]
  drafts: ProspectingDraft[]
}

interface AuthContextType {
  currentUser: User | null
  currentCompany: Company | null
  companyUser: CompanyUser | null
  userList: User[]
  companyUsersList: CompanyUser[]
  allCompanies: Company[]
  companyData: CompanyData
  isAuthenticated: boolean
  loading: boolean
  role: Role | null
  // Actions
  login: (email: string, senha?: string) => Promise<{ success: boolean; message?: string }>
  loginAsDemo: () => Promise<void>
  logout: () => void
  switchCompany: (companyId: string) => Promise<void>
  registerCompanyAndAdmin: (
    companyData: Partial<Company>,
    adminData: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>
  // User Management
  createUser: (userData: {
    nome: string
    email: string
    cargo?: string
    role?: Role
    senha?: string
  }) => Promise<boolean>
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
  // Company Management
  updateCurrentCompany: (updates: Partial<Company>) => Promise<void>
  // Scoped Data mutations
  updateCompanyData: (updater: (prev: CompanyData) => CompanyData) => void
  reloadAllData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null)
  const [userList, setUserList] = useState<User[]>([])
  const [companyUsersList, setCompanyUsersList] = useState<CompanyUser[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState<boolean>(true)
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

  // Load commercial data from PocketBase for given company
  const loadCompanyData = useCallback(async (companyId: string) => {
    if (!companyId) return
    try {
      const [accounts, contacts, opportunities, meetings, activities] = await Promise.all([
        crmService.getAccounts(companyId),
        crmService.getContacts(companyId),
        crmService.getOpportunities(companyId),
        crmService.getMeetings(companyId),
        crmService.getActivities(companyId),
      ])

      // Build timeline from activities & creation events
      const timeline: TimelineEvent[] = activities.map((act) => ({
        id: act.id,
        empresaId: companyId,
        contaId: act.account || '',
        contatoId: act.contact,
        tipo: (act.type as any) || 'outro',
        titulo: act.description || act.type,
        descricao: act.description || '',
        origem: (act.origin as any) || 'usuario',
        criadoEm: act.created || new Date().toISOString(),
      }))

      setCompanyData({
        accounts,
        contacts,
        opportunities,
        meetings,
        activities,
        timeline,
        drafts: [],
      })
    } catch (err) {
      console.error('Error loading company data:', err)
    }
  }, [])

  // Sync auth state and load user's company associations
  const initAuth = useCallback(async () => {
    setLoading(true)
    try {
      if (!pb.authStore.isValid || !pb.authStore.record) {
        setCurrentUser(null)
        setCurrentCompany(null)
        setCompanyUser(null)
        setLoading(false)
        return
      }

      const authRecord = pb.authStore.record

      // Fetch all company_users associations for this user
      const compUserRecords = await pb.collection('company_users').getFullList({
        filter: `user = '${authRecord.id}' && status = 'ativo'`,
        expand: 'company,user',
      })

      if (compUserRecords.length === 0) {
        // User has no company linked yet
        setCurrentUser({
          id: authRecord.id,
          empresaId: '',
          nome: authRecord.name || authRecord.email?.split('@')[0] || 'Usuário',
          email: authRecord.email || '',
          cargo: 'Executivo',
          role: 'executivo',
          ativo: true,
          criadoEm: authRecord.created,
        })
        setCurrentCompany(null)
        setCompanyUser(null)
        setLoading(false)
        return
      }

      // Check for saved company preference in localStorage (UI state only)
      const lastCompId = localStorage.getItem('central_ia_last_company_id')
      let activeCompUser = compUserRecords.find((cu) => cu.company === lastCompId)
      if (!activeCompUser) {
        activeCompUser = compUserRecords[0]
      }

      // Load all companies this user has access to
      const companiesList: Company[] = compUserRecords
        .map((cu) => cu.expand?.company)
        .filter(Boolean)
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          nome: c.name,
          slug: c.slug,
          segment: c.segment,
          region: c.region,
          brand_color: c.brand_color,
          created: c.created,
          updated: c.updated,
        }))

      setAllCompanies(companiesList)

      const compObj: Company = {
        id: activeCompUser.expand?.company?.id || activeCompUser.company,
        name: activeCompUser.expand?.company?.name || 'Minha Empresa',
        nome: activeCompUser.expand?.company?.name || 'Minha Empresa',
        slug: activeCompUser.expand?.company?.slug,
        segment: activeCompUser.expand?.company?.segment,
        region: activeCompUser.expand?.company?.region,
        brand_color: activeCompUser.expand?.company?.brand_color,
      }

      const activeCU: CompanyUser = {
        id: activeCompUser.id,
        company: compObj.id,
        user: authRecord.id,
        profile: activeCompUser.profile,
        status: activeCompUser.status,
        last_access: activeCompUser.last_access,
      }

      const uObj: User = {
        id: authRecord.id,
        empresaId: compObj.id,
        nome: authRecord.name || authRecord.email?.split('@')[0] || 'Usuário',
        email: authRecord.email || '',
        cargo: activeCompUser.profile === 'proprietario' ? 'Proprietário' : 'Executivo',
        role: activeCompUser.profile as any,
        ativo: true,
        criadoEm: authRecord.created,
      }

      setCurrentUser(uObj)
      setCurrentCompany(compObj)
      setCompanyUser(activeCU)

      // Fetch all company_users for current company
      try {
        const teamUsers = await pb.collection('company_users').getFullList({
          filter: `company = '${compObj.id}'`,
          expand: 'user',
        })
        setCompanyUsersList(teamUsers as any)
        const mappedUsers: User[] = teamUsers.map((tu: any) => ({
          id: tu.expand?.user?.id || tu.user,
          empresaId: compObj.id,
          nome: tu.expand?.user?.name || tu.expand?.user?.email?.split('@')[0] || 'Usuário',
          email: tu.expand?.user?.email || '',
          cargo: tu.profile,
          role: tu.profile,
          ativo: tu.status === 'ativo',
          criadoEm: tu.created,
        }))
        setUserList(mappedUsers)
      } catch (tErr) {
        console.error('Error fetching company users list:', tErr)
      }

      // Load company commercial data
      await loadCompanyData(compObj.id)
    } catch (err) {
      console.error('Error in initAuth:', err)
    } finally {
      setLoading(false)
    }
  }, [loadCompanyData])

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const login = async (email: string, senha?: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email.trim(), senha || '')
      if (authData && authData.record) {
        await initAuth()
        toast({
          title: 'Acesso realizado com sucesso',
          description: `Bem-vindo(a) à Central Comercial IA!`,
        })
        return { success: true }
      }
      return { success: false, message: 'Não foi possível autenticar.' }
    } catch (err: any) {
      console.error('Login error:', err)
      return {
        success: false,
        message: err?.message || 'E-mail ou senha incorretos. Verifique suas credenciais.',
      }
    }
  }

  const loginAsDemo = async () => {
    try {
      // Tenta login com a conta de demonstração inicial
      const res = await login('demo@aurorasolucoes.com', 'Skip@Pass123')
      if (!res.success) {
        // Fallback para admin inicial caso exista
        await login('rcongestao@gmail.com', 'Skip@Pass')
      }
    } catch (err) {
      console.error('Demo login error:', err)
      toast({
        title: 'Erro no login demo',
        description: 'Não foi possível entrar com a conta de demonstração.',
        variant: 'destructive',
      })
    }
  }

  const logout = () => {
    pb.authStore.clear()
    localStorage.removeItem('central_ia_last_company_id')
    setCurrentUser(null)
    setCurrentCompany(null)
    setCompanyUser(null)
    setCompanyData({
      accounts: [],
      contacts: [],
      opportunities: [],
      meetings: [],
      activities: [],
      timeline: [],
      drafts: [],
    })
    toast({
      title: 'Sessão encerrada',
      description: 'Você saiu da plataforma.',
    })
  }

  const switchCompany = async (companyId: string) => {
    if (!pb.authStore.record) return
    try {
      // Verify user has access to target company
      const compUsers = await pb.collection('company_users').getFullList({
        filter: `user = '${pb.authStore.record.id}' && company = '${companyId}' && status = 'ativo'`,
        expand: 'company,user',
      })

      if (compUsers.length === 0) {
        toast({
          title: 'Acesso não permitido',
          description: 'Você não tem vínculo ativo com esta empresa.',
          variant: 'destructive',
        })
        return
      }

      localStorage.setItem('central_ia_last_company_id', companyId)
      await initAuth()
      toast({
        title: 'Empresa alterada',
        description: 'Ambiente alternado com sucesso.',
      })
    } catch (err) {
      console.error('Error switching company:', err)
    }
  }

  const registerCompanyAndAdmin = async (
    companyInput: Partial<Company>,
    adminInput: Partial<User>,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      let authUser = pb.authStore.record

      // 1. If not authenticated, create user or login
      if (!authUser) {
        const userEmail = adminInput.email || ''
        const userPass = adminInput.senha || 'Skip@Pass123'
        const userName = adminInput.nome || 'Administrador'

        try {
          authUser = await pb.collection('users').create({
            email: userEmail,
            password: userPass,
            passwordConfirm: userPass,
            name: userName,
          })
          await pb.collection('users').authWithPassword(userEmail, userPass)
        } catch (uErr: any) {
          // If already exists, try logging in
          try {
            const loginRes = await pb.collection('users').authWithPassword(userEmail, userPass)
            authUser = loginRes.record
          } catch (_) {
            return {
              success: false,
              error: 'Erro ao criar usuário: ' + (uErr.message || 'Verifique os dados.'),
            }
          }
        }
      }

      if (!authUser) {
        return { success: false, error: 'Falha na autenticação do usuário.' }
      }

      // 2. Create Company
      const compName = companyInput.name || companyInput.nome || 'Nova Empresa'
      const compSlug =
        compName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 30) +
        '-' +
        Math.random().toString(36).substring(2, 6)

      const newCompany = await pb.collection('companies').create({
        name: compName,
        slug: compSlug,
        segment: companyInput.segment || companyInput.segmentosPrioritarios?.join(', ') || '',
        region: companyInput.region || companyInput.regiaoAtuacao || 'Brasil',
        brand_color: companyInput.brand_color || '#2563EB',
      })

      // 3. Create CompanyUser link as "proprietario"
      const newCompUser = await pb.collection('company_users').create({
        company: newCompany.id,
        user: authUser.id,
        profile: 'proprietario',
        status: 'ativo',
        last_access: new Date().toISOString(),
      })

      // 4. Save Onboarding Config
      try {
        await pb.collection('onboarding_config').create({
          company: newCompany.id,
          differentiators: companyInput.diferenciais || [],
          priority_segments: companyInput.segmentosPrioritarios || [],
          products_services: companyInput.produtosServicos || [],
          icp: {
            description: companyInput.perfilClienteIdeal || '',
            region: companyInput.regiaoAtuacao || 'Brasil',
          },
        })
      } catch (onbErr) {
        console.error('Error creating onboarding config:', onbErr)
      }

      localStorage.setItem('central_ia_last_company_id', newCompany.id)
      await initAuth()

      toast({
        title: 'Empresa cadastrada com sucesso!',
        description: `Seja bem-vindo(a) à Central Comercial IA, ${adminInput.nome || authUser.name}.`,
      })

      return { success: true }
    } catch (err: any) {
      console.error('Error in registerCompanyAndAdmin:', err)
      return { success: false, error: err?.message || 'Erro ao cadastrar empresa.' }
    }
  }

  const createUser = async (userData: {
    nome: string
    email: string
    cargo?: string
    role?: Role
    senha?: string
  }): Promise<boolean> => {
    if (!currentCompany || !companyUser) {
      toast({
        title: 'Erro',
        description: 'Empresa ativa não identificada.',
        variant: 'destructive',
      })
      return false
    }

    if (
      companyUser.profile !== 'proprietario' &&
      companyUser.profile !== 'administrador' &&
      companyUser.profile !== 'diretor_comercial'
    ) {
      toast({
        title: 'Permissão negada',
        description: 'Apenas Administradores e Proprietários podem adicionar membros.',
        variant: 'destructive',
      })
      return false
    }

    try {
      // Create invitation or user directly
      const inv = await crmService.createInvitation({
        company: currentCompany.id,
        email: userData.email,
        profile: (userData.role as any) || 'executivo',
        invited_by: companyUser.id,
        status: 'pendente',
      })

      toast({
        title: 'Convite criado com sucesso!',
        description: `Convite gerado para ${userData.email} com perfil ${(userData.role || 'executivo').toUpperCase()}.`,
      })

      await initAuth()
      return true
    } catch (err: any) {
      console.error('Error creating user/invitation:', err)
      toast({
        title: 'Erro ao convidar usuário',
        description: err?.message || 'Não foi possível cadastrar o usuário.',
        variant: 'destructive',
      })
      return false
    }
  }

  const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    if (!companyUser) return false

    // If updating role and user is self
    if (currentUser?.id === id && updates.role && updates.role !== currentUser.role) {
      toast({
        title: 'Operação bloqueada',
        description: 'Usuários não podem alterar o seu próprio perfil de acesso.',
        variant: 'destructive',
      })
      return false
    }

    try {
      // Find company_user record for this user
      const cuRecords = await pb.collection('company_users').getFullList({
        filter: `user = '${id}' && company = '${currentCompany?.id}'`,
      })

      if (cuRecords.length > 0) {
        const payload: any = {}
        if (updates.role) payload.profile = updates.role
        if (updates.ativo !== undefined) payload.status = updates.ativo ? 'ativo' : 'inativo'
        await pb.collection('company_users').update(cuRecords[0].id, payload)
      }

      await initAuth()
      toast({ title: 'Usuário atualizado com sucesso' })
      return true
    } catch (err: any) {
      console.error('Error updating user:', err)
      toast({
        title: 'Erro ao atualizar usuário',
        description: err?.message || 'Falha na atualização.',
        variant: 'destructive',
      })
      return false
    }
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    if (
      !companyUser ||
      (companyUser.profile !== 'proprietario' && companyUser.profile !== 'administrador')
    ) {
      toast({
        title: 'Permissão negada',
        description: 'Apenas Administradores podem remover membros da empresa.',
        variant: 'destructive',
      })
      return false
    }

    if (currentUser?.id === id) {
      toast({
        title: 'Operação inválida',
        description: 'Você não pode remover seu próprio acesso.',
        variant: 'destructive',
      })
      return false
    }

    try {
      const cuRecords = await pb.collection('company_users').getFullList({
        filter: `user = '${id}' && company = '${currentCompany?.id}'`,
      })

      if (cuRecords.length > 0) {
        await pb.collection('company_users').delete(cuRecords[0].id)
      }

      await initAuth()
      toast({
        title: 'Acesso cancelado',
        description: 'O usuário foi removido da empresa.',
      })
      return true
    } catch (err: any) {
      console.error('Error deleting user:', err)
      toast({
        title: 'Erro ao remover',
        description: err?.message,
        variant: 'destructive',
      })
      return false
    }
  }

  const updateCurrentCompany = async (updates: Partial<Company>) => {
    if (!currentCompany) return
    try {
      await pb.collection('companies').update(currentCompany.id, {
        name: updates.name || updates.nome,
        segment: updates.segment || updates.segmentosPrioritarios?.join(', '),
        region: updates.region || updates.regiaoAtuacao,
        brand_color: updates.brand_color,
      })

      // Also update onboarding_config if ICP or differentiators provided
      if (
        updates.diferenciais ||
        updates.segmentosPrioritarios ||
        updates.produtosServicos ||
        updates.perfilClienteIdeal
      ) {
        await crmService.saveOnboardingConfig(currentCompany.id, {
          differentiators: updates.diferenciais,
          priority_segments: updates.segmentosPrioritarios,
          products_services: updates.produtosServicos,
          icp: {
            description: updates.perfilClienteIdeal,
            region: updates.regiaoAtuacao,
          },
        })
      }

      await initAuth()
      toast({
        title: 'Dados da Empresa Atualizados',
        description: 'As alterações foram salvas com sucesso no banco de dados.',
      })
    } catch (err: any) {
      console.error('Error updating company:', err)
      toast({
        title: 'Erro ao atualizar empresa',
        description: err?.message,
        variant: 'destructive',
      })
    }
  }

  const updateCompanyData = (updater: (prev: CompanyData) => CompanyData) => {
    setCompanyData((prev) => updater(prev))
  }

  const reloadAllData = async () => {
    await initAuth()
  }

  const role = (companyUser?.profile as Role) || (currentUser?.role as Role) || null
  const isAuthenticated = pb.authStore.isValid && !!currentUser && !!currentCompany

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentCompany,
        companyUser,
        userList,
        companyUsersList,
        allCompanies,
        companyData,
        isAuthenticated,
        loading,
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
