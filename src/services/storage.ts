import {
  User,
  Company,
  CommercialAccount,
  Contact,
  Opportunity,
  Meeting,
  Activity,
  TimelineEvent,
  ProspectingDraft,
  IntegrationCard,
} from '@/types'

// Standard storage keys
const STORAGE_KEYS = {
  USERS: 'central_ia_users',
  COMPANIES: 'central_ia_companies',
  ACTIVE_SESSION: 'central_ia_active_session',
  // Company-scoped data prefix: central_ia_data_{companyId}
  DATA_PREFIX: 'central_ia_data_',
  AI_CONFIG: 'central_ia_ai_config',
}

export interface CompanyData {
  accounts: CommercialAccount[]
  contacts: Contact[]
  opportunities: Opportunity[]
  meetings: Meeting[]
  activities: Activity[]
  timeline: TimelineEvent[]
  drafts: ProspectingDraft[]
}

export interface AiConfig {
  provider: 'skip_native' | 'openai' | 'anthropic' | 'gemini'
  customApiKey?: string
  customModel?: string
  enabled: boolean
}

// Initial demo seed
export const DEMO_COMPANY: Company = {
  id: 'empresa_aurora_tech',
  nome: 'Aurora Soluções Digitais',
  nomeFantasia: 'Aurora Tech B2B',
  segmentosPrioritarios: [
    'Tecnologia',
    'Saúde & Healthtech',
    'Serviços Financeiros',
    'Varejo / E-commerce',
  ],
  produtosServicos: [
    'Plataforma de Automação de Processos Comerciais',
    'Consultoria em Eficiência de Vendas B2B',
    'Integração de Sistemas & Dashboards Inteligentes',
  ],
  perfilClienteIdeal:
    'Empresas B2B de médio e grande porte (50 a 500 colaboradores), faturamento acima de R$ 10M/ano, com equipe comercial ativa de 5+ pessoas buscando reduzir ciclo de vendas e aumentar taxa de conversão.',
  diferenciais: [
    'Implementação ágil em até 14 dias',
    'IA contextualizada para o modelo de negócios do cliente',
    'Suporte executivo dedicado sem custo adicional',
  ],
  regiaoAtuacao: 'Brasil (Nacional — foco Sul e Sudeste)',
  criadoEm: '2025-01-10T09:00:00.000Z',
}

export const DEMO_USERS: User[] = [
  {
    id: 'usr_admin_1',
    empresaId: 'empresa_aurora_tech',
    nome: 'Carlos Eduardo Mendes',
    email: 'admin@aurora.com',
    senha: '123',
    cargo: 'Diretor Comercial & Sócio',
    role: 'admin',
    ativo: true,
    criadoEm: '2025-01-10T09:00:00.000Z',
  },
  {
    id: 'usr_gestor_1',
    empresaId: 'empresa_aurora_tech',
    nome: 'Mariana Silveira',
    email: 'mariana.gestora@aurora.com',
    senha: '123',
    cargo: 'Head de Vendas & Inside Sales',
    role: 'gestor',
    ativo: true,
    criadoEm: '2025-01-12T10:00:00.000Z',
  },
  {
    id: 'usr_exec_1',
    empresaId: 'empresa_aurora_tech',
    nome: 'Lucas Fontes',
    email: 'lucas.executivo@aurora.com',
    senha: '123',
    cargo: 'Executivo Comercial Senior (Account Executive)',
    role: 'executivo',
    ativo: true,
    criadoEm: '2025-01-15T11:00:00.000Z',
  },
  {
    id: 'usr_exec_2',
    empresaId: 'empresa_aurora_tech',
    nome: 'Beatriz Ramos',
    email: 'beatriz.executiva@aurora.com',
    senha: '123',
    cargo: 'Executiva de Prospecção (SDR)',
    role: 'executivo',
    ativo: true,
    criadoEm: '2025-01-16T14:00:00.000Z',
  },
  {
    id: 'usr_viewer_1',
    empresaId: 'empresa_aurora_tech',
    nome: 'Renato Prado',
    email: 'renato.viewer@aurora.com',
    senha: '123',
    cargo: 'Analista de Planejamento (Acompanhamento)',
    role: 'visualizador',
    ativo: true,
    criadoEm: '2025-01-20T08:30:00.000Z',
  },
]

export const INITIAL_INTEGRATIONS: IntegrationCard[] = [
  {
    id: 'whatsapp_business',
    nome: 'WhatsApp Business API Oficial',
    categoria: 'comunicacao',
    icone: 'MessageSquare',
    descricao: 'Abertura de canal oficial com parâmetros preenchidos e registro de disparo.',
    status: 'disponivel_configuracao',
    oQuePermite: [
      'Geração de link de clique oficial (wa.me) com mensagem pronta',
      'Registro no CRM após envio confirmado pelo executivo',
      'Histórico unificado de conversas no lead',
    ],
    credenciaisNecessarias: [
      'Número de telefone oficial',
      'Meta Business Manager ID (para envio automático via Cloud API)',
    ],
    exigeAprovacao:
      'Sim, se utilizar a Cloud API direta da Meta; Não para abertura assistida no WhatsApp Web / Desktop.',
    custos:
      'Conversas cobradas pela Meta por janela de 24h na API oficial; abertura manual assistida é 100% gratuita.',
    funcionaSemIntegracao:
      'A plataforma gera a mensagem contextualizada via IA, permite cópia em um clique e abre o WhatsApp Oficial do navegador/app de forma 100% funcional.',
  },
  {
    id: 'email_gmail',
    nome: 'Gmail / Google Workspace',
    categoria: 'email_calendario',
    icone: 'Mail',
    descricao:
      'Criação de e-mails assistidos, abertura no cliente padrão e registro de follow-ups.',
    status: 'disponivel_configuracao',
    oQuePermite: [
      'Abertura direta do rascunho preenchido no Gmail Web',
      'Assuntos com alto índice de abertura gerados por IA',
      'Registro do envio e timeline associada ao contato',
    ],
    credenciaisNecessarias: ['Conta Google Workspace ou Gmail comercial'],
    exigeAprovacao: 'OAuth 2.0 padrão Google.',
    custos: 'Gratuito no modo assistido (mailto / web launcher).',
    funcionaSemIntegracao:
      'A plataforma formata o assunto e corpo ideal, copia com 1 clique e aciona o cliente de e-mail do sistema operacional ou navegador.',
  },
  {
    id: 'outlook_m365',
    nome: 'Microsoft 365 / Outlook',
    categoria: 'email_calendario',
    icone: 'Inbox',
    descricao: 'Integração corporativa com Microsoft Exchange e Outlook Online.',
    status: 'disponivel_configuracao',
    oQuePermite: [
      'Disparo assistido corporativo',
      'Sincronização de respostas manuais na linha do tempo',
    ],
    credenciaisNecessarias: ['Azure AD App Registration / Tenant ID (para sync bidirecional)'],
    exigeAprovacao: 'Requer consentimento do administrador do Microsoft 365 da organização.',
    custos: 'Incluído nos planos Microsoft 365 existentes da sua empresa.',
    funcionaSemIntegracao: 'Tudo opera normalmente com cópia direta e abertura de link mailto/web.',
  },
  {
    id: 'google_calendar',
    nome: 'Google Agenda',
    categoria: 'email_calendario',
    icone: 'Calendar',
    descricao: 'Sincronização de reuniões comerciais agendadas e convites.',
    status: 'disponivel_configuracao',
    oQuePermite: [
      'Criação de evento com link Meet automático',
      'Lembretes de follow-up direto no calendário',
    ],
    credenciaisNecessarias: ['Google Calendar API Key ou OAuth Client'],
    exigeAprovacao: 'Permissão de leitura e escrita de agenda pelo usuário.',
    custos: 'Sem custo adicional.',
    funcionaSemIntegracao:
      'A Central Comercial IA possui agenda interna própria e completa para reuniões, follow-ups e ligações, sem nenhuma dependência externa.',
  },
  {
    id: 'ms_teams_calendar',
    nome: 'Calendário Microsoft Teams',
    categoria: 'email_calendario',
    icone: 'CalendarDays',
    descricao: 'Agendamento de videoconferências no Teams com histórico na conta.',
    status: 'disponivel_configuracao',
    oQuePermite: ['Agendamento de reuniões Teams a partir da oportunidade'],
    credenciaisNecessarias: ['Microsoft Graph API token'],
    exigeAprovacao: 'Aprovação do time de TI corporativo.',
    custos: 'Sem custo adicional além da licença M365.',
    funcionaSemIntegracao:
      'Registros de ata, anotações de reunião e resumo por IA operam perfeitamente na agenda interna.',
  },
  {
    id: 'linkedin_sales',
    nome: 'LinkedIn (Navegação Assistida)',
    categoria: 'comunicacao',
    icone: 'Share2',
    descricao: 'Acesso rápido ao perfil público de decisores e mensagens curtas otimizadas.',
    status: 'disponivel_configuracao',
    oQuePermite: [
      'Abertura direta do perfil do contato no LinkedIn em nova aba',
      'Mensagens de conexão e InMail geradas por IA no tom exato do executivo',
    ],
    credenciaisNecessarias: ['Conta pessoal no LinkedIn (não requer API paga)'],
    exigeAprovacao:
      'Nenhuma — não utiliza scraping nem automação invasiva (100% compliant com termos do LinkedIn).',
    custos: 'Gratuito.',
    funcionaSemIntegracao:
      'A plataforma gera a mensagem sob medida e abre o link do perfil com 1 clique.',
  },
  {
    id: 'ai_openai',
    nome: 'OpenAI (Chave Própria - BYOK)',
    categoria: 'ia',
    icone: 'Cpu',
    descricao: 'Conexão com seu modelo GPT-4o / GPT-4o-mini dedicado.',
    status: 'disponivel_configuracao',
    oQuePermite: ['Uso de chave API corporativa privada para geração de insights e mensagens'],
    credenciaisNecessarias: ['API Key da plataforma OpenAI (platform.openai.com)'],
    exigeAprovacao: 'Nenhuma além do seu cadastro na OpenAI.',
    custos: 'Cobrança direta pela OpenAI conforme seu consumo de tokens.',
    funcionaSemIntegracao:
      'A IA nativa da plataforma opera em modo assistido local sem necessidade de chave.',
  },
  {
    id: 'ai_anthropic',
    nome: 'Anthropic Claude (Chave Própria - BYOK)',
    categoria: 'ia',
    icone: 'Sparkles',
    descricao: 'Conexão com modelos Claude 3.5 Sonnet / Claude 3 Opus.',
    status: 'disponivel_configuracao',
    oQuePermite: ['Análise aprofundada de contas e elaboração de hipóteses com Claude'],
    credenciaisNecessarias: ['Anthropic API Key (console.anthropic.com)'],
    exigeAprovacao: 'Cadastro na plataforma Anthropic.',
    custos: 'Cobrança direta pela Anthropic por tokens consumidos.',
    funcionaSemIntegracao: 'A plataforma fornece assistente comercial inteligente nativo.',
  },
  {
    id: 'ai_gemini',
    nome: 'Google Gemini (Chave Própria - BYOK)',
    categoria: 'ia',
    icone: 'Bot',
    descricao: 'Conexão com modelos Gemini 1.5 Pro / Flash.',
    status: 'disponivel_configuracao',
    oQuePermite: ['Resumos executivos e geração rápida de e-mails com Gemini'],
    credenciaisNecessarias: ['Google AI Studio API Key'],
    exigeAprovacao: 'Nenhuma.',
    custos: 'Nível gratuito disponível no Google AI Studio / pay-as-you-go.',
    funcionaSemIntegracao: 'Assistente interno nativo sempre disponível.',
  },
]

export function buildDemoCompanyData(companyId: string): CompanyData {
  const accounts: CommercialAccount[] = [
    {
      id: 'acc_1',
      empresaId: companyId,
      razaoSocial: 'Vanguard Logística & Supply Chain S.A.',
      nomeFantasia: 'Vanguard Log',
      cnpj: '28.349.120/0001-45',
      site: 'https://vanguardlog.exemplo.com.br',
      segmento: 'Transporte e Logística',
      localizacao: 'Curitiba, PR',
      endereco: 'Av. das Indústrias, 1420 - CIC',
      linkedinInstitucional: 'https://linkedin.com/company/vanguard-log-brasil',
      responsavelComercialId: 'usr_exec_1',
      etapaAtual: 'proposta_apresentada',
      ultimaAtividade: '2025-04-10T14:30:00.000Z',
      proximoPasso: 'Follow-up sobre validação jurídica da minuta contratual',
      proximoPassoData: '2025-04-18',
      porte: '201-500',
      observacoes:
        'Cliente busca modernizar operação de distribuição. Orçamento aprovado para o Q2.',
      iaAnalysis: {
        resumoExecutivo:
          'Empresa logística de grande porte expandindo frota e CDs na região Sul. Sofrem com gargalos manuais no repasse de cotações para clientes B2B.',
        aderenciaIcp: 'Alta',
        scoreIcp: 92,
        necessidadesSugeridas: [
          'Automação do fluxo de follow-up com embarcadores',
          'Visibilidade em tempo real da carteira de fretes para a diretoria',
          'Redução do tempo de resposta a RFPs e cotações',
        ],
        perguntasComerciais: [
          'Qual o tempo médio atual entre a solicitação de frete e o envio da proposta comercial?',
          'Quantas oportunidades de contratos anuais são perdidas por falta de follow-up tempestivo?',
          'Quem além da diretoria de operações precisa validar a integração tecnológica?',
        ],
        hipoteses: [
          'A diretoria já perdeu receita em contratos recentes devido a lentidão nas respostas comerciais.',
          'O time comercial opera sobrecarregado com planilhas paralelas.',
        ],
        dadosNaoConfirmados: [
          'Faturamento exato do último exercício (estimado em R$ 85M)',
          'Data limite exata para encerramento do orçamento Q2',
        ],
        geradoEm: '2025-04-09T10:00:00.000Z',
      },
      criadoEm: '2025-02-01T10:00:00.000Z',
      atualizadoEm: '2025-04-10T14:30:00.000Z',
    },
    {
      id: 'acc_2',
      empresaId: companyId,
      razaoSocial: 'Nexus Diagnósticos e Saúde Integrada Ltda',
      nomeFantasia: 'Nexus Saúde B2B',
      cnpj: '14.892.331/0001-90',
      site: 'https://nexussaude.exemplo.com.br',
      segmento: 'Saúde & Healthtech',
      localizacao: 'São Paulo, SP',
      endereco: 'Rua Bela Cintra, 890 - Consolação',
      linkedinInstitucional: 'https://linkedin.com/company/nexus-saude-integrada',
      responsavelComercialId: 'usr_exec_2',
      etapaAtual: 'reuniao_agendada',
      ultimaAtividade: '2025-04-12T11:00:00.000Z',
      proximoPasso: 'Realizar reunião de demonstração executiva com Diretora Médica e COO',
      proximoPassoData: '2025-04-16',
      porte: '51-200',
      observacoes: 'Demonstraram grande interesse após abordagem estruturada via LinkedIn.',
      iaAnalysis: {
        resumoExecutivo:
          'Rede de laboratórios e medicina diagnóstica corporativa com 18 unidades. Crescimento de 40% ao ano, buscando estruturar time comercial de convênios.',
        aderenciaIcp: 'Alta',
        scoreIcp: 88,
        necessidadesSugeridas: [
          'Padronização da abordagem a RHs de grandes empresas',
          'Gestão centralizada de contas corporativas de saúde',
        ],
        perguntasComerciais: [
          'Como vocês priorizam as empresas que recebem propostas de exames ocupacionais hoje?',
          'Qual é a principal dificuldade na retenção dos contratos corporativos atuais?',
        ],
        hipoteses: [
          'A empresa tem alta taxa de sucesso quando consegue falar com o Diretor de RH, mas baixa eficiência no primeiro contato.',
        ],
        dadosNaoConfirmados: ['Volume de contas ativas no segmento corporativo'],
        geradoEm: '2025-04-11T09:30:00.000Z',
      },
      criadoEm: '2025-02-15T14:00:00.000Z',
      atualizadoEm: '2025-04-12T11:00:00.000Z',
    },
    {
      id: 'acc_3',
      empresaId: companyId,
      razaoSocial: 'Horizonte Alimentos e Bebidas do Brasil S.A.',
      nomeFantasia: 'Horizonte Alimentos',
      cnpj: '09.112.445/0001-12',
      site: 'https://horizontealimentos.exemplo.com.br',
      segmento: 'Indústria / Varejo',
      localizacao: 'Ribeirão Preto, SP',
      endereco: 'Rodovia Anhanguera, km 312',
      linkedinInstitucional: 'https://linkedin.com/company/horizonte-alimentos-brasil',
      responsavelComercialId: 'usr_exec_1',
      etapaAtual: 'negociacao',
      ultimaAtividade: '2025-04-13T16:00:00.000Z',
      proximoPasso: 'Ajuste de cláusulas de SLA para assinatura final',
      proximoPassoData: '2025-04-17',
      porte: '500+',
      observacoes: 'Negociação avançada de contrato anual. Aprovação técnica já concluída.',
      iaAnalysis: {
        resumoExecutivo:
          'Indústria tradicional em transição digital. Distribui para mais de 3.000 pontos de venda e precisa de controle sobre canais indiretos.',
        aderenciaIcp: 'Alta',
        scoreIcp: 95,
        necessidadesSugeridas: [
          'Visibilidade dos ciclos de recompra dos distribuidores',
          'Prevenção de churn de distribuidores regionais',
        ],
        perguntasComerciais: [
          'Como o time de campo repassa informações estratégicas para a mesa de decisão?',
        ],
        hipoteses: [
          'Distribuidores menores compram abaixo do potencial por falta de contato comercial regular.',
        ],
        dadosNaoConfirmados: ['Margem líquida por canal de distribuição'],
        geradoEm: '2025-04-01T15:00:00.000Z',
      },
      criadoEm: '2025-01-20T09:00:00.000Z',
      atualizadoEm: '2025-04-13T16:00:00.000Z',
    },
    {
      id: 'acc_4',
      empresaId: companyId,
      razaoSocial: 'Vertex Soluções Financeiras & Meios de Pagamento',
      nomeFantasia: 'Vertex Fintech',
      cnpj: '33.409.811/0001-77',
      site: 'https://vertexfintech.exemplo.com.br',
      segmento: 'Serviços Financeiros',
      localizacao: 'Florianópolis, SC',
      endereco: 'Passeio Primavera, Bloco B - SC-401',
      linkedinInstitucional: 'https://linkedin.com/company/vertex-fintech',
      responsavelComercialId: 'usr_exec_2',
      etapaAtual: 'primeira_abordagem',
      ultimaAtividade: '2025-04-14T09:00:00.000Z',
      proximoPasso: 'Enviar mensagem estruturada de valor via WhatsApp para o CTO',
      proximoPassoData: '2025-04-15',
      porte: '51-200',
      observacoes: 'Receberam aporte Series A recentemente. Momento propício para abordagem.',
      iaAnalysis: {
        resumoExecutivo:
          'Fintech de infraestrutura de pagamentos B2B com rápido crescimento. Contratando agressivamente times de produto e vendas.',
        aderenciaIcp: 'Média',
        scoreIcp: 74,
        necessidadesSugeridas: [
          'Estruturação rápida da máquina de vendas',
          'Treinamento e playbook para novos executivos',
        ],
        perguntasComerciais: [
          'Qual a meta de expansão de novos clientes corporativos pós-rodada de captação?',
        ],
        hipoteses: [
          'Os fundadores ainda participam de todas as reuniões comerciais e precisam delegar com controle.',
        ],
        dadosNaoConfirmados: ['Runway atual e parceiros bancários de liquidação'],
        geradoEm: '2025-04-14T08:30:00.000Z',
      },
      criadoEm: '2025-04-05T11:00:00.000Z',
      atualizadoEm: '2025-04-14T09:00:00.000Z',
    },
    {
      id: 'acc_5',
      empresaId: companyId,
      razaoSocial: 'Soluções Alfa Serviços Terceirizados',
      nomeFantasia: 'Alfa Facilities',
      cnpj: '19.201.304/0001-08',
      site: 'https://alfafacilities.exemplo.com.br',
      segmento: 'Serviços Terceirizados',
      localizacao: 'Belo Horizonte, MG',
      responsavelComercialId: 'usr_exec_1',
      etapaAtual: 'conta_qualificada',
      ultimaAtividade: '2025-04-08T17:00:00.000Z',
      proximoPasso:
        'Identificar quem é o responsável pela contratação de tecnologia no organograma',
      proximoPassoData: '2025-04-19',
      porte: '201-500',
      observacoes: 'Conta mapeada no plano de expansão MG.',
      criadoEm: '2025-04-01T10:00:00.000Z',
      atualizadoEm: '2025-04-08T17:00:00.000Z',
    },
    {
      id: 'acc_6',
      empresaId: companyId,
      razaoSocial: 'Delta Prime Distribuidora de Medicamentos',
      nomeFantasia: 'Delta Prime Pharma',
      cnpj: '45.102.990/0001-55',
      segmento: 'Saúde & Healthtech',
      localizacao: 'Porto Alegre, RS',
      responsavelComercialId: 'usr_exec_2',
      etapaAtual: 'ganha',
      ultimaAtividade: '2025-03-28T15:00:00.000Z',
      proximoPasso: 'Kick-off de onboarding do cliente',
      porte: '500+',
      observacoes: 'Contrato fechado com vigência de 24 meses.',
      criadoEm: '2025-01-15T10:00:00.000Z',
      atualizadoEm: '2025-03-28T15:00:00.000Z',
    },
    {
      id: 'acc_7',
      empresaId: companyId,
      razaoSocial: 'Beta Software e Sistemas Legados Ltda',
      nomeFantasia: 'Beta TI',
      segmento: 'Tecnologia',
      localizacao: 'Campinas, SP',
      responsavelComercialId: 'usr_exec_1',
      etapaAtual: 'perdida',
      ultimaAtividade: '2025-03-10T10:00:00.000Z',
      proximoPasso: 'Revisitar em 6 meses',
      motivoPerda: 'Optaram por desenvolvimento interno por terem equipe própria disponível.',
      porte: '11-50',
      observacoes: 'Decisão do comitê de tecnologia interno.',
      criadoEm: '2025-02-01T10:00:00.000Z',
      atualizadoEm: '2025-03-10T10:00:00.000Z',
    },
  ]

  const contacts: Contact[] = [
    {
      id: 'ct_1',
      empresaId: companyId,
      contaId: 'acc_1',
      nome: 'Roberto Antunes',
      cargo: 'Diretor de Operações e Logística',
      area: 'Operações',
      email: 'roberto.antunes@vanguardlog.exemplo.com.br',
      telefone: '+55 41 99123-4455',
      linkedin: 'https://linkedin.com/in/roberto-antunes-log',
      classificacao: 'decisor',
      origemRelacionamento: 'Prospecção Ativa via LinkedIn',
      relacaoComExecutivo: 'Excelente sintonia; focado em retorno sobre investimento.',
      observacoes: 'Prefere contatos diretos e objetivos via WhatsApp.',
      criadoEm: '2025-02-02T10:00:00.000Z',
    },
    {
      id: 'ct_2',
      empresaId: companyId,
      contaId: 'acc_1',
      nome: 'Juliana Meireles',
      cargo: 'Gerente de TI & Infraestrutura',
      area: 'Tecnologia da Informação',
      email: 'juliana.meireles@vanguardlog.exemplo.com.br',
      telefone: '+55 41 98844-2211',
      linkedin: 'https://linkedin.com/in/juliana-meireles-tech',
      classificacao: 'responsavel_tecnico',
      origemRelacionamento: 'Envolvida pelo Diretor de Operações',
      relacaoComExecutivo: 'Muito técnica e criteriosa com segurança da informação.',
      observacoes: 'Aprovou o diagrama de arquitetura na reunião do dia 05/04.',
      criadoEm: '2025-02-10T11:00:00.000Z',
    },
    {
      id: 'ct_3',
      empresaId: companyId,
      contaId: 'acc_2',
      nome: 'Dra. Camila Toledo',
      cargo: 'Diretora Médica & Novos Negócios',
      area: 'Diretoria / Expansão',
      email: 'camila.toledo@nexussaude.exemplo.com.br',
      telefone: '+55 11 97655-8899',
      linkedin: 'https://linkedin.com/in/dra-camila-toledo',
      classificacao: 'decisor',
      origemRelacionamento: 'Indicação em Congresso de Saúde B2B',
      relacaoComExecutivo: 'Primeiro contato amigável e receptivo.',
      observacoes: 'Horário ideal de contato é início da manhã ou após as 18h.',
      criadoEm: '2025-02-16T14:30:00.000Z',
    },
    {
      id: 'ct_4',
      empresaId: companyId,
      contaId: 'acc_3',
      nome: 'Henrique Barcellos',
      cargo: 'VP de Comercial & Parcerias Estratégicas',
      area: 'Comercial',
      email: 'henrique.barcellos@horizontealimentos.exemplo.com.br',
      telefone: '+55 16 99233-1020',
      linkedin: 'https://linkedin.com/in/henrique-barcellos-agro',
      classificacao: 'decisor',
      origemRelacionamento: 'Relacionamento anterior do Diretor Carlos Eduardo',
      relacaoComExecutivo: 'Relacionamento consolidado e de alta confiança mútua.',
      observacoes: 'Liderando a modernização de toda a cadeia de distribuidores.',
      criadoEm: '2025-01-22T09:00:00.000Z',
    },
    {
      id: 'ct_5',
      empresaId: companyId,
      contaId: 'acc_4',
      nome: 'Felipe Alencar',
      cargo: 'CTO & Co-founder',
      area: 'Tecnologia / Produto',
      email: 'felipe.alencar@vertexfintech.exemplo.com.br',
      telefone: '+55 48 99877-3312',
      linkedin: 'https://linkedin.com/in/felipe-alencar-cto',
      classificacao: 'influenciador',
      origemRelacionamento: 'Mapeamento de Startups da Região Sul',
      relacaoComExecutivo: 'Em fase de aproximação inicial.',
      observacoes: 'Gosta de conteúdos diretos, com dados de benchmark de mercado.',
      criadoEm: '2025-04-06T10:00:00.000Z',
    },
  ]

  const opportunities: Opportunity[] = [
    {
      id: 'opp_1',
      empresaId: companyId,
      contaId: 'acc_1',
      contatoId: 'ct_1',
      titulo: 'Implantação Automação Comercial Vanguard Logística',
      responsavelId: 'usr_exec_1',
      etapa: 'proposta_apresentada',
      valorEstimado: 145000,
      proximaAcao: 'Follow-up sobre aprovação jurídica',
      prazoEstimado: '2025-04-30',
      observacoes: 'Contrato com setup de R$ 35k + R$ 110k anual recorrente.',
      criadoEm: '2025-02-15T10:00:00.000Z',
      atualizadoEm: '2025-04-10T14:30:00.000Z',
    },
    {
      id: 'opp_2',
      empresaId: companyId,
      contaId: 'acc_2',
      contatoId: 'ct_3',
      titulo: 'Plataforma de Expansão de Contas Corporativas Nexus',
      responsavelId: 'usr_exec_2',
      etapa: 'reuniao_agendada',
      valorEstimado: 88000,
      proximaAcao: 'Apresentação executiva e mapeamento de dores',
      prazoEstimado: '2025-05-15',
      observacoes: 'Previsão de fechamento para meados de maio.',
      criadoEm: '2025-03-01T11:00:00.000Z',
      atualizadoEm: '2025-04-12T11:00:00.000Z',
    },
    {
      id: 'opp_3',
      empresaId: companyId,
      contaId: 'acc_3',
      contatoId: 'ct_4',
      titulo: 'Consultoria + Plataforma Nacional de Distribuição Horizonte',
      responsavelId: 'usr_exec_1',
      etapa: 'negociacao',
      valorEstimado: 320000,
      proximaAcao: 'Ajuste final de SLAs do contrato',
      prazoEstimado: '2025-04-25',
      observacoes: 'Maior oportunidade do trimestre em fase final de fechamento.',
      criadoEm: '2025-01-25T14:00:00.000Z',
      atualizadoEm: '2025-04-13T16:00:00.000Z',
    },
    {
      id: 'opp_4',
      empresaId: companyId,
      contaId: 'acc_4',
      contatoId: 'ct_5',
      titulo: 'Estruturação da Máquina de Vendas B2B Vertex',
      responsavelId: 'usr_exec_2',
      etapa: 'primeira_abordagem',
      valorEstimado: 64000,
      proximaAcao: 'Enviar proposta de valor personalizada via WhatsApp',
      prazoEstimado: '2025-06-15',
      criadoEm: '2025-04-06T11:00:00.000Z',
      atualizadoEm: '2025-04-14T09:00:00.000Z',
    },
    {
      id: 'opp_5',
      empresaId: companyId,
      contaId: 'acc_6',
      titulo: 'Contrato Bianual Delta Prime Pharma',
      responsavelId: 'usr_exec_2',
      etapa: 'ganha',
      valorEstimado: 210000,
      prazoEstimado: '2025-03-30',
      observacoes: 'Venda ganha e assinada com sucesso.',
      criadoEm: '2025-01-20T10:00:00.000Z',
      atualizadoEm: '2025-03-28T15:00:00.000Z',
    },
    {
      id: 'opp_6',
      empresaId: companyId,
      contaId: 'acc_7',
      titulo: 'Modernização de Vendas Beta TI',
      responsavelId: 'usr_exec_1',
      etapa: 'perdida',
      valorEstimado: 45000,
      motivoPerda: 'Decidiram construir solução interna com squad próprio.',
      prazoEstimado: '2025-03-15',
      criadoEm: '2025-02-05T10:00:00.000Z',
      atualizadoEm: '2025-03-10T10:00:00.000Z',
    },
  ]

  const meetings: Meeting[] = [
    {
      id: 'meet_1',
      empresaId: companyId,
      contaId: 'acc_2',
      contatoId: 'ct_3',
      titulo: 'Demonstração Executiva & Diagnóstico — Nexus Saúde',
      dataHora: '2025-04-16T10:30:00',
      duracaoMinutos: 45,
      tipo: 'reuniao',
      participantes: [
        'Beatriz Ramos (Executiva)',
        'Dra. Camila Toledo (Diretora)',
        'Mariana Silveira (Head)',
      ],
      anotacoes: 'Foco em apresentar redução de ciclo de prospecção corporativa.',
      status: 'agendada',
      criadoEm: '2025-04-12T11:00:00.000Z',
    },
    {
      id: 'meet_2',
      empresaId: companyId,
      contaId: 'acc_1',
      contatoId: 'ct_1',
      titulo: 'Alinhamento de Minuta Contratual — Vanguard Log',
      dataHora: '2025-04-18T14:00:00',
      duracaoMinutos: 30,
      tipo: 'followup',
      participantes: [
        'Lucas Fontes (Executivo)',
        'Roberto Antunes (Diretor)',
        'Juliana Meireles (TI)',
      ],
      anotacoes: 'Validar termos de SLA e cronograma de implementação.',
      status: 'agendada',
      criadoEm: '2025-04-10T14:30:00.000Z',
    },
    {
      id: 'meet_3',
      empresaId: companyId,
      contaId: 'acc_3',
      contatoId: 'ct_4',
      titulo: 'Reunião de Apresentação Técnica — Horizonte Alimentos',
      dataHora: '2025-04-05T15:00:00',
      duracaoMinutos: 60,
      tipo: 'reuniao',
      participantes: ['Lucas Fontes', 'Carlos Mendes', 'Henrique Barcellos'],
      anotacoes:
        'Reunião excelente. Cliente solicitou formalização da proposta com 3 cenários de escopo.',
      resumoIa:
        'Reunião altamente produtiva. A diretoria confirmou o orçamento reservado para modernização comercial. Principal interesse focado em dashboards em tempo real para equipe de campo. Próximo passo aprovado: envio da proposta com opções Standard e Enterprise.',
      proximaAtividade: 'Enviar proposta comercial revisada',
      status: 'concluida',
      criadoEm: '2025-04-05T16:00:00.000Z',
    },
  ]

  const activities: Activity[] = [
    {
      id: 'act_1',
      empresaId: companyId,
      contaId: 'acc_1',
      titulo: 'Enviar minuta ajustada para departamento jurídico da Vanguard',
      tipo: 'proposta',
      dataVencimento: '2025-04-17',
      responsavelId: 'usr_exec_1',
      status: 'pendente',
      observacoes: 'Incluir adendo de confidencialidade e garantia de uptime de 99.8%.',
      criadoEm: '2025-04-10T14:30:00.000Z',
    },
    {
      id: 'act_2',
      empresaId: companyId,
      contaId: 'acc_2',
      titulo: 'Preparar pitch deck com cases do segmento de saúde',
      tipo: 'reuniao',
      dataVencimento: '2025-04-15',
      responsavelId: 'usr_exec_2',
      status: 'pendente',
      observacoes: 'Destacar números de retenção de clientes corporativos.',
      criadoEm: '2025-04-12T11:00:00.000Z',
    },
    {
      id: 'act_3',
      empresaId: companyId,
      contaId: 'acc_4',
      titulo: 'Fazer primeira abordagem estruturada com Felipe Alencar',
      tipo: 'followup',
      dataVencimento: '2025-04-15',
      responsavelId: 'usr_exec_2',
      status: 'pendente',
      criadoEm: '2025-04-14T09:00:00.000Z',
    },
    {
      id: 'act_4',
      empresaId: companyId,
      contaId: 'acc_5',
      titulo: 'Mapear decisor de tecnologia na Alfa Facilities',
      tipo: 'ligacao',
      dataVencimento: '2025-04-10',
      responsavelId: 'usr_exec_1',
      status: 'atrasada',
      observacoes: 'Ligar para a recepção corporativa e solicitar contato de Novos Negócios.',
      criadoEm: '2025-04-02T10:00:00.000Z',
    },
  ]

  const drafts: ProspectingDraft[] = [
    {
      id: 'drf_1',
      empresaId: companyId,
      contaId: 'acc_4',
      contatoId: 'ct_5',
      canal: 'whatsapp',
      mensagem:
        'Olá, Felipe! Tudo bem? Acompanhei o recente aporte na Vertex Fintech, parabéns pela tração. Aqui na Aurora, temos ajudado fintechs B2B em rápida expansão a estruturar a máquina de vendas para que os fundadores não fiquem sobrecarregados na operação. Teria 15 minutos na quinta-feira para trocarmos uma ideia sobre benchmarks comerciais desse momento?',
      status: 'rascunho',
      proximaAcao: 'Copiar e abrir WhatsApp oficial para envio manual',
      criadoEm: '2025-04-14T09:10:00.000Z',
      atualizadoEm: '2025-04-14T09:10:00.000Z',
    },
  ]

  const timeline: TimelineEvent[] = [
    {
      id: 'tl_1',
      empresaId: companyId,
      contaId: 'acc_1',
      contatoId: 'ct_1',
      tipo: 'conta_criada',
      titulo: 'Conta Comercial Cadastrada',
      descricao: 'Vanguard Logística cadastrada no sistema por Carlos Mendes.',
      origem: 'usuario',
      criadoPorUsuarioId: 'usr_admin_1',
      criadoPorNome: 'Carlos Eduardo Mendes',
      criadoEm: '2025-02-01T10:00:00.000Z',
    },
    {
      id: 'tl_2',
      empresaId: companyId,
      contaId: 'acc_1',
      tipo: 'analise_ia_produzida',
      titulo: 'Análise de ICP e Diagnóstico Comercial Gerados por IA',
      descricao:
        'IA identificou 92% de aderência ao ICP e preparou perguntas de qualificação e hipóteses.',
      origem: 'ia',
      criadoEm: '2025-02-01T10:05:00.000Z',
    },
    {
      id: 'tl_3',
      empresaId: companyId,
      contaId: 'acc_1',
      contatoId: 'ct_1',
      tipo: 'mensagem_preparada',
      titulo: 'Abordagem Customizada Preparada via IA',
      descricao: 'Mensagem focada em automação de cotações gerada para o Diretor Roberto Antunes.',
      origem: 'ia',
      criadoEm: '2025-02-02T09:30:00.000Z',
    },
    {
      id: 'tl_4',
      empresaId: companyId,
      contaId: 'acc_1',
      contatoId: 'ct_1',
      tipo: 'envio_confirmado',
      titulo: 'Mensagem Enviada pelo Executivo via WhatsApp Oficial',
      descricao: 'Lucas Fontes abriu o WhatsApp Web e confirmou o envio manual da abordagem.',
      origem: 'usuario',
      criadoPorUsuarioId: 'usr_exec_1',
      criadoPorNome: 'Lucas Fontes',
      criadoEm: '2025-02-02T10:15:00.000Z',
    },
    {
      id: 'tl_5',
      empresaId: companyId,
      contaId: 'acc_1',
      contatoId: 'ct_1',
      tipo: 'resposta_recebida',
      titulo: 'Resposta do Cliente Registrada',
      descricao:
        'Roberto respondeu: "Interessante, estamos sofrendo exatamente com isso aqui. Podemos agendar para terça?".',
      origem: 'usuario',
      criadoPorUsuarioId: 'usr_exec_1',
      criadoPorNome: 'Lucas Fontes',
      criadoEm: '2025-02-02T14:40:00.000Z',
    },
    {
      id: 'tl_6',
      empresaId: companyId,
      contaId: 'acc_1',
      tipo: 'reuniao_registrada',
      titulo: 'Reunião de Diagnóstico Realizada',
      descricao: 'Reunião de 45 min com Roberto Antunes e Juliana Meireles.',
      origem: 'usuario',
      criadoPorUsuarioId: 'usr_exec_1',
      criadoPorNome: 'Lucas Fontes',
      criadoEm: '2025-02-06T11:00:00.000Z',
    },
    {
      id: 'tl_7',
      empresaId: companyId,
      contaId: 'acc_1',
      tipo: 'oportunidade_atualizada',
      titulo: 'Proposta Comercial Apresentada',
      descricao:
        'Oportunidade avançada para a etapa "Proposta Apresentada" no valor de R$ 145.000.',
      origem: 'usuario',
      criadoPorUsuarioId: 'usr_exec_1',
      criadoPorNome: 'Lucas Fontes',
      criadoEm: '2025-04-10T14:30:00.000Z',
    },
    {
      id: 'tl_8',
      empresaId: companyId,
      contaId: 'acc_2',
      tipo: 'conta_criada',
      titulo: 'Conta Nexus Saúde Cadastrada',
      descricao: 'Cadastrada por Beatriz Ramos a partir de indicação.',
      origem: 'usuario',
      criadoPorUsuarioId: 'usr_exec_2',
      criadoPorNome: 'Beatriz Ramos',
      criadoEm: '2025-02-15T14:00:00.000Z',
    },
  ]

  return {
    accounts,
    contacts,
    opportunities,
    meetings,
    activities,
    timeline,
    drafts,
  }
}

// Storage Service API
export const storageService = {
  // Users
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS)
    if (!raw) {
      this.saveUsers(DEMO_USERS)
      return DEMO_USERS
    }
    try {
      return JSON.parse(raw)
    } catch {
      return DEMO_USERS
    }
  },

  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  },

  addUser(user: User) {
    const users = this.getUsers()
    users.push(user)
    this.saveUsers(users)
  },

  updateUser(id: string, updates: Partial<User>) {
    const users = this.getUsers().map((u) => (u.id === id ? { ...u, ...updates } : u))
    this.saveUsers(users)
  },

  deleteUser(id: string) {
    const users = this.getUsers().filter((u) => u.id !== id)
    this.saveUsers(users)
  },

  // Companies
  getCompanies(): Company[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANIES)
    if (!raw) {
      this.saveCompanies([DEMO_COMPANY])
      return [DEMO_COMPANY]
    }
    try {
      return JSON.parse(raw)
    } catch {
      return [DEMO_COMPANY]
    }
  },

  saveCompanies(companies: Company[]) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies))
  },

  addCompany(company: Company) {
    const companies = this.getCompanies()
    companies.push(company)
    this.saveCompanies(companies)
    // Initialize empty or template data for this company
    const initialData = buildDemoCompanyData(company.id)
    this.saveCompanyData(company.id, initialData)
  },

  updateCompany(id: string, updates: Partial<Company>) {
    const companies = this.getCompanies().map((c) => (c.id === id ? { ...c, ...updates } : c))
    this.saveCompanies(companies)
  },

  // Session
  getSession(): { userId: string; companyId: string } | null {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  setSession(userId: string, companyId: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify({ userId, companyId }))
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION)
  },

  // Company-Scoped Data
  getCompanyData(companyId: string): CompanyData {
    const key = `${STORAGE_KEYS.DATA_PREFIX}${companyId}`
    const raw = localStorage.getItem(key)
    if (!raw) {
      // If demo company, seed demo data
      if (companyId === DEMO_COMPANY.id) {
        const demoData = buildDemoCompanyData(companyId)
        this.saveCompanyData(companyId, demoData)
        return demoData
      }
      const emptyData: CompanyData = {
        accounts: [],
        contacts: [],
        opportunities: [],
        meetings: [],
        activities: [],
        timeline: [],
        drafts: [],
      }
      this.saveCompanyData(companyId, emptyData)
      return emptyData
    }
    try {
      return JSON.parse(raw)
    } catch {
      return {
        accounts: [],
        contacts: [],
        opportunities: [],
        meetings: [],
        activities: [],
        timeline: [],
        drafts: [],
      }
    }
  },

  saveCompanyData(companyId: string, data: CompanyData) {
    const key = `${STORAGE_KEYS.DATA_PREFIX}${companyId}`
    localStorage.setItem(key, JSON.stringify(data))
  },

  // AI Configuration
  getAiConfig(): AiConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CONFIG)
    if (!raw) {
      return { provider: 'skip_native', enabled: true }
    }
    try {
      return JSON.parse(raw)
    } catch {
      return { provider: 'skip_native', enabled: true }
    }
  },

  saveAiConfig(config: AiConfig) {
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(config))
  },

  // Reset demo
  resetToDemo() {
    this.saveCompanies([DEMO_COMPANY])
    this.saveUsers(DEMO_USERS)
    this.saveCompanyData(DEMO_COMPANY.id, buildDemoCompanyData(DEMO_COMPANY.id))
    this.setSession(DEMO_USERS[0].id, DEMO_COMPANY.id)
  },
}
