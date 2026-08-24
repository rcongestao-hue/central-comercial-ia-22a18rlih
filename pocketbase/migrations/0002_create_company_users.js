migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')

    // 2. company_users
    const companyUsers = new Collection({
      name: 'company_users',
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
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          cascadeDelete: true,
        },
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
        {
          name: 'status',
          type: 'select',
          values: ['ativo', 'inativo', 'suspenso'],
          maxSelect: 1,
        },
        { name: 'last_access', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_comp_user ON company_users (user, company)'],
    })
    app.save(companyUsers)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('company_users')
      app.delete(col)
    } catch (_) {}
  },
)
