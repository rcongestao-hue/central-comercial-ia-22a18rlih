import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ChannelType, ProspectingDraft } from '@/types'
import { commercialAiService } from '@/services/ai-service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  Send,
  MessageSquare,
  Mail,
  Share2,
  Phone,
  Copy,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  Check,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ProspectingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentCompany, currentUser, companyData, updateCompanyData } = useAuth()
  const { toast } = useToast()

  const accounts = companyData.accounts || []
  const contacts = companyData.contacts || []

  const paramContaId = searchParams.get('contaId') || accounts[0]?.id || ''
  const paramContatoId = searchParams.get('contatoId') || ''

  const [selectedContaId, setSelectedContaId] = useState<string>(paramContaId)
  const [selectedContatoId, setSelectedContatoId] = useState<string>(paramContatoId)
  const [selectedCanal, setSelectedCanal] = useState<ChannelType>('whatsapp')
  const [tom, setTom] = useState<'consultivo' | 'direto' | 'executivo'>('consultivo')

  // Generated message state
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [dica, setDica] = useState('')

  // Execution Step State
  const [statusDraft, setStatusDraft] = useState<
    'rascunho' | 'copiada' | 'canal_aberto' | 'envio_confirmado' | 'resposta_registrada'
  >('rascunho')
  const [respostaTexto, setRespostaTexto] = useState('')
  const [proximaAcao, setProximaAcao] = useState('')
  const [copied, setCopied] = useState(false)

  const selectedAccount = accounts.find((a) => a.id === selectedContaId)
  const accountContacts = contacts.filter((c) => c.contaId === selectedContaId)
  const selectedContact =
    accountContacts.find((c) => c.id === selectedContatoId) || accountContacts[0]

  useEffect(() => {
    if (paramContaId) setSelectedContaId(paramContaId)
  }, [paramContaId])

  useEffect(() => {
    if (selectedAccount && currentCompany) {
      handleGenerateMessage()
    }
  }, [selectedContaId, selectedContatoId, selectedCanal, tom])

  const handleGenerateMessage = () => {
    if (!selectedAccount || !currentCompany) return

    const result = commercialAiService.generateApproach(
      selectedAccount,
      selectedContact,
      currentCompany,
      selectedCanal,
      tom,
    )

    setAssunto(result.assunto)
    setMensagem(result.mensagem)
    setDica(result.dicaExecutiva)
    setStatusDraft('rascunho')
    setCopied(false)
  }

  const handleCopy = () => {
    const textToCopy = selectedCanal === 'email' ? `Assunto: ${assunto}\n\n${mensagem}` : mensagem
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setStatusDraft('copiada')

    // Register Timeline Event
    if (currentCompany && selectedAccount) {
      updateCompanyData((prev) => ({
        ...prev,
        timeline: [
          {
            id: `tl_${Date.now()}`,
            empresaId: currentCompany.id,
            contaId: selectedAccount.id,
            contatoId: selectedContact?.id,
            tipo: 'mensagem_copiada',
            titulo: `Mensagem Copiada para Canal ${selectedCanal.toUpperCase()}`,
            descricao: `Texto de abordagem preparado pela IA copiado para a área de transferência.`,
            origem: 'usuario',
            criadoPorUsuarioId: currentUser?.id,
            criadoPorNome: currentUser?.nome,
            criadoEm: new Date().toISOString(),
          },
          ...prev.timeline,
        ],
      }))
    }

    toast({
      title: 'Conteúdo copiado!',
      description: 'Pronto para colar no canal oficial da sua escolha.',
    })

    setTimeout(() => setCopied(false), 2500)
  }

  const handleOpenOfficialChannel = () => {
    if (!selectedAccount) return

    setStatusDraft('canal_aberto')

    // Record timeline
    if (currentCompany) {
      updateCompanyData((prev) => ({
        ...prev,
        timeline: [
          {
            id: `tl_${Date.now()}`,
            empresaId: currentCompany.id,
            contaId: selectedAccount.id,
            contatoId: selectedContact?.id,
            tipo: 'canal_aberto',
            titulo: `Canal Oficial Aberto: ${selectedCanal.toUpperCase()}`,
            descricao: `Executivo iniciou a interface oficial de envio.`,
            origem: 'usuario',
            criadoPorUsuarioId: currentUser?.id,
            criadoPorNome: currentUser?.nome,
            criadoEm: new Date().toISOString(),
          },
          ...prev.timeline,
        ],
      }))
    }

    if (selectedCanal === 'whatsapp') {
      const cleanPhone = (selectedContact?.telefone || '').replace(/\D/g, '')
      const encodedMsg = encodeURIComponent(mensagem)
      const url = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
        : `https://web.whatsapp.com`
      window.open(url, '_blank')
      return
    }

    if (selectedCanal === 'email') {
      const mailto = `mailto:${selectedContact?.email || ''}?subject=${encodeURIComponent(
        assunto,
      )}&body=${encodeURIComponent(mensagem)}`
      window.location.href = mailto
      return
    }

    if (selectedCanal === 'linkedin') {
      const targetUrl =
        selectedContact?.linkedin || selectedAccount.linkedinInstitucional || 'https://linkedin.com'
      window.open(targetUrl, '_blank')
      return
    }

    if (selectedCanal === 'telefone') {
      toast({
        title: 'Ligação em andamento',
        description: `Número: ${selectedContact?.telefone || 'Telefone não cadastrado'}`,
      })
    }
  }

  const handleConfirmSent = () => {
    if (!selectedAccount || !currentCompany) return

    setStatusDraft('envio_confirmado')

    updateCompanyData((prev) => ({
      ...prev,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: selectedAccount.id,
          contatoId: selectedContact?.id,
          tipo: 'envio_confirmado',
          titulo: `Envio Manual Confirmado via ${selectedCanal.toUpperCase()}`,
          descricao: `Abordagem enviada para ${selectedContact?.nome || 'Contato'} (${selectedContact?.cargo || 'Decisor'}).`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))

    toast({
      title: 'Disparo registrado no histórico!',
      description: 'A atividade foi documentada na linha do tempo da conta.',
    })
  }

  const handleRegisterResponse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!respostaTexto.trim() || !selectedAccount || !currentCompany) return

    setStatusDraft('resposta_registrada')

    updateCompanyData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === selectedAccount.id
          ? {
              ...acc,
              proximoPasso: proximaAcao || acc.proximoPasso,
              atualizadoEm: new Date().toISOString(),
            }
          : acc,
      ),
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId: selectedAccount.id,
          contatoId: selectedContact?.id,
          tipo: 'resposta_recebida',
          titulo: `Resposta Recebida do Contato (${selectedContact?.nome || 'Lead'})`,
          descricao: `Retorno registrado: "${respostaTexto}" • Próximo passo: ${proximaAcao || 'Acompanhamento'}`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))

    toast({
      title: 'Resposta e Próximo Passo Registrados!',
      description: 'O funil e a linha do tempo foram atualizados.',
    })

    setRespostaTexto('')
    setProximaAcao('')
  }

  const channelIcons: Record<ChannelType, any> = {
    whatsapp: MessageSquare,
    email: Mail,
    linkedin: Share2,
    telefone: Phone,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-600" />
            <span>Prospecção Manual Assistida por IA</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gere abordagens personalizadas com base no contexto da conta, copie e dispare no canal
            oficial seguro.
          </p>
        </div>

        {/* Workflow steps tracker */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold bg-white p-2 rounded-xl border border-slate-200">
          <span
            className={`px-2 py-1 rounded ${statusDraft === 'rascunho' ? 'bg-blue-100 text-blue-800' : 'text-slate-400'}`}
          >
            1. Rascunho IA
          </span>
          <span>→</span>
          <span
            className={`px-2 py-1 rounded ${statusDraft === 'copiada' ? 'bg-blue-100 text-blue-800' : 'text-slate-400'}`}
          >
            2. Copiar
          </span>
          <span>→</span>
          <span
            className={`px-2 py-1 rounded ${statusDraft === 'canal_aberto' ? 'bg-blue-100 text-blue-800' : 'text-slate-400'}`}
          >
            3. Canal Oficial
          </span>
          <span>→</span>
          <span
            className={`px-2 py-1 rounded ${statusDraft === 'envio_confirmado' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400'}`}
          >
            4. Confirmar Envio
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 cols: Selectors & Account Context */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">
                1. Contexto & Destinatário
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Selecione a conta-alvo e o canal de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {/* Select Account */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Conta Comercial</Label>
                <Select
                  value={selectedContaId}
                  onValueChange={(val) => {
                    setSelectedContaId(val)
                    setSelectedContatoId('')
                  }}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id} className="text-xs">
                        {a.nomeFantasia || a.razaoSocial} ({a.segmento})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Contact */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Decisor / Contato</Label>
                <Select value={selectedContatoId} onValueChange={setSelectedContatoId}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Selecione o contato" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountContacts.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.nome} — {c.cargo} ({c.classificacao.toUpperCase()})
                      </SelectItem>
                    ))}
                    {accountContacts.length === 0 && (
                      <SelectItem value="none" disabled className="text-xs">
                        Nenhum contato cadastrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Channel Selector */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Canal de Abordagem</Label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {(['whatsapp', 'email', 'linkedin', 'telefone'] as ChannelType[]).map((canal) => {
                    const Icon = channelIcons[canal]
                    const isSelected = selectedCanal === canal
                    return (
                      <button
                        key={canal}
                        type="button"
                        onClick={() => setSelectedCanal(canal)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="capitalize">{canal}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tone of Voice */}
              <div className="space-y-1 pt-1">
                <Label className="text-xs font-semibold">Tom da Mensagem</Label>
                <Select value={tom} onValueChange={(val: any) => setTom(val)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultivo" className="text-xs">
                      Consultivo & Empático (Recomendado)
                    </SelectItem>
                    <SelectItem value="direto" className="text-xs">
                      Direto & Focado em Dores
                    </SelectItem>
                    <SelectItem value="executivo" className="text-xs">
                      Executivo / C-Level (Alto Padrão)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateMessage}
                className="w-full text-xs border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-1.5 mt-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Regenerar Abordagem com IA</span>
              </Button>
            </CardContent>
          </Card>

          {/* Target Account Summary Pill */}
          {selectedAccount && (
            <Card className="border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Contexto da Empresa:</span>
              <p className="text-slate-600">
                <strong>{selectedAccount.razaoSocial}</strong> • {selectedAccount.localizacao}
              </p>
              {selectedAccount.iaAnalysis && (
                <div className="p-2 rounded bg-white border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                  <span className="font-semibold text-blue-900 block mb-0.5">Diagnóstico IA:</span>
                  {selectedAccount.iaAnalysis.resumoExecutivo}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right 8 cols: Generated Message, Copy, Open Official, Confirm */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>2. Abordagem Comercial Assistida</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Edite livremente antes de copiar. O texto utiliza os diferenciais cadastrados no
                  onboarding.
                </CardDescription>
              </div>

              <Badge variant="outline" className="text-xs capitalize bg-slate-50">
                {selectedCanal}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Subject if Email */}
              {selectedCanal === 'email' && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Assunto do E-mail</Label>
                  <Input
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              )}

              {/* Message Body Textarea */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Corpo da Mensagem (Editável)</Label>
                <Textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={selectedCanal === 'email' ? 10 : 7}
                  className="text-xs font-normal leading-relaxed resize-y"
                />
              </div>

              {/* Executive Tip */}
              {dica && (
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2 text-xs text-slate-700">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-900">Dica Executiva: </span>
                    <span>{dica}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Copy, Open Channel, Confirm Sent */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCopy}
                    variant={copied ? 'secondary' : 'default'}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado!' : '1. Copiar Conteúdo'}</span>
                  </Button>

                  <Button
                    onClick={handleOpenOfficialChannel}
                    variant="outline"
                    className="border-slate-300 text-slate-700 text-xs h-9 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                    <span>2. Abrir {selectedCanal.toUpperCase()} Oficial</span>
                  </Button>
                </div>

                <Button
                  onClick={handleConfirmSent}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 flex items-center gap-1.5 font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Confirmar Envio Manual</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Register Response & Next Action Form */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900">
                3. Registrar Resposta & Próxima Ação
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Quando o cliente responder, registre a resposta para manter o histórico unificado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterResponse} className="space-y-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Resposta do Lead / Contato</Label>
                  <Textarea
                    placeholder="Ex: 'Oi Lucas, temos interesse sim. Pode me mandar uma proposta ou agendarmos para quinta?'"
                    value={respostaTexto}
                    onChange={(e) => setRespostaTexto(e.target.value)}
                    rows={2}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Próximo Passo Imediato</Label>
                  <Input
                    placeholder="Ex: Agendar reunião de diagnóstico para quinta-feira às 14h"
                    value={proximaAcao}
                    onChange={(e) => setProximaAcao(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9"
                  >
                    Gravar Resposta no Histórico
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
