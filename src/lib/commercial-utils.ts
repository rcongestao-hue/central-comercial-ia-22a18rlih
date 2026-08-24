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
  Role,
} from '@/types'
import { CompanyData } from '@/services/storage'

export interface CompanyStats {
  totalAccounts: number
  activeAccounts: number
  totalContacts: number
  openOpportunities: number
  totalPipelineValue: number
  wonValue: number
  lostValue: number
  scheduledMeetings: number
  pendingActivities: number
  delayedActivities: number
  conversionRate: number
}

export function calculateCompanyStats(data: CompanyData): CompanyStats {
  const accounts = data.accounts || []
  const contacts = data.contacts || []
  const opps = data.opportunities || []
  const meetings = data.meetings || []
  const activities = data.activities || []

  const totalAccounts = accounts.length
  const activeAccounts = accounts.filter((a) => a.etapaAtual !== 'perdida').length
  const totalContacts = contacts.length

  const openOpps = opps.filter((o) => o.etapa !== 'ganha' && o.etapa !== 'perdida')
  const wonOpps = opps.filter((o) => o.etapa === 'ganha')
  const lostOpps = opps.filter((o) => o.etapa === 'perdida')

  const totalPipelineValue = openOpps.reduce((acc, o) => acc + (o.valorEstimado || 0), 0)
  const wonValue = wonOpps.reduce((acc, o) => acc + (o.valorEstimado || 0), 0)
  const lostValue = lostOpps.reduce((acc, o) => acc + (o.valorEstimado || 0), 0)

  const totalFinished = wonOpps.length + lostOpps.length
  const conversionRate = totalFinished > 0 ? (wonOpps.length / totalFinished) * 100 : 0

  const nowStr = new Date().toISOString().split('T')[0]
  const scheduledMeetings = meetings.filter((m) => m.status === 'agendada').length

  const pendingActivities = activities.filter((a) => a.status === 'pendente').length
  const delayedActivities = activities.filter(
    (a) => a.status === 'atrasada' || (a.status === 'pendente' && a.dataVencimento < nowStr),
  ).length

  return {
    totalAccounts,
    activeAccounts,
    totalContacts,
    openOpportunities: openOpps.length,
    totalPipelineValue,
    wonValue,
    lostValue,
    scheduledMeetings,
    pendingActivities,
    delayedActivities,
    conversionRate,
  }
}

export function canManageUsers(role: Role): boolean {
  return role === 'admin'
}

export function canEditCommercialData(role: Role): boolean {
  return role === 'admin' || role === 'gestor' || role === 'executivo'
}

export function canViewReports(role: Role): boolean {
  return true // All roles can view reports
}

export function canAccessGestorPanel(role: Role): boolean {
  return role === 'admin' || role === 'gestor'
}

export function canConfigureIntegrations(role: Role): boolean {
  return role === 'admin'
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDatePtBR(isoString?: string): string {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch {
    return isoString
  }
}

export function formatDateTimePtBR(isoString?: string): string {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return isoString
  }
}
