// Types for Central Comercial IA

export type Profile =
  | 'proprietario'
  | 'administrador'
  | 'diretor_comercial'
  | 'gestor'
  | 'executivo'
  | 'visualizador'

// Alias for backwards compatibility where needed
export type Role = Profile | 'admin'

export interface PbUser {
  id: string
  name?: string
  email?: string
  avatar?: string
  created?: string
  updated?: string
}

export interface Company {
  id: string
  name: string
  slug?: string
  segment?: string
  region?: string
  brand_color?: string
  logo?: string
  created?: string
  updated?: string
  // Legacy fields mapped for compatibility
  nome?: string
  nomeFantasia?: string
  segmentosPrioritarios?: string[]
  produtosServicos?: string[]
  perfilClienteIdeal?: string
  diferenciais?: string[]
  regiaoAtuacao?: string
}

export interface CompanyUser {
  id: string
  company: string
  user: string
  profile: Profile
  status: 'ativo' | 'inativo' | 'suspenso'
  last_access?: string
  created?: string
  updated?: string
  // Expand relations
  expand?: {
    user?: PbUser
    company?: Company
  }
}

export interface Team {
  id: string
  company: string
  name: string
  manager?: string
  region?: string
  portfolio?: string
  created?: string
  updated?: string
  expand?: {
    manager?: CompanyUser
  }
}

export interface TeamMember {
  id: string
  team: string
  user: string
  role?: string
  created?: string
  expand?: {
    team?: Team
    user?: CompanyUser
  }
}

export interface Invitation {
  id: string
  company: string
  email: string
  profile: Profile
  team?: string
  manager?: string
  invited_by?: string
  status: 'pendente' | 'aceito' | 'expirado' | 'revogado'
  token?: string
  expires_at?: string
  created?: string
  updated?: string
  expand?: {
    company?: Company
    team?: Team
    manager?: CompanyUser
    invited_by?: CompanyUser
  }
}

export type PipelineStage =
  | 'conta_identificada'
  | 'conta_qualificada'
  | 'contato_identificado'
  | 'primeira_abordagem'
  | 'conversa_iniciada'
  | 'reuniao_agendada'
  | 'necessidade_identificada'
  | 'oportunidade_qualificada'
  | 'proposta_elaboracao'
  | 'proposta_apresentada'
  | 'negociacao'
  | 'ganha'
  | 'perdida'

export const PIPELINE_STAGES: { id: PipelineStage; label: string; order: number; color: string }[] =
  [
    {
      id: 'conta_identificada',
      label: 'Conta Identificada',
      order: 1,
      color: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    {
      id: 'conta_qualificada',
      label: 'Conta Qualificada',
      order: 2,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'contato_identificado',
      label: 'Contato Identificado',
      order: 3,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      id: 'primeira_abordagem',
      label: 'Primeira Abordagem',
      order: 4,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'conversa_iniciada',
      label: 'Conversa Iniciada',
      order: 5,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'reuniao_agendada',
      label: 'Reunião Agendada',
      order: 6,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'necessidade_identificada',
      label: 'Necessidade Identificada',
      order: 7,
      color: 'bg-orange-50 text-orange-800 border-orange-200',
    },
    {
      id: 'oportunidade_qualificada',
      label: 'Oportunidade Qualificada',
      order: 8,
      color: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    {
      id: 'proposta_elaboracao',
      label: 'Proposta em Elaboração',
      order: 9,
      color: 'bg-violet-50 text-violet-800 border-violet-200',
    },
    {
      id: 'proposta_apresentada',
      label: 'Proposta Apresentada',
      order: 10,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      id: 'negociacao',
      label: 'Negociação',
      order: 11,
      color: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    },
    {
      id: 'ganha',
      label: 'Ganha',
      order: 12,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
    {
      id: 'perdida',
      label: 'Perdida',
      order: 13,
      color: 'bg-rose-50 text-rose-800 border-rose-300',
    },
  ]

export type ContactClassification =
  | 'decisor'
  | 'influenciador'
  | 'compras'
  | 'responsavel_tecnico'
  | 'financeiro'
  | 'usuario'
  | 'indicacao'
  | 'nao_qualificado'

export const CONTACT_CLASSIFICATIONS: { id: ContactClassification; label: string }[] = [
  { id: 'decisor', label: 'Decisor' },
  { id: 'influenciador', label: 'Influenciador' },
  { id: 'compras', label: 'Compras' },
  { id: 'responsavel_tecnico', label: 'Responsável Técnico' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'usuario', label: 'Usuário Final' },
  { id: 'indicacao', label: 'Indicação' },
  { id: 'nao_qualificado', label: 'Não Qualificado' },
]

export interface CommercialAccount {
  id: string
  company: string
  responsible?: string
  team?: string
  razao_social?: string
  nome_fantasia?: string
  cnpj?: string
  site?: string
  segmento?: string
  localizacao?: string
  endereco?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  cnaePrincipal?: string
  telefone?: string
  email?: string
  situacaoCadastral?: string
  porte?: string
  linkedin?: string
  etapa?: string
  ultima_atividade?: string
  proximo_passo?: string
  observacoes?: string
  icp_score?: number
  icp_classification?: string
  ai_summary?: string
  ai_hypotheses?: any
  ai_pending_points?: any
  ai_confirmed_info?: any
  sources?: any
  identification_status?: 'confirmada' | 'provavel' | 'pendente_validacao' | 'nao_identificada'
  created?: string
  updated?: string
  // Legacy UI mapped fields
  empresaId?: string
  razaoSocial?: string
  nomeFantasia?: string
  responsavelComercialId?: string
  etapaAtual?: PipelineStage
  ultimaAtividade?: string
  proximoPasso?: string
  proximoPassoData?: string
  motivoPerda?: string
  linkedinInstitucional?: string
  iaAnalysis?: {
    resumoExecutivo: string
    aderenciaIcp: 'Alta' | 'Média' | 'Baixa'
    scoreIcp: number
    necessidadesSugeridas: string[]
    perguntasComerciais: string[]
    hipoteses: string[]
    dadosNaoConfirmados: string[]
    geradoEm: string
  }
  criadoEm?: string
  atualizadoEm?: string
  expand?: {
    responsible?: CompanyUser
    team?: Team
  }
}

export interface Contact {
  id: string
  company: string
  account: string
  name: string
  cargo?: string
  area?: string
  email?: string
  telefone?: string
  linkedin?: string
  classificacao?: string
  origem_relacionamento?: string
  relacao_executivo?: string
  observacoes?: string
  created?: string
  updated?: string
  // Legacy UI mapped fields
  empresaId?: string
  contaId?: string
  nome?: string
  origemRelacionamento?: string
  relacaoComExecutivo?: string
  criadoEm?: string
}

export interface Opportunity {
  id: string
  company: string
  account: string
  contact?: string
  responsible?: string
  etapa: string
  valor_estimado?: number
  prazo?: string
  proximo_passo?: string
  motivo_perda?: string
  historico?: any
  created?: string
  updated?: string
  // Legacy UI mapped fields
  empresaId?: string
  contaId?: string
  contatoId?: string
  titulo?: string
  responsavelId?: string
  valorEstimado?: number
  proximaAcao?: string
  prazoEstimado?: string
  observacoes?: string
  criadoEm?: string
  atualizadoEm?: string
  expand?: {
    account?: CommercialAccount
    contact?: Contact
    responsible?: CompanyUser
  }
}

export interface Activity {
  id: string
  company: string
  account?: string
  contact?: string
  user?: string
  type: string
  origin?: 'usuario' | 'ia' | 'integracao'
  description?: string
  metadata?: any
  created?: string
  // Legacy UI mapped fields
  empresaId?: string
  contaId?: string
  titulo?: string
  tipo?: string
  dataVencimento?: string
  responsavelId?: string
  status?: 'pendente' | 'concluida' | 'atrasada'
  observacoes?: string
  criadoEm?: string
}

export interface Meeting {
  id: string
  company: string
  account?: string
  title: string
  date: string
  time?: string
  participants?: string[]
  notes?: string
  ai_summary?: string
  next_steps?: string
  status?: 'agendada' | 'realizada' | 'cancelada'
  created?: string
  updated?: string
  // Legacy UI mapped fields
  empresaId?: string
  contaId?: string
  contatoId?: string
  titulo?: string
  dataHora?: string
  duracaoMinutos?: number
  tipo?: 'reuniao' | 'followup' | 'ligacao' | 'retorno'
  anotacoes?: string
  resumoIa?: string
  proximaAtividade?: string
  criadoEm?: string
}

export interface Product {
  id: string
  company: string
  name: string
  category?: string
  description?: string
  problems_solved?: string
  benefits?: string
  differentiators?: string
  target_segments?: any
  ideal_company_size?: string
  target_region?: string
  decision_maker_profile?: string
  need_signals?: string
  exclusion_criteria?: string
  commercial_notes?: string
  created?: string
  updated?: string
}

export interface OnboardingConfig {
  id: string
  company: string
  differentiators?: any
  priority_segments?: any
  products_services?: any
  icp?: any
  created?: string
  updated?: string
}

export interface Notification {
  id: string
  company: string
  user: string
  title: string
  description?: string
  read?: boolean
  type?: string
  link?: string
  created?: string
}

export type ChannelType = 'whatsapp' | 'email' | 'linkedin' | 'telefone'

export interface ProspectingDraft {
  id: string
  empresaId: string
  contaId: string
  contatoId: string
  canal: ChannelType
  assunto?: string
  mensagem: string
  status: 'rascunho' | 'copiada' | 'canal_aberto' | 'envio_confirmado' | 'resposta_registrada'
  respostaTexto?: string
  respostaData?: string
  proximaAcao?: string
  criadoEm: string
  atualizadoEm: string
}

export interface TimelineEvent {
  id: string
  empresaId: string
  contaId: string
  contatoId?: string
  tipo:
    | 'conta_criada'
    | 'contato_adicionado'
    | 'analise_ia_produzida'
    | 'mensagem_preparada'
    | 'mensagem_copiada'
    | 'canal_aberto'
    | 'envio_confirmado'
    | 'ligacao_registrada'
    | 'resposta_recebida'
    | 'reuniao_registrada'
    | 'proximo_passo_criado'
    | 'oportunidade_atualizada'
  titulo: string
  descricao: string
  origem: 'usuario' | 'ia' | 'integracao'
  criadoPorUsuarioId?: string
  criadoPorNome?: string
  metadados?: Record<string, unknown>
  criadoEm: string
}

export interface IntegrationCard {
  id: string
  nome: string
  categoria: 'comunicacao' | 'email_calendario' | 'ia'
  icone: string
  descricao: string
  status:
    | 'nao_conectado'
    | 'disponivel_configuracao'
    | 'aguardando_autorizacao'
    | 'conectado'
    | 'indisponivel_ambiente'
  oQuePermite: string[]
  credenciaisNecessarias: string[]
  exigeAprovacao: string
  custos: string
  funcionaSemIntegracao: string
}

export interface User {
  id: string
  empresaId: string
  nome: string
  email: string
  senha?: string
  cargo: string
  role: Role
  avatarUrl?: string
  ativo: boolean
  criadoEm: string
}
