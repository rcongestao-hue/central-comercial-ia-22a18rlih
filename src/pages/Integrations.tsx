import React, { useState } from 'react'
import { INITIAL_INTEGRATIONS } from '@/services/storage'
import { IntegrationCard } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plug,
  MessageSquare,
  Mail,
  Inbox,
  Calendar,
  CalendarDays,
  Share2,
  Cpu,
  Sparkles,
  Bot,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react'

export default function IntegrationsPage() {
  const [integrations] = useState<IntegrationCard[]>(INITIAL_INTEGRATIONS)
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationCard | null>(null)

  const iconMap: Record<string, any> = {
    MessageSquare,
    Mail,
    Inbox,
    Calendar,
    CalendarDays,
    Share2,
    Cpu,
    Sparkles,
    Bot,
  }

  const statusBadges: Record<string, { label: string; color: string }> = {
    nao_conectado: {
      label: 'Não Conectado',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    disponivel_configuracao: {
      label: 'Disponível para Configuração',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    aguardando_autorizacao: {
      label: 'Aguardando Autorização',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    conectado: { label: 'Conectado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    indisponivel_ambiente: {
      label: 'Indisponível no Ambiente',
      color: 'bg-slate-100 text-slate-400 border-slate-200',
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Plug className="w-6 h-6 text-blue-600" />
          <span>Integrações & Conectores Opcionais</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Conexões com serviços de produtividade corporativa. Sem simulações fictícias ou logins
          falsos.
        </p>
      </div>

      {/* Security & Authenticity Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-white text-sm">Política de Transparência de Conectores</p>
            <p className="text-slate-300 leading-relaxed">
              A Central Comercial IA opera com fluxo assistido oficial. Nunca simulamos conexões
              ativas sem autenticação OAuth ou token válido. Todas as funcionalidades centrais
              operam perfeitamente no modo nativo sem integrações pagas obrigatórias.
            </p>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => {
          const IconComponent = iconMap[item.icone] || Plug
          const statusInfo = statusBadges[item.status] || statusBadges.disponivel_configuracao

          return (
            <Card
              key={item.id}
              className="border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="pt-2">
                  <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                    {item.nome}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.descricao}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800 block mb-0.5">
                    Sem integração externa:
                  </span>
                  <span>{item.funcionaSemIntegracao}</span>
                </div>
              </CardContent>

              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIntegration(item)}
                  className="w-full text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>COMO CONECTAR</span>
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* DETAILED "COMO CONECTAR" DIALOG */}
      <Dialog
        open={!!selectedIntegration}
        onOpenChange={(open) => !open && setSelectedIntegration(null)}
      >
        {selectedIntegration && (
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {selectedIntegration.categoria.toUpperCase()}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Como Conectar: {selectedIntegration.nome}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Requisitos técnicos, aprovações necessárias e custos para ativação oficial.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs text-slate-700">
              {/* O que permite */}
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 space-y-1.5">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  O que esta integração permite:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  {selectedIntegration.oQuePermite.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Credenciais Necessárias */}
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Credenciais & Requisitos:</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {selectedIntegration.credenciaisNecessarias.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Exige Aprovação */}
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Exige Aprovação Externa?</span>
                <p className="text-slate-600">{selectedIntegration.exigeAprovacao}</p>
              </div>

              {/* Custos */}
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Custos do Provedor:</span>
                <p className="text-slate-600">{selectedIntegration.custos}</p>
              </div>

              {/* O que funciona sem integração */}
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  O que já funciona hoje sem nenhuma integração:
                </span>
                <p className="text-slate-700">{selectedIntegration.funcionaSemIntegracao}</p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setSelectedIntegration(null)}
                  className="bg-slate-900 text-white text-xs"
                >
                  Entendi
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
