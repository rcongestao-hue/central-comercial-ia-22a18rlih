// PERMISSIONS HOOK
// Intercepts and enforces role-based access control, tenancy isolation and anti-privilege escalation

onRecordUpdateRequest((e) => {
  const record = e.record
  const authUser = e.auth

  if (authUser) {
    const targetUserId = record.get('user')
    const companyId = record.get('company')
    const body = e.requestInfo().body || {}

    const callerRecords = $app.findRecordsByFilter(
      'company_users',
      `user = '${authUser.id}' && company = '${companyId}' && status = 'ativo'`,
      '-created',
      1,
      0,
    )

    if (callerRecords.length === 0) {
      throw new ForbiddenError(
        'Você não tem vínculo ativo com esta empresa para realizar alterações.',
      )
    }

    const callerProfile = callerRecords[0].get('profile')

    if (targetUserId === authUser.id) {
      if (body.profile && body.profile !== record.get('profile')) {
        throw new BadRequestError('Usuários não podem alterar o seu próprio perfil de acesso.')
      }
      if (body.company && body.company !== record.get('company')) {
        throw new BadRequestError('Usuários não podem alterar a empresa vinculada.')
      }
      if (body.status && body.status !== record.get('status')) {
        throw new BadRequestError('Usuários não podem alterar o próprio status de acesso.')
      }
    }

    if (callerProfile !== 'proprietario' && callerProfile !== 'administrador') {
      if (callerProfile === 'diretor_comercial') {
        const targetProfile = record.get('profile')
        if (targetProfile === 'proprietario' || targetProfile === 'administrador') {
          throw new ForbiddenError(
            'Diretores comerciais não podem alterar proprietários ou administradores.',
          )
        }
        if (body.profile === 'proprietario' || body.profile === 'administrador') {
          throw new ForbiddenError(
            'Diretores comerciais não podem promover usuários a proprietário ou administrador.',
          )
        }
      } else {
        throw new ForbiddenError('Você não tem permissão para gerenciar usuários nesta empresa.')
      }
    }

    if (body.profile === 'proprietario' && record.get('profile') !== 'proprietario') {
      if (callerProfile !== 'proprietario') {
        throw new ForbiddenError(
          'Apenas o proprietário atual pode transferir ou conceder a propriedade.',
        )
      }
    }

    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      const audit = new Record(auditCol)
      audit.set('company', companyId)
      audit.set('target_type', 'company_user')
      audit.set('target_id', record.id)
      audit.set('actor', authUser.id)

      if (body.profile && body.profile !== record.get('profile')) {
        audit.set('action', 'perfil_alterado')
        audit.set('details', {
          old_profile: record.get('profile'),
          new_profile: body.profile,
          target_user: targetUserId,
        })
        $app.save(audit)
      } else if (body.status && body.status !== record.get('status')) {
        audit.set('action', 'status_usuario_alterado')
        audit.set('details', {
          old_status: record.get('status'),
          new_status: body.status,
          target_user: targetUserId,
        })
        $app.save(audit)
      }
    } catch (auditErr) {
      console.log('Error auditing company_user update:', auditErr)
    }
  }

  e.next()
}, 'company_users')

onRecordCreateRequest((e) => {
  const record = e.record
  const authUser = e.auth

  if (authUser) {
    const companyId = record.get('company')
    const requestedProfile = record.get('profile')

    const existingForCompany = $app.findRecordsByFilter(
      'company_users',
      `company = '${companyId}'`,
      '-created',
      5,
      0,
    )

    if (existingForCompany.length > 0) {
      const callerRecords = $app.findRecordsByFilter(
        'company_users',
        `user = '${authUser.id}' && company = '${companyId}' && status = 'ativo'`,
        '-created',
        1,
        0,
      )

      if (callerRecords.length === 0) {
        throw new ForbiddenError('Sem permissão para adicionar membros a esta empresa.')
      }

      const callerProfile = callerRecords[0].get('profile')
      if (callerProfile !== 'proprietario' && callerProfile !== 'administrador') {
        if (callerProfile === 'diretor_comercial') {
          if (requestedProfile === 'proprietario' || requestedProfile === 'administrador') {
            throw new ForbiddenError(
              'Diretores não podem cadastrar administradores ou proprietários.',
            )
          }
        } else {
          throw new ForbiddenError(
            'Apenas Administradores ou Proprietários podem adicionar membros diretamente.',
          )
        }
      }

      if (requestedProfile === 'proprietario' && callerProfile !== 'proprietario') {
        throw new ForbiddenError('Apenas o proprietário pode conceder o perfil de proprietário.')
      }
    } else {
      record.set('profile', 'proprietario')
      record.set('status', 'ativo')
    }
  }

  e.next()
}, 'company_users')

const commercialCols = [
  'commercial_accounts',
  'contacts',
  'opportunities',
  'activities',
  'meetings',
  'products',
  'onboarding_config',
]

for (let i = 0; i < commercialCols.length; i++) {
  const colName = commercialCols[i]

  onRecordCreateRequest((e) => {
    const record = e.record
    const authUser = e.auth

    if (authUser) {
      const targetCompany = record.get('company')
      if (!targetCompany) {
        throw new BadRequestError('O registro comercial deve conter a empresa obrigatoriamente.')
      }

      const compUsers = $app.findRecordsByFilter(
        'company_users',
        `user = '${authUser.id}' && company = '${targetCompany}' && status = 'ativo'`,
        '-created',
        1,
        0,
      )

      if (!compUsers || compUsers.length === 0) {
        throw new ForbiddenError(
          'Você não tem autorização para criar registros comerciais nesta empresa.',
        )
      }

      const callerProfile = compUsers[0].get('profile')
      if (callerProfile === 'visualizador') {
        throw new ForbiddenError('Perfil visualizador possui acesso somente de leitura.')
      }
    }

    e.next()
  }, colName)

  onRecordUpdateRequest((e) => {
    const record = e.record
    const authUser = e.auth

    if (authUser) {
      const targetCompany = record.get('company')
      const compUsers = $app.findRecordsByFilter(
        'company_users',
        `user = '${authUser.id}' && company = '${targetCompany}' && status = 'ativo'`,
        '-created',
        1,
        0,
      )

      if (!compUsers || compUsers.length === 0) {
        throw new ForbiddenError('Acesso negado para modificar registros de outra empresa.')
      }

      const callerProfile = compUsers[0].get('profile')
      if (callerProfile === 'visualizador') {
        throw new ForbiddenError('Perfil visualizador não tem permissão para editar dados.')
      }
    }

    e.next()
  }, colName)

  onRecordDeleteRequest((e) => {
    const record = e.record
    const authUser = e.auth

    if (authUser) {
      const targetCompany = record.get('company')
      const compUsers = $app.findRecordsByFilter(
        'company_users',
        `user = '${authUser.id}' && company = '${targetCompany}' && status = 'ativo'`,
        '-created',
        1,
        0,
      )

      if (!compUsers || compUsers.length === 0) {
        throw new ForbiddenError('Acesso negado para excluir registros desta empresa.')
      }

      const callerProfile = compUsers[0].get('profile')
      if (callerProfile === 'visualizador' || callerProfile === 'executivo') {
        throw new ForbiddenError(
          'Apenas Gestores, Diretores ou Administradores podem excluir este registro.',
        )
      }
    }

    e.next()
  }, colName)
}
