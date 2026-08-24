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
  CommercialAccount,
} from '@/types'
import { fetchCnpjData, cleanCnpj, formatCnpj, isValidCnpj } from '@/services/cnpj-service'
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
  Plus,
  Clock,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Edit,
  AlertCircle,
  MapPin,
  Search,
  Loader2,
  FileSearch,
  Building,
  Hash,
  Globe,
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
  const timeline = companyData.timeline.filter((t) => t.contaId === id)

  // Edit Account Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editCnpj, setEditCnpj] = useState(account?.cnpj || '')
  const [editRazaoSocial, setEditRazaoSocial] = useState(account?.razaoSocial || '')
  const [editNomeFantasia, setEditNomeFantasia] = useState(account?.nomeFantasia || '')
  const [editSegmento, setEditSegmento] = useState(account?.segmento || '')
  const [editCnaePrincipal, setEditCnaePrincipal] = useState(account?.cnaePrincipal || '')
  const [editPorte, setEditPorte] = useState<'1-10' | '11-50' | '51-200' | '201-500' | '500+'>(
    account?.porte || '51-200',
  )
  const [editTelefone, setEditTelefone] = useState(account?.telefone || '')
  const [editEmail, setEditEmail] = useState(account?.email || '')
  const [editSite, setEditSite] = useState(account?.site || '')
  const [editLinkedin, setEditLinkedin] = useState(account?.linkedinInstitucional || '')
  const [editLocalizacao, setEditLocalizacao] = useState(account?.localizacao || '')
  const [editCep, setEditCep] = useState(account?.cep || '')
  const [editLogradouro, setEditLogradouro] = useState(account?.logradouro || '')
  const [editNumero, setEditNumero] = useState(account?.numero || '')
  const [editComplemento, setEditComplemento] = useState(account?.complemento || '')
  const [editBairro, setEditBairro] = useState(account?.bairro || '')
  const [editCidade, setEditCidade] = useState(account?.cidade || '')
  const [editEstado, setEditEstado] = useState(account?.estado || '')
  const [editSituacaoCadastral, setEditSituacaoCadastral] = useState(
    account?.situacaoCadastral || '',
  )
  const [editObservacoes, setEditObservacoes] = useState(account?.observacoes || '')
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false)

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

  // Populate edit dialog form
  const handleOpenEditDialog = () => {
    setEditCnpj(account.cnpj || '')
    setEditRazaoSocial(account.razaoSocial || '')
    setEditNomeFantasia(account.nomeFantasia || '')
    setEditSegmento(account.segmento || '')
    setEditCnaePrincipal(account.cnaePrincipal || '')
    setEditPorte(account.porte || '51-200')
    setEditTelefone(account.telefone || '')
    setEditEmail(account.email || '')
    setEditSite(account.site || '')
    setEditLinkedin(account.linkedinInstitucional || '')
    setEditLocalizacao(account.localizacao || '')
    setEditCep(account.cep || '')
    setEditLogradouro(account.logradouro || '')
    setEditNumero(account.numero || '')
    setEditComplemento(account.complemento || '')
    setEditBairro(account.bairro || '')
    setEditCidade(account.cidade || '')
    setEditEstado(account.estado || '')
    setEditSituacaoCadastral(account.situacaoCadastral || '')
    setEditObservacoes(account.observacoes || '')
    setEditDialogOpen(true)
  }

  const handleEditFetchCnpj = async () => {
    const cleaned = cleanCnpj(editCnpj)

    if (!cleaned) {
      toast({
        variant: 'destructive',
        title: 'Informe um CNPJ',
        description: 'Digite o CNPJ antes de buscar os dados.',
      })
      return
    }

    if (cleaned.length !== 14) {
      toast({
        variant: 'destructive',
        title: 'CNPJ incompleto',
        description: `O CNPJ deve conter 14 dígitos (você digitou ${cleaned.length}).`,
      })
      return
    }

    if (!isValidCnpj(cleaned)) {
      toast({
        variant: 'destructive',
        title: 'Dígitos verificadores inválidos',
        description: 'O número informado pode não ser um CNPJ válido na Receita Federal.',
      })
    }

    setIsFetchingCnpj(true)
    try {
      const data = await fetchCnpjData(cleaned)

      setEditCnpj(data.cnpjFormatted)
      setEditRazaoSocial(data.razaoSocial)
      setEditNomeFantasia(data.nomeFantasia)
      setEditSegmento(data.cnaeDescricao || 'B2B Geral')
      if (data.cnaeDescricao) {
        setEditCnaePrincipal(
          data.cnaeCodigo ? `${data.cnaeCodigo} - ${data.cnaeDescricao}` : data.cnaeDescricao,
        )
      }
      if (data.porteSugestao) {
        setEditPorte(data.porteSugestao)
      }
      if (data.telefone) {
        setEditTelefone(data.telefone)
      }
      if (data.email) {
        setEditEmail(data.email)
      }
      if (data.cep) {
        setEditCep(data.cep)
      }
      if (data.logradouro) {
        setEditLogradouro(data.logradouro)
      }
      if (data.numero) {
        setEditNumero(data.numero)
      }
      if (data.complemento) {
        setEditComplemento(data.complemento)
      }
      if (data.bairro) {
        setEditBairro(data.bairro)
      }
      if (data.municipio) {
        setEditCidade(data.municipio)
      }
      if (data.uf) {
        setEditEstado(data.uf)
      }
      if (data.localizacao) {
        setEditLocalizacao(data.localizacao)
      }
      if (data.situacaoCadastral) {
        setEditSituacaoCadastral(data.situacaoCadastral)
      }

      toast({
        title: 'Dados da empresa importados!',
        description: `${data.razaoSocial} encontrada com sucesso via Brasil API.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao consultar CNPJ',
        description: err?.message || 'Não foi possível consultar os dados da empresa.',
      })
    } finally {
      setIsFetchingCnpj(false)
    }
  }

  const handleSaveAccountEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editRazaoSocial.trim() || !currentCompany) return

    const parts: string[] = []
    if (editLogradouro) {
      parts.push(editNumero ? `${editLogradouro}, ${editNumero}` : editLogradouro)
    }
    if (editComplemento) {
      parts.push(editComplemento)
    }
    if (editBairro) {
      parts.push(`Bairro ${editBairro}`)
    }
    if (editCep) {
      parts.push(`CEP ${editCep}`)
    }
    const calculatedEndereco = parts.join(' - ')

    const calculatedLocalizacao =
      editLocalizacao.trim() ||
      (editCidade && editEstado
        ? `${editCidade}, ${editEstado}`
        : editCidade || editEstado || 'Brasil')

    const updatedAccount: CommercialAccount = {
      ...account,
      razaoSocial: editRazaoSocial.trim(),
      nomeFantasia: (editNomeFantasia || editRazaoSocial).trim(),
      cnpj: editCnpj ? formatCnpj(editCnpj) : undefined,
      segmento: editSegmento.trim() || 'B2B Geral',
      cnaePrincipal: editCnaePrincipal.trim() || undefined,
      porte: editPorte,
      telefone: editTelefone.trim() || undefined,
      email: editEmail.trim() || undefined,
      site: editSite.trim() || undefined,
      linkedinInstitucional: editLinkedin.trim() || undefined,
      localizacao: calculatedLocalizacao,
      endereco: calculatedEndereco || account.endereco || undefined,
      logradouro: editLogradouro.trim() || undefined,
      numero: editNumero.trim() || undefined,
      complemento: editComplemento.trim() || undefined,
      bairro: editBairro.trim() || undefined,
      cidade: editCidade.trim() || undefined,
      estado: editEstado.trim() || undefined,
      cep: editCep.trim() || undefined,
      situacaoCadastral: editSituacaoCadastral.trim() || undefined,
      observacoes: editObservacoes.trim() || undefined,
      atualizadoEm: new Date().toISOString(),
    }

    // Re-qualify with updated data
    const iaQual = commercialAiService.qualifyAccount(updatedAccount, currentCompany)
    updatedAccount.iaAnalysis = {
      ...iaQual,
      geradoEm: new Date().toISOString(),
    }

    updateCompanyData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === account.id ? updatedAccount : a)),
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: account.id,
          tipo: 'oportunidade_atualizada',
          titulo: 'Dados Cadastrais da Conta Atualizados',
          descricao: `Informações de ${updatedAccount.razaoSocial} atualizadas por ${
            currentUser?.nome || 'Usuário'
          }${updatedAccount.cnpj ? ` (CNPJ: ${updatedAccount.cnpj})` : ''}.`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))

    toast({
      title: 'Conta comercial atualizada!',
      description: 'Os dados foram salvos e a análise de IA foi re-executada.',
    })
    setEditDialogOpen(false)
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
                {account.situacaoCadastral && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      account.situacaoCadastral.toUpperCase() === 'ATIVA'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {account.situacaoCadastral}
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
              variant="outline"
              onClick={handleOpenEditDialog}
              className="text-xs border-slate-300 text-slate-700 flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar Dados / CNPJ</span>
            </Button>
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

        {/* Informações Cadastrais Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-start gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-semibold text-slate-800 block">Endereço / Sede</span>
              <span className="text-slate-500 text-[11px] truncate block">
                {account.endereco || account.localizacao || 'Não informado'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-600">
            <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-semibold text-slate-800 block">Telefone</span>
              <span className="text-slate-500 text-[11px] block">
                {account.telefone || 'Não informado'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-semibold text-slate-800 block">E-mail Corporativo</span>
              <span className="text-slate-500 text-[11px] truncate block">
                {account.email || 'Não informado'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-600">
            <Globe className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-semibold text-slate-800 block">Web / LinkedIn</span>
              <div className="flex items-center gap-2 text-[11px] text-blue-600">
                {account.site && (
                  <a
                    href={
                      account.site.startsWith('http') ? account.site : `https://${account.site}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-0.5"
                  >
                    Site <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
                {account.linkedinInstitucional && (
                  <a
                    href={
                      account.linkedinInstitucional.startsWith('http')
                        ? account.linkedinInstitucional
                        : `https://${account.linkedinInstitucional}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-0.5"
                  >
                    LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
                {!account.site && !account.linkedinInstitucional && (
                  <span className="text-slate-400">Não informado</span>
                )}
              </div>
            </div>
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
                    <p className="text-slate-600 leading-relaxed">
                      Segmento: {account.segmento} • Sede: {account.localizacao} • Porte:{' '}
                      {account.porte || 'Não informado'} colaboradores.
                      {account.cnpj && <> • CNPJ: {account.cnpj}</>}
                      {account.cnaePrincipal && <> • CNAE: {account.cnaePrincipal}</>}
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

      {/* DIALOG: EDITAR CONTA COM BUSCA CNPJ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Editar Dados da Conta Comercial</span>
            </DialogTitle>
            <DialogDescription>
              Atualize as informações cadastrais. Você pode consultar novamente o CNPJ via Brasil
              API para recarregar dados.
            </DialogDescription>
          </DialogHeader>

          {/* CNPJ Search Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200/80 space-y-2">
            <Label
              htmlFor="edit-cnpj-search"
              className="text-xs font-bold text-blue-950 flex items-center gap-1.5"
            >
              <FileSearch className="w-4 h-4 text-blue-600" />
              <span>Consultar / Atualizar via CNPJ (Brasil API)</span>
            </Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="edit-cnpj-search"
                  placeholder="00.000.000/0000-00 ou apenas dígitos"
                  value={editCnpj}
                  onChange={(e) => setEditCnpj(formatCnpj(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleEditFetchCnpj()
                    }
                  }}
                  className="pl-9 h-10 bg-white border-blue-300 font-mono text-sm focus:border-blue-500"
                />
              </div>
              <Button
                type="button"
                onClick={handleEditFetchCnpj}
                disabled={isFetchingCnpj}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-4 shrink-0 shadow-sm"
              >
                {isFetchingCnpj ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Consultando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    <span>Buscar dados</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSaveAccountEdit} className="space-y-4 pt-1">
            {/* Bloco 1: Identificação */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>Dados da Empresa</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-razao" className="text-xs font-semibold">
                    Razão Social *
                  </Label>
                  <Input
                    id="edit-razao"
                    value={editRazaoSocial}
                    onChange={(e) => setEditRazaoSocial(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-fantasia" className="text-xs font-semibold">
                    Nome Fantasia
                  </Label>
                  <Input
                    id="edit-fantasia"
                    value={editNomeFantasia}
                    onChange={(e) => setEditNomeFantasia(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-seg" className="text-xs font-semibold">
                    Segmento de Mercado *
                  </Label>
                  <Input
                    id="edit-seg"
                    value={editSegmento}
                    onChange={(e) => setEditSegmento(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-porte" className="text-xs font-semibold">
                    Porte Estimado
                  </Label>
                  <Select value={editPorte} onValueChange={(val: any) => setEditPorte(val)}>
                    <SelectTrigger id="edit-porte" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1 a 10 pessoas</SelectItem>
                      <SelectItem value="11-50">11 a 50 pessoas</SelectItem>
                      <SelectItem value="51-200">51 a 200 pessoas</SelectItem>
                      <SelectItem value="201-500">201 a 500 pessoas</SelectItem>
                      <SelectItem value="500+">500+ pessoas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-situacao" className="text-xs font-semibold">
                    Situação Cadastral
                  </Label>
                  <Input
                    id="edit-situacao"
                    value={editSituacaoCadastral}
                    onChange={(e) => setEditSituacaoCadastral(e.target.value)}
                  />
                </div>
              </div>

              {editCnaePrincipal && (
                <div className="space-y-1">
                  <Label htmlFor="edit-cnae-desc" className="text-xs font-semibold">
                    CNAE Principal Completo (Receita Federal)
                  </Label>
                  <Input
                    id="edit-cnae-desc"
                    value={editCnaePrincipal}
                    onChange={(e) => setEditCnaePrincipal(e.target.value)}
                    className="text-xs bg-slate-50"
                  />
                </div>
              )}
            </div>

            {/* Bloco 2: Endereço Detalhado */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Endereço & Localização</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="edit-logradouro" className="text-xs font-semibold">
                    Logradouro
                  </Label>
                  <Input
                    id="edit-logradouro"
                    value={editLogradouro}
                    onChange={(e) => setEditLogradouro(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-num" className="text-xs font-semibold">
                    Número
                  </Label>
                  <Input
                    id="edit-num"
                    value={editNumero}
                    onChange={(e) => setEditNumero(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-comp" className="text-xs font-semibold">
                    Complemento
                  </Label>
                  <Input
                    id="edit-comp"
                    value={editComplemento}
                    onChange={(e) => setEditComplemento(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-bairro" className="text-xs font-semibold">
                    Bairro
                  </Label>
                  <Input
                    id="edit-bairro"
                    value={editBairro}
                    onChange={(e) => setEditBairro(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-cidade" className="text-xs font-semibold">
                    Cidade *
                  </Label>
                  <Input
                    id="edit-cidade"
                    value={editCidade}
                    onChange={(e) => {
                      setEditCidade(e.target.value)
                      if (!editLocalizacao || editLocalizacao === `${editCidade}, ${editEstado}`) {
                        setEditLocalizacao(
                          editEstado ? `${e.target.value}, ${editEstado}` : e.target.value,
                        )
                      }
                    }}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="edit-estado" className="text-xs font-semibold">
                      UF *
                    </Label>
                    <Input
                      id="edit-estado"
                      maxLength={2}
                      value={editEstado}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase()
                        setEditEstado(val)
                        if (
                          !editLocalizacao ||
                          editLocalizacao === `${editCidade}, ${editEstado}`
                        ) {
                          setEditLocalizacao(editCidade ? `${editCidade}, ${val}` : val)
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-cep" className="text-xs font-semibold">
                      CEP
                    </Label>
                    <Input
                      id="edit-cep"
                      value={editCep}
                      onChange={(e) => setEditCep(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 3: Contatos & Canais */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Canais de Contato & Presença Digital</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-tel" className="text-xs font-semibold">
                    Telefone Institucional
                  </Label>
                  <Input
                    id="edit-tel"
                    value={editTelefone}
                    onChange={(e) => setEditTelefone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-email" className="text-xs font-semibold">
                    E-mail Institucional
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-site" className="text-xs font-semibold">
                    Website Oficial
                  </Label>
                  <Input
                    id="edit-site"
                    value={editSite}
                    onChange={(e) => setEditSite(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-linkedin" className="text-xs font-semibold">
                    LinkedIn Institucional
                  </Label>
                  <Input
                    id="edit-linkedin"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Bloco 4: Observações */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <Label htmlFor="edit-obs" className="text-xs font-semibold">
                Observações / Contexto da Conta
              </Label>
              <Textarea
                id="edit-obs"
                value={editObservacoes}
                onChange={(e) => setEditObservacoes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
