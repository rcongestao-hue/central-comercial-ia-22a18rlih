import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { calculateCompanyStats, formatBRL } from '@/lib/commercial-utils'
import { PIPELINE_STAGES } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Download,
  PieChart,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ReportsPage() {
  const { currentCompany, companyData } = useAuth()
  const { toast } = useToast()

  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'ano' | 'tudo'>('mes')

  const stats = calculateCompanyStats(companyData)
  const accounts = companyData.accounts || []
  const opportunities = companyData.opportunities || []
  const meetings = companyData.meetings || []

  // Export CSV
  const handleExportCsv = () => {
    if (opportunities.length === 0) {
      toast({ title: 'Nenhum dado para exportar', variant: 'destructive' })
      return
    }

    const headers = ['Título', 'Conta', 'Valor', 'Etapa', 'Prazo', 'Responsável']
    const rows = opportunities.map((opp) => {
      const acc = accounts.find((a) => a.id === opp.contaId)
      return [
        `"${opp.titulo.replace(/"/g, '""')}"`,
        `"${(acc?.nomeFantasia || acc?.razaoSocial || '').replace(/"/g, '""')}"`,
        opp.valorEstimado,
        `"${opp.etapa}"`,
        `"${opp.prazoEstimado || ''}"`,
        `"${opp.responsavelId}"`,
      ].join(';')
    })

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `relatorio_comercial_${currentCompany?.nome || 'empresa'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({ title: 'Relatório CSV baixado com sucesso!' })
  }

  // Stage distribution
  const stageCounts = PIPELINE_STAGES.map((st) => {
    const oppsInStage = opportunities.filter((o) => o.etapa === st.id)
    const totalVal = oppsInStage.reduce((acc, o) => acc + (o.valorEstimado || 0), 0)
    return {
      stage: st,
      count: oppsInStage.length,
      value: totalVal,
    }
  })

  // Won vs Lost reasons
  const lostOpps = opportunities.filter((o) => o.etapa === 'perdida')
  const wonOpps = opportunities.filter((o) => o.etapa === 'ganha')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Relatórios & Inteligência Comercial</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Métricas de conversão, saúde do funil e distribuição de volume negociado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCsv}
            variant="outline"
            className="border-slate-300 text-slate-700 flex items-center gap-2 text-xs h-9 bg-white"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white shadow-sm p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Volume em Negociação
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatBRL(stats.totalPipelineValue)}
          </div>
          <p className="text-xs text-slate-500">{stats.openOpportunities} negócios ativos</p>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Volume Fechado (Ganha)
          </span>
          <div className="text-2xl font-black text-emerald-600">{formatBRL(stats.wonValue)}</div>
          <p className="text-xs text-slate-500">{wonOpps.length} contratos assinados</p>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Volume Perdido</span>
          <div className="text-2xl font-black text-rose-600">{formatBRL(stats.lostValue)}</div>
          <p className="text-xs text-slate-500">{lostOpps.length} oportunidades perdidas</p>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Taxa de Conversão</span>
          <div className="text-2xl font-black text-blue-600">
            {stats.conversionRate.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500">Ganha vs Total Encerradas</p>
        </Card>
      </div>

      {/* Funnel Stage Breakdown */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900">
            Distribuição de Oportunidades por Etapa do Funil
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Visão detalhada de volume financeiro e quantidade de contas em cada fase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {stageCounts.map(({ stage, count, value }) => {
              const percentage =
                stats.totalPipelineValue > 0 ? (value / stats.totalPipelineValue) * 100 : 0
              return (
                <div key={stage.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800">
                      {stage.label} ({count})
                    </span>
                    <span className="text-slate-900 font-bold">{formatBRL(value)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(count > 0 ? 5 : 0, percentage))}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reasons for Lost Deals & Closed Deals Recap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Motivos de Perda */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Análise de Motivos de Perda</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {lostOpps.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">
                Nenhuma oportunidade perdida registrada.
              </p>
            ) : (
              lostOpps.map((opp) => {
                const acc = accounts.find((a) => a.id === opp.contaId)
                return (
                  <div
                    key={opp.id}
                    className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{opp.titulo}</span>
                      <span className="text-rose-700">{formatBRL(opp.valorEstimado)}</span>
                    </div>
                    <p className="text-slate-500">{acc?.nomeFantasia || 'Conta'}</p>
                    <p className="text-slate-700 font-medium pt-1">
                      <strong>Motivo:</strong>{' '}
                      {opp.motivoPerda || 'Preço / Concorrente / Solução Interna'}
                    </p>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Negócios Ganhos */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Contratos Fechados com Sucesso</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {wonOpps.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">
                Nenhum contrato ganho registrado ainda.
              </p>
            ) : (
              wonOpps.map((opp) => {
                const acc = accounts.find((a) => a.id === opp.contaId)
                return (
                  <div
                    key={opp.id}
                    className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{opp.titulo}</span>
                      <span className="text-emerald-700">{formatBRL(opp.valorEstimado)}</span>
                    </div>
                    <p className="text-slate-500">{acc?.nomeFantasia || 'Conta'}</p>
                    {opp.observacoes && (
                      <p className="text-slate-700 text-[11px]">{opp.observacoes}</p>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
