migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')
    const companyUsers = app.findCollectionByNameOrId('company_users')

    // 3. teams
    const teams = new Collection({
      name: 'teams',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'company',
          type: 'relation',
          required: true,
          collectionId: companies.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'manager', type: 'relation', collectionId: companyUsers.id, maxSelect: 1 },
        { name: 'region', type: 'text' },
        { name: 'portfolio', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(teams)

    // 4. team_members
    const teamMembers = new Collection({
      name: 'team_members',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'team',
          type: 'relation',
          required: true,
          collectionId: teams.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: companyUsers.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'role', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_team_member ON team_members (team, user)'],
    })
    app.save(teamMembers)

    // 5. invitations
    const invitations = new Collection({
      name: 'invitations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'company',
          type: 'relation',
          required: true,
          collectionId: companies.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'email', type: 'text', required: true },
        {
          name: 'profile',
          type: 'select',
          required: true,
          values: [
            'proprietario',
            'administrador',
            'diretor_comercial',
            'gestor',
            'executivo',
            'visualizador',
          ],
          maxSelect: 1,
        },
        { name: 'team', type: 'relation', collectionId: teams.id, maxSelect: 1 },
        { name: 'manager', type: 'relation', collectionId: companyUsers.id, maxSelect: 1 },
        { name: 'invited_by', type: 'relation', collectionId: companyUsers.id, maxSelect: 1 },
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'aceito', 'expirado', 'revogado'],
          maxSelect: 1,
        },
        { name: 'token', type: 'text' },
        { name: 'expires_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_invitation_token ON invitations (token) WHERE token != ''",
      ],
    })
    app.save(invitations)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('invitations'))
      app.delete(app.findCollectionByNameOrId('team_members'))
      app.delete(app.findCollectionByNameOrId('teams'))
    } catch (_) {}
  },
)
