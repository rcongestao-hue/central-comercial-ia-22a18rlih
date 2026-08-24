import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Meeting, Activity } from '@/types'
import { commercialAiService } from '@/services/ai-service'
import { formatDatePtBR, formatDateTimePtBR } from '@/lib/commercial-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
  Phone,
  Video,
  Building2,
  FileText,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AgendaPage() {
  const { currentCompany, currentUser, companyData, updateCompanyData } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'compromissos' | 'atividades'>('compromissos')
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)

  // Meeting Form
  const [meetContaId, setMeetContaId] = useState('')
  const [meetTitulo, setMeetTitulo] = useState('')
  const [meetDataHora, setMeetDataHora] = useState('')
  const [meetDuracao, setMeetDuracao] = useState('45')
  const [meetTipo, setMeetTipo] = useState<'reuniao' | 'followup' | 'ligacao' | 'retorno'>(
    'reuniao',
  )
  const [meetAnotacoes, setMeetAnotacoes] = useState('')

  // Activity Form
  const [actContaId, setActContaId] = useState('')
  const [actTitulo, setActTitulo] = useState('')
  const [actTipo, setActTipo] = useState<
    'followup' | 'ligacao' | 'retorno' | 'reuniao' | 'proposta'
  >('followup')
  const [actVencimento, setActVencimento] = useState('')
  const [actObs, setActObs] = useState('')

  const accounts = companyData.accounts || []
  const meetings = companyData.meetings || []
  const activities = companyData.activities || []

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetTitulo || !meetDataHora || !currentCompany) return

    const acc = accounts.find((a) => a.id === meetContaId)
    const summary = commercialAiService.summarizeMeeting(
      meetAnotacoes,
      acc?.nomeFantasia || 'Conta Comercial',
    )

    const newMeeting: Meeting = {
      id: `meet_${Date.now()}`,
      empresaId: currentCompany.id,
      contaId: meetContaId || accounts[0]?.id || '',
      titulo: meetTitulo,
      dataHora: meetDataHora,
      duracaoMinutos: parseInt(meetDuracao, 10) || 45,
      tipo: meetTipo,
      participantes: [currentUser?.nome || 'Executivo Comercial'],
      anotacoes: meetAnotacoes,
      resumoIa: meetAnotacoes ? summary.resumo : undefined,
      proximaAtividade: meetAnotacoes ? summary.proximosPassos[0] : undefined,
      status: 'agendada',
      criadoEm: new Date().toISOString(),
    }

    updateCompanyData((prev) => ({
      ...prev,
      meetings: [newMeeting, ...prev.meetings],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: newMeeting.contaId,
          tipo: 'reuniao_registrada',
          titulo: `Reunião Agendada: ${newMeeting.titulo}`,
          descricao: `Agendada para ${formatDateTimePtBR(newMeeting.dataHora)} por ${currentUser?.nome}.`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))

    toast({ title: 'Compromisso agendado na agenda interna!' })
    setMeetingDialogOpen(false)
    resetMeetingForm()
  }

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!actTitulo || !actVencimento || !currentCompany) return

    const newActivity: Activity = {
      id: `act_${Date.now()}`,
      empresaId: currentCompany.id,
      contaId: actContaId || accounts[0]?.id || '',
      titulo: actTitulo,
      tipo: actTipo,
      dataVencimento: actVencimento,
      responsavelId: currentUser?.id || 'usr_exec_1',
      status: 'pendente',
      observacoes: actObs,
      criadoEm: new Date().toISOString(),
    }

    updateCompanyData((prev) => ({
      ...prev,
      activities: [newActivity, ...prev.activities],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: newActivity.contaId,
          tipo: 'proximo_passo_criado',
          titulo: `Atividade Criada: ${newActivity.titulo}`,
          descricao: `Vencimento em ${formatDatePtBR(newActivity.dataVencimento)}.`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))

    toast({ title: 'Atividade comercial adicionada!' })
    setActivityDialogOpen(false)
    resetActivityForm()
  }

  const handleToggleActivityStatus = (actId: string) => {
    if (!currentCompany) return
    updateCompanyData((prev) => ({
      ...prev,
      activities: prev.activities.map((a) =>
        a.id === actId ? { ...a, status: a.status === 'concluida' ? 'pendente' : 'concluida' } : a,
      ),
    }))
    toast({ title: 'Status da atividade atualizado' })
  }

  const resetMeetingForm = () => {
    setMeetContaId('')
    setMeetTitulo('')
    setMeetDataHora('')
    setMeetAnotacoes('')
  }

  const resetActivityForm = () => {
    setActContaId('')
    setActTitulo('')
    setActVencimento('')
    setActObs('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Agenda & Próximos Passos Comerciais</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Agenda interna 100% autônoma para reuniões, follow-ups, atas e compromissos da equipe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setMeetingDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs h-10 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agendar Reunião</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setActivityDialogOpen(true)}
            className="border-slate-300 text-slate-700 flex items-center gap-1.5 text-xs h-10 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Atividade</span>
          </Button>
        </div>
      </div>

      {/* Tabs / Switches */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Button
          variant={activeTab === 'compromissos' ? 'secondary' : 'ghost'}
          onClick={() => setActiveTab('compromissos')}
          className="text-xs font-semibold"
        >
          Reuniões & Compromissos ({meetings.length})
        </Button>
        <Button
          variant={activeTab === 'atividades' ? 'secondary' : 'ghost'}
          onClick={() => setActiveTab('atividades')}
          className="text-xs font-semibold"
        >
          Atividades & Follow-ups ({activities.length})
        </Button>
      </div>

      {/* TAB CONTENT: MEETINGS */}
      {activeTab === 'compromissos' && (
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 p-12 text-center bg-white/50">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">Nenhum compromisso agendado</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Agende demonstrações e reuniões de alinhamento com registro de ata inteligente.
              </p>
              <Button
                onClick={() => setMeetingDialogOpen(true)}
                className="bg-blue-600 text-white text-xs"
              >
                + Agendar Reunião Agora
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map((m) => {
                const acc = accounts.find((a) => a.id === m.contaId)
                return (
                  <Card key={m.id} className="border-slate-200 bg-white shadow-sm p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-blue-600 block uppercase tracking-wider">
                          {formatDateTimePtBR(m.dataHora)} • {m.duracaoMinutos} min
                        </span>
                        <h3 className="font-bold text-slate-900 text-base leading-tight mt-0.5">
                          {m.titulo}
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize bg-slate-50">
                        {m.status}
                      </Badge>
                    </div>

                    <div
                      onClick={() => acc && navigate(`/contas/${acc.id}`)}
                      className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer hover:text-blue-600"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">
                        {acc?.nomeFantasia || acc?.razaoSocial || 'Conta'}
                      </span>
                      <span>•</span>
                      <span>{acc?.segmento}</span>
                    </div>

                    {m.anotacoes && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                        <strong className="block text-slate-900 mb-1">Anotações da Pauta:</strong>
                        <p className="line-clamp-3 leading-relaxed">{m.anotacoes}</p>
                      </div>
                    )}

                    {m.resumoIa && (
                      <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-slate-700 space-y-1">
                        <strong className="text-blue-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          Resumo & Próximos Passos (IA):
                        </strong>
                        <p className="line-clamp-2 leading-relaxed">{m.resumoIa}</p>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ACTIVITIES */}
      {activeTab === 'atividades' && (
        <div className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Nenhuma atividade pendente.
                </div>
              ) : (
                activities.map((act) => {
                  const acc = accounts.find((a) => a.id === act.contaId)
                  const isDone = act.status === 'concluida'
                  const isDelayed = act.status === 'atrasada'

                  return (
                    <div
                      key={act.id}
                      className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors ${
                        isDone ? 'opacity-60 bg-slate-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleActivityStatus(act.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-blue-600'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold text-slate-900 truncate ${
                              isDone ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {act.titulo}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {acc?.nomeFantasia || acc?.razaoSocial} • Tipo:{' '}
                            <span className="capitalize">{act.tipo}</span>
                          </p>
                          {act.observacoes && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">
                              "{act.observacoes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isDelayed
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isDone
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatDatePtBR(act.dataVencimento)}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => acc && navigate(`/contas/${acc.id}`)}
                          className="text-xs text-blue-600"
                        >
                          Ver Conta →
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      )}

      {/* DIALOG: AGENDAR REUNIÃO */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agendar Reunião ou Follow-up</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMeeting} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Conta Comercial *</Label>
              <Select value={meetContaId} onValueChange={setMeetContaId} required>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Selecione a empresa" />
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
              <Label className="text-xs font-semibold">Título do Compromisso *</Label>
              <Input
                placeholder="Ex: Demonstração da Solução com Diretoria"
                value={meetTitulo}
                onChange={(e) => setMeetTitulo(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Data e Hora *</Label>
                <Input
                  type="datetime-local"
                  value={meetDataHora}
                  onChange={(e) => setMeetDataHora(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Duração (minutos)</Label>
                <Input
                  type="number"
                  value={meetDuracao}
                  onChange={(e) => setMeetDuracao(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Pauta Prevista / Anotações Iniciais</Label>
              <Textarea
                placeholder="Tópicos da reunião para orientação e resumo posterior..."
                value={meetAnotacoes}
                onChange={(e) => setMeetAnotacoes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setMeetingDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white font-semibold">
                Agendar na Plataforma
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: NOVA ATIVIDADE */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Atividade / Follow-up</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateActivity} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Conta Comercial *</Label>
              <Select value={actContaId} onValueChange={setActContaId} required>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Selecione a empresa" />
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
              <Label className="text-xs font-semibold">Título da Atividade *</Label>
              <Input
                placeholder="Ex: Ligar para verificar aprovação de minuta"
                value={actTitulo}
                onChange={(e) => setActTitulo(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tipo de Ação</Label>
                <Select value={actTipo} onValueChange={(val: any) => setActTipo(val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="ligacao">Ligação</SelectItem>
                    <SelectItem value="retorno">Retorno</SelectItem>
                    <SelectItem value="proposta">Envio de Proposta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Data Limite *</Label>
                <Input
                  type="date"
                  value={actVencimento}
                  onChange={(e) => setActVencimento(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Instruções / Observações</Label>
              <Input
                placeholder="Ex: Falar com a secretária se o diretor estiver em reunião"
                value={actObs}
                onChange={(e) => setActObs(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setActivityDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white font-semibold">
                Salvar Atividade
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
