import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CommercialAccount, PipelineStage, PIPELINE_STAGES } from '@/types'
import { commercialAiService } from '@/services/ai-service'
import { formatDatePtBR } from '@/lib/commercial-utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  ExternalLink,
  MapPin,
  Globe,
  Users,
  ChevronRight,
  Filter,
  CheckCircle2,
  Briefcase,
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
  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [site, setSite] = useState('')
  const [segmento, setSegmento] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [endereco, setEndereco] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [porte, setPorte] = useState<'1-10' | '11-50' | '51-200' | '201-500' | '500+'>('51-200')
  const [observacoes, setObservacoes] = useState('')
  const [proximoPasso, setProximoPasso] = useState('')

  const accounts = companyData.accounts || []

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.nomeFantasia && acc.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      acc.segmento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.localizacao.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStage = selectedStage === 'all' || acc.etapaAtual === selectedStage
    return matchesSearch && matchesStage
  })

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!razaoSocial.trim() || !currentCompany) return

    const newAccId = `acc_${Date.now()}`
    const newAccount: CommercialAccount = {
      id: newAccId,
      empresaId: currentCompany.id,
      razaoSocial,
      nomeFantasia: nomeFantasia || razaoSocial,
      cnpj: cnpj || undefined,
      site: site || undefined,
      segmento: segmento || 'B2B Geral',
      localizacao: localizacao || 'Brasil',
      endereco: endereco || undefined,
      linkedinInstitucional: linkedin || undefined,
      responsavelComercialId: currentUser?.id || 'usr_exec_1',
      etapaAtual: 'conta_identificada',
      porte,
      observacoes,
      proximoPasso: proximoPasso || 'Realizar qualificação inicial e identificar decisores',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }

    // Auto generate IA analysis for the new account
    const iaQual = commercialAiService.qualifyAccount(newAccount, currentCompany)
    newAccount.iaAnalysis = {
      ...iaQual,
      geradoEm: new Date().toISOString(),
    }

    updateCompanyData((prev) => ({
      ...prev,
      accounts: [newAccount, ...prev.accounts],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: newAccId,
          tipo: 'conta_criada',
          titulo: 'Conta Comercial Cadastrada',
          descricao: `${newAccount.razaoSocial} foi adicionada à carteira de prospecção.`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        {
          id: `tl_ia_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: newAccId,
          tipo: 'analise_ia_produzida',
          titulo: 'Análise de ICP e Diagnóstico Gerados por IA',
          descricao: `Aderência ao ICP avaliada em ${iaQual.scoreIcp}% (${iaQual.aderenciaIcp}).`,
          origem: 'ia',
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))

    toast({
      title: 'Conta comercial cadastrada!',
      description: 'A IA já realizou o diagnóstico de qualificação e gerou perguntas de abordagem.',
    })

    setDialogOpen(false)
    resetForm()
    navigate(`/contas/${newAccId}`)
  }

  const resetForm = () => {
    setRazaoSocial('')
    setNomeFantasia('')
    setCnpj('')
    setSite('')
    setSegmento('')
    setLocalizacao('')
    setEndereco('')
    setLinkedin('')
    setObservacoes('')
    setProximoPasso('')
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
            Empresas-alvo mapeadas para abordagem, negociação e expansão comercial.
          </p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
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
              placeholder="Buscar por razão social, nome fantasia, segmento ou cidade..."
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
              : 'Cadastre sua primeira empresa-alvo para iniciar a qualificação com IA e prospecção assistida.'}
          </p>
          <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 text-white text-xs">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Conta Comercial</DialogTitle>
            <DialogDescription>
              Insira os dados da empresa-alvo. A IA analisará a aderência ao ICP e preparará
              perguntas de abordagem.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAccount} className="space-y-4 pt-2">
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
                <Label htmlFor="cnpj" className="text-xs font-semibold">
                  CNPJ (opcional)
                </Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="seg" className="text-xs font-semibold">
                  Segmento de Mercado *
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
                  Porte (Colaboradores)
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cidade" className="text-xs font-semibold">
                  Localização (Cidade/UF) *
                </Label>
                <Input
                  id="cidade"
                  placeholder="Ex: Curitiba, PR"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  required
                />
              </div>

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

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Salvar e Analisar com IA
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
