import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CommercialAccount, PipelineStage, PIPELINE_STAGES } from '@/types'
import { commercialAiService } from '@/services/ai-service'
import { formatDatePtBR } from '@/lib/commercial-utils'
import { fetchCnpjData, cleanCnpj, formatCnpj, isValidCnpj } from '@/services/cnpj-service'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Building2,
  Plus,
  Search,
  Sparkles,
  MapPin,
  ChevronRight,
  Loader2,
  Phone,
  Mail,
  CheckCircle,
  FileSearch,
  Building,
  Hash,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AccountsPage() {
  const { currentCompany, currentUser, companyData, updateCompanyData } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  // New Account Form State
  const [cnpj, setCnpj] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [segmento, setSegmento] = useState('')
  const [cnaePrincipal, setCnaePrincipal] = useState('')
  const [porte, setPorte] = useState<'1-10' | '11-50' | '51-200' | '201-500' | '500+'>('51-200')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [site, setSite] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [situacaoCadastral, setSituacaoCadastral] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [proximoPasso, setProximoPasso] = useState('')

  // CNPJ Fetching State
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false)
  const [cnpjAutoFilled, setCnpjAutoFilled] = useState(false)

  const accounts = companyData.accounts || []

  const filteredAccounts = accounts.filter((acc) => {
    const q = searchTerm.toLowerCase().trim()
    const cleanQ = cleanCnpj(searchTerm)

    const matchesSearch =
      acc.razaoSocial.toLowerCase().includes(q) ||
      (acc.nomeFantasia && acc.nomeFantasia.toLowerCase().includes(q)) ||
      acc.segmento.toLowerCase().includes(q) ||
      acc.localizacao.toLowerCase().includes(q) ||
      (acc.cnpj && cleanQ && cleanCnpj(acc.cnpj).includes(cleanQ)) ||
      (acc.cnpj && acc.cnpj.toLowerCase().includes(q))

    const matchesStage = selectedStage === 'all' || acc.etapaAtual === selectedStage
    return matchesSearch && matchesStage
  })

  // CNPJ change handler with auto-formatting
  const handleCnpjChange = (value: string) => {
    // Permite digitar livremente ou colar formatado
    const formatted = formatCnpj(value)
    setCnpj(formatted)
  }

  // Consulta API Brasil API
  const handleFetchCnpj = async () => {
    const cleaned = cleanCnpj(cnpj)

    if (!cleaned) {
      toast({
        variant: 'destructive',
        title: 'Informe um CNPJ',
        description: 'Digite o CNPJ da empresa antes de buscar os dados.',
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
        description: 'O número informado não corresponde a um CNPJ válido da Receita Federal.',
      })
      // Não bloqueia a requisição caso o usuário queira tentar, mas avisa
    }

    setIsFetchingCnpj(true)
    try {
      const data = await fetchCnpjData(cleaned)

      // Preenche os campos automaticamente mantendo-os editáveis
      setCnpj(data.cnpjFormatted)
      setRazaoSocial(data.razaoSocial)
      setNomeFantasia(data.nomeFantasia)
      setSegmento(data.cnaeDescricao || 'B2B Geral')
      if (data.cnaeDescricao) {
        setCnaePrincipal(
          data.cnaeCodigo ? `${data.cnaeCodigo} - ${data.cnaeDescricao}` : data.cnaeDescricao,
        )
      }
      if (data.porteSugestao) {
        setPorte(data.porteSugestao)
      }
      if (data.telefone) {
        setTelefone(data.telefone)
      }
      if (data.email) {
        setEmail(data.email)
      }
      if (data.cep) {
        setCep(data.cep)
      }
      if (data.logradouro) {
        setLogradouro(data.logradouro)
      }
      if (data.numero) {
        setNumero(data.numero)
      }
      if (data.complemento) {
        setComplemento(data.complemento)
      }
      if (data.bairro) {
        setBairro(data.bairro)
      }
      if (data.municipio) {
        setCidade(data.municipio)
      }
      if (data.uf) {
        setEstado(data.uf)
      }
      if (data.localizacao) {
        setLocalizacao(data.localizacao)
      }
      if (data.situacaoCadastral) {
        setSituacaoCadastral(data.situacaoCadastral)
      }

      setCnpjAutoFilled(true)
      toast({
        title: 'Dados da empresa importados!',
        description: `${data.razaoSocial} encontrada com sucesso via Brasil API. Você pode revisar e editar os campos.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao consultar CNPJ',
        description:
          err?.message || 'Não foi possível consultar os dados da empresa. Tente novamente.',
      })
    } finally {
      setIsFetchingCnpj(false)
    }
  }

  // Formata o endereço consolidado
  const buildFullAddress = () => {
    const parts: string[] = []
    if (logradouro) {
      parts.push(numero ? `${logradouro}, ${numero}` : logradouro)
    }
    if (complemento) {
      parts.push(complemento)
    }
    if (bairro) {
      parts.push(`Bairro ${bairro}`)
    }
    if (cep) {
      parts.push(`CEP ${cep}`)
    }
    return parts.join(' - ')
  }

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!razaoSocial.trim() || !currentCompany) {
      toast({
        variant: 'destructive',
        title: 'Campo obrigatório',
        description: 'A Razão Social é obrigatória para cadastrar a conta.',
      })
      return
    }

    const calculatedLocalizacao =
      localizacao.trim() ||
      (cidade && estado ? `${cidade}, ${estado}` : cidade || estado || 'Brasil')

    const calculatedEndereco = buildFullAddress()

    // Temporary object for AI evaluation
    const tempAccount: CommercialAccount = {
      id: '',
      company: currentCompany.id,
      empresaId: currentCompany.id,
      razaoSocial: razaoSocial.trim(),
      nomeFantasia: (nomeFantasia || razaoSocial).trim(),
      segmento: segmento.trim() || 'B2B Geral',
      localizacao: calculatedLocalizacao,
      porte,
    }
    const iaQual = commercialAiService.qualifyAccount(tempAccount, currentCompany)

    import('@/services/crm-service').then(async ({ crmService }) => {
      try {
        const createdAcc = await crmService.createAccount({
          company: currentCompany.id,
          razao_social: razaoSocial.trim(),
          nome_fantasia: (nomeFantasia || razaoSocial).trim(),
          cnpj: cnpj ? formatCnpj(cnpj) : undefined,
          site: site.trim() || undefined,
          segmento: segmento.trim() || 'B2B Geral',
          localizacao: calculatedLocalizacao,
          endereco: calculatedEndereco || undefined,
          logradouro: logradouro.trim() || undefined,
          numero: numero.trim() || undefined,
          complemento: complemento.trim() || undefined,
          bairro: bairro.trim() || undefined,
          cidade: cidade.trim() || undefined,
          estado: estado.trim() || undefined,
          cep: cep.trim() || undefined,
          cnaePrincipal: cnaePrincipal.trim() || undefined,
          telefone: telefone.trim() || undefined,
          email: email.trim() || undefined,
          situacaoCadastral: situacaoCadastral || undefined,
          linkedin: linkedin.trim() || undefined,
          porte,
          observacoes: observacoes.trim() || undefined,
          proximo_passo:
            proximoPasso.trim() || 'Realizar qualificação inicial e identificar decisores',
          icp_score: iaQual.scoreIcp,
          icp_classification: iaQual.aderenciaIcp,
          ai_summary: iaQual.resumoExecutivo,
          ai_hypotheses: iaQual.hipoteses,
          ai_pending_points: iaQual.dadosNaoConfirmados,
          identification_status: 'confirmada',
        })

        // Also record activity in PB
        await crmService.createActivity({
          company: currentCompany.id,
          account: createdAcc.id,
          type: 'conta_criada',
          origin: 'usuario',
          description: `${createdAcc.razaoSocial} foi adicionada à carteira de prospecção.`,
        })

        updateCompanyData((prev) => ({
          ...prev,
          accounts: [createdAcc, ...prev.accounts],
        }))

        toast({
          title: 'Conta comercial cadastrada!',
          description:
            'A IA já realizou o diagnóstico de qualificação e gerou perguntas de abordagem.',
        })

        setDialogOpen(false)
        resetForm()
        navigate(`/contas/${createdAcc.id}`)
      } catch (err: any) {
        console.error('Error creating account:', err)
        toast({
          title: 'Erro ao criar conta',
          description: err?.message || 'Falha ao salvar conta comercial.',
          variant: 'destructive',
        })
      }
    })
  }

  const resetForm = () => {
    setCnpj('')
    setRazaoSocial('')
    setNomeFantasia('')
    setSegmento('')
    setCnaePrincipal('')
    setPorte('51-200')
    setTelefone('')
    setEmail('')
    setSite('')
    setLinkedin('')
    setLocalizacao('')
    setCep('')
    setLogradouro('')
    setNumero('')
    setComplemento('')
    setBairro('')
    setCidade('')
    setEstado('')
    setSituacaoCadastral('')
    setObservacoes('')
    setProximoPasso('')
    setCnpjAutoFilled(false)
  }

  const getStageBadge = (stage: PipelineStage) => {
    const s = PIPELINE_STAGES.find((st) => st.id === stage)
    return (
      <Badge variant="outline" className={`text-xs ${s?.color || 'bg-slate-100 text-slate-700'}`}>
        {s?.label || stage}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Contas Comerciais</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Empresas-alvo mapeadas com busca automática por CNPJ, enriquecimento de dados e IA de
            prospecção.
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Conta</span>
        </Button>
      </div>

      {/* Filters Toolbar */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por razão social, nome fantasia, CNPJ, segmento ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-sm border-slate-300"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-full md:w-[220px] h-10 text-xs border-slate-300">
                <SelectValue placeholder="Filtrar por etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as etapas ({accounts.length})</SelectItem>
                {PIPELINE_STAGES.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedStage !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStage('all')}
                className="text-xs text-slate-500 h-10"
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accounts List Grid */}
      {filteredAccounts.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300 bg-white/50 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Nenhuma conta comercial encontrada</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            {searchTerm || selectedStage !== 'all'
              ? 'Tente ajustar os filtros de busca para encontrar as empresas cadastradas.'
              : 'Cadastre sua primeira empresa-alvo buscando automaticamente pelo CNPJ para iniciar a qualificação com IA.'}
          </p>
          <Button
            onClick={() => {
              resetForm()
              setDialogOpen(true)
            }}
            className="bg-blue-600 text-white text-xs"
          >
            + Cadastrar Conta Agora
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => {
            const hasIa = !!account.iaAnalysis
            const score = account.iaAnalysis?.scoreIcp || 70

            return (
              <Card
                key={account.id}
                onClick={() => navigate(`/contas/${account.id}`)}
                className="border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors truncate">
                        {account.nomeFantasia || account.razaoSocial}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {account.razaoSocial}
                      </p>
                      {account.cnpj && (
                        <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                          CNPJ: {account.cnpj}
                        </p>
                      )}
                    </div>
                    {hasIa && (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold shrink-0 ${
                          score >= 80
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 mr-1 inline" />
                        ICP {score}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {getStageBadge(account.etapaAtual)}
                    <Badge
                      variant="outline"
                      className="text-[11px] bg-slate-50 text-slate-600 border-slate-200"
                    >
                      {account.segmento}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{account.localizacao}</span>
                    </div>
                    {account.telefone && (
                      <div className="flex items-center gap-1.5 text-slate-500 truncate">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{account.telefone}</span>
                      </div>
                    )}
                    {account.proximoPasso && (
                      <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px] mt-2 text-slate-700">
                        <strong className="text-slate-900 block mb-0.5">Próximo Passo:</strong>
                        <span className="line-clamp-2">{account.proximoPasso}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 rounded-b-xl">
                  <span>Atualizado {formatDatePtBR(account.atualizadoEm)}</span>
                  <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Ver detalhes <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Cadastrar Nova Conta Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Cadastrar Nova Conta Comercial</span>
            </DialogTitle>
            <DialogDescription>
              Informe o CNPJ para preencher os dados cadastrais automaticamente via Brasil API ou
              digite manualmente.
            </DialogDescription>
          </DialogHeader>

          {/* Seção de Busca por CNPJ em destaque */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200/80 space-y-2">
            <Label
              htmlFor="cnpj-search"
              className="text-xs font-bold text-blue-950 flex items-center gap-1.5"
            >
              <FileSearch className="w-4 h-4 text-blue-600" />
              <span>Preenchimento Automático por CNPJ (Brasil API)</span>
            </Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="cnpj-search"
                  placeholder="00.000.000/0000-00 ou apenas dígitos"
                  value={cnpj}
                  onChange={(e) => handleCnpjChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleFetchCnpj()
                    }
                  }}
                  className="pl-9 h-10 bg-white border-blue-300 font-mono text-sm focus:border-blue-500"
                />
              </div>
              <Button
                type="button"
                onClick={handleFetchCnpj}
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

            {cnpjAutoFilled && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-1">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Dados carregados da Receita Federal! Você pode revisar ou editar qualquer campo
                  abaixo.
                </span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              Dica: cole o CNPJ formatado ou não. Buscaremos razão social, nome fantasia, endereço
              completo, CNAE principal, telefone e e-mail.
            </p>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-4 pt-1">
            {/* Bloco 1: Identificação */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>Dados da Empresa</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="razao" className="text-xs font-semibold">
                    Razão Social *
                  </Label>
                  <Input
                    id="razao"
                    placeholder="Ex: Sigma Distribuidora S.A."
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fantasia" className="text-xs font-semibold">
                    Nome Fantasia
                  </Label>
                  <Input
                    id="fantasia"
                    placeholder="Ex: Sigma Brasil"
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="seg" className="text-xs font-semibold">
                    Segmento de Mercado / CNAE *
                  </Label>
                  <Input
                    id="seg"
                    placeholder="Ex: Logística, Saúde, Varejo"
                    value={segmento}
                    onChange={(e) => setSegmento(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="porte" className="text-xs font-semibold">
                    Porte Estimado
                  </Label>
                  <Select value={porte} onValueChange={(val: any) => setPorte(val)}>
                    <SelectTrigger id="porte" className="text-xs">
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
                  <Label htmlFor="situacao" className="text-xs font-semibold">
                    Situação Cadastral
                  </Label>
                  <Input
                    id="situacao"
                    placeholder="Ex: ATIVA"
                    value={situacaoCadastral}
                    onChange={(e) => setSituacaoCadastral(e.target.value)}
                  />
                </div>
              </div>

              {cnaePrincipal && (
                <div className="space-y-1">
                  <Label htmlFor="cnae-desc" className="text-xs font-semibold">
                    CNAE Principal Completo (Receita Federal)
                  </Label>
                  <Input
                    id="cnae-desc"
                    value={cnaePrincipal}
                    onChange={(e) => setCnaePrincipal(e.target.value)}
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
                  <Label htmlFor="logradouro" className="text-xs font-semibold">
                    Logradouro (Rua, Av, etc.)
                  </Label>
                  <Input
                    id="logradouro"
                    placeholder="Ex: Av. Paulista"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="num" className="text-xs font-semibold">
                    Número
                  </Label>
                  <Input
                    id="num"
                    placeholder="Ex: 1000"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="comp" className="text-xs font-semibold">
                    Complemento
                  </Label>
                  <Input
                    id="comp"
                    placeholder="Ex: Sala 42, Bloco B"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bairro" className="text-xs font-semibold">
                    Bairro
                  </Label>
                  <Input
                    id="bairro"
                    placeholder="Ex: Bela Vista"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cidade" className="text-xs font-semibold">
                    Cidade *
                  </Label>
                  <Input
                    id="cidade"
                    placeholder="Ex: São Paulo"
                    value={cidade}
                    onChange={(e) => {
                      setCidade(e.target.value)
                      if (!localizacao || localizacao === `${cidade}, ${estado}`) {
                        setLocalizacao(estado ? `${e.target.value}, ${estado}` : e.target.value)
                      }
                    }}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="estado" className="text-xs font-semibold">
                      UF *
                    </Label>
                    <Input
                      id="estado"
                      placeholder="SP"
                      maxLength={2}
                      value={estado}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase()
                        setEstado(val)
                        if (!localizacao || localizacao === `${cidade}, ${estado}`) {
                          setLocalizacao(cidade ? `${cidade}, ${val}` : val)
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cep" className="text-xs font-semibold">
                      CEP
                    </Label>
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 3: Contatos & Canais Oficiais */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Canais de Contato & Presença Digital</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="tel" className="text-xs font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    Telefone Institucional
                  </Label>
                  <Input
                    id="tel"
                    placeholder="Ex: (11) 3456-7890"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    E-mail Institucional
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="site" className="text-xs font-semibold">
                    Website Oficial
                  </Label>
                  <Input
                    id="site"
                    placeholder="https://empresa.com.br"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="linkedin" className="text-xs font-semibold">
                    LinkedIn Institucional
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/company/empresa"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Bloco 4: Estratégia Comercial */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <Label htmlFor="proximo" className="text-xs font-semibold">
                  Próximo Passo Comercial Imediato
                </Label>
                <Input
                  id="proximo"
                  placeholder="Ex: Identificar Diretor de Operações e preparar abordagem WhatsApp"
                  value={proximoPasso}
                  onChange={(e) => setProximoPasso(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="obs" className="text-xs font-semibold">
                  Observações / Contexto da Conta
                </Label>
                <Textarea
                  id="obs"
                  placeholder="Contexto relevante sobre o momento da empresa, contatos prévios..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Salvar e Analisar com IA</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
