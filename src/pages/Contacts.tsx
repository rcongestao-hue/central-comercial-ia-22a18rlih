import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Contact, CONTACT_CLASSIFICATIONS, ContactClassification } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Send,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ContactsPage() {
  const { currentCompany, currentUser, companyData, updateCompanyData } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClassification, setSelectedClassification] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form
  const [contaId, setContaId] = useState('')
  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [area, setArea] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [classificacao, setClassificacao] = useState<ContactClassification>('decisor')
  const [origem, setOrigem] = useState('Prospecção Ativa')
  const [relacao, setRelacao] = useState('')
  const [obs, setObs] = useState('')

  const accounts = companyData.accounts || []
  const contacts = companyData.contacts || []

  const filteredContacts = contacts.filter((c) => {
    const acc = accounts.find((a) => a.id === c.contaId)
    const accName = acc ? acc.nomeFantasia || acc.razaoSocial : ''

    const matchesSearch =
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClass =
      selectedClassification === 'all' || c.classificacao === selectedClassification
    return matchesSearch && matchesClass
  })

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !contaId || !currentCompany) return

    const newContact: Contact = {
      id: `ct_${Date.now()}`,
      empresaId: currentCompany.id,
      contaId,
      nome,
      cargo,
      area: area || 'Geral',
      email,
      telefone,
      linkedin: linkedin || undefined,
      classificacao,
      origemRelacionamento: origem,
      relacaoComExecutivo: relacao,
      observacoes: obs,
      criadoEm: new Date().toISOString(),
    }

    updateCompanyData((prev) => ({
      ...prev,
      contacts: [newContact, ...prev.contacts],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          empresaId: currentCompany.id,
          contaId,
          contatoId: newContact.id,
          tipo: 'contato_adicionado',
          titulo: `Contato Adicionado: ${newContact.nome}`,
          descricao: `${newContact.cargo} (${newContact.classificacao.toUpperCase()}) cadastrado no CRM.`,
          origem: 'usuario',
          criadoPorUsuarioId: currentUser?.id,
          criadoPorNome: currentUser?.nome,
          criadoEm: new Date().toISOString(),
        },
        ...prev.timeline,
      ],
    }))

    toast({ title: 'Contato cadastrado com sucesso!' })
    setDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setContaId('')
    setNome('')
    setCargo('')
    setArea('')
    setEmail('')
    setTelefone('')
    setLinkedin('')
    setRelacao('')
    setObs('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Contatos & Decisores</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Mapeamento de organograma comercial com classificação de papéis na tomada de decisão.
          </p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Contato</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nome, cargo, e-mail ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-sm border-slate-300"
            />
          </div>

          <Select value={selectedClassification} onValueChange={setSelectedClassification}>
            <SelectTrigger className="w-full md:w-[220px] h-10 text-xs border-slate-300">
              <SelectValue placeholder="Classificação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas classificações</SelectItem>
              {CONTACT_CLASSIFICATIONS.map((cl) => (
                <SelectItem key={cl.id} value={cl.id}>
                  {cl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Grid of Contacts */}
      {filteredContacts.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300 bg-white/50 p-12 text-center">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">Nenhum contato localizado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Adicione contatos associando-os às empresas cadastradas para alimentar as abordagens de
            IA.
          </p>
          <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 text-white text-xs">
            + Cadastrar Contato
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => {
            const acc = accounts.find((a) => a.id === contact.contaId)
            return (
              <Card
                key={contact.id}
                className="border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                        {contact.nome}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {contact.cargo}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border-blue-200 shrink-0"
                    >
                      {contact.classificacao}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3 flex-1">
                  <div
                    onClick={() => acc && navigate(`/contas/${acc.id}`)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold cursor-pointer hover:underline truncate"
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {acc?.nomeFantasia || acc?.razaoSocial || 'Empresa'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    {contact.email && (
                      <p className="flex items-center gap-2 text-slate-600 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </p>
                    )}
                    {contact.telefone && (
                      <p className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{contact.telefone}</span>
                      </p>
                    )}
                  </div>

                  {contact.observacoes && (
                    <p className="p-2 rounded bg-slate-50 text-[11px] text-slate-600 border border-slate-100 italic line-clamp-2">
                      "{contact.observacoes}"
                    </p>
                  )}
                </CardContent>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50 rounded-b-xl">
                  <span className="text-[11px] text-slate-400">{contact.area}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(`/prospeccao?contaId=${contact.contaId}&contatoId=${contact.id}`)
                    }
                    className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gerar Mensagem</span>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* DIALOG: NOVO CONTATO */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Contato Comercial</DialogTitle>
            <DialogDescription>
              Vincule o contato a uma conta comercial para permitir abordagem contextualizada via
              IA.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContact} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Empresa / Conta Comercial *</Label>
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
              <Label className="text-xs font-semibold">Nome Completo *</Label>
              <Input
                placeholder="Ex: Carlos Eduardo Silveira"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Cargo *</Label>
                <Input
                  placeholder="Ex: Diretor de Operações"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Classificação no Processo</Label>
                <Select value={classificacao} onValueChange={(val: any) => setClassificacao(val)}>
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
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Telefone / WhatsApp</Label>
                <Input
                  placeholder="+55 11 99999-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">LinkedIn</Label>
              <Input
                placeholder="https://linkedin.com/in/perfil"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Observações / Contexto</Label>
              <Textarea
                placeholder="Pontos de atenção, preferências de contato, dores mencionadas..."
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white font-semibold">
                Salvar Contato
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
