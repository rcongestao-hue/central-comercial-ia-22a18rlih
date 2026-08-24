import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Opportunity, PipelineStage, PIPELINE_STAGES } from '@/types'
import { formatBRL, formatDatePtBR } from '@/lib/commercial-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  KanbanSquare,
  List,
  Plus,
  Search,
  Building2,
  DollarSign,
  Calendar,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function PipelinePage() {
  const { currentCompany, currentUser, companyData, updateCompanyData } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form State
  const [contaId, setContaId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [valor, setValor] = useState('')
  const [etapa, setEtapa] = useState<PipelineStage>('conta_identificada')
  const [prazo, setPrazo] = useState('')
  const [proximaAcao, setProximaAcao] = useState('')

  const accounts = companyData.accounts || []
  const opportunities = companyData.opportunities || []
  const users = companyData ? storageUsers(currentCompany?.id) : []

  function storageUsers(empresaId?: string) {
    return [
      { id: 'usr_admin_1', nome: 'Carlos Mendes' },
      { id: 'usr_gestor_1', nome: 'Mariana Silveira' },
      { id: 'usr_exec_1', nome: 'Lucas Fontes' },
      { id: 'usr_exec_2', nome: 'Beatriz Ramos' },
    ]
  }

  const filteredOpps = opportunities.filter((opp) => {
    const acc = accounts.find((a) => a.id === opp.contaId)
    const accName = acc ? acc.nomeFantasia || acc.razaoSocial : ''
    return (
      opp.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo || !contaId || !currentCompany) return

    import('@/services/crm-service').then(async ({ crmService }) => {
      try {
        const createdOpp = await crmService.createOpportunity({
          company: currentCompany.id,
          account: contaId,
          proximo_passo: titulo,
          etapa,
          valor_estimado: parseFloat(valor) || 0,
          prazo: prazo || undefined,
        })

        await crmService.createActivity({
          company: currentCompany.id,
          account: contaId,
          type: 'oportunidade_atualizada',
          description: `Nova Oportunidade: ${titulo} (${formatBRL(parseFloat(valor) || 0)})`,
        })

        updateCompanyData((prev) => ({
          ...prev,
          opportunities: [createdOpp, ...prev.opportunities],
        }))

        toast({ title: 'Oportunidade adicionada ao pipeline!' })
        setDialogOpen(false)
        resetForm()
      } catch (err: any) {
        toast({
          title: 'Erro ao criar oportunidade',
          description: err?.message,
          variant: 'destructive',
        })
      }
    })
  }

  const handleMoveStage = (oppId: string, newStage: PipelineStage) => {
    if (!currentCompany) return
    const targetOpp = opportunities.find((o) => o.id === oppId)
    if (!targetOpp) return

    import('@/services/crm-service').then(async ({ crmService }) => {
      try {
        await crmService.updateOpportunity(oppId, { etapa: newStage })
        await crmService.createActivity({
          company: currentCompany.id,
          account: targetOpp.account || targetOpp.contaId,
          type: 'oportunidade_atualizada',
          description: `Oportunidade movida para ${PIPELINE_STAGES.find((s) => s.id === newStage)?.label}`,
        })

        updateCompanyData((prev) => ({
          ...prev,
          opportunities: prev.opportunities.map((o) =>
            o.id === oppId ? { ...o, etapa: newStage } : o,
          ),
        }))

        toast({ title: 'Etapa do pipeline atualizada' })
      } catch (err: any) {
        toast({ title: 'Erro ao mover etapa', description: err?.message, variant: 'destructive' })
      }
    })
  }

  const resetForm = () => {
    setContaId('')
    setTitulo('')
    setValor('')
    setEtapa('conta_identificada')
    setPrazo('')
    setProximaAcao('')
  }

  // Pipeline summary
  const totalValue = filteredOpps.reduce((acc, o) => acc + (o.valorEstimado || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <KanbanSquare className="w-6 h-6 text-blue-600" />
            <span>Pipeline de Oportunidades</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Funil comercial de 13 etapas para acompanhamento visual do avanço das negociações.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center shadow-sm">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="h-8 text-xs font-semibold px-2.5 flex items-center gap-1"
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Quadro</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 text-xs font-semibold px-2.5 flex items-center gap-1"
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </Button>
          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm text-xs h-10"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Oportunidade</span>
          </Button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Filtrar por nome do negócio ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-sm border-slate-300 bg-white"
            />
          </div>
        </div>

        <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-2.5 px-4 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Volume Total Exibido:</span>
          <span className="text-base font-black text-slate-900">{formatBRL(totalValue)}</span>
        </div>
      </div>

      {/* VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4 pt-1">
          <div className="flex gap-4 min-w-[1400px]">
            {PIPELINE_STAGES.map((stage) => {
              const stageOpps = filteredOpps.filter((o) => o.etapa === stage.id)
              const stageTotal = stageOpps.reduce((acc, o) => acc + (o.valorEstimado || 0), 0)

              return (
                <div
                  key={stage.id}
                  className="w-[280px] shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-xl flex flex-col max-h-[75vh]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-slate-200/90 bg-white rounded-t-xl">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-slate-800 truncate">
                        {stage.label}
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold">
                        {stageOpps.length}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-bold text-blue-600">{formatBRL(stageTotal)}</p>
                  </div>

                  {/* Column Cards */}
                  <div className="p-2 space-y-2 overflow-y-auto flex-1">
                    {stageOpps.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                        Sem negócios nesta etapa
                      </div>
                    ) : (
                      stageOpps.map((opp) => {
                        const acc = accounts.find((a) => a.id === opp.contaId)
                        return (
                          <Card
                            key={opp.id}
                            className="p-3 bg-white border-slate-200 shadow-sm hover:border-blue-400 hover:shadow transition-all space-y-2 text-xs cursor-pointer group"
                            onClick={() => acc && navigate(`/contas/${acc.id}`)}
                          >
                            <div>
                              <h4 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                                {opp.titulo}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {acc?.nomeFantasia || acc?.razaoSocial || 'Conta'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between font-black text-slate-900 pt-1 border-t border-slate-100">
                              <span>{formatBRL(opp.valorEstimado)}</span>
                              {opp.prazoEstimado && (
                                <span className="text-[10px] font-normal text-slate-400">
                                  {formatDatePtBR(opp.prazoEstimado)}
                                </span>
                              )}
                            </div>

                            {/* Stage advance quick selector */}
                            <div
                              className="pt-1 flex items-center justify-between gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-[10px] text-slate-400 font-medium">Mover:</span>
                              <Select
                                value={opp.etapa}
                                onValueChange={(val: any) => handleMoveStage(opp.id, val)}
                              >
                                <SelectTrigger className="h-6 text-[10px] px-1.5 border-slate-200 bg-slate-50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PIPELINE_STAGES.map((s) => (
                                    <SelectItem key={s.id} value={s.id} className="text-xs">
                                      {s.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* VIEW: LIST */
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Negócio / Título</th>
                  <th className="py-3 px-4">Conta Comercial</th>
                  <th className="py-3 px-4">Etapa Atual</th>
                  <th className="py-3 px-4">Valor Estimado</th>
                  <th className="py-3 px-4">Previsão</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOpps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhuma oportunidade encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredOpps.map((opp) => {
                    const acc = accounts.find((a) => a.id === opp.contaId)
                    return (
                      <tr
                        key={opp.id}
                        className="hover:bg-slate-50/80 cursor-pointer"
                        onClick={() => acc && navigate(`/contas/${acc.id}`)}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900">{opp.titulo}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {acc?.nomeFantasia || acc?.razaoSocial || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] bg-slate-50">
                            {PIPELINE_STAGES.find((s) => s.id === opp.etapa)?.label || opp.etapa}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900">
                          {formatBRL(opp.valorEstimado)}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDatePtBR(opp.prazoEstimado)}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => acc && navigate(`/contas/${acc.id}`)}
                            className="text-xs text-blue-600"
                          >
                            Ver Conta →
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* DIALOG: NOVA OPORTUNIDADE */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Oportunidade Comercial</DialogTitle>
            <DialogDescription>
              Adicione um negócio em andamento com valor estimado e etapa inicial no pipeline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOpportunity} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Conta Comercial *</Label>
              <Select value={contaId} onValueChange={setContaId} required>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Selecione a empresa associada" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="text-xs">
                      {a.nomeFantasia || a.razaoSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Título do Negócio *</Label>
              <Input
                placeholder="Ex: Expansão Nacional de Logística Q2"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Valor Estimado (R$)</Label>
                <Input
                  type="number"
                  placeholder="85000"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Etapa Inicial</Label>
                <Select value={etapa} onValueChange={(val: any) => setEtapa(val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Previsão de Fechamento</Label>
                <Input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Próxima Ação</Label>
                <Input
                  placeholder="Ex: Agendar demo"
                  value={proximaAcao}
                  onChange={(e) => setProximaAcao(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white font-semibold">
                Salvar no Pipeline
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
