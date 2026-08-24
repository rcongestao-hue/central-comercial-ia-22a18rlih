import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await login(email, senha)
      setLoading(false)
      if (res.success) {
        navigate('/')
      } else {
        setError(res.message || 'Erro ao realizar login.')
      }
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || 'Falha ao autenticar.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0E1B2F] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Value Proposition Panel */}
        <div className="lg:col-span-6 text-white space-y-6 lg:pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SaaS B2B Comercial Inteligente</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Central Comercial <span className="text-blue-400">IA</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Plataforma independente de produtividade comercial B2B. Acelere qualificação de contas,
            geração de abordagens assistidas, follow-ups e gestão de equipe com isolamento estrito
            multiempresa.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Qualificação de Contas e Aderência ao Perfil de Cliente Ideal (ICP)',
              'Prospecção Assistida por IA nos canais oficiais (WhatsApp, E-mail, LinkedIn)',
              'Pipeline Visual e Agenda Interna Integrada (sem dependência externa)',
              'Estrutura Multiempresa Segura com Perfis de Acesso (Owner, Admin, Gestor, Executivo)',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs text-slate-300">
              <strong className="text-white">Isolamento Multiempresa com RLS:</strong> Segurança em
              camadas com API Rules no banco de dados e validações ativas de tenant.
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-6">
          <Card className="border-slate-800 bg-white text-slate-900 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Acessar Plataforma
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-500">
                Entre com seu e-mail corporativo e senha cadastrados.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    E-mail Corporativo
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 text-sm border-slate-300 focus-visible:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="senha" className="text-xs font-semibold text-slate-700">
                      Senha de Acesso
                    </Label>
                  </div>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="h-10 text-sm border-slate-300 focus-visible:ring-blue-600"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 shadow-sm"
                >
                  {loading ? 'Validando...' : 'Entrar na Central'}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="bg-slate-50 border-t border-slate-100 py-3 flex items-center justify-between text-xs text-slate-600">
              <span>Primeira vez na plataforma?</span>
              <Link
                to="/onboarding"
                className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                Cadastrar Empresa <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
