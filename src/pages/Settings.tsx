import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Role, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Settings,
  Building2,
  Users,
  Shield,
  Cpu,
  Database,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Lock,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const {
    currentUser,
    currentCompany,
    userList,
    createUser,
    updateUser,
    deleteUser,
    updateCurrentCompany,
    companyData,
    reloadAllData,
  } = useAuth()
  const { toast } = useToast()

  const isAdmin = currentUser?.role === 'admin'

  // Company Form State
  const [compNome, setCompNome] = useState(currentCompany?.nome || '')
  const [compFantasia, setCompFantasia] = useState(currentCompany?.nomeFantasia || '')
  const [compIcp, setCompIcp] = useState(currentCompany?.perfilClienteIdeal || '')
  const [compDiff, setCompDiff] = useState(currentCompany?.diferenciais?.join(', ') || '')
  const [compSeg, setCompSeg] = useState(currentCompany?.segmentosPrioritarios?.join(', ') || '')
  const [compRegiao, setCompRegiao] = useState(currentCompany?.regiaoAtuacao || '')

  // User Management Form State
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserCargo, setNewUserCargo] = useState('')
  const [newUserRole, setNewUserRole] = useState<Role>('executivo')
  const [newUserSenha, setNewUserSenha] = useState('123456')

  // AI Provider State (Future BYOK)
  const [aiProvider, setAiProvider] = useState<'skip_native' | 'openai' | 'anthropic' | 'gemini'>(
    'skip_native',
  )
  const [customApiKey, setCustomApiKey] = useState('')

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      toast({ title: 'Apenas Administradores podem alterar diretrizes', variant: 'destructive' })
      return
    }

    updateCurrentCompany({
      nome: compNome,
      nomeFantasia: compFantasia,
      perfilClienteIdeal: compIcp,
      diferenciais: compDiff
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean),
      segmentosPrioritarios: compSeg
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      regiaoAtuacao: compRegiao,
    })
  }

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName || !newUserEmail) return

    const success = createUser({
      nome: newUserName,
      email: newUserEmail,
      cargo: newUserCargo || 'Executivo Comercial',
      role: newUserRole,
      senha: newUserSenha || '123456',
      ativo: true,
    })

    if (success) {
      setUserDialogOpen(false)
      setNewUserName('')
      setNewUserEmail('')
      setNewUserCargo('')
      setNewUserRole('executivo')
    }
  }

  const handleExportJson = () => {
    const payload = {
      empresa: currentCompany,
      usuarios: userList,
      dadosComerciais: companyData,
      exportadoEm: new Date().toISOString(),
    }

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute(
      'download',
      `backup_central_ia_${currentCompany?.id || 'empresa'}.json`,
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()

    toast({ title: 'Backup JSON baixado com sucesso!' })
  }

  const roleLabels: Record<Role, { label: string; desc: string }> = {
    admin: {
      label: 'Administrador',
      desc: 'Acesso total: gerencia usuários, diretrizes da empresa e integrações',
    },
    gestor: {
      label: 'Gestor Comercial',
      desc: 'Acesso ao painel do gestor, relatórios e todas as contas/oportunidades',
    },
    executivo: {
      label: 'Executivo Comercial',
      desc: 'Opera contas, contatos, pipeline, prospecção assistida e agenda',
    },
    visualizador: {
      label: 'Visualizador',
      desc: 'Visualização de dados comerciais e relatórios, sem permissão de edição',
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>Configurações & Administração</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Gestão de usuários por perfil, diretrizes da empresa, provedor de IA e segurança
          localStorage.
        </p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
          <TabsTrigger value="empresa" className="text-xs flex items-center gap-1.5 font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Perfil da Empresa & ICP</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="text-xs flex items-center gap-1.5 font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Usuários & Perfis ({userList.length})</span>
          </TabsTrigger>
          <TabsTrigger value="ia" className="text-xs flex items-center gap-1.5 font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Provedor de IA</span>
          </TabsTrigger>
          <TabsTrigger value="dados" className="text-xs flex items-center gap-1.5 font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span>Segurança & Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB: EMPRESA */}
        <TabsContent value="empresa">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Diretrizes Comerciais da Empresa
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Estes parâmetros calibram os diagnósticos de qualificação e mensagens de prospecção
                da IA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveCompany} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Razão Social</Label>
                    <Input
                      value={compNome}
                      onChange={(e) => setCompNome(e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Nome Fantasia</Label>
                    <Input
                      value={compFantasia}
                      onChange={(e) => setCompFantasia(e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Segmentos Prioritários (Separados por vírgula)
                  </Label>
                  <Input
                    value={compSeg}
                    onChange={(e) => setCompSeg(e.target.value)}
                    disabled={!isAdmin}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Perfil de Cliente Ideal (ICP)</Label>
                  <Textarea
                    value={compIcp}
                    onChange={(e) => setCompIcp(e.target.value)}
                    rows={3}
                    disabled={!isAdmin}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Principais Diferenciais</Label>
                    <Input
                      value={compDiff}
                      onChange={(e) => setCompDiff(e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Região de Atuação</Label>
                    <Input
                      value={compRegiao}
                      onChange={(e) => setCompRegiao(e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex justify-end pt-2">
                    <Button type="submit" className="bg-blue-600 text-white text-xs font-semibold">
                      Salvar Alterações da Empresa
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: USUÁRIOS & PERFIS */}
        <TabsContent value="usuarios">
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Membros da Empresa & Perfis de Acesso
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Administrador, Gestor comercial, Executivo comercial e Visualizador.
                </CardDescription>
              </div>

              {isAdmin && (
                <Button
                  onClick={() => setUserDialogOpen(true)}
                  className="bg-blue-600 text-white text-xs flex items-center gap-1.5 h-8 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Usuário</span>
                </Button>
              )}
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">Cargo</th>
                    <th className="py-3 px-4">Perfil de Acesso</th>
                    <th className="py-3 px-4">Status</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{user.nome}</td>
                      <td className="py-3 px-4 text-slate-600">{user.email}</td>
                      <td className="py-3 px-4 text-slate-600">{user.cargo}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-bold bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Ativo
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right">
                          {user.id !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteUser(user.id)}
                              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB: PROVEDOR DE IA (FUTURE BYOK) */}
        <TabsContent value="ia">
          <Card className="border-slate-200 bg-white shadow-sm space-y-4 p-6">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <span>Provedor de IA & Arquitetura BYOK (Bring Your Own Key)</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                A plataforma opera com assistente inteligente nativo local. Você também pode
                preparar a conexão futura com OpenAI, Anthropic ou Google Gemini.
              </CardDescription>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-2">
              <span className="font-bold text-blue-900 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                IA Nativa Comercial (Ativa e Operacional)
              </span>
              <p className="leading-relaxed">
                Todas as rotinas comerciais (qualificação de contas, geração de abordagens por
                canal, resumos de atas de reunião e diagnósticos de gestão) operam com o motor
                interno contextualizado com as diretrizes da sua empresa.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
              <span className="font-bold text-slate-800 block text-sm">
                Conexão com API Própria (Funcionalidade Futura):
              </span>
              <p className="text-slate-500 leading-relaxed">
                A arquitetura da Central Comercial IA está desacoplada e pronta para receber chaves
                privadas de modelos de ponta sem comprometer a privacidade dos seus dados
                comerciais.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Provedor Selecionado</Label>
                  <Select value={aiProvider} onValueChange={(val: any) => setAiProvider(val)}>
                    <SelectTrigger className="text-xs h-9 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip_native">Motor Nativo da Central (Padrão)</SelectItem>
                      <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                      <SelectItem value="anthropic">Anthropic (Claude 3.5 Sonnet)</SelectItem>
                      <SelectItem value="gemini">Google Gemini 1.5 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Chave de API Dedicada (Opcional)</Label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="h-9 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB: DADOS & BACKUP */}
        <TabsContent value="dados">
          <Card className="border-slate-200 bg-white shadow-sm p-6 space-y-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span>Segurança & Armazenamento Local (localStorage)</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Seus dados ficam armazenados exclusivamente no seu navegador com isolamento por
                empresa.
              </CardDescription>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <span className="font-bold text-slate-900 block">
                Princípios de Segurança da Plataforma:
              </span>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>
                  Separação estrita de dados entre diferentes empresas cadastradas no navegador.
                </li>
                <li>Sem envio não autorizado de dados confidenciais para servidores externos.</li>
                <li>Nenhuma credencial exposta em repositórios públicos.</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={handleExportJson}
                variant="outline"
                className="text-xs border-slate-300 text-slate-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Exportar Backup Completo (JSON)</span>
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG: NOVO USUÁRIO */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Usuário na Empresa</DialogTitle>
            <DialogDescription>Defina o nível de permissão comercial adequado.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNewUser} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nome Completo *</Label>
              <Input
                placeholder="Ex: Rafael Silva"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">E-mail Corporativo *</Label>
              <Input
                type="email"
                placeholder="rafael@empresa.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Cargo / Função *</Label>
              <Input
                placeholder="Ex: Executivo de Vendas B2B"
                value={newUserCargo}
                onChange={(e) => setNewUserCargo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Perfil de Acesso</Label>
              <Select value={newUserRole} onValueChange={(val: any) => setNewUserRole(val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executivo">Executivo Comercial (Opera Funil)</SelectItem>
                  <SelectItem value="gestor">Gestor Comercial (Acompanha Equipe)</SelectItem>
                  <SelectItem value="admin">Administrador (Controle Total)</SelectItem>
                  <SelectItem value="visualizador">Visualizador (Apenas Leitura)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Senha Inicial</Label>
              <Input
                type="password"
                value={newUserSenha}
                onChange={(e) => setNewUserSenha(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setUserDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 text-white font-semibold">
                Cadastrar Usuário
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
