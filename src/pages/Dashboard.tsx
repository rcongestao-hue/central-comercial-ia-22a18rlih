import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { calculateCompanyStats, formatBRL, formatDatePtBR } from '@/lib/commercial-utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Users,
  Send,
  Calendar,
  KanbanSquare,
  Sparkles,
  ArrowUpRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { PIPELINE_STAGES } from '@/types'

export default function Dashboard() {
  const { currentUser, currentCompany, companyData } = useAuth()
  const navigate = useNavigate()

  const stats = calculateCompanyStats(companyData)
  const accounts = companyData.accounts || []
  const opportunities = companyData.opportunities || []
  const meetings = companyData.meetings || []
  const activities = companyData.activities || []
  const timeline = companyData.timeline || []

  const upcomingMeetings = meetings.filter((m) => m.status === 'agendada').slice(0, 4)

  const pendingOrDelayedActivities = activities
    .filter((a) => a.status === 'pendente' || a.status === 'atrasada')
    .slice(0, 5)

  const recentTimeline = [...timeline].reverse().slice(0, 6)

  const getStageLabel = (stageId: string) => {
    return PIPELINE_STAGES.find((s) => s.id === stageId)?.label || stageId
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Central Comercial Inteligente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Olá, {currentUser?.nome || 'Executivo'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Empresa ativa: <strong className="text-slate-800">{currentCompany?.nome}</strong> •
            Perfil:{' '}
            <span className="capitalize font-medium text-slate-700">{currentUser?.role}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => navigate('/prospeccao')}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Prospecção Assistida</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/contas')}
            className="border-slate-300 text-slate-700 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Ver Contas</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pipeline em Aberto */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pipeline Ativo
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatBRL(stats.totalPipelineValue)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-blue-600">{stats.openOpportunities}</span>{' '}
              oportunidades em andamento
            </p>
          </CardContent>
        </Card>

        {/* Contas Comerciais */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Contas Mapeadas
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalAccounts}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-emerald-600">{stats.activeAccounts}</span> contas
              ativas no radar
            </p>
          </CardContent>
        </Card>

        {/* Reuniões Agendadas */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Reuniões na Agenda
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.scheduledMeetings}
            </div>
            <p className="text-xs text-slate-500 mt-1">Compromissos e demonstrações confirmadas</p>
          </CardContent>
        </Card>

        {/* Atividades / Follow-ups */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Atividades Pendentes
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.pendingActivities}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.delayedActivities > 0 ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline" /> {stats.delayedActivities}{' '}
                  atrasada(s)
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 inline" /> Em dia
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Pipeline Preview + Tasks & Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Active Accounts & Opportunities */}
        <div className="lg:col-span-8 space-y-6">
          {/* Opportunities Highlight */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Oportunidades em Destaque no Funil
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Acompanhe os negócios mais próximos de fechamento
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/oportunidades')}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Ver Pipeline Kanban</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {opportunities.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhuma oportunidade cadastrada ainda.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {opportunities.slice(0, 5).map((opp) => {
                    const acc = accounts.find((a) => a.id === opp.contaId)
                    return (
                      <div
                        key={opp.id}
                        onClick={() => navigate(`/contas/${opp.contaId}`)}
                        className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {opp.titulo}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {acc?.nomeFantasia || acc?.razaoSocial || 'Conta'} • {acc?.segmento}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge variant="outline" className="text-xs bg-slate-50">
                            {getStageLabel(opp.etapa)}
                          </Badge>
                          <span className="text-sm font-bold text-slate-900">
                            {formatBRL(opp.valorEstimado)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick AI Proactive Insights */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Diagnóstico Inteligente do Radar Comercial</span>
                </div>
                <Badge className="bg-blue-600 text-white text-[10px]">IA Nativa Ativa</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-700">
              <p className="leading-relaxed">
                A IA analisou as diretrizes da <strong>{currentCompany?.nome}</strong> e identificou
                as seguintes prioridades para hoje:
              </p>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white border border-blue-100 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      Follow-up de Alto Impacto: Vanguard Logística
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Proposta de R$ 145.000 em validação jurídica. Gere uma mensagem executiva
                      consultiva na aba de Prospecção Assistida.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-blue-100 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      Preparação de Demonstração: Nexus Saúde
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Reunião com Dra. Camila Toledo em 48h. Aderência ao ICP avaliada em 88%.
                      Perguntas de qualificação prontas no perfil da conta.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 4 Cols: Agenda & Recent Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Meetings */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">Próximas Reuniões</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/agenda')}
                className="text-xs text-blue-600 p-0 h-auto hover:bg-transparent"
              >
                Ver agenda
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {upcomingMeetings.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Nenhuma reunião agendada.</p>
              ) : (
                upcomingMeetings.map((m) => {
                  const acc = accounts.find((a) => a.id === m.contaId)
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                        <span className="truncate">{m.titulo}</span>
                        <span className="text-blue-600 font-bold shrink-0">
                          {formatDatePtBR(m.dataHora)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {acc?.nomeFantasia || 'Conta'} • {m.duracaoMinutos} min
                      </p>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Unified Timeline Snapshot */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">
                Histórico de Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {recentTimeline.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Nenhum evento registrado.</p>
              ) : (
                <div className="relative pl-4 space-y-3 border-l-2 border-slate-200 text-xs">
                  {recentTimeline.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <p className="font-semibold text-slate-800 leading-tight">{item.titulo}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {item.descricao}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{formatDatePtBR(item.criadoEm)}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {item.origem === 'ia' ? 'IA Comercial' : item.criadoPorNome || 'Usuário'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
