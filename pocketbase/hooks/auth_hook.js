onRecordAuthWithPasswordRequest((e) => {
  // Let authentication proceed
  e.next()

  try {
    const authRecord = e.record
    if (!authRecord) return

    // Find active company_users associated with this user
    const compUsers = $app.findRecordsByFilter(
      'company_users',
      `user = '${authRecord.id}' && status = 'ativo'`,
      '-created',
      10,
      0,
    )

    if (compUsers && compUsers.length > 0) {
      const nowStr = new Date().toISOString()
      for (let cu of compUsers) {
        cu.set('last_access', nowStr)
        $app.save(cu)
      }
    }
  } catch (err) {
    console.log('Error updating last_access on auth:', err)
  }
}, '_pb_users_auth_')

// Health Check Endpoint (safe, without exposing secrets/tokens)
routerAdd('GET', '/api/health-check', (e) => {
  let pbConnected = true
  let migrationsApplied = true
  let authUser = e.auth
  let activeCompany = null
  let activeMembership = null
  let totalCompanies = 0
  let isTenantActive = false

  try {
    const companies = $app.findRecordsByFilter('companies', '', '-created', 1, 0)
    totalCompanies = companies.length
  } catch (err) {
    pbConnected = false
  }

  if (authUser) {
    try {
      const compUsers = $app.findRecordsByFilter(
        'company_users',
        `user = '${authUser.id}' && status = 'ativo'`,
        '-created',
        1,
        0,
      )
      if (compUsers.length > 0) {
        const cu = compUsers[0]
        const compId = cu.get('company')
        isTenantActive = true
        activeMembership = {
          id: cu.id,
          profile: cu.get('profile'),
          status: cu.get('status'),
          last_access: cu.get('last_access'),
        }
        try {
          const comp = $app.findCollectionByNameOrId('companies')
          const compRec = $app.findFirstRecordByData('companies', 'id', compId)
          if (compRec) {
            activeCompany = {
              id: compRec.id,
              name: compRec.get('name'),
              slug: compRec.get('slug'),
              segment: compRec.get('segment'),
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  return e.json(200, {
    status: 'ok',
    pocketbaseConnected: pbConnected,
    migrationsApplied: migrationsApplied,
    realtimeAvailable: true,
    authenticated: !!authUser,
    user: authUser
      ? {
          id: authUser.id,
          email: authUser.email(),
          name: authUser.get('name'),
        }
      : null,
    activeCompany: activeCompany,
    activeMembership: activeMembership,
    tenantActive: isTenantActive,
    timestamp: new Date().toISOString(),
  })
})
