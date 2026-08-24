onRecordAuthWithPasswordRequest((e) => {
  // Let authentication proceed
  e.next()

  try {
    const authRecord = e.record
    if (!authRecord) return

    // Find company_users associated with this user
    const compUsers = $app.findRecordsByFilter(
      'company_users',
      `user = '${authRecord.id}' && status = 'ativo'`,
      '-created',
      10,
      0,
    )

    if (compUsers && compUsers.length > 0) {
      // Update last_access on the active company_user record
      const activeCompUser = compUsers[0]
      activeCompUser.set('last_access', new Date().toISOString())
      $app.save(activeCompUser)
    }
  } catch (err) {
    console.log('Error updating last_access on auth:', err)
  }
}, '_pb_users_auth_')
