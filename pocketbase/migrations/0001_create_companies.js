migrate(
  (app) => {
    // 1. companies
    const companies = new Collection({
      name: 'companies',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text' },
        { name: 'segment', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'brand_color', type: 'text' },
        { name: 'logo', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_companies_slug ON companies (slug) WHERE slug != ''"],
    })
    app.save(companies)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('companies')
      app.delete(col)
    } catch (_) {}
  },
)
