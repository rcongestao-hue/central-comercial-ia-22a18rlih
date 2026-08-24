# ROTEIRO DE TESTE MANUAL DE SEGURANÇA E MULTIEMPRESA

Este documento descreve o procedimento passo a passo para validar o isolamento de dados e as regras de segurança na **Central Comercial IA**.

---

## 1. Teste de Cadastro e Isolamento Inicial de Empresa
1. Acesse a tela de onboarding (`/onboarding`) e cadastre uma nova empresa:
   - Empresa: **Empresa Alpha Tech**
   - Nome do Administrador: **Alice Silva**
   - E-mail: `alice@alphatech.com`
   - Senha: uma senha forte com pelo menos 8 caracteres.
2. Observe que a empresa é criada com a base comercial **completamente vazia** (0 contas, 0 contatos, 0 oportunidades).
3. Crie uma conta comercial em `/contas`:
   - Razão Social: "Cliente Alpha 1"
   - CNPJ: "11.222.333/0001-44"

---

## 2. Teste de Isolamento Multiempresa (Tenant B)
1. Abra uma janela anônima do navegador.
2. Acesse `/onboarding` e cadastre uma segunda empresa:
   - Empresa: **Empresa Beta Log**
   - Nome do Administrador: **Bruno Costa**
   - E-mail: `bruno@betalog.com`
   - Senha: uma senha com pelo menos 8 caracteres.
3. No painel da **Empresa Beta Log**, verifique que:
   - A listagem de contas está vazia (a conta "Cliente Alpha 1" da Empresa Alpha **não é visível**).
   - Tentar acessar `/contas/:id` informando o ID da conta da Empresa Alpha resulta em 404/bloqueio imediato pelo backend.
   - Qualquer tentativa de criar um registro passando o ID da Empresa Alpha via API é bloqueada pelas API Rules (`ForbiddenError`).

---

## 3. Teste de Perfis e Permissões (Anti-Auto-Promoção)
1. Na **Empresa Alpha Tech**, vá em **Equipe & Hierarquia** (`/equipe`) e convide um usuário:
   - E-mail: `executivo@alphatech.com`
   - Perfil: **Executivo Comercial**
2. Copie o link do convite.
3. Na janela do executivo, crie a conta ou faça login com `executivo@alphatech.com` e aceite o convite.
4. Tente via inspeção ou chamada de API alterar o campo `profile` no registro de `company_users` do próprio executivo para `proprietario` ou `administrador`.
5. **Resultado esperado:** O backend intercepta no hook `permissions_hook.js` e recusa com o erro: *"Usuários não podem alterar o seu próprio perfil de acesso."*

---

## 4. Teste de Convites (Segurança e Anti-Fraude)
1. **Perfil Proibido:** Tente criar um convite selecionando o perfil `proprietario`.
   - **Resultado:** O backend bloqueia com o erro: *"O perfil de proprietário não pode ser concedido por convite padrão."*
2. **E-mail Incorreto:** Tente aceitar um convite destinado a `executivo@alphatech.com` estando autenticado com `outro@email.com`.
   - **Resultado:** O backend bloqueia com código 403: *"O convite foi destinado ao e-mail executivo@alphatech.com. Você está conectado como outro@email.com."*
3. **Reutilização de Token:** Tente aceitar novamente o mesmo token de convite já utilizado.
   - **Resultado:** O backend retorna 404: *"Convite inválido, revogado ou já utilizado."*

---

## 5. Teste de Auditoria (`audit_logs`)
1. No painel de Administrador, verifique que alterações em usuários, criação e aceite de convites geram registros na coleção `audit_logs`.
2. Apenas proprietários e administradores têm permissão de leitura sobre a coleção da própria empresa.
3. Chamadas diretas de escrita na coleção `audit_logs` são rejeitadas (somente hooks do backend gravam).

---

## 6. Health Check do Sistema
1. Acesse **Configurações > Segurança & Backup**.
2. Verifique o painel **Diagnóstico do Ambiente (Health Check)**:
   - PocketBase: Conectado
   - Migrations: Aplicadas
   - Vínculo Multiempresa: Vínculo Ativo
   - Realtime: Operacional
