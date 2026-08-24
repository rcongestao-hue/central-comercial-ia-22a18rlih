import { Company, CommercialAccount, Contact } from '@/types'

export interface AiQualificationResult {
  resumoExecutivo: string
  aderenciaIcp: 'Alta' | 'Média' | 'Baixa'
  scoreIcp: number
  necessidadesSugeridas: string[]
  perguntasComerciais: string[]
  hipoteses: string[]
  dadosNaoConfirmados: string[]
}

export interface AiProspectingMessage {
  assunto: string
  mensagem: string
  canal: 'whatsapp' | 'email' | 'linkedin' | 'telefone'
  dicaExecutiva: string
}

export const commercialAiService = {
  /**
   * Qualifies an account based on company profile and target account data
   */
  qualifyAccount(account: CommercialAccount, company: Company): AiQualificationResult {
    const isSegmentMatch = company.segmentosPrioritarios.some(
      (s) =>
        account.segmento.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(account.segmento.toLowerCase()),
    )

    let baseScore = 65
    if (isSegmentMatch) baseScore += 20
    if (account.cnpj) baseScore += 5
    if (account.linkedinInstitucional) baseScore += 5
    if (account.site) baseScore += 5

    const scoreIcp = Math.min(96, Math.max(45, baseScore))
    const aderenciaIcp: 'Alta' | 'Média' | 'Baixa' =
      scoreIcp >= 80 ? 'Alta' : scoreIcp >= 65 ? 'Média' : 'Baixa'

    const necessidadesSugeridas = [
      `Acelerar o ciclo comercial no segmento de ${account.segmento}`,
      `Eliminar gargalos manuais na passagem de bastão entre pré-vendas e executivos`,
      `Implementar visibilidade preditiva de fechamentos para a liderança`,
    ]

    const perguntasComerciais = [
      `Como a ${account.nomeFantasia || account.razaoSocial} gerencia hoje o follow-up de contas estratégicas para evitar perda de timing?`,
      `Qual o impacto financeiro de reduzir em 20% o tempo gasto pela equipe em tarefas operacionais manuais?`,
      `Quem além de você participa da decisão final de contratação de novas soluções no organograma atual?`,
    ]

    const hipoteses = [
      `A empresa possui forte demanda reprimida ou cotações em aberto por falta de prospecção ativa estruturada.`,
      `O time comercial sofre com dispersão de dados em mensagens instantâneas e anotações descentralizadas.`,
      `Existe abertura imediata para soluções que demonstrem ROI nos primeiros 30 a 60 dias de implantação.`,
    ]

    const dadosNaoConfirmados = [
      `Faturamento anual oficial e orçamento previsto para o trimestre atual`,
      `Soluções concorrentes ou ferramentas internas atualmente sob contrato vigente`,
    ]

    const resumoExecutivo = `${account.razaoSocial} (${account.segmento}) localizada em ${account.localizacao}. Apresenta aderência ${aderenciaIcp.toLowerCase()} (${scoreIcp}/100) com base no ICP da ${company.nome}. Foco prioritário na otimização de conversão e diferenciais em ${company.diferenciais[0] || 'agilidade de entrega'}.`

    return {
      resumoExecutivo,
      aderenciaIcp,
      scoreIcp,
      necessidadesSugeridas,
      perguntasComerciais,
      hipoteses,
      dadosNaoConfirmados,
    }
  },

  /**
   * Generates tailored prospecting messages per channel
   */
  generateApproach(
    account: CommercialAccount,
    contact: Contact | undefined,
    company: Company,
    canal: 'whatsapp' | 'email' | 'linkedin' | 'telefone',
    tom: 'consultivo' | 'direto' | 'executivo' = 'consultivo',
  ): AiProspectingMessage {
    const contactName = contact ? contact.nome.split(' ')[0] : 'Prezado(a)'
    const contactRole = contact ? contact.cargo : 'Líder'
    const companyName = account.nomeFantasia || account.razaoSocial
    const myCompany = company.nome
    const diferencial = company.diferenciais[0] || 'soluções ágeis com alto retorno'

    if (canal === 'whatsapp') {
      return {
        assunto: '',
        mensagem: `Olá, ${contactName}! Tudo bem?

Acompanho o crescimento da ${companyName} no setor de ${account.segmento} e vi sua atuação como ${contactRole}.

Aqui na ${myCompany}, nós ajudamos empresas do seu segmento a aumentarem a eficiência comercial com ${diferencial}.

Você teria 10 a 15 minutos nesta semana para uma conversa rápida sobre como estamos gerando resultados práticos nesse mercado?`,
        canal: 'whatsapp',
        dicaExecutiva:
          'Ideal para envio em dias úteis entre 09:30 e 11:30 ou 14:30 e 16:30. Seja direto e objetivo.',
      }
    }

    if (canal === 'email') {
      return {
        assunto: `${companyName} + ${myCompany} — Oportunidade de ganho em ${account.segmento}`,
        mensagem: `Olá, ${contactName}, tudo bem?

Espero que esta mensagem o(a) encontre bem.

Identificamos que a ${companyName} vem se destacando no segmento de ${account.segmento}. No entanto, conversando com lideranças da sua área, notamos que muitos enfrentam desafios para encurtar ciclos de negociação e garantir previsibilidade nos fechamentos.

Na ${myCompany}, desenvolvemos um método assistido que entrega ${diferencial}, permitindo que o time comercial foque no que realmente move o ponteiro de receita.

Gostaria de compartilhar um diagnóstico rápido de 15 minutos com você nesta quinta ou sexta-feira. Qual o melhor horário para agendarmos?

Atenciosamente,`,
        canal: 'email',
        dicaExecutiva:
          'Mantenha o assunto curto e focado na dor do cliente. Não anexe arquivos na primeira abordagem.',
      }
    }

    if (canal === 'linkedin') {
      return {
        assunto: `Conexão profissional — ${companyName}`,
        mensagem: `Olá ${contactName}, tudo bem?

Acompanho sua trajetória como ${contactRole} na ${companyName}. Temos desenvolvido iniciativas de alto impacto no segmento de ${account.segmento} aqui na ${myCompany} com foco em ${diferencial}.

Gostaria de me conectar para acompanhar seus conteúdos e, se fizer sentido, trocarmos algumas experiências sobre o mercado!`,
        canal: 'linkedin',
        dicaExecutiva:
          'Envie com a nota de convite personalizada (até 300 caracteres). Não venda no primeiro clique.',
      }
    }

    // Telefone
    return {
      assunto: `Roteiro de Cold Call / Ligação Estruturada`,
      mensagem: `[ABERTURA - 10s]: "Olá ${contactName}, bom dia! Aqui é [Seu Nome] da ${myCompany}. Estou ligando rápido porque sei que sua rotina como ${contactRole} na ${companyName} é intensa. Posso tomar 30 segundos para te dizer o motivo do contato?"

[GANCHO - 20s]: "Perfeito. O motivo é que ajudamos lideranças de ${account.segmento} a resolverem gargalos de eficiência comercial com ${diferencial}."

[PERGUNTA DE QUALIFICAÇÃO]: "Hoje na ${companyName}, como vocês estão lidando com [mencionar dor principal]?"

[FECHAMENTO DO COMPROMISSO]: "Faz sentido batermos um papo de 15 minutos na próxima terça às 10h para te mostrar um benchmark prático do que tem funcionado?"`,
      canal: 'telefone',
      dicaExecutiva:
        'Tenha papel e caneta para registrar objeções e anote a data exata do retorno.',
    }
  },

  /**
   * Summarizes meeting notes into an executive action report
   */
  summarizeMeeting(
    anotacoes: string,
    contaNome: string,
  ): { resumo: string; proximosPassos: string[] } {
    if (!anotacoes || anotacoes.trim().length === 0) {
      return {
        resumo: 'Nenhuma anotação fornecida para sumarização.',
        proximosPassos: ['Registrar resumo da pauta tratada'],
      }
    }

    return {
      resumo: `Reunião realizada com ${contaNome}. Principais pontos debatidos: ${anotacoes.slice(0, 200)}... O alinhamento indicou aderência às soluções apresentadas e interesse em avançar nas etapas de validação.`,
      proximosPassos: [
        'Enviar ata e pontos combinados por e-mail em até 24h',
        'Elaborar minuta de proposta ou detalhamento técnico conforme solicitado',
        'Agendar reunião de follow-up na agenda interna',
      ],
    }
  },
}
