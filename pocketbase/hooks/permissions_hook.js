onRecordUpdateRequest((e) => {
  const record = e.record
  const authUser = e.auth

  // If request is made by an authenticated user
  if (authUser) {
    // Check if the user is editing their own company_user record
    const targetUserId = record.get('user')
    if (targetUserId === authUser.id) {
      // Check if profile field is being changed
      const body = e.requestInfo().body || {}
      if (body.profile && body.profile !== record.get('profile')) {
        throw new BadRequestError('Usuários não podem alterar o seu próprio perfil de acesso.')
      }
    }
  }

  e.next()
}, 'company_users')

onRecordCreateRequest((e) => {
  const record = e.record
  const authUser = e.auth

  if (authUser) {
    const body = e.requestInfo().body || {}
    const companyId = record.get('company') || body.company

    if (companyId) {
      // Verify if authenticated user belongs to this company as admin/proprietario
      try {
        const callerRecords = $app.findRecordsByFilter(
          'company_users',
          `user = '${authUser.id}' && company = '${companyId}' && status = 'ativo'`,
          '-created',
          1,
          0,
        )
        if (callerRecords.length > 0) {
          const profile = callerRecords[0].get('profile')
          if (
            profile !== 'proprietario' &&
            profile !== 'administrador' &&
            profile !== 'diretor_comercial'
          ) {
            throw new ForbiddenError('Sem permissão para adicionar usuários nesta empresa.')
          }
        }
      } catch (err) {
        // If error or forbidden, re-throw if it's our error
        if (err.status === 403 || err.status === 400) throw err
      }
    }
  }

  e.next()
}, 'company_users')
