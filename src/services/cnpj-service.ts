export interface BrasilApiCnpjResponse {
  cnpj: string
  identificador_matriz_filial?: number
  descricao_identificador_matriz_filial?: string
  razao_social: string
  nome_fantasia?: string
  situacao_cadastral?: number
  descricao_situacao_cadastral?: string
  data_situacao_cadastral?: string
  motivo_situacao_cadastral?: number
  nome_cidade_no_exterior?: string
  codigo_natureza_juridica?: number
  data_inicio_atividade?: string
  cnae_fiscal?: number
  cnae_fiscal_descricao?: string
  descricao_tipo_de_logradouro?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cep?: string
  uf?: string
  municipio?: string
  ddd_telefone_1?: string
  ddd_telefone_2?: string
  ddd_fax?: string
  email?: string | null
  porte?: string
  codigo_porte?: number
  descricao_porte?: string
  capital_social?: number
  natureza_juridica?: string
  opcao_pelo_simples?: boolean | null
  data_opcao_pelo_simples?: string | null
  opcao_pelo_mei?: boolean | null
  qsa?: Array<{
    nome_socio?: string
    qualificacao_socio?: string
    faixa_etaria?: string
  }>
  cnaes_secundarios?: Array<{
    codigo: number
    descricao: string
  }>
}

export interface FormattedCnpjData {
  cnpjClean: string
  cnpjFormatted: string
  razaoSocial: string
  nomeFantasia: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  enderecoCompleto: string
  localizacao: string
  segmento: string
  cnaeCodigo?: number
  cnaeDescricao?: string
  telefone?: string
  email?: string
  porteSugestao?: '1-10' | '11-50' | '51-200' | '201-500' | '500+'
  situacaoCadastral?: string
  naturezaJuridica?: string
}

/**
 * Remove qualquer caractere que não seja dígito.
 */
export function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '')
}

/**
 * Formata dígitos no padrão CNPJ (00.000.000/0000-00)
 */
export function formatCnpj(cnpj: string): string {
  const digits = cleanCnpj(cnpj).slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
}

/**
 * Validação básica de dígitos verificadores de CNPJ.
 */
export function isValidCnpj(cnpj: string): boolean {
  const digits = cleanCnpj(cnpj)
  if (digits.length !== 14) return false

  // Bloqueia números conhecidos de dígitos repetidos (0000..., 1111...)
  if (/^(\d)\1+$/.test(digits)) return false

  // Validação do 1º dígito verificador
  let tamanho = 12
  let numeros = digits.substring(0, tamanho)
  const digitos = digits.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--
    if (pos < 2) pos = 9
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false

  // Validação do 2º dígito verificador
  tamanho = 13
  numeros = digits.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--
    if (pos < 2) pos = 9
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(1), 10)) return false

  return true
}

/**
 * Formata telefone vindo da BrasilAPI (ex: 1123851939 ou 11999998888)
 */
export function formatTelefoneBr(dddTelefone?: string): string | undefined {
  if (!dddTelefone) return undefined
  const digits = dddTelefone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  if (digits.length > 2) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  return digits || undefined
}

/**
 * Formata CEP (00000-000)
 */
export function formatCep(cep?: string): string | undefined {
  if (!cep) return undefined
  const digits = cep.replace(/\D/g, '')
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }
  return cep
}

/**
 * Mapeia porte da BrasilAPI para o enum de porte da plataforma
 */
function mapPorte(
  porteRaw?: string,
  codigoPorte?: number,
): '1-10' | '11-50' | '51-200' | '201-500' | '500+' {
  const p = (porteRaw || '').toUpperCase()
  if (codigoPorte === 1 || p.includes('MICRO') || p.includes('MEI') || p.includes('ME')) {
    return '1-10'
  }
  if (codigoPorte === 3 || p.includes('EPP') || p.includes('PEQUENO')) {
    return '11-50'
  }
  if (codigoPorte === 5 || p.includes('DEMAIS') || p.includes('GRANDE') || p.includes('MEDIO')) {
    return '51-200'
  }
  return '51-200'
}

/**
 * Realiza consulta de CNPJ na Brasil API e retorna os dados mapeados para a conta comercial.
 */
export async function fetchCnpjData(rawCnpj: string): Promise<FormattedCnpjData> {
  const clean = cleanCnpj(rawCnpj)

  if (clean.length !== 14) {
    throw new Error('O CNPJ deve conter exatamente 14 dígitos numéricos.')
  }

  const url = `https://brasilapi.com.br/api/cnpj/v1/${clean}`

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new Error(
      'Erro de conexão ao consultar a Brasil API. Verifique sua conexão com a internet.',
    )
  }

  if (response.status === 404) {
    throw new Error(`CNPJ ${formatCnpj(clean)} não foi encontrado na base da Receita Federal.`)
  }

  if (response.status === 400) {
    const errJson = await response.json().catch(() => null)
    throw new Error(errJson?.message || 'CNPJ inválido ou com formato incorreto.')
  }

  if (!response.ok) {
    throw new Error(`Falha ao consultar CNPJ na Brasil API (Código ${response.status}).`)
  }

  const data: BrasilApiCnpjResponse = await response.json()

  // Constrói partes de endereço
  const logradouroPart = [data.descricao_tipo_de_logradouro, data.logradouro]
    .filter(Boolean)
    .join(' ')
    .trim()

  const logradouro = logradouroPart || data.logradouro || ''
  const numero = data.numero || ''
  const complemento = data.complemento || ''
  const bairro = data.bairro || ''
  const municipio = data.municipio || ''
  const uf = data.uf || ''
  const cep = formatCep(data.cep) || ''

  // Monta endereço formatado completo
  const endParts: string[] = []
  if (logradouro) {
    endParts.push(numero ? `${logradouro}, ${numero}` : logradouro)
  }
  if (complemento) {
    endParts.push(complemento)
  }
  if (bairro) {
    endParts.push(`Bairro ${bairro}`)
  }
  if (cep) {
    endParts.push(`CEP ${cep}`)
  }
  const enderecoCompleto = endParts.join(' - ')

  // Monta localização simplificada (Cidade, UF)
  const localizacao = municipio && uf ? `${municipio}, ${uf}` : municipio || uf || 'Brasil'

  // Segmento a partir do CNAE Principal
  const segmento = data.cnae_fiscal_descricao || 'B2B Geral'

  // Telefone e e-mail
  const telefone = formatTelefoneBr(data.ddd_telefone_1 || data.ddd_telefone_2)
  const email = data.email ? data.email.toLowerCase() : undefined

  return {
    cnpjClean: clean,
    cnpjFormatted: formatCnpj(clean),
    razaoSocial: data.razao_social || '',
    nomeFantasia: data.nome_fantasia || data.razao_social || '',
    logradouro,
    numero,
    complemento,
    bairro,
    municipio,
    uf,
    cep,
    enderecoCompleto,
    localizacao,
    segmento,
    cnaeCodigo: data.cnae_fiscal,
    cnaeDescricao: data.cnae_fiscal_descricao,
    telefone,
    email,
    porteSugestao: mapPorte(data.descricao_porte, data.codigo_porte),
    situacaoCadastral: data.descricao_situacao_cadastral,
    naturezaJuridica: data.natureza_juridica,
  }
}
