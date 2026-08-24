onRecordCreateRequest((e) => {
  const record = e.record

  // Auto-generate token if empty
  if (!record.get('token')) {
    record.set('token', $security.randomString(32))
  }

  // Set expiration to +7 days if not provided
  if (!record.get('expires_at')) {
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    record.set('expires_at', expires.toISOString())
  }

  // Default status
  if (!record.get('status')) {
    record.set('status', 'pendente')
  }

  e.next()
}, 'invitations')

routerAdd('POST', '/api/invitations/accept', (e) => {
  const body = e.requestInfo().body || {}
  const token = body.token
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
      return e.json(404, { error: 'Convite inválido ou já utilizado.' })
    }

    const invitation = invRecords[0]
    const expiresAt = invitation.get('expires_at')
    if (expiresAt && new Date(expiresAt) < new Date()) {
      invitation.set('status', 'expirado')
      $app.save(invitation)
      return e.json(400, { error: 'Convite expirado.' })
    }

    const companyId = invitation.get('company')
    const profile = invitation.get('profile') || 'executivo'
    const teamId = invitation.get('team')

    // Check if user is already in company_users for this company
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

    // Add to team if specified
    if (teamId) {
      try {
        const teamMembersCol = $app.findCollectionByNameOrId('team_members')
        const tmRecord = new Record(teamMembersCol)
        tmRecord.set('team', teamId)
        tmRecord.set('user', companyUserRecord.id)
        tmRecord.set('role', profile)
        $app.save(tmRecord)
      } catch (tmErr) {
        console.log('Error adding to team member:', tmErr)
      }
    }

    // Mark invitation as accepted
    invitation.set('status', 'aceito')
    $app.save(invitation)

    return e.json(200, {
      success: true,
      companyId: companyId,
      companyUserId: companyUserRecord.id,
    })
  } catch (err) {
    console.log('Error accepting invitation:', err)
    return e.json(500, { error: 'Erro ao processar aceitação de convite.' })
  }
})
