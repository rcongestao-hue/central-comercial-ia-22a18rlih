import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { commercialAiService } from '@/services/ai-service'
import { formatDatePtBR, formatDateTimePtBR, formatBRL } from '@/lib/commercial-utils'
import {
  PIPELINE_STAGES,
  PipelineStage,
  ContactClassification,
  CONTACT_CLASSIFICATIONS,
  Contact,
  Opportunity,
  Meeting,
} from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Building2,
  Users,
  Sparkles,
  ArrowLeft,
  Calendar,
  KanbanSquare,
  Send,
  MessageSquare,
  Mail,
  Phone,
  Share2,
  Plus,
  Clock,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Edit,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentCompany, currentUser, companyData, updateCompanyData } = useAuth()
  const { toast } = useToast()

  const account = companyData.accounts.find((a) => a.id === id)
  const contacts = companyData.contacts.filter((c) => c.contaId === id)
  const opportunities = companyData.opportunities.filter((o) => o.contaId === id)
  const meetings = companyData.meetings.filter((m) => m.contaId === id)
  const activities = companyData.activities.filter((a) => a.contaId === id)
  const timeline = companyData.timeline.filter((t) => t.contaId === id)

  // Contact Dialog
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [ctNome, setCtNome] = useState('')
  const [ctCargo, setCtCargo] = useState('')
  const [ctArea, setCtArea] = useState('')
  const [ctEmail, setCtEmail] = useState('')
  const [ctTelefone, setCtTelefone] = useState('')
  const [ctLinkedin, setCtLinkedin] = useState('')
  const [ctClassificacao, setCtClassificacao] = useState<ContactClassification>('decisor')
  const [ctOrigem, setCtOrigem] = useState('Prospecção Direta')
  const [ctRelacao, setCtRelacao] = useState('')
  const [ctObs, setCtObs] = useState('')

  // Opportunity Dialog
  const [oppDialogOpen, setOppDialogOpen] = useState(false)
  const [oppTitulo, setOppTitulo] = useState('')
  const [oppValor, setOppValor] = useState('')
  const [oppEtapa, setOppEtapa] = useState<PipelineStage>('oportunidade_qualificada')
  const [oppPrazo, setOppPrazo] = useState('')
  const [oppContatoId, setOppContatoId] = useState('')

  // Meeting Dialog
  const [meetDialogOpen, setMeetDialogOpen] = useState(false)
  const [meetTitulo, setMeetTitulo] = useState('')
  const [meetData, setMeetData] = useState('')
  const [meetDuracao, setMeetDuracao] = useState('45')
  const [meetAnotacoes, setMeetAnotacoes] = useState('')

  // Proximo Passo inline edit
  const [proximoPassoInput, setProximoPassoInput] = useState(account?.proximoPasso || '')

  // IA re-qualify loading
  const [isQualifying, setIsQualifying] = useState(false)

  if (!account) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Conta não encontrada</h2>
        <Button onClick={() => navigate('/contas')} variant="outline">
          Voltar para Contas
        </Button>
      </div>
    )
  }

  const handleReQualifyWithAi = () => {
    if (!currentCompany) return
    setIsQualifying(true)
    setTimeout(() => {
      const iaQual = commercialAiService.qualifyAccount(account, currentCompany)
      updateCompanyData((prev) => ({
        ...prev,
        accounts: prev.accounts.map((acc) =>
          acc.id === account.id
            ? {
                ...acc,
                iaAnalysis: {
                  ...iaQual,
                  geradoEm: new Date().toISOString(),
                },
                atualizadoEm: new Date().toISOString(),
              }
            : acc,
        ),
        timeline: [
          {
            id: `tl_${Date.now()}`,
            empresaId: currentCompany.id,
            contaId: account.id,
            tipo: 'analise_ia_produzida',
            titulo: 'Análise de Qualificação Reavaliada por IA',
            descricao: `Score atualizado para ${iaQual.scoreIcp}% com base no perfil calibrado da empresa.`,
            origem: 'ia',
            criadoEm: new Date().toISOString(),
          },
          ...prev.timeline,
        ],
      }))
      setIsQualifying(false)
      toast({
        title: 'Análise de IA atualizada!',
        description: 'Novas perguntas e hipóteses geradas para a conta.',
      })
    }, 400)
  }

  const handleStageChange = (newStage: PipelineStage) => {
    if (!currentCompany) return
    const stageLabel = PIPELINE_STAGES.find((s) => s.id === newStage)?.label
    updateCompanyData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === account.id
          ? { ...acc, etapaAtual: newStage, atualizadoEm: new Date().toISOString() }
          : acc,
      ),
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: account.id,
          tipo: 'oportunidade_atualizada',
          titulo: `Etapa da Conta Atualizada: ${stageLabel}`,
          descricao: `Movimentada por ${currentUser?.nome || 'Usuário'} no CRM.`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))
    toast({ title: 'Etapa alterada', description: `Conta avançou para: ${stageLabel}` })
  }

  const handleUpdateProximoPasso = () => {
    if (!currentCompany) return
    updateCompanyData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === account.id
          ? { ...acc, proximoPasso: proximoPassoInput, atualizadoEm: new Date().toISOString() }
          : acc,
      ),
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: account.id,
          tipo: 'proximo_passo_criado',
          titulo: 'Próximo Passo Comercial Definido',
          descricao: proximoPassoInput,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))
    toast({ title: 'Próximo passo atualizado com sucesso' })
  }

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ctNome || !currentCompany) return

    const newContact: Contact = {
      id: `ct_${Date.now()}`,
      empresaId: currentCompany.id,
      contaId: account.id,
      nome: ctNome,
      cargo: ctCargo,
      area: ctArea || 'Comercial',
      email: ctEmail,
      telefone: ctTelefone,
      linkedin: ctLinkedin,
      classificacao: ctClassificacao,
      origemRelacionamento: ctOrigem,
      relacaoComExecutivo: ctRelacao,
      observacoes: ctObs,
      criadoEm: new Date().toISOString(),
    }

    updateCompanyData((prev) => ({
      ...prev,
      contacts: [newContact, ...prev.contacts],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: account.id,
          contatoId: newContact.id,
          tipo: 'contato_adicionado',
          titulo: `Contato Adicionado: ${newContact.nome}`,
          descricao: `${newContact.cargo} (${newContact.classificacao.toUpperCase()}) registrado por ${currentUser?.nome}.`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))

    toast({ title: 'Contato registrado na conta!' })
    setContactDialogOpen(false)
    setCtNome('')
    setCtCargo('')
    setCtEmail('')
    setCtTelefone('')
  }

  const handleAddOpportunity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!oppTitulo || !currentCompany) return

    const newOpp: Opportunity = {
      id: `opp_${Date.now()}`,
      empresaId: currentCompany.id,
      contaId: account.id,
      contatoId: oppContatoId || undefined,
      titulo: oppTitulo,
      responsavelId: currentUser?.id || 'usr_exec_1',
      etapa: oppEtapa,
      valorEstimado: parseFloat(oppValor) || 0,
      prazoEstimado: oppPrazo || undefined,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }

    updateCompanyData((prev) => ({
      ...prev,
      opportunities: [newOpp, ...prev.opportunities],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: account.id,
          tipo: 'oportunidade_atualizada',
          titulo: `Nova Oportunidade: ${newOpp.titulo}`,
          descricao: `Valor estimado: ${formatBRL(newOpp.valorEstimado)} • Etapa: ${oppEtapa}`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))

    toast({ title: 'Oportunidade criada no funil!' })
    setOppDialogOpen(false)
    setOppTitulo('')
    setOppValor('')
  }

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetTitulo || !meetData || !currentCompany) return

    const summary = commercialAiService.summarizeMeeting(
      meetAnotacoes,
      account.nomeFantasia || account.razaoSocial,
    )

    const newMeeting: Meeting = {
      id: `meet_${Date.now()}`,
      empresaId: currentCompany.id,
      contaId: account.id,
      titulo: meetTitulo,
      dataHora: meetData,
      duracaoMinutos: parseInt(meetDuracao, 10) || 45,
      tipo: 'reuniao',
      participantes: [currentUser?.nome || 'Executivo Comercial'],
      anotacoes: meetAnotacoes,
      resumoIa: meetAnotacoes ? summary.resumo : undefined,
      proximaAtividade: meetAnotacoes ? summary.proximosPassos[0] : undefined,
      status: 'concluida',
      criadoEm: new Date().toISOString(),
    }

    updateCompanyData((prev) => ({
      ...prev,
      meetings: [newMeeting, ...prev.meetings],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: account.id,
          tipo: 'reuniao_registrada',
          titulo: `Reunião Concluída: ${newMeeting.titulo}`,
          descricao: `Anotações registradas e resumidas via IA nativa.`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))

    toast({ title: 'Reunião e ata registradas com sucesso!' })
    setMeetDialogOpen(false)
    setMeetTitulo('')
    setMeetData('')
    setMeetAnotacoes('')
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/contas')}
              className="h-9 w-9 shrink-0 text-slate-600 border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {account.nomeFantasia || account.razaoSocial}
                </h1>
                {account.cnpj && (
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 font-mono">
                    CNPJ {account.cnpj}
                  </Badge>
                )}
                {account.iaAnalysis && (
                  <Badge
                    className={`text-xs ${
                      account.iaAnalysis.scoreIcp >= 80
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    ICP {account.iaAnalysis.scoreIcp}% ({account.iaAnalysis.aderenciaIcp})
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {account.razaoSocial} • {account.segmento} • {account.localizacao}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => navigate(`/prospeccao?contaId=${account.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gerar Abordagem IA</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setContactDialogOpen(true)}
              className="text-xs border-slate-300 text-slate-700 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Contato</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setOppDialogOpen(true)}
              className="text-xs border-slate-300 text-slate-700 flex items-center gap-1.5"
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>+ Oportunidade</span>
            </Button>
          </div>
        </div>

        {/* Stage & Next Step Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-slate-100 items-center">
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Etapa no Funil:</span>
            <Select value={account.etapaAtual} onValueChange={(val: any) => handleStageChange(val)}>
              <SelectTrigger className="h-8 text-xs border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((st) => (
                  <SelectItem key={st.id} value={st.id} className="text-xs">
                    {st.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-8 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Próximo Passo:</span>
            <Input
              value={proximoPassoInput}
              onChange={(e) => setProximoPassoInput(e.target.value)}
              placeholder="Definir ação comercial..."
              className="h-8 text-xs flex-1 border-slate-300"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleUpdateProximoPasso}
              className="h-8 text-xs font-semibold"
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation for Account Details */}
      <Tabs defaultValue="ia" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
          <TabsTrigger
            value="ia"
            className="text-xs flex items-center gap-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Análise & Diagnóstico IA</span>
          </TabsTrigger>
          <TabsTrigger value="contatos" className="text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Contatos ({contacts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="oportunidades" className="text-xs flex items-center gap-1.5">
            <KanbanSquare className="w-3.5 h-3.5" />
            <span>Oportunidades ({opportunities.length})</span>
          </TabsTrigger>
          <TabsTrigger value="reunioes" className="text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Reuniões & Atas ({meetings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Histórico Unificado ({timeline.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: IA ANALYSIS */}
        <TabsContent value="ia" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Structured AI Insights */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border-blue-200 bg-white shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Diagnóstico Estruturado Comercial</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Cruzamento entre os diferenciais da {currentCompany?.nome} e os dados da
                      conta.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReQualifyWithAi}
                    disabled={isQualifying}
                    className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {isQualifying ? 'Analisando...' : 'Recalibrar com IA'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 text-xs text-slate-700">
                  {/* Resumo */}
                  <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 space-y-1">
                    <span className="font-bold text-blue-900 block text-xs">
                      Resumo Executivo da Conta:
                    </span>
                    <p className="leading-relaxed text-slate-700">
                      {account.iaAnalysis?.resumoExecutivo || 'Análise de contexto pendente.'}
                    </p>
                  </div>

                  {/* Necessidades Sugeridas */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Necessidades & Dores Sugeridas (Para Investigar):</span>
                    </h4>
                    <ul className="space-y-1.5 pl-4 list-disc text-slate-600">
                      {account.iaAnalysis?.necessidadesSugeridas.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Perguntas Comerciais */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>Perguntas Estratégicas de Qualificação (Spin Selling / B2B):</span>
                    </h4>
                    <div className="space-y-2">
                      {account.iaAnalysis?.perguntasComerciais.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-md bg-slate-50 border border-slate-200 font-medium text-slate-800"
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 5 Cols: Hypotheses vs Verified Data */}
            <div className="lg:col-span-5 space-y-4">
              {/* Separate Confirmed vs Hypotheses */}
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Separação de Dados & Hipóteses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {/* Confirmed Data */}
                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Informações Cadastradas & Confirmadas:
                    </span>
                    <p className="text-slate-600">
                      Segmento: {account.segmento} • Sede: {account.localizacao} • Porte:{' '}
                      {account.porte || 'Não informado'} colaboradores.
                    </p>
                  </div>

                  {/* AI Hypotheses */}
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1.5">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Hipóteses Produzidas pela IA (Não Confirmadas):
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      {account.iaAnalysis?.hipoteses.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Points */}
                  <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      Pontos a Validar na Próxima Interação:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {account.iaAnalysis?.dadosNaoConfirmados.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: CONTACTS */}
        <TabsContent value="contatos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Decisores e Envolvidos na Conta</h3>
            <Button
              onClick={() => setContactDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Contato</span>
            </Button>
          </div>

          {contacts.length === 0 ? (
            <Card className="border-dashed border-slate-300 p-8 text-center bg-white/50">
              <p className="text-xs text-slate-500">
                Nenhum contato cadastrado para esta conta comercial.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setContactDialogOpen(true)}
                className="mt-3 text-xs"
              >
                Cadastrar Primeiro Decisor
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <Card key={contact.id} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{contact.nome}</h4>
                      <p className="text-xs text-slate-500">
                        {contact.cargo} • {contact.area}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {contact.classificacao}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2 text-xs text-slate-600">
                    <div className="space-y-1">
                      {contact.email && (
                        <p className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.email}</span>
                        </p>
                      )}
                      {contact.telefone && (
                        <p className="flex items-center gap-1.5 text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.telefone}</span>
                        </p>
                      )}
                    </div>

                    {contact.observacoes && (
                      <p className="p-2 rounded bg-slate-50 text-[11px] text-slate-600 italic">
                        "{contact.observacoes}"
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/prospeccao?contaId=${account.id}&contatoId=${contact.id}`)
                        }
                        className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-semibold"
                      >
                        Gerar Abordagem Assistida →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: OPPORTUNITIES */}
        <TabsContent value="oportunidades" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Oportunidades em Aberto</h3>
            <Button
              onClick={() => setOppDialogOpen(true)}
              className="bg-blue-600 text-white text-xs h-8 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Oportunidade</span>
            </Button>
          </div>

          {opportunities.length === 0 ? (
            <Card className="border-dashed border-slate-300 p-8 text-center bg-white/50">
              <p className="text-xs text-slate-500">Nenhuma oportunidade registrada nesta conta.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <Card
                  key={opp.id}
                  className="border-slate-200 bg-white p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{opp.titulo}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prazo: {formatDatePtBR(opp.prazoEstimado)} •{' '}
                      {opp.proximaAcao || 'Sem ação definida'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs bg-slate-50">
                      {PIPELINE_STAGES.find((s) => s.id === opp.etapa)?.label || opp.etapa}
                    </Badge>
                    <span className="text-base font-black text-slate-900">
                      {formatBRL(opp.valorEstimado)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: REUNIÕES & ATAS */}
        <TabsContent value="reunioes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Histórico de Reuniões e Atas com Resumo IA
            </h3>
            <Button
              onClick={() => setMeetDialogOpen(true)}
              className="bg-blue-600 text-white text-xs h-8 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Reunião / Ata</span>
            </Button>
          </div>

          {meetings.length === 0 ? (
            <Card className="border-dashed border-slate-300 p-8 text-center bg-white/50">
              <p className="text-xs text-slate-500">Nenhuma reunião registrada ainda.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {meetings.map((m) => (
                <Card key={m.id} className="border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{m.titulo}</h4>
                      <p className="text-xs text-slate-500">
                        {formatDateTimePtBR(m.dataHora)} • {m.duracaoMinutos} minutos
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize bg-slate-50">
                      {m.status}
                    </Badge>
                  </div>

                  {m.anotacoes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <strong className="block text-slate-800 mb-1">Anotações do Executivo:</strong>
                      <p className="whitespace-pre-line">{m.anotacoes}</p>
                    </div>
                  )}

                  {m.resumoIa && (
                    <div className="text-xs bg-blue-50/70 p-3 rounded-lg border border-blue-100 space-y-1">
                      <strong className="text-blue-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Resumo Executivo Gerado por IA:
                      </strong>
                      <p className="text-slate-700">{m.resumoIa}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 5: UNIFIED TIMELINE */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="border-slate-200 bg-white p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Linha do Tempo Completa da Conta
            </h3>
            <div className="relative pl-6 space-y-6 border-l-2 border-slate-200">
              {timeline.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div
                    className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      evt.origem === 'ia'
                        ? 'bg-blue-600'
                        : evt.origem === 'integracao'
                          ? 'bg-purple-600'
                          : 'bg-slate-700'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{evt.titulo}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold ${
                          evt.origem === 'ia'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {evt.origem === 'ia' ? 'IA Comercial' : evt.criadoPorNome || 'Usuário'}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatDateTimePtBR(evt.criadoEm)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{evt.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG: NOVO CONTATO */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Decisor / Contato</DialogTitle>
            <DialogDescription>
              Adicione os dados do contato chave para gerar abordagens contextuais.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddContact} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nome Completo *</Label>
              <Input
                placeholder="Ex: Dra. Juliana Meireles"
                value={ctNome}
                onChange={(e) => setCtNome(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Cargo *</Label>
                <Input
                  placeholder="Ex: Diretora de TI"
                  value={ctCargo}
                  onChange={(e) => setCtCargo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Classificação</Label>
                <Select
                  value={ctClassificacao}
                  onValueChange={(val: any) => setCtClassificacao(val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_CLASSIFICATIONS.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">E-mail Profissional</Label>
                <Input
                  type="email"
                  placeholder="contato@empresa.com"
                  value={ctEmail}
                  onChange={(e) => setCtEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Telefone / WhatsApp</Label>
                <Input
                  placeholder="+55 11 99999-0000"
                  value={ctTelefone}
                  onChange={(e) => setCtTelefone(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Perfil LinkedIn</Label>
              <Input
                placeholder="https://linkedin.com/in/perfil"
                value={ctLinkedin}
                onChange={(e) => setCtLinkedin(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Observações / Perfil Psicológico</Label>
              <Textarea
                placeholder="Ex: Muito focado em dados, prefere abordagens diretas..."
                value={ctObs}
                onChange={(e) => setCtObs(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setContactDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white">
                Salvar Contato
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: NOVA OPORTUNIDADE */}
      <Dialog open={oppDialogOpen} onOpenChange={setOppDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Oportunidade no Funil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOpportunity} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Título do Negócio *</Label>
              <Input
                placeholder="Ex: Implantação Enterprise 2025"
                value={oppTitulo}
                onChange={(e) => setOppTitulo(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Valor Estimado (R$)</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={oppValor}
                  onChange={(e) => setOppValor(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Previsão Fechamento</Label>
                <Input type="date" value={oppPrazo} onChange={(e) => setOppPrazo(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOppDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white">
                Criar Negócio
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: REGISTRAR REUNIÃO */}
      <Dialog open={meetDialogOpen} onOpenChange={setMeetDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Reunião & Gerar Resumo IA</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMeeting} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Título da Reunião *</Label>
              <Input
                placeholder="Ex: Alinhamento de Minuta Contratual"
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
                  value={meetData}
                  onChange={(e) => setMeetData(e.target.value)}
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
              <Label className="text-xs font-semibold">Anotações da Reunião / Pauta Tratada</Label>
              <Textarea
                placeholder="Cole ou digite os pontos discutidos para que a IA resuma e extraia próximos passos..."
                value={meetAnotacoes}
                onChange={(e) => setMeetAnotacoes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setMeetDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white">
                Salvar e Gerar Resumo IA
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
