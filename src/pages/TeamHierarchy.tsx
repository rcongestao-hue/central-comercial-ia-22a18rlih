import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import pb from '@/lib/pocketbase/client'
import { crmService } from '@/services/crm-service'
import { CompanyUser, Team, Invitation, Profile } from '@/types'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  Mail,
  Building2,
  FolderTree,
  Send,
  Trash2,
  Clock,
  CheckCircle,
  Copy,
  Plus,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TeamHierarchy() {
  const { currentCompany, currentUser, companyUser, companyData, reloadAllData } = useAuth()
  const { toast } = useToast()

  const [members, setMembers] = useState<CompanyUser[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  // Dialogs
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<CompanyUser | null>(null)

  // Invite Form
  const [invEmail, setInvEmail] = useState('')
  const [invProfile, setInvProfile] = useState<Profile>('executivo')
  const [invTeam, setInvTeam] = useState<string>('')
  const [invManager, setInvManager] = useState<string>('')

  // Team Form
  const [teamName, setTeamName] = useState('')
  const [teamManager, setTeamManager] = useState('')
  const [teamRegion, setTeamRegion] = useState('')
  const [teamPortfolio, setTeamPortfolio] = useState('')

  // Edit Member Form
  const [editProfile, setEditProfile] = useState<Profile>('executivo')
  const [editStatus, setEditStatus] = useState<'ativo' | 'inativo' | 'suspenso'>('ativo')

  const isOwnerOrAdmin =
    companyUser?.profile === 'proprietario' || companyUser?.profile === 'administrador'

  const loadData = async () => {
    if (!currentCompany) return
    setLoading(true)
    try {
      const [membersRes, teamsRes, invRes] = await Promise.all([
        pb.collection('company_users').getFullList({
          filter: `company = '${currentCompany.id}'`,
          expand: 'user,company',
        }),
        crmService.getTeams(currentCompany.id),
        crmService.getInvitations(currentCompany.id),
      ])

      setMembers(membersRes as any)
      setTeams(teamsRes)
      setInvitations(invRes)
    } catch (err) {
      console.error('Error loading team data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentCompany])

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invEmail || !currentCompany) return

    try {
      await crmService.createInvitation({
        company: currentCompany.id,
        email: invEmail.trim(),
        profile: invProfile,
        team: invTeam || undefined,
        manager: invManager || undefined,
        invited_by: companyUser?.id,
        status: 'pendente',
      })

      toast({
        title: 'Convite criado com sucesso!',
        description: `Link de convite gerado. Copie e envie manualmente ao usuário (${invEmail}).`,
      })

      setInviteDialogOpen(false)
      setInvEmail('')
      setInvTeam('')
      setInvManager('')
      loadData()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar convite',
        description: err?.message,
      })
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName || !currentCompany) return

    try {
      await crmService.createTeam({
        company: currentCompany.id,
        name: teamName,
        manager: teamManager || undefined,
        region: teamRegion || undefined,
        portfolio: teamPortfolio || undefined,
      })

      toast({
        title: 'Equipe criada com sucesso!',
        description: `A equipe ${teamName} foi registrada.`,
      })

      setTeamDialogOpen(false)
      setTeamName('')
      setTeamManager('')
      setTeamRegion('')
      setTeamPortfolio('')
      loadData()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar equipe',
        description: err?.message,
      })
    }
  }

  const handleSaveMemberEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return

    // Prevent changing own profile
    if (selectedMember.user === currentUser?.id && editProfile !== selectedMember.profile) {
      toast({
        variant: 'destructive',
        title: 'Operação bloqueada',
        description: 'Usuários não podem alterar o seu próprio perfil de acesso.',
      })
      return
    }

    try {
      await pb.collection('company_users').update(selectedMember.id, {
        profile: editProfile,
        status: editStatus,
      })

      toast({
        title: 'Membro atualizado!',
        description: 'As alterações de perfil e status foram salvas.',
      })

      setEditMemberDialogOpen(false)
      loadData()
      reloadAllData()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar membro',
        description: err?.message,
      })
    }
  }

  const handleCopyInviteToken = (token?: string) => {
    if (!token) return
    const inviteUrl = `${window.location.origin}/entrar?convite=${token}`
    navigator.clipboard.writeText(inviteUrl)
    toast({
      title: 'Link de convite copiado!',
      description: 'Link de convite gerado. Copie e envie manualmente ao usuário.',
    })
  }

  const handleRevokeInvitation = async (invId: string) => {
    try {
      await crmService.deleteInvitation(invId)
      toast({ title: 'Convite revogado com sucesso.' })
      loadData()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const getProfileBadge = (profile: Profile) => {
    switch (profile) {
      case 'proprietario':
        return <Badge className="bg-amber-500 text-white border-amber-600">Proprietário</Badge>
      case 'administrador':
        return <Badge className="bg-purple-600 text-white">Administrador</Badge>
      case 'diretor_comercial':
        return <Badge className="bg-blue-600 text-white">Diretor Comercial</Badge>
      case 'gestor':
        return <Badge className="bg-indigo-600 text-white">Gestor de Equipe</Badge>
      case 'executivo':
        return <Badge className="bg-slate-700 text-white">Executivo Comercial</Badge>
      case 'visualizador':
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            Visualizador
          </Badge>
        )
      default:
        return <Badge variant="secondary">{profile}</Badge>
    }
  }

  const directors = members.filter(
    (m) => m.profile === 'proprietario' || m.profile === 'diretor_comercial',
  )
  const managers = members.filter((m) => m.profile === 'gestor' || m.profile === 'administrador')
  const executives = members.filter(
    (m) => m.profile === 'executivo' || m.profile === 'visualizador',
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Equipe, Permissões & Hierarquia</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerenciamento multi-tenant de colaboradores, papéis de acesso, carteiras e estrutura
            comercial.
          </p>
        </div>

        {isOwnerOrAdmin && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setTeamDialogOpen(true)}
              variant="outline"
              className="text-xs h-10 border-slate-300"
            >
              <FolderTree className="w-4 h-4 mr-1.5" />
              <span>Nova Equipe</span>
            </Button>
            <Button
              onClick={() => setInviteDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-10 shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              <span>Convidar Usuário</span>
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="membros" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
          <TabsTrigger value="membros" className="text-xs font-semibold">
            Membros Ativos ({members.length})
          </TabsTrigger>
          <TabsTrigger value="hierarquia" className="text-xs font-semibold">
            Visão Hierárquica
          </TabsTrigger>
          <TabsTrigger value="equipes" className="text-xs font-semibold">
            Equipes ({teams.length})
          </TabsTrigger>
          <TabsTrigger value="convites" className="text-xs font-semibold">
            Convites Pendentes ({invitations.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MEMBROS ATIVOS */}
        <TabsContent value="membros" className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">Perfil de Acesso</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Último Acesso</th>
                    {isOwnerOrAdmin && <th className="py-3 px-4 text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => {
                    const userName =
                      m.expand?.user?.name || m.expand?.user?.email?.split('@')[0] || 'Usuário'
                    const userEmail = m.expand?.user?.email || '—'
                    const isSelf = m.user === currentUser?.id

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span>{userName}</span>
                            {isSelf && (
                              <Badge variant="outline" className="ml-2 text-[10px] bg-slate-100">
                                Você
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{userEmail}</td>
                        <td className="py-3 px-4">{getProfileBadge(m.profile)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${
                              m.status === 'ativo'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {m.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {m.last_access ? formatDatePtBR(m.last_access) : 'Recente'}
                        </td>
                        {isOwnerOrAdmin && (
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(m)
                                setEditProfile(m.profile)
                                setEditStatus(m.status)
                                setEditMemberDialogOpen(true)
                              }}
                              className="text-xs text-blue-600"
                            >
                              Editar Permissões
                            </Button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: VISÃO HIERÁRQUICA */}
        <TabsContent value="hierarquia" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Diretoria */}
            <Card className="border-amber-200 bg-amber-50/20 shadow-sm">
              <CardHeader className="pb-3 border-b border-amber-100">
                <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Diretoria & Proprietários</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Acesso irrestrito a todas as contas e configurações
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {directors.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 bg-white rounded-lg border border-amber-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {d.expand?.user?.name || d.expand?.user?.email}
                      </p>
                      <p className="text-[11px] text-slate-500">{d.expand?.user?.email}</p>
                    </div>
                    {getProfileBadge(d.profile)}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Gestores */}
            <Card className="border-indigo-200 bg-indigo-50/20 shadow-sm">
              <CardHeader className="pb-3 border-b border-indigo-100">
                <CardTitle className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Gestores & Administradores</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Supervisão de equipe e distribuição de contas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {managers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Nenhum gestor atribuído.
                  </p>
                ) : (
                  managers.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-white rounded-lg border border-indigo-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {m.expand?.user?.name || m.expand?.user?.email}
                        </p>
                        <p className="text-[11px] text-slate-500">{m.expand?.user?.email}</p>
                      </div>
                      {getProfileBadge(m.profile)}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Executivos */}
            <Card className="border-slate-200 bg-slate-50/50 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-200">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-600" />
                  <span>Executivos & Visualizadores</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Acesso focado na sua carteira de contas e metas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {executives.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Nenhum executivo na carteira.
                  </p>
                ) : (
                  executives.map((e) => (
                    <div
                      key={e.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {e.expand?.user?.name || e.expand?.user?.email}
                        </p>
                        <p className="text-[11px] text-slate-500">{e.expand?.user?.email}</p>
                      </div>
                      {getProfileBadge(e.profile)}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: EQUIPES */}
        <TabsContent value="equipes" className="space-y-4">
          {teams.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 p-12 text-center bg-white/50">
              <FolderTree className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">Nenhuma equipe configurada</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Organize seus executivos por esquadrões, regiões ou segmentos de mercado.
              </p>
              {isOwnerOrAdmin && (
                <Button
                  onClick={() => setTeamDialogOpen(true)}
                  className="bg-blue-600 text-white text-xs"
                >
                  + Criar Primeira Equipe
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((t) => (
                <Card key={t.id} className="border-slate-200 bg-white shadow-sm p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                      {t.region && (
                        <p className="text-xs text-slate-500 mt-0.5">Região: {t.region}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs bg-slate-50">
                      Equipe
                    </Badge>
                  </div>
                  {t.portfolio && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                      {t.portfolio}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: CONVITES PENDENTES */}
        <TabsContent value="convites" className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">E-mail Convidado</th>
                    <th className="py-3 px-4">Perfil Destinado</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Data do Convite</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Nenhum convite pendente.
                      </td>
                    </tr>
                  ) : (
                    invitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-900">{inv.email}</td>
                        <td className="py-3 px-4">{getProfileBadge(inv.profile)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${
                              inv.status === 'pendente'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : inv.status === 'aceito'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {inv.created ? formatDatePtBR(inv.created) : 'Hoje'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyInviteToken(inv.token)}
                            className="text-xs text-blue-600 border-blue-200"
                          >
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            <span>Copiar Link</span>
                          </Button>
                          {isOwnerOrAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeInvitation(inv.id)}
                              className="text-xs text-rose-600 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG: CONVIDAR USUÁRIO */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Novo Usuário</DialogTitle>
            <DialogDescription>
              Gere um link de acesso com o perfil e equipe adequados para o colaborador.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendInvite} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">E-mail Corporativo *</Label>
              <Input
                type="email"
                placeholder="colaborador@empresa.com"
                value={invEmail}
                onChange={(e) => setInvEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Perfil de Acesso *</Label>
              <Select value={invProfile} onValueChange={(val: any) => setInvProfile(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">
                    Administrador (Controle Total da Empresa)
                  </SelectItem>
                  <SelectItem value="diretor_comercial">Diretor Comercial</SelectItem>
                  <SelectItem value="gestor">Gestor de Equipe</SelectItem>
                  <SelectItem value="executivo">Executivo Comercial (Vendas)</SelectItem>
                  <SelectItem value="visualizador">Visualizador (Somente Leitura)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {teams.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Vincular à Equipe (Opcional)</Label>
                <Select value={invTeam} onValueChange={setInvTeam}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white font-semibold">
                Gerar Convite
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: NOVA EQUIPE */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Equipe Comercial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTeam} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nome da Equipe *</Label>
              <Input
                placeholder="Ex: Esquadrão Sul / Enterprise"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Região de Atuação</Label>
              <Input
                placeholder="Ex: São Paulo Capital / Sul"
                value={teamRegion}
                onChange={(e) => setTeamRegion(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Descrição da Carteira</Label>
              <Input
                placeholder="Ex: Contas B2B acima de 500 colaboradores"
                value={teamPortfolio}
                onChange={(e) => setTeamPortfolio(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setTeamDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white font-semibold">
                Salvar Equipe
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: EDITAR MEMBRO */}
      <Dialog open={editMemberDialogOpen} onOpenChange={setEditMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Permissões do Membro</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveMemberEdit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Perfil de Acesso</Label>
              <Select value={editProfile} onValueChange={(val: any) => setEditProfile(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proprietario">Proprietário</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="diretor_comercial">Diretor Comercial</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="executivo">Executivo</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Status de Acesso</Label>
              <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditMemberDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white font-semibold">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
