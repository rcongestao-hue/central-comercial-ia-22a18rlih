// Types for Central Comercial IA

export type Role = 'admin' | 'gestor' | 'executivo' | 'visualizador'

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

export interface Company {
  id: string
  nome: string
  nomeFantasia?: string
  segmentosPrioritarios: string[]
  produtosServicos: string[]
  perfilClienteIdeal: string // ICP
  diferenciais: string[]
  regiaoAtuacao: string
  criadoEm: string
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
  empresaId: string
  razaoSocial: string
  nomeFantasia: string
  cnpj?: string
  site?: string
  segmento: string
  localizacao: string
  endereco?: string
  linkedinInstitucional?: string
  responsavelComercialId: string
  etapaAtual: PipelineStage
  ultimaAtividade?: string
  proximoPasso?: string
  proximoPassoData?: string
  motivoPerda?: string
  observacoes?: string
  porte?: '1-10' | '11-50' | '51-200' | '201-500' | '500+'
  iaAnalysis?: {
    resumoExecutivo: string
    aderenciaIcp: 'Alta' | 'Média' | 'Baixa'
    scoreIcp: number // 0-100
    necessidadesSugeridas: string[]
    perguntasComerciais: string[]
    hipoteses: string[]
    dadosNaoConfirmados: string[]
    geradoEm: string
  }
  criadoEm: string
  atualizadoEm: string
}

export interface Contact {
  id: string
  empresaId: string
  contaId: string
  nome: string
  cargo: string
  area: string
  email: string
  telefone: string
  linkedin?: string
  classificacao: ContactClassification
  origemRelacionamento: string
  relacaoComExecutivo?: string
  observacoes?: string
  criadoEm: string
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

export type TimelineOrigin = 'usuario' | 'ia' | 'integracao'

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
  origem: TimelineOrigin
  criadoPorUsuarioId?: string
  criadoPorNome?: string
  metadados?: Record<string, unknown>
  criadoEm: string
}

export interface Opportunity {
  id: string
  empresaId: string
  contaId: string
  contatoId?: string
  titulo: string
  responsavelId: string
  etapa: PipelineStage
  valorEstimado: number
  proximaAcao?: string
  prazoEstimado?: string
  motivoPerda?: string
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}

export interface Meeting {
  id: string
  empresaId: string
  contaId: string
  contatoId?: string
  titulo: string
  dataHora: string
  duracaoMinutos: number
  tipo: 'reuniao' | 'followup' | 'ligacao' | 'retorno'
  participantes: string[]
  anotacoes?: string
  resumoIa?: string
  proximaAtividade?: string
  status: 'agendada' | 'concluida' | 'cancelada'
  criadoEm: string
}

export interface Activity {
  id: string
  empresaId: string
  contaId: string
  titulo: string
  tipo: 'followup' | 'ligacao' | 'retorno' | 'reuniao' | 'proposta'
  dataVencimento: string
  responsavelId: string
  status: 'pendente' | 'concluida' | 'atrasada'
  observacoes?: string
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
