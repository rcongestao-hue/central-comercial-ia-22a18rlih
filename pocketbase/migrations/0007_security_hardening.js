migrate(
  (app) => {
    // 1. Create audit_logs collection
    try {
      app.findCollectionByNameOrId('audit_logs')
    } catch (_) {
      const companies = app.findCollectionByNameOrId('companies')
      const auditLogs = new Collection({
        name: 'audit_logs',
        type: 'base',
        listRule:
          "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo' && (company.company_users_via_company.profile ?= 'proprietario' || company.company_users_via_company.profile ?= 'administrador')",
        viewRule:
          "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo' && (company.company_users_via_company.profile ?= 'proprietario' || company.company_users_via_company.profile ?= 'administrador')",
        createRule: null, // superuser/hook only
        updateRule: null, // immutable
        deleteRule: null, // immutable
        fields: [
          {
            name: 'company',
            type: 'relation',
            required: true,
            collectionId: companies.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'action', type: 'text', required: true },
          { name: 'target_type', type: 'text' },
          { name: 'target_id', type: 'text' },
          {
            name: 'actor',
            type: 'relation',
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
          },
          { name: 'details', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_audit_logs_company ON audit_logs (company)',
          'CREATE INDEX idx_audit_logs_action ON audit_logs (action)',
          'CREATE INDEX idx_audit_logs_actor ON audit_logs (actor)',
        ],
      })
      app.save(auditLogs)
    }

    // Standard multi-tenant rule for entities with `company` relation
    const tenantRule =
      "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo'"

    // 2. Update companies API Rules
    const companiesCol = app.findCollectionByNameOrId('companies')
    companiesCol.listRule =
      "@request.auth.id != '' && company_users_via_company.user ?= @request.auth.id && company_users_via_company.status ?= 'ativo'"
    companiesCol.viewRule =
      "@request.auth.id != '' && company_users_via_company.user ?= @request.auth.id && company_users_via_company.status ?= 'ativo'"
    companiesCol.createRule = "@request.auth.id != ''"
    companiesCol.updateRule =
      "@request.auth.id != '' && company_users_via_company.user ?= @request.auth.id && company_users_via_company.status ?= 'ativo' && (company_users_via_company.profile ?= 'proprietario' || company_users_via_company.profile ?= 'administrador')"
    companiesCol.deleteRule =
      "@request.auth.id != '' && company_users_via_company.user ?= @request.auth.id && company_users_via_company.status ?= 'ativo' && company_users_via_company.profile ?= 'proprietario'"
    app.save(companiesCol)

    // 3. Update company_users API Rules
    const companyUsersCol = app.findCollectionByNameOrId('company_users')
    companyUsersCol.listRule =
      "@request.auth.id != '' && (user = @request.auth.id || (company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo'))"
    companyUsersCol.viewRule =
      "@request.auth.id != '' && (user = @request.auth.id || (company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo'))"
    companyUsersCol.createRule = "@request.auth.id != ''"
    companyUsersCol.updateRule =
      "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo' && (company.company_users_via_company.profile ?= 'proprietario' || company.company_users_via_company.profile ?= 'administrador')"
    companyUsersCol.deleteRule =
      "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo' && (company.company_users_via_company.profile ?= 'proprietario' || company.company_users_via_company.profile ?= 'administrador')"
    app.save(companyUsersCol)

    // 4. Update teams API Rules
    const teamsCol = app.findCollectionByNameOrId('teams')
    teamsCol.listRule = tenantRule
    teamsCol.viewRule = tenantRule
    teamsCol.createRule =
      "@request.auth.id != '' && @request.body.company.company_users_via_company.user ?= @request.auth.id && @request.body.company.company_users_via_company.status ?= 'ativo' && (@request.body.company.company_users_via_company.profile ?= 'proprietario' || @request.body.company.company_users_via_company.profile ?= 'administrador' || @request.body.company.company_users_via_company.profile ?= 'diretor_comercial')"
    teamsCol.updateRule =
      "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo' && (company.company_users_via_company.profile ?= 'proprietario' || company.company_users_via_company.profile ?= 'administrador' || company.company_users_via_company.profile ?= 'diretor_comercial')"
    teamsCol.deleteRule =
      "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo' && (company.company_users_via_company.profile ?= 'proprietario' || company.company_users_via_company.profile ?= 'administrador')"
    app.save(teamsCol)

    // 5. Update team_members API Rules
    const teamMembersCol = app.findCollectionByNameOrId('team_members')
    const teamMemberTenantRule =
      "@request.auth.id != '' && team.company.company_users_via_company.user ?= @request.auth.id && team.company.company_users_via_company.status ?= 'ativo'"
    teamMembersCol.listRule = teamMemberTenantRule
    teamMembersCol.viewRule = teamMemberTenantRule
    teamMembersCol.createRule =
      "@request.auth.id != '' && @request.body.team.company.company_users_via_company.user ?= @request.auth.id && @request.body.team.company.company_users_via_company.status ?= 'ativo' && (@request.body.team.company.company_users_via_company.profile ?= 'proprietario' || @request.body.team.company.company_users_via_company.profile ?= 'administrador' || @request.body.team.company.company_users_via_company.profile ?= 'diretor_comercial' || @request.body.team.company.company_users_via_company.profile ?= 'gestor')"
    teamMembersCol.updateRule =
      "@request.auth.id != '' && team.company.company_users_via_company.user ?= @request.auth.id && team.company.company_users_via_company.status ?= 'ativo' && (team.company.company_users_via_company.profile ?= 'proprietario' || team.company.company_users_via_company.profile ?= 'administrador' || team.company.company_users_via_company.profile ?= 'diretor_comercial' || team.company.company_users_via_company.profile ?= 'gestor')"
    teamMembersCol.deleteRule =
      "@request.auth.id != '' && team.company.company_users_via_company.user ?= @request.auth.id && team.company.company_users_via_company.status ?= 'ativo' && (team.company.company_users_via_company.profile ?= 'proprietario' || team.company.company_users_via_company.profile ?= 'administrador' || team.company.company_users_via_company.profile ?= 'diretor_comercial' || team.company.company_users_via_company.profile ?= 'gestor')"
    app.save(teamMembersCol)

    // 6. Update invitations API Rules
    const invitationsCol = app.findCollectionByNameOrId('invitations')
    invitationsCol.listRule =
      "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo' && (company.company_users_via_company.profile ?= 'proprietario' || company.company_users_via_company.profile ?= 'administrador' || company.company_users_via_company.profile ?= 'diretor_comercial')"
    invitationsCol.viewRule =
      "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo' && (company.company_users_via_company.profile ?= 'proprietario' || company.company_users_via_company.profile ?= 'administrador' || company.company_users_via_company.profile ?= 'diretor_comercial')"
    invitationsCol.createRule =
      "@request.auth.id != '' && @request.body.company.company_users_via_company.user ?= @request.auth.id && @request.body.company.company_users_via_company.status ?= 'ativo' && (@request.body.company.company_users_via_company.profile ?= 'proprietario' || @request.body.company.company_users_via_company.profile ?= 'administrador' || @request.body.company.company_users_via_company.profile ?= 'diretor_comercial')"
    invitationsCol.updateRule =
      "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo' && (company.company_users_via_company.profile ?= 'proprietario' || company.company_users_via_company.profile ?= 'administrador')"
    invitationsCol.deleteRule =
      "@request.auth.id != '' && company.company_users_via_company.user ?= @request.auth.id && company.company_users_via_company.status ?= 'ativo' && (company.company_users_via_company.profile ?= 'proprietario' || company.company_users_via_company.profile ?= 'administrador')"
    app.save(invitationsCol)

    // 7. Update Commercial collections: commercial_accounts, contacts, opportunities, activities, meetings, products, onboarding_config, notifications
    const baseCols = [
      'commercial_accounts',
      'contacts',
      'opportunities',
      'activities',
      'meetings',
      'products',
      'onboarding_config',
      'notifications',
    ]

    for (let colName of baseCols) {
      try {
        const col = app.findCollectionByNameOrId(colName)
        col.listRule = tenantRule
        col.viewRule = tenantRule
        col.createRule =
          "@request.auth.id != '' && @request.body.company.company_users_via_company.user ?= @request.auth.id && @request.body.company.company_users_via_company.status ?= 'ativo'"
        col.updateRule = tenantRule
        col.deleteRule = tenantRule
        app.save(col)
      } catch (err) {
        console.log(`Failed updating rules for ${colName}:`, err)
      }
    }

    // 8. Clean up demo accounts if unmistakably created as seed
    try {
      const demoEmails = ['demo@aurorasolucoes.com', 'rcongestao@gmail.com']
      for (let email of demoEmails) {
        try {
          const userRec = app.findAuthRecordByEmail('_pb_users_auth_', email)
          if (userRec) {
            // Delete company users associated with demo user
            const cuRecs = app.findRecordsByFilter(
              'company_users',
              `user = '${userRec.id}'`,
              '-created',
              10,
              0,
            )
            for (let cu of cuRecs) {
              app.delete(cu)
            }
            app.delete(userRec)
          }
        } catch (_) {}
      }

      // Check if demo company Aurora exists and has no other users
      try {
        const demoComp = app.findFirstRecordByData('companies', 'slug', 'aurora-solucoes')
        if (demoComp) {
          const activeUsers = app.findRecordsByFilter(
            'company_users',
            `company = '${demoComp.id}'`,
            '-created',
            5,
            0,
          )
          if (activeUsers.length === 0) {
            // Clean related onboarding config and demo company
            try {
              const onb = app.findFirstRecordByData('onboarding_config', 'company', demoComp.id)
              if (onb) app.delete(onb)
            } catch (_) {}
            app.delete(demoComp)
          }
        }
      } catch (_) {}
    } catch (cleanErr) {
      console.log('Error cleaning demo records in migration:', cleanErr)
    }
  },
  (app) => {
    try {
      const auditLogs = app.findCollectionByNameOrId('audit_logs')
      if (auditLogs) app.delete(auditLogs)
    } catch (_) {}
  },
)
