// Storage Service shim - Only used for UI preferences like themes, sidebar states, etc.
// All commercial data is stored in PocketBase (crmService).

import { CompanyData } from '@/context/AuthContext'
import { IntegrationCard } from '@/types'

export type { CompanyData }

export interface UiPreferences {
  sidebarCollapsed?: boolean
  theme?: string
}

export const INITIAL_INTEGRATIONS: IntegrationCard[] = [
  {
    id: 'whatsapp',
    nome: 'WhatsApp Business Cloud API',
    categoria: 'comunicacao',
    icone: 'MessageSquare',
    descricao: 'Disparo de mensagens transacionais e templates homologados pela Meta.',
    status: 'disponivel_configuracao',
    oQuePermite: [
      'Envio de modelos de mensagem aprovados pela Meta',
      'Recebimento de respostas e webhook de status',
      'Histórico sincronizado na timeline da conta',
    ],
    credenciaisNecessarias: [
      'Meta Business Manager verificado',
      'Conta WhatsApp Business API ativa',
      'Token de acesso de sistema permanente',
    ],
    exigeAprovacao: 'Sim, pela Meta (processo de verificação de empresa).',
    custos: 'Tarifação por conversa iniciada cobrada diretamente pela Meta.',
    funcionaSemIntegracao: 'A IA redige o texto exato e o botão "Abrir no WhatsApp Web" transfere a mensagem sem necessidade de API.',
  },
  {
    id: 'gmail',
    nome: 'Google Workspace / Gmail',
    categoria: 'email_calendario',
    icone: 'Mail',
    descricao: 'Sincronização de envio de e-mails comerciais e convites de agenda Google Meet.',
    status: 'disponivel_configuracao',
    oQuePermite: [
      'Envio de e-mails em nome do executivo autenticado via OAuth',
      'Agendamento automático no Google Calendar',
      'Sincronização de respostas na timeline',
    ],
    credenciaisNecessarias: [
      'Projeto Google Cloud Console configurado',
      'Escopos de Gmail e Calendar autorizados',
      'OAuth Client ID e Client Secret',
    ],
    exigeAprovacao: 'Verificação do app pelo Google para escopos sensíveis.',
    custos: 'Incluso no plano Google Workspace existente.',
    funcionaSemIntegracao: 'A IA gera o assunto e o corpo formatado com botão "Copiar Texto" ou "mailto:" pronto.',
  },
  {
    id: 'outlook',
    nome: 'Microsoft 365 / Outlook',
    categoria: 'email_calendario',
    icone: 'Inbox',
    descricao: 'Conexão via Microsoft Graph para envio de e-mails e reuniões Teams.',
    status: 'disponivel_configuracao',
    oQuePermite: [
      'Envio de propostas e cadências pelo Outlook',
      'Criação de links do Teams na agenda',
    ],
    credenciaisNecessarias: [
      'Registro de aplicativo no Microsoft Entra ID (Azure AD)',
      'Consentimento do administrador do locatário',
    ],
    exigeAprovacao: 'Aprovação do Administrador de TI da organização.',
    custos: 'Incluso na licença Microsoft 365 da empresa.',
    funcionaSemIntegracao: 'Cópia rápida de ata de reunião e pauta gerada por IA para colar no seu cliente de e-mail.',
  },
  {
    id: 'linkedin',
    nome: 'LinkedIn Sales Navigator',
    categoria: 'comunicacao',
    icone: 'Share2',
    descricao: 'Sincronização de perfis e mensagens InMail oficiais.',
    status: 'indisponivel_ambiente',
    oQuePermite: [
      'Visualização do perfil corporativo do lead',
      'Envio de InMails diretamente pela plataforma',
    ],
    credenciaisNecessarias: [
      'Assinatura LinkedIn Sales Navigator Advanced Plus',
      'Contrato de API LinkedIn Enterprise CRM Partner',
    ],
    exigeAprovacao: 'Aprovação comercial e técnica restrita do LinkedIn Corporation.',
    custos: 'Licenças corporativas de alto volume.',
    funcionaSemIntegracao: 'Busca direta por atalho com botão "Pesquisar Perfil no LinkedIn" e mensagens de conexão pré-redigidas.',
  },
]

const UI_PREF_KEY = 'central_ia_ui_prefs'

export const storageService = {
  getUiPreferences(): UiPreferences {
    try {
      const raw = localStorage.getItem(UI_PREF_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  },

  saveUiPreferences(prefs: UiPreferences) {
    localStorage.setItem(UI_PREF_KEY, JSON.stringify(prefs))
  },
}
