import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Sparkles,
  Building2,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
} from 'lucide-react'

export default function Onboarding() {
  const { registerCompanyAndAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1: Admin User Data
  const [adminNome, setAdminNome] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminCargo, setAdminCargo] = useState('Diretor(a) Comercial')
  const [adminSenha, setAdminSenha] = useState('')

  // Step 2: Company & Commercial Context (Used by IA)
  const [companyNome, setCompanyNome] = useState('')
  const [companyFantasia, setCompanyFantasia] = useState('')
  const [produtosServicos, setProdutosServicos] = useState('')
  const [segmentosPrioritarios, setSegmentosPrioritarios] = useState('')
  const [perfilClienteIdeal, setPerfilClienteIdeal] = useState('')
  const [principaisDiferenciais, setPrincipaisDiferenciais] = useState('')
  const [regiaoAtuacao, setRegiaoAtuacao] = useState('Brasil (Nacional)')

  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (isAuthenticated) {
      // Allow onboarding to create new workspace, don't force redirect
    }
  }, [])

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminNome || !adminEmail || !adminSenha) return
    setStep(2)
  }

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyNome.trim()) return

    setLoading(true)
    const segArray = segmentosPrioritarios
      ? segmentosPrioritarios
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : ['B2B Geral']
    const prodArray = produtosServicos
      ? produtosServicos
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : ['Consultoria & Serviços']
    const diffArray = principaisDiferenciais
      ? principaisDiferenciais
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : ['Atendimento Ágil']

    try {
      const res = await registerCompanyAndAdmin(
        {
          nome: companyNome,
          nomeFantasia: companyFantasia || companyNome,
          segmentosPrioritarios: segArray,
          produtosServicos: prodArray,
          perfilClienteIdeal:
            perfilClienteIdeal || 'Empresas B2B de médio porte buscando eficiência',
          diferenciais: diffArray,
          regiaoAtuacao: regiaoAtuacao || 'Brasil',
        },
        {
          nome: adminNome,
          email: adminEmail,
          cargo: adminCargo,
          senha: adminSenha || 'admin123',
        },
      )
      setLoading(false)
      if (res.success) {
        toast({
          title: 'Empresa cadastrada!',
          description: 'Seja bem-vindo(a) à Central Comercial IA.',
        })
        navigate('/inicio')
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao cadastrar',
          description: res.error || 'Não foi possível salvar no banco de dados.',
        })
      }
    } catch (err: any) {
      setLoading(false)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err.message,
      })
    }
  }
  return (
    <div className="min-h-screen bg-[#0E1B2F] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl w-full">
        {/* Header Progress */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Onboarding Comercial Estruturado</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Configurar Nova Empresa na Central
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Essas informações orientam a IA para qualificar suas contas-alvo e calibrar os roteiros
            de prospecção.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${
                step === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-blue-400 border border-blue-500/30'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {step > 1 ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span>1. Administrador Inicial</span>
            </div>

            <div className="w-8 h-px bg-slate-700" />

            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>2. Perfil Comercial da Empresa</span>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <Card className="border-slate-800 bg-white text-slate-900 shadow-2xl rounded-2xl overflow-hidden">
          {step === 1 && (
            <form onSubmit={handleNextStep}>
              <CardHeader>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs">
                  <UserCheck className="w-4 h-4" />
                  <span>Passo 1 de 2</span>
                </div>
                <CardTitle className="text-xl font-bold">Dados do Administrador da Conta</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Você terá privilégios totais de gestão de equipe, permissões e diretrizes da
                  empresa.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nome" className="text-xs font-semibold">
                      Seu Nome Completo *
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Carlos Mendes"
                      value={adminNome}
                      onChange={(e) => setAdminNome(e.target.value)}
                      required
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">
                      Seu E-mail Corporativo *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="carlos@suaempresa.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cargo" className="text-xs font-semibold">
                      Seu Cargo / Função *
                    </Label>
                    <Input
                      id="cargo"
                      placeholder="Ex: Diretor Comercial, Head de Vendas, Sócio"
                      value={adminCargo}
                      onChange={(e) => setAdminCargo(e.target.value)}
                      required
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="senha" className="text-xs font-semibold">
                      Defina uma Senha de Acesso *
                    </Label>
                    <Input
                      id="senha"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={adminSenha}
                      onChange={(e) => setAdminSenha(e.target.value)}
                      required
                      minLength={4}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50 border-t border-slate-100 flex items-center justify-between py-4">
                <Link to="/entrar" className="text-xs text-slate-500 hover:text-slate-800">
                  Já possui conta? Entrar
                </Link>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <span>Próximo: Dados da Empresa</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinish}>
              <CardHeader>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>Passo 2 de 2</span>
                </div>
                <CardTitle className="text-xl font-bold">
                  Diretrizes Comerciais & Perfil de Cliente Ideal (ICP)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Sem integrações externas obrigatórias. Esses parâmetros alimentam a inteligência
                  comercial interna.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="compNome" className="text-xs font-semibold">
                      Razão Social / Nome da Empresa *
                    </Label>
                    <Input
                      id="compNome"
                      placeholder="Ex: Aurora Soluções Digitais Ltda"
                      value={companyNome}
                      onChange={(e) => setCompanyNome(e.target.value)}
                      required
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="compFantasia" className="text-xs font-semibold">
                      Nome Fantasia (Como o cliente conhece)
                    </Label>
                    <Input
                      id="compFantasia"
                      placeholder="Ex: Aurora Tech B2B"
                      value={companyFantasia}
                      onChange={(e) => setCompanyFantasia(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="produtos" className="text-xs font-semibold">
                    Principais Produtos e Serviços Oferecidos
                  </Label>
                  <Input
                    id="produtos"
                    placeholder="Ex: Plataforma SaaS, Consultoria Comercial B2B, Integração de APIs (separe por vírgula)"
                    value={produtosServicos}
                    onChange={(e) => setProdutosServicos(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="segmentos" className="text-xs font-semibold">
                      Segmentos Prioritários de Prospecção
                    </Label>
                    <Input
                      id="segmentos"
                      placeholder="Ex: Tecnologia, Saúde, Logística, Varejo B2B"
                      value={segmentosPrioritarios}
                      onChange={(e) => setSegmentosPrioritarios(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="regiao" className="text-xs font-semibold">
                      Região de Atuação Comercial
                    </Label>
                    <Input
                      id="regiao"
                      placeholder="Ex: Brasil (Nacional), SP/RJ, América Latina"
                      value={regiaoAtuacao}
                      onChange={(e) => setRegiaoAtuacao(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="icp" className="text-xs font-semibold">
                    Perfil de Cliente Ideal (ICP) — Descreva o porte, momento e desafios das contas
                    que você busca
                  </Label>
                  <Textarea
                    id="icp"
                    placeholder="Ex: Empresas B2B com faturamento acima de R$ 5M/ano e equipe de vendas ativa que precisam encurtar o ciclo de negociação..."
                    value={perfilClienteIdeal}
                    onChange={(e) => setPerfilClienteIdeal(e.target.value)}
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="diferenciais" className="text-xs font-semibold">
                    Principais Diferenciais Competitivos (destacados na abordagem)
                  </Label>
                  <Input
                    id="diferenciais"
                    placeholder="Ex: Implantação em 14 dias, Suporte dedicado, Garantia de ROI (separe por vírgula)"
                    value={principaisDiferenciais}
                    onChange={(e) => setPrincipaisDiferenciais(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50 border-t border-slate-100 flex items-center justify-between py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Inicializando Ambiente...' : 'Concluir e Acessar CRM'}</span>
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
