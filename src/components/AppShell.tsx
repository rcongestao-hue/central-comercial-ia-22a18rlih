import React, { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Home,
  Building2,
  Users,
  Send,
  KanbanSquare,
  Calendar,
  Briefcase,
  LayoutDashboard,
  Network,
  BarChart3,
  Plug,
  Settings,
  ChevronDown,
  LogOut,
  Building,
  Menu,
  X,
  Bell,
  Sparkles,
  ShieldCheck,
  Search,
  PlusCircle,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function AppShell() {
  const {
    currentUser,
    currentCompany,
    allCompanies,
    switchCompany,
    logout,
    registerCompanyAndAdmin,
  } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newCompanyDialogOpen, setNewCompanyDialogOpen] = useState(false)

  // New Company form state
  const [newCompName, setNewCompName] = useState('')
  const [newCompSegment, setNewCompSegment] = useState('')
  const [newCompIcp, setNewCompIcp] = useState('')
  const [newCompDiff, setNewCompDiff] = useState('')

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompName.trim()) return

    registerCompanyAndAdmin(
      {
        nome: newCompName,
        segmentosPrioritarios: newCompSegment ? [newCompSegment] : ['B2B Geral'],
        perfilClienteIdeal: newCompIcp || 'Empresas em expansão',
        diferenciais: newCompDiff ? [newCompDiff] : ['Atendimento consultivo'],
      },
      {
        nome: currentUser?.nome || 'Administrador',
        email: currentUser?.email || 'admin@empresa.com',
        role: 'admin',
        cargo: 'Diretor Comercial',
      },
    )

    setNewCompanyDialogOpen(false)
    setNewCompName('')
    setNewCompSegment('')
    setNewCompIcp('')
    setNewCompDiff('')
  }

  const navItems = [
    { label: 'Início', path: '/', icon: Home },
    { label: 'Contas', path: '/contas', icon: Building2 },
    { label: 'Contatos', path: '/contatos', icon: Users },
    { label: 'Prospecção Assistida', path: '/prospeccao', icon: Send, badge: 'IA' },
    { label: 'Oportunidades', path: '/oportunidades', icon: KanbanSquare },
    { label: 'Agenda Comercial', path: '/agenda', icon: Calendar },
    { label: 'Painel do Gestor', path: '/gestao', icon: LayoutDashboard },
    { label: 'Equipe & Permissões', path: '/equipe', icon: Users },
    { label: 'Relatórios & Metas', path: '/relatorios', icon: BarChart3 },
    { label: 'Integrações', path: '/integrações', icon: Network },
    { label: 'Configurações', path: '/configuracoes', icon: Settings },
  ]
  const roleBadges: Record<string, { label: string; color: string }> = {
    proprietario: { label: 'Proprietário', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    administrador: {
      label: 'Administrador',
      color: 'bg-purple-100 text-purple-900 border-purple-200',
    },
    admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-900 border-purple-200' },
    diretor_comercial: {
      label: 'Diretor Comercial',
      color: 'bg-blue-100 text-blue-900 border-blue-200',
    },
    gestor: { label: 'Gestor Comercial', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    executivo: { label: 'Executivo', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    visualizador: { label: 'Visualizador', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  }

  return (
    <div className="min-h-screen flex bg-[#F4F6FB] text-slate-900">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-800 bg-[#0E1B2F] text-slate-300 transition-all duration-200 ${
          collapsed ? 'w-[76px]' : 'w-[260px]'
        } shrink-0 fixed top-0 bottom-0 left-0 z-30`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-white text-base tracking-tight leading-none">
                  Central Comercial
                </span>
                <span className="text-[11px] text-blue-400 font-medium tracking-wide flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-pulse"></span>
                  IA B2B Produtividade
                </span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white hover:bg-slate-800/60 h-8 w-8 ml-auto"
            title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-400/20 text-blue-200 border border-blue-400/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Company Card & Switcher in Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0A1424]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-left transition-colors group">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
                  {currentCompany?.nome?.substring(0, 2).toUpperCase() || 'EM'}
                </div>
                {!collapsed && (
                  <div className="flex-1 truncate">
                    <p className="text-xs font-semibold text-white truncate leading-tight group-hover:text-blue-300">
                      {currentCompany?.nome || 'Minha Empresa'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">Trocar empresa</p>
                  </div>
                )}
                {!collapsed && (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-slate-900 border-slate-800 text-slate-200"
            >
              <DropdownMenuLabel className="text-xs text-slate-400 font-normal">
                Ambientes Multiempresa & Permissões
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              {allCompanies.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => switchCompany(c.id)}
                  className={`cursor-pointer text-xs py-2 ${
                    c.id === currentCompany?.id
                      ? 'bg-blue-600/20 text-blue-400 font-semibold'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <Building className="w-4 h-4 mr-2 opacity-70" />
                  <div className="truncate flex-1">
                    <div>{c.nome}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {c.segmentosPrioritarios?.join(', ')}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                onClick={() => setNewCompanyDialogOpen(true)}
                className="cursor-pointer text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800 font-medium py-2"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Cadastrar Nova Empresa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0E1B2F] text-slate-300 flex flex-col h-full shadow-2xl z-10">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-sm">Central Comercial IA</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="p-3 border-t border-slate-800">
              <p className="text-xs text-slate-400 mb-1 font-semibold">{currentCompany?.nome}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-slate-700 bg-slate-800 text-slate-200"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setNewCompanyDialogOpen(true)
                }}
              >
                + Nova Empresa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[260px]'
        } min-w-0`}
      >
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{currentCompany?.nome}</span>
              <span className="text-slate-300">/</span>
              <Badge
                variant="outline"
                className={`text-xs font-normal ${roleBadges[currentUser?.role || 'executivo']?.color}`}
              >
                {roleBadges[currentUser?.role || 'executivo']?.label}
              </Badge>
            </div>
          </div>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-3">
            {/* Multi-Company quick badge */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex items-center gap-2 border-slate-200 text-xs h-8"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate max-w-[150px] font-medium text-slate-700">
                    {currentCompany?.nome}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">Alternar Empresa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allCompanies.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => switchCompany(c.id)}
                    className="cursor-pointer text-xs flex items-center justify-between"
                  >
                    <span className="truncate">{c.nome}</span>
                    {c.id === currentCompany?.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-2" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification simulated bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-slate-600 hover:text-slate-900 h-9 w-9"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2">
                <DropdownMenuLabel className="text-xs flex items-center justify-between">
                  <span>Notificações Comerciais</span>
                  <Badge variant="secondary" className="text-[10px]">
                    2 novas
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-2 py-1 text-xs">
                  <div className="p-2 rounded bg-blue-50 border border-blue-100 text-slate-700">
                    <p className="font-semibold text-blue-900">Reunião em 48h</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Demonstração executiva com Nexus Saúde agendada.
                    </p>
                  </div>
                  <div className="p-2 rounded bg-amber-50 border border-amber-100 text-slate-700">
                    <p className="font-semibold text-amber-900">Atividade Atrasada</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Mapear decisor de TI na Alfa Facilities.
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs border border-blue-200">
                    {currentUser?.nome?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight">
                      {currentUser?.nome || 'Usuário'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {currentUser?.cargo || 'Executivo'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">
                  <div>{currentUser?.nome}</div>
                  <div className="text-[11px] font-normal text-slate-500">{currentUser?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate('/configuracoes')}
                  className="cursor-pointer text-xs"
                >
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  Configurações & Usuários
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/gestao')}
                  className="cursor-pointer text-xs"
                >
                  <Briefcase className="w-3.5 h-3.5 mr-2" />
                  Painel do Gestor
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-xs text-rose-600 hover:text-rose-700"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sair da Conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>

        {/* TRANSPARENCY FOOTER */}
        <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white/60">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1440px] mx-auto">
            <span>© 2025 Central Comercial IA — Plataforma SaaS B2B Assistida por IA</span>
            <span className="text-[11px] text-slate-400">
              Dados persistidos com isolamento multi-tenant seguro e banco de dados real. Sem dados
              expostos.
            </span>
          </div>
        </footer>
      </div>

      {/* CREATE NEW COMPANY MODAL */}
      <Dialog open={newCompanyDialogOpen} onOpenChange={setNewCompanyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
            <DialogDescription>
              Crie um novo ambiente corporativo com isolamento completo de contas, contatos e
              oportunidades.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCompany} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-name" className="text-xs font-semibold">
                Nome da Empresa *
              </Label>
              <Input
                id="c-name"
                placeholder="Ex: Sigma Tecnologia & Consultoria B2B"
                value={newCompName}
                onChange={(e) => setNewCompName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-seg" className="text-xs font-semibold">
                Segmento Principal
              </Label>
              <Input
                id="c-seg"
                placeholder="Ex: Software B2B, Logística, Serviços Financeiros"
                value={newCompSegment}
                onChange={(e) => setNewCompSegment(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-icp" className="text-xs font-semibold">
                Perfil de Cliente Ideal (ICP)
              </Label>
              <Textarea
                id="c-icp"
                placeholder="Ex: Médias e grandes empresas com equipe de vendas estruturada..."
                value={newCompIcp}
                onChange={(e) => setNewCompIcp(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-diff" className="text-xs font-semibold">
                Principal Diferencial Competitivo
              </Label>
              <Input
                id="c-diff"
                placeholder="Ex: Implantação expressa e retorno comprovado em 30 dias"
                value={newCompDiff}
                onChange={(e) => setNewCompDiff(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewCompanyDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Criar e Alternar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
