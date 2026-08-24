// INVITATIONS HOOK
// Validation, security hardening, audit logging and acceptance flow

onRecordCreateRequest((e) => {
  const record = e.record
  const authUser = e.auth

  if (!authUser) {
    throw new UnauthorizedError('Autenticação necessária para criar convites.')
  }

  const companyId = record.get('company')
  const requestedProfile = record.get('profile')
  const targetEmail = (record.get('email') || '').trim().toLowerCase()

  if (!companyId) {
    throw new BadRequestError('O convite precisa estar vinculado a uma empresa.')
  }

  if (!targetEmail) {
    throw new BadRequestError('O e-mail do destinatário é obrigatório.')
  }

  // 1. Profile restriction: Owner role cannot be granted via normal invitation
  if (requestedProfile === 'proprietario') {
    throw new BadRequestError('O perfil de proprietário não pode ser concedido por convite padrão.')
  }

  // 2. Author permission check: caller must be active owner/admin (or director if allowed) in that company
  const callerMemberships = $app.findRecordsByFilter(
    'company_users',
    `user = '${authUser.id}' && company = '${companyId}' && status = 'ativo'`,
    '-created',
    1,
    0,
  )

  if (!callerMemberships || callerMemberships.length === 0) {
    throw new ForbiddenError('Você não possui vínculo ativo nesta empresa para criar convites.')
  }

  const callerProfile = callerMemberships[0].get('profile')
  if (callerProfile !== 'proprietario' && callerProfile !== 'administrador') {
    if (callerProfile === 'diretor_comercial') {
      if (
        requestedProfile !== 'gestor' &&
        requestedProfile !== 'executivo' &&
        requestedProfile !== 'visualizador'
      ) {
        throw new ForbiddenError(
          'Diretores comerciais só podem convidar gestores, executivos ou visualizadores.',
        )
      }
    } else {
      throw new ForbiddenError(
        'Apenas Proprietários, Administradores ou Diretores Comerciais autorizados podem criar convites.',
      )
    }
  }

  // 3. Prevent multiple pending invitations for the same email + company
  const existingPending = $app.findRecordsByFilter(
    'invitations',
    `company = '${companyId}' && email = '${targetEmail}' && status = 'pendente'`,
    '-created',
    1,
    0,
  )

  if (existingPending && existingPending.length > 0) {
    const existing = existingPending[0]
    const exp = existing.get('expires_at')
    if (!exp || new Date(exp) > new Date()) {
      throw new BadRequestError(
        'Já existe um convite ativo pendente para este e-mail nesta empresa.',
      )
    } else {
      existing.set('status', 'expirado')
      $app.save(existing)
    }
  }

  // 4. Force valid invitation attributes
  record.set('email', targetEmail)
  record.set('invited_by', callerMemberships[0].id)
  if (!record.get('token')) {
    record.set('token', $security.randomString(40))
  }

  const expires = new Date()
  expires.setDate(expires.getDate() + 7)
  record.set('expires_at', expires.toISOString())
  record.set('status', 'pendente')

  e.next()

  // Audit log creation
  try {
    const auditCol = $app.findCollectionByNameOrId('audit_logs')
    const audit = new Record(auditCol)
    audit.set('company', companyId)
    audit.set('action', 'convite_criado')
    audit.set('target_type', 'invitation')
    audit.set('target_id', record.id)
    audit.set('actor', authUser.id)
    audit.set('details', {
      email: targetEmail,
      profile: requestedProfile,
      invited_by: callerMemberships[0].id,
      expires_at: record.get('expires_at'),
    })
    $app.save(audit)
  } catch (auditErr) {
    console.log('Error creating audit log for invitation create:', auditErr)
  }
}, 'invitations')

onRecordUpdateRequest((e) => {
  const record = e.record
  const authUser = e.auth
  const body = e.requestInfo().body || {}

  if (authUser) {
    const companyId = record.get('company')
    const callerMemberships = $app.findRecordsByFilter(
      'company_users',
      `user = '${authUser.id}' && company = '${companyId}' && status = 'ativo'`,
      '-created',
      1,
      0,
    )

    if (!callerMemberships || callerMemberships.length === 0) {
      throw new ForbiddenError('Acesso negado para alterar convites.')
    }

    const callerProfile = callerMemberships[0].get('profile')
    if (callerProfile !== 'proprietario' && callerProfile !== 'administrador') {
      throw new ForbiddenError(
        'Apenas Administradores e Proprietários podem alterar ou revogar convites.',
      )
    }

    // Check if status is changed to 'revogado'
    if (body.status === 'revogado' && record.get('status') !== 'revogado') {
      try {
        const auditCol = $app.findCollectionByNameOrId('audit_logs')
        const audit = new Record(auditCol)
        audit.set('company', companyId)
        audit.set('action', 'convite_revogado')
        audit.set('target_type', 'invitation')
        audit.set('target_id', record.id)
        audit.set('actor', authUser.id)
        audit.set('details', {
          email: record.get('email'),
          revoked_by: authUser.id,
        })
        $app.save(audit)
      } catch (auditErr) {
        console.log('Error auditing revoke:', auditErr)
      }
    }
  }

  e.next()
}, 'invitations')

onRecordDeleteRequest((e) => {
  const record = e.record
  const authUser = e.auth

  if (authUser) {
    const companyId = record.get('company')
    const callerMemberships = $app.findRecordsByFilter(
      'company_users',
      `user = '${authUser.id}' && company = '${companyId}' && status = 'ativo'`,
      '-created',
      1,
      0,
    )

    if (!callerMemberships || callerMemberships.length === 0) {
      throw new ForbiddenError('Acesso negado para excluir convites.')
    }

    const callerProfile = callerMemberships[0].get('profile')
    if (callerProfile !== 'proprietario' && callerProfile !== 'administrador') {
      throw new ForbiddenError('Apenas Administradores e Proprietários podem excluir convites.')
    }

    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      const audit = new Record(auditCol)
      audit.set('company', companyId)
      audit.set('action', 'convite_revogado')
      audit.set('target_type', 'invitation')
      audit.set('target_id', record.id)
      audit.set('actor', authUser.id)
      audit.set('details', {
        email: record.get('email'),
        deleted_by: authUser.id,
      })
      $app.save(audit)
    } catch (auditErr) {
      console.log('Error auditing invitation deletion:', auditErr)
    }
  }

  e.next()
}, 'invitations')

// ACCEPT INVITATION ROUTE
routerAdd('POST', '/api/invitations/accept', (e) => {
  const body = e.requestInfo().body || {}
  const token = (body.token || '').trim()
  const authUser = e.auth

  if (!token) {
    return e.json(400, { error: 'Token de convite obrigatório.' })
  }

  if (!authUser) {
    return e.json(401, { error: 'Usuário precisa estar autenticado para aceitar o convite.' })
  }

  try {
    const invRecords = $app.findRecordsByFilter(
      'invitations',
      `token = '${token}' && status = 'pendente'`,
      '-created',
      1,
      0,
    )

    if (!invRecords || invRecords.length === 0) {
      return e.json(404, { error: 'Convite inválido, revogado ou já utilizado.' })
    }

    const invitation = invRecords[0]
    const expiresAt = invitation.get('expires_at')
    if (expiresAt && new Date(expiresAt) < new Date()) {
      invitation.set('status', 'expirado')
      $app.save(invitation)
      return e.json(400, { error: 'Convite expirado. Solicite um novo convite ao administrador.' })
    }

    // Security: Authenticated email MUST match invitation email
    const authEmail = (authUser.email() || '').trim().toLowerCase()
    const invEmail = (invitation.get('email') || '').trim().toLowerCase()

    if (authEmail !== invEmail) {
      return e.json(403, {
        error: `O convite foi destinado ao e-mail ${invEmail}. Você está conectado como ${authEmail}.`,
      })
    }

    // Security: Anti self-promotion check
    const invitedByCUId = invitation.get('invited_by')
    if (invitedByCUId) {
      try {
        const inviterCU = $app.findFirstRecordByData('company_users', 'id', invitedByCUId)
        if (inviterCU && inviterCU.get('user') === authUser.id) {
          return e.json(403, {
            error:
              'Você não pode aceitar um convite criado por você mesmo para alterar privilégios.',
          })
        }
      } catch (_) {}
    }

    const companyId = invitation.get('company')
    const profile = invitation.get('profile') || 'executivo'
    const teamId = invitation.get('team')

    // Find existing company_user record
    const existing = $app.findRecordsByFilter(
      'company_users',
      `user = '${authUser.id}' && company = '${companyId}'`,
      '-created',
      1,
      0,
    )

    let companyUserRecord
    if (existing && existing.length > 0) {
      companyUserRecord = existing[0]
      companyUserRecord.set('status', 'ativo')
      companyUserRecord.set('profile', profile)
      companyUserRecord.set('last_access', new Date().toISOString())
      $app.save(companyUserRecord)
    } else {
      const compUsersCol = $app.findCollectionByNameOrId('company_users')
      companyUserRecord = new Record(compUsersCol)
      companyUserRecord.set('user', authUser.id)
      companyUserRecord.set('company', companyId)
      companyUserRecord.set('profile', profile)
      companyUserRecord.set('status', 'ativo')
      companyUserRecord.set('last_access', new Date().toISOString())
      $app.save(companyUserRecord)
    }

    // Add to team member if specified
    if (teamId) {
      try {
        const existingMember = $app.findRecordsByFilter(
          'team_members',
          `team = '${teamId}' && user = '${companyUserRecord.id}'`,
          '-created',
          1,
          0,
        )
        if (!existingMember || existingMember.length === 0) {
          const teamMembersCol = $app.findCollectionByNameOrId('team_members')
          const tmRecord = new Record(teamMembersCol)
          tmRecord.set('team', teamId)
          tmRecord.set('user', companyUserRecord.id)
          tmRecord.set('role', profile)
          $app.save(tmRecord)
        }
      } catch (tmErr) {
        console.log('Error linking team member:', tmErr)
      }
    }

    // Mark invitation as accepted and invalidate token
    invitation.set('status', 'aceito')
    $app.save(invitation)

    // Audit log for invitation accepted
    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      const audit = new Record(auditCol)
      audit.set('company', companyId)
      audit.set('action', 'convite_aceito')
      audit.set('target_type', 'invitation')
      audit.set('target_id', invitation.id)
      audit.set('actor', authUser.id)
      audit.set('details', {
        email: invEmail,
        profile: profile,
        company_user: companyUserRecord.id,
      })
      $app.save(audit)
    } catch (auditErr) {
      console.log('Error creating audit log for accepted invitation:', auditErr)
    }

    return e.json(200, {
      success: true,
      message: 'Convite aceito com sucesso.',
      companyId: companyId,
      companyUserId: companyUserRecord.id,
    })
  } catch (err) {
    console.log('Error accepting invitation:', err)
    return e.json(500, { error: 'Erro ao processar aceitação de convite.' })
  }
})
