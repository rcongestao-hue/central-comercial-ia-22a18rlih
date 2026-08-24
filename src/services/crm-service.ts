import pb from '@/lib/pocketbase/client'
import {
  CommercialAccount,
  Contact,
  Opportunity,
  Meeting,
  Activity,
  Product,
  Company,
  CompanyUser,
  Team,
  TeamMember,
  Invitation,
  OnboardingConfig,
  Notification,
} from '@/types'

// Map PB record to CommercialAccount with backwards compatibility
export function mapAccount(record: any): CommercialAccount {
  return {
    id: record.id,
    company: record.company,
    empresaId: record.company,
    responsible: record.responsible,
    responsavelComercialId: record.responsible || '',
    team: record.team,
    razao_social: record.razao_social || '',
    razaoSocial: record.razao_social || '',
    nome_fantasia: record.nome_fantasia || '',
    nomeFantasia: record.nome_fantasia || record.razao_social || '',
    cnpj: record.cnpj || '',
    site: record.site || '',
    segmento: record.segmento || 'Geral',
    localizacao: record.localizacao || '',
    endereco: record.endereco || '',
    logradouro: record.logradouro || '',
    numero: record.numero || '',
    complemento: record.complemento || '',
    bairro: record.bairro || '',
    cidade: record.cidade || '',
    estado: record.estado || '',
    cep: record.cep || '',
    cnaePrincipal: record.cnaePrincipal || '',
    telefone: record.telefone || '',
    email: record.email || '',
    situacaoCadastral: record.situacaoCadastral || '',
    porte: record.porte,
    linkedin: record.linkedin || '',
    linkedinInstitucional: record.linkedin || '',
    etapa: record.etapa || 'conta_identificada',
    etapaAtual: (record.etapa || 'conta_identificada') as any,
    ultima_atividade: record.ultima_atividade || record.updated,
    ultimaAtividade: record.ultima_atividade || record.updated,
    proximo_passo: record.proximo_passo || '',
    proximoPasso: record.proximo_passo || '',
    observacoes: record.observacoes || '',
    icp_score: record.icp_score || 0,
    icp_classification: record.icp_classification || 'Média',
    ai_summary: record.ai_summary || '',
    ai_hypotheses: record.ai_hypotheses || [],
    ai_pending_points: record.ai_pending_points || [],
    ai_confirmed_info: record.ai_confirmed_info || [],
    sources: record.sources || [],
    identification_status: record.identification_status || 'pendente_validacao',
    iaAnalysis: record.ai_summary
      ? {
          resumoExecutivo: record.ai_summary,
          aderenciaIcp: (record.icp_classification as any) || 'Média',
          scoreIcp: record.icp_score || 70,
          necessidadesSugeridas: [],
          perguntasComerciais: [],
          hipoteses: Array.isArray(record.ai_hypotheses) ? record.ai_hypotheses : [],
          dadosNaoConfirmados: Array.isArray(record.ai_pending_points)
            ? record.ai_pending_points
            : [],
          geradoEm: record.updated || record.created,
        }
      : undefined,
    created: record.created,
    updated: record.updated,
    criadoEm: record.created,
    atualizadoEm: record.updated,
    expand: record.expand,
  }
}

export function mapContact(record: any): Contact {
  return {
    id: record.id,
    company: record.company,
    empresaId: record.company,
    account: record.account,
    contaId: record.account,
    name: record.name,
    nome: record.name,
    cargo: record.cargo || '',
    area: record.area || '',
    email: record.email || '',
    telefone: record.telefone || '',
    linkedin: record.linkedin || '',
    classificacao: record.classificacao || 'Decisor',
    origem_relacionamento: record.origem_relacionamento || '',
    origemRelacionamento: record.origem_relacionamento || '',
    relacao_executivo: record.relacao_executivo || '',
    relacaoComExecutivo: record.relacao_executivo || '',
    observacoes: record.observacoes || '',
    created: record.created,
    updated: record.updated,
    criadoEm: record.created,
  }
}

export function mapOpportunity(record: any): Opportunity {
  return {
    id: record.id,
    company: record.company,
    empresaId: record.company,
    account: record.account,
    contaId: record.account,
    contact: record.contact,
    contatoId: record.contact,
    responsible: record.responsible,
    responsavelId: record.responsible || '',
    titulo: record.proximo_passo || 'Oportunidade Comercial',
    etapa: record.etapa || 'Conta identificada',
    valor_estimado: record.valor_estimado || 0,
    valorEstimado: record.valor_estimado || 0,
    prazo: record.prazo,
    prazoEstimado: record.prazo,
    proximo_passo: record.proximo_passo || '',
    proximaAcao: record.proximo_passo || '',
    motivo_perda: record.motivo_perda || '',
    historico: record.historico || [],
    created: record.created,
    updated: record.updated,
    criadoEm: record.created,
    atualizadoEm: record.updated,
    expand: record.expand,
  }
}

export function mapMeeting(record: any): Meeting {
  return {
    id: record.id,
    company: record.company,
    empresaId: record.company,
    account: record.account,
    contaId: record.account,
    title: record.title || 'Reunião',
    titulo: record.title || 'Reunião',
    date: record.date,
    dataHora: record.date
      ? record.time
        ? `${record.date.split(' ')[0]}T${record.time}`
        : record.date
      : '',
    duracaoMinutos: 45,
    tipo: 'reuniao',
    time: record.time || '',
    participants: Array.isArray(record.participants) ? record.participants : [],
    notes: record.notes || '',
    anotacoes: record.notes || '',
    ai_summary: record.ai_summary || '',
    resumoIa: record.ai_summary || '',
    next_steps: record.next_steps || '',
    proximaAtividade: record.next_steps || '',
    status: record.status || 'agendada',
    created: record.created,
    updated: record.updated,
    criadoEm: record.created,
  }
}

export function mapActivity(record: any): Activity {
  return {
    id: record.id,
    company: record.company,
    empresaId: record.company,
    account: record.account,
    contaId: record.account,
    contact: record.contact,
    user: record.user,
    responsavelId: record.user || '',
    type: record.type,
    tipo: record.type,
    titulo: record.description || record.type,
    description: record.description || '',
    origin: record.origin || 'usuario',
    metadata: record.metadata || {},
    status: 'pendente',
    created: record.created,
    criadoEm: record.created,
  }
}

export const crmService = {
  // Accounts
  async getAccounts(companyId: string): Promise<CommercialAccount[]> {
    if (!companyId) return []
    try {
      const records = await pb.collection('commercial_accounts').getFullList({
        filter: `company = '${companyId}'`,
        sort: '-created',
        expand: 'responsible,team',
      })
      return records.map(mapAccount)
    } catch (err) {
      console.error('Error fetching accounts:', err)
      return []
    }
  },

  async getAccountById(id: string): Promise<CommercialAccount | null> {
    try {
      const record = await pb.collection('commercial_accounts').getOne(id, {
        expand: 'responsible,team',
      })
      return mapAccount(record)
    } catch (err) {
      console.error('Error fetching account:', err)
      return null
    }
  },

  async createAccount(data: Partial<CommercialAccount>): Promise<CommercialAccount> {
    const payload: any = {
      company: data.company || data.empresaId,
      responsible: data.responsible || data.responsavelComercialId || null,
      team: data.team || null,
      razao_social: data.razao_social || data.razaoSocial || '',
      nome_fantasia: data.nome_fantasia || data.nomeFantasia || '',
      cnpj: data.cnpj || '',
      site: data.site || '',
      segmento: data.segmento || '',
      localizacao: data.localizacao || '',
      endereco: data.endereco || '',
      logradouro: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cidade: data.cidade || '',
      estado: data.estado || '',
      cep: data.cep || '',
      cnaePrincipal: data.cnaePrincipal || '',
      telefone: data.telefone || '',
      email: data.email || '',
      situacaoCadastral: data.situacaoCadastral || '',
      porte: data.porte || '',
      linkedin: data.linkedin || data.linkedinInstitucional || '',
      etapa: data.etapa || data.etapaAtual || 'Conta identificada',
      proximo_passo: data.proximo_passo || data.proximoPasso || '',
      observacoes: data.observacoes || '',
      icp_score: data.icp_score || (data.iaAnalysis ? data.iaAnalysis.scoreIcp : 0),
      icp_classification:
        data.icp_classification || (data.iaAnalysis ? data.iaAnalysis.aderenciaIcp : ''),
      ai_summary: data.ai_summary || (data.iaAnalysis ? data.iaAnalysis.resumoExecutivo : ''),
      ai_hypotheses: data.ai_hypotheses || (data.iaAnalysis ? data.iaAnalysis.hipoteses : []),
      ai_pending_points:
        data.ai_pending_points || (data.iaAnalysis ? data.iaAnalysis.dadosNaoConfirmados : []),
      identification_status: data.identification_status || 'confirmada',
    }
    const record = await pb.collection('commercial_accounts').create(payload)
    return mapAccount(record)
  },

  async updateAccount(id: string, data: Partial<CommercialAccount>): Promise<CommercialAccount> {
    const payload: any = {}
    if (data.razao_social !== undefined) payload.razao_social = data.razao_social
    if (data.razaoSocial !== undefined) payload.razao_social = data.razaoSocial
    if (data.nome_fantasia !== undefined) payload.nome_fantasia = data.nome_fantasia
    if (data.nomeFantasia !== undefined) payload.nome_fantasia = data.nomeFantasia
    if (data.cnpj !== undefined) payload.cnpj = data.cnpj
    if (data.site !== undefined) payload.site = data.site
    if (data.segmento !== undefined) payload.segmento = data.segmento
    if (data.localizacao !== undefined) payload.localizacao = data.localizacao
    if (data.endereco !== undefined) payload.endereco = data.endereco
    if (data.telefone !== undefined) payload.telefone = data.telefone
    if (data.email !== undefined) payload.email = data.email
    if (data.porte !== undefined) payload.porte = data.porte
    if (data.responsible !== undefined) payload.responsible = data.responsible || null
    if (data.responsavelComercialId !== undefined)
      payload.responsible = data.responsavelComercialId || null
    if (data.etapa !== undefined) payload.etapa = data.etapa
    if (data.etapaAtual !== undefined) payload.etapa = data.etapaAtual
    if (data.proximo_passo !== undefined) payload.proximo_passo = data.proximo_passo
    if (data.proximoPasso !== undefined) payload.proximo_passo = data.proximoPasso
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes
    if (data.icp_score !== undefined) payload.icp_score = data.icp_score
    if (data.icp_classification !== undefined) payload.icp_classification = data.icp_classification
    if (data.ai_summary !== undefined) payload.ai_summary = data.ai_summary
    if (data.ai_hypotheses !== undefined) payload.ai_hypotheses = data.ai_hypotheses
    if (data.ai_pending_points !== undefined) payload.ai_pending_points = data.ai_pending_points
    if (data.identification_status !== undefined)
      payload.identification_status = data.identification_status
    if (data.iaAnalysis) {
      if (data.iaAnalysis.resumoExecutivo) payload.ai_summary = data.iaAnalysis.resumoExecutivo
      if (data.iaAnalysis.aderenciaIcp) payload.icp_classification = data.iaAnalysis.aderenciaIcp
      if (data.iaAnalysis.scoreIcp) payload.icp_score = data.iaAnalysis.scoreIcp
      if (data.iaAnalysis.hipoteses) payload.ai_hypotheses = data.iaAnalysis.hipoteses
      if (data.iaAnalysis.dadosNaoConfirmados)
        payload.ai_pending_points = data.iaAnalysis.dadosNaoConfirmados
    }

    const record = await pb.collection('commercial_accounts').update(id, payload)
    return mapAccount(record)
  },

  async deleteAccount(id: string): Promise<boolean> {
    await pb.collection('commercial_accounts').delete(id)
    return true
  },

  // Contacts
  async getContacts(companyId: string): Promise<Contact[]> {
    if (!companyId) return []
    try {
      const records = await pb.collection('contacts').getFullList({
        filter: `company = '${companyId}'`,
        sort: '-created',
      })
      return records.map(mapContact)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      return []
    }
  },

  async createContact(data: Partial<Contact>): Promise<Contact> {
    const payload: any = {
      company: data.company || data.empresaId,
      account: data.account || data.contaId,
      name: data.name || data.nome || '',
      cargo: data.cargo || '',
      area: data.area || '',
      email: data.email || '',
      telefone: data.telefone || '',
      linkedin: data.linkedin || '',
      classificacao: data.classificacao || 'Decisor',
      origem_relacionamento: data.origem_relacionamento || data.origemRelacionamento || '',
      relacao_executivo: data.relacao_executivo || data.relacaoComExecutivo || '',
      observacoes: data.observacoes || '',
    }
    const record = await pb.collection('contacts').create(payload)
    return mapContact(record)
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const payload: any = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.nome !== undefined) payload.name = data.nome
    if (data.cargo !== undefined) payload.cargo = data.cargo
    if (data.area !== undefined) payload.area = data.area
    if (data.email !== undefined) payload.email = data.email
    if (data.telefone !== undefined) payload.telefone = data.telefone
    if (data.linkedin !== undefined) payload.linkedin = data.linkedin
    if (data.classificacao !== undefined) payload.classificacao = data.classificacao
    if (data.origem_relacionamento !== undefined)
      payload.origem_relacionamento = data.origem_relacionamento
    if (data.origemRelacionamento !== undefined)
      payload.origem_relacionamento = data.origemRelacionamento
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes

    const record = await pb.collection('contacts').update(id, payload)
    return mapContact(record)
  },

  async deleteContact(id: string): Promise<boolean> {
    await pb.collection('contacts').delete(id)
    return true
  },

  // Opportunities
  async getOpportunities(companyId: string): Promise<Opportunity[]> {
    if (!companyId) return []
    try {
      const records = await pb.collection('opportunities').getFullList({
        filter: `company = '${companyId}'`,
        sort: '-created',
        expand: 'account,contact,responsible',
      })
      return records.map(mapOpportunity)
    } catch (err) {
      console.error('Error fetching opportunities:', err)
      return []
    }
  },

  async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    const payload: any = {
      company: data.company || data.empresaId,
      account: data.account || data.contaId,
      contact: data.contact || data.contatoId || null,
      responsible: data.responsible || data.responsavelId || null,
      etapa: data.etapa || 'Conta identificada',
      valor_estimado: data.valor_estimado || data.valorEstimado || 0,
      prazo: data.prazo || data.prazoEstimado || null,
      proximo_passo: data.proximo_passo || data.proximaAcao || '',
      motivo_perda: data.motivo_perda || '',
      historico: data.historico || [],
    }
    const record = await pb.collection('opportunities').create(payload)
    return mapOpportunity(record)
  },

  async updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    const payload: any = {}
    if (data.etapa !== undefined) payload.etapa = data.etapa
    if (data.valor_estimado !== undefined) payload.valor_estimado = data.valor_estimado
    if (data.valorEstimado !== undefined) payload.valor_estimado = data.valorEstimado
    if (data.prazo !== undefined) payload.prazo = data.prazo
    if (data.prazoEstimado !== undefined) payload.prazo = data.prazoEstimado
    if (data.proximo_passo !== undefined) payload.proximo_passo = data.proximo_passo
    if (data.proximaAcao !== undefined) payload.proximo_passo = data.proximaAcao
    if (data.motivo_perda !== undefined) payload.motivo_perda = data.motivo_perda
    if (data.responsible !== undefined) payload.responsible = data.responsible || null
    if (data.responsavelId !== undefined) payload.responsible = data.responsavelId || null

    const record = await pb.collection('opportunities').update(id, payload)
    return mapOpportunity(record)
  },

  async deleteOpportunity(id: string): Promise<boolean> {
    await pb.collection('opportunities').delete(id)
    return true
  },

  // Meetings
  async getMeetings(companyId: string): Promise<Meeting[]> {
    if (!companyId) return []
    try {
      const records = await pb.collection('meetings').getFullList({
        filter: `company = '${companyId}'`,
        sort: '-date',
      })
      return records.map(mapMeeting)
    } catch (err) {
      console.error('Error fetching meetings:', err)
      return []
    }
  },

  async createMeeting(data: Partial<Meeting>): Promise<Meeting> {
    const payload: any = {
      company: data.company || data.empresaId,
      account: data.account || data.contaId || null,
      title: data.title || data.titulo || 'Reunião',
      date: data.date || data.dataHora || new Date().toISOString(),
      time: data.time || '',
      participants: data.participants || [],
      notes: data.notes || data.anotacoes || '',
      ai_summary: data.ai_summary || data.resumoIa || '',
      next_steps: data.next_steps || data.proximaAtividade || '',
      status: data.status || 'agendada',
    }
    const record = await pb.collection('meetings').create(payload)
    return mapMeeting(record)
  },

  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const payload: any = {}
    if (data.title !== undefined) payload.title = data.title
    if (data.titulo !== undefined) payload.title = data.titulo
    if (data.date !== undefined) payload.date = data.date
    if (data.dataHora !== undefined) payload.date = data.dataHora
    if (data.time !== undefined) payload.time = data.time
    if (data.participants !== undefined) payload.participants = data.participants
    if (data.notes !== undefined) payload.notes = data.notes
    if (data.anotacoes !== undefined) payload.notes = data.anotacoes
    if (data.ai_summary !== undefined) payload.ai_summary = data.ai_summary
    if (data.resumoIa !== undefined) payload.ai_summary = data.resumoIa
    if (data.next_steps !== undefined) payload.next_steps = data.next_steps
    if (data.proximaAtividade !== undefined) payload.next_steps = data.proximaAtividade
    if (data.status !== undefined) payload.status = data.status

    const record = await pb.collection('meetings').update(id, payload)
    return mapMeeting(record)
  },

  async deleteMeeting(id: string): Promise<boolean> {
    await pb.collection('meetings').delete(id)
    return true
  },

  // Activities
  async getActivities(companyId: string): Promise<Activity[]> {
    if (!companyId) return []
    try {
      const records = await pb.collection('activities').getFullList({
        filter: `company = '${companyId}'`,
        sort: '-created',
      })
      return records.map(mapActivity)
    } catch (err) {
      console.error('Error fetching activities:', err)
      return []
    }
  },

  async createActivity(data: Partial<Activity>): Promise<Activity> {
    const payload: any = {
      company: data.company || data.empresaId,
      account: data.account || data.contaId || null,
      contact: data.contact || null,
      user: data.user || data.responsavelId || null,
      type: data.type || data.tipo || 'outro',
      origin: data.origin || 'usuario',
      description: data.description || data.titulo || '',
      metadata: data.metadata || {},
    }
    const record = await pb.collection('activities').create(payload)
    return mapActivity(record)
  },

  // Products
  async getProducts(companyId: string): Promise<Product[]> {
    if (!companyId) return []
    try {
      return await pb.collection('products').getFullList({
        filter: `company = '${companyId}'`,
        sort: 'name',
      })
    } catch (err) {
      console.error('Error fetching products:', err)
      return []
    }
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    return await pb.collection('products').create(data)
  },

  // Onboarding Config
  async getOnboardingConfig(companyId: string): Promise<OnboardingConfig | null> {
    if (!companyId) return null
    try {
      const record = await pb
        .collection('onboarding_config')
        .getFirstListItem(`company = '${companyId}'`)
      return record as any
    } catch (_) {
      return null
    }
  },

  async saveOnboardingConfig(
    companyId: string,
    data: Partial<OnboardingConfig>,
  ): Promise<OnboardingConfig> {
    try {
      const existing = await this.getOnboardingConfig(companyId)
      if (existing) {
        return await pb.collection('onboarding_config').update(existing.id, data)
      } else {
        return await pb.collection('onboarding_config').create({ ...data, company: companyId })
      }
    } catch (err) {
      console.error('Error saving onboarding config:', err)
      throw err
    }
  },

  // Teams & Members
  async getTeams(companyId: string): Promise<Team[]> {
    if (!companyId) return []
    try {
      return await pb.collection('teams').getFullList({
        filter: `company = '${companyId}'`,
        sort: 'name',
        expand: 'manager.user',
      })
    } catch (err) {
      console.error('Error fetching teams:', err)
      return []
    }
  },

  async createTeam(data: Partial<Team>): Promise<Team> {
    return await pb.collection('teams').create(data)
  },

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    return await pb.collection('teams').update(id, data)
  },

  async deleteTeam(id: string): Promise<boolean> {
    await pb.collection('teams').delete(id)
    return true
  },

  // System Health Check
  async getHealthCheck(): Promise<{
    status: string
    pocketbaseConnected: boolean
    migrationsApplied: boolean
    realtimeAvailable: boolean
    authenticated: boolean
    user: any
    activeCompany: any
    activeMembership: any
    tenantActive: boolean
    timestamp: string
  }> {
    try {
      if (!import.meta.env.VITE_POCKETBASE_URL) {
        throw new Error('VITE_POCKETBASE_URL não está configurada no ambiente.')
      }
      return await pb.send('/api/health-check', { method: 'GET' })
    } catch (err: any) {
      return {
        status: 'error',
        pocketbaseConnected: false,
        migrationsApplied: false,
        realtimeAvailable: false,
        authenticated: pb.authStore.isValid,
        user: pb.authStore.record,
        activeCompany: null,
        activeMembership: null,
        tenantActive: false,
        timestamp: new Date().toISOString(),
      }
    }
  },

  // Invitations
  async getInvitations(companyId: string): Promise<Invitation[]> {
    if (!companyId) return []
    try {
      return await pb.collection('invitations').getFullList({
        filter: `company = '${companyId}'`,
        sort: '-created',
        expand: 'team,manager.user,invited_by.user',
      })
    } catch (err) {
      console.error('Error fetching invitations:', err)
      return []
    }
  },

  async createInvitation(data: Partial<Invitation>): Promise<Invitation> {
    return await pb.collection('invitations').create(data)
  },

  async updateInvitation(id: string, data: Partial<Invitation>): Promise<Invitation> {
    return await pb.collection('invitations').update(id, data)
  },

  async deleteInvitation(id: string): Promise<boolean> {
    await pb.collection('invitations').delete(id)
    return true
  },

  async acceptInvitation(token: string): Promise<any> {
    return await pb.send('/api/invitations/accept', {
      method: 'POST',
      body: { token },
    })
  },
}
