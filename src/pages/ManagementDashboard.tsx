import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { calculateCompanyStats, formatBRL } from '@/lib/commercial-utils'
import { PIPELINE_STAGES } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Briefcase,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Calendar,
  Building2,
  Award,
} from 'lucide-react'

export default function ManagementDashboard() {
  const { currentCompany, userList, companyData } = useAuth()

  const [selectedExecId, setSelectedExecId] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<'semana' | 'mes' | 'trimestre'>('mes')

  const accounts = companyData.accounts || []
  const opportunities = companyData.opportunities || []
  const activities = companyData.activities || []
  const meetings = companyData.meetings || []

  // Filter accounts by executive if selected
  const filteredAccounts = accounts.filter(
    (a) => selectedExecId === 'all' || a.responsavelComercialId === selectedExecId,
  )

  const filteredOpps = opportunities.filter(
    (o) => selectedExecId === 'all' || o.responsavelId === selectedExecId,
  )

  const filteredActivities = activities.filter(
    (act) => selectedExecId === 'all' || act.responsavelId === selectedExecId,
  )

  // Metrics calculation
  const accountsWithoutNextStep = filteredAccounts.filter((a) => !a.proximoPasso)
  const accountsWithoutMovement = filteredAccounts.filter(
    (a) => a.etapaAtual === 'conta_identificada',
  )
  const delayedActivities = filteredActivities.filter((a) => a.status === 'atrasada')
  const completedActivities = filteredActivities.filter((a) => a.status === 'concluida')

  // Executive team members
  const executives = userList.filter(
    (u) => u.role === 'executivo' || u.role === 'gestor' || u.role === 'admin',
  )

  // Team performance table
  const teamMetrics = executives.map((exec) => {
    const execAccounts = accounts.filter((a) => a.responsavelComercialId === exec.id)
    const execOpps = opportunities.filter((o) => o.responsavelId === exec.id)
    const execWonOpps = execOpps.filter((o) => o.etapa === 'ganha')
    const execWonValue = execWonOpps.reduce((acc, o) => acc + (o.valorEstimado || 0), 0)
    const execPipeline = execOpps
      .filter((o) => o.etapa !== 'ganha' && o.etapa !== 'perdida')
      .reduce((acc, o) => acc + (o.valorEstimado || 0), 0)
    const execMeetings = meetings.filter((m) => m.participantes.some((p) => p.includes(exec.nome)))

    return {
      exec,
      accountCount: execAccounts.length,
      oppCount: execOpps.length,
      pipelineValue: execPipeline,
      wonValue: execWonValue,
      meetingCount: execMeetings.length,
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>Painel do Gestor Comercial</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Visão gerencial de performance da equipe, gargalos de funil e saúde da carteira.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Executive Filter */}
          <Select value={selectedExecId} onValueChange={setSelectedExecId}>
            <SelectTrigger className="w-[200px] h-9 text-xs border-slate-300 bg-white">
              <SelectValue placeholder="Todos os executivos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda a equipe ({executives.length})</SelectItem>
              {executives.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nome} ({e.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Period Selector */}
          <Select value={selectedPeriod} onValueChange={(val: any) => setSelectedPeriod(val)}>
            <SelectTrigger className="w-[140px] h-9 text-xs border-slate-300 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="trimestre">Este Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Critical Managerial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Contas sem Próximo Passo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {accountsWithoutNextStep.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {accountsWithoutNextStep.length > 0 ? (
                <span className="text-amber-600 font-semibold">Exige atenção do gestor</span>
              ) : (
                <span className="text-emerald-600 font-semibold">
                  Todas as contas com ação definida
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Contas Paradas no Topo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {accountsWithoutMovement.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Contas apenas identificadas sem avanço</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Atividades Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{delayedActivities.length}</div>
            <p className="text-xs text-slate-500 mt-1">Follow-ups fora do prazo previsto</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reuniões Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {meetings.filter((m) => m.status === 'concluida').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Demonstrações e diagnósticos com atas</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Productivity Table */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Performance por Executivo Comercial
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Distribuição da carteira de contas, pipeline e volume ganho por membro do time
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Executivo / Responsável</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4 text-center">Contas</th>
                <th className="py-3 px-4 text-center">Oportunidades</th>
                <th className="py-3 px-4 text-center">Reuniões</th>
                <th className="py-3 px-4">Pipeline Ativo</th>
                <th className="py-3 px-4">Volume Fechado (Ganha)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMetrics.map((row) => (
                <tr key={row.exec.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{row.exec.nome}</p>
                    <p className="text-[11px] text-slate-500">{row.exec.cargo}</p>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] uppercase bg-slate-50">
                      {row.exec.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {row.accountCount}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">{row.oppCount}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {row.meetingCount}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-600">
                    {formatBRL(row.pipelineValue)}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    {formatBRL(row.wonValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Weekly AI Synthesis Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Resumo Semanal Executivo Gerado por IA</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            O time comercial da <strong>{currentCompany?.nome}</strong> movimentou{' '}
            <strong>{filteredOpps.length} oportunidades</strong> neste ciclo. O maior gargalo
            identificado concentra-se no avanço da etapa de proposta comercial para validação
            jurídica.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-white rounded-lg border border-blue-100 space-y-1">
              <span className="font-bold text-blue-900 block">Recomendação de Gestão:</span>
              <p className="text-slate-600">
                Priorizar reuniões executivas de alinhamento nas contas de maior valor (Horizonte
                Alimentos e Vanguard Logística) para encurtar o fechamento no fechamento do mês.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100 space-y-1">
              <span className="font-bold text-blue-900 block">Atenção Operacional:</span>
              <p className="text-slate-600">
                Existem {accountsWithoutNextStep.length} contas sem próximo passo definido.
                Incentive os executivos a utilizarem o botão de Prospecção Assistida para retomar
                contato.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
