migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')
    const companyUsers = app.findCollectionByNameOrId('company_users')
    const teams = app.findCollectionByNameOrId('teams')

    // 6. commercial_accounts
    const commercialAccounts = new Collection({
      name: 'commercial_accounts',
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
        { name: 'responsible', type: 'relation', collectionId: companyUsers.id, maxSelect: 1 },
        { name: 'team', type: 'relation', collectionId: teams.id, maxSelect: 1 },
        { name: 'razao_social', type: 'text' },
        { name: 'nome_fantasia', type: 'text' },
        { name: 'cnpj', type: 'text' },
        { name: 'site', type: 'text' },
        { name: 'segmento', type: 'text' },
        { name: 'localizacao', type: 'text' },
        { name: 'endereco', type: 'text' },
        { name: 'logradouro', type: 'text' },
        { name: 'numero', type: 'text' },
        { name: 'complemento', type: 'text' },
        { name: 'bairro', type: 'text' },
        { name: 'cidade', type: 'text' },
        { name: 'estado', type: 'text' },
        { name: 'cep', type: 'text' },
        { name: 'cnaePrincipal', type: 'text' },
        { name: 'telefone', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'situacaoCadastral', type: 'text' },
        { name: 'porte', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'etapa', type: 'text' },
        { name: 'ultima_atividade', type: 'date' },
        { name: 'proximo_passo', type: 'text' },
        { name: 'observacoes', type: 'text' },
        { name: 'icp_score', type: 'number' },
        { name: 'icp_classification', type: 'text' },
        { name: 'ai_summary', type: 'text' },
        { name: 'ai_hypotheses', type: 'json' },
        { name: 'ai_pending_points', type: 'json' },
        { name: 'ai_confirmed_info', type: 'json' },
        { name: 'sources', type: 'json' },
        {
          name: 'identification_status',
          type: 'select',
          values: ['confirmada', 'provavel', 'pendente_validacao', 'nao_identificada'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_accounts_company ON commercial_accounts (company)',
        'CREATE INDEX idx_accounts_responsible ON commercial_accounts (responsible)',
      ],
    })
    app.save(commercialAccounts)

    // 7. contacts
    const contacts = new Collection({
      name: 'contacts',
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
          name: 'account',
          type: 'relation',
          required: true,
          collectionId: commercialAccounts.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'cargo', type: 'text' },
        { name: 'area', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'telefone', type: 'text' },
        { name: 'linkedin', type: 'text' },
        {
          name: 'classificacao',
          type: 'select',
          values: [
            'Decisor',
            'Influenciador',
            'Compras',
            'Responsável técnico',
            'Financeiro',
            'Usuário',
            'Indicação',
            'Não qualificado',
          ],
          maxSelect: 1,
        },
        { name: 'origem_relacionamento', type: 'text' },
        { name: 'relacao_executivo', type: 'text' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_contacts_account ON contacts (account)',
        'CREATE INDEX idx_contacts_company ON contacts (company)',
      ],
    })
    app.save(contacts)

    // 8. opportunities
    const opportunities = new Collection({
      name: 'opportunities',
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
          name: 'account',
          type: 'relation',
          required: true,
          collectionId: commercialAccounts.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'contact', type: 'relation', collectionId: contacts.id, maxSelect: 1 },
        { name: 'responsible', type: 'relation', collectionId: companyUsers.id, maxSelect: 1 },
        {
          name: 'etapa',
          type: 'select',
          required: true,
          values: [
            'Conta identificada',
            'Conta qualificada',
            'Contato identificado',
            'Primeira abordagem',
            'Conversa iniciada',
            'Reunião agendada',
            'Necessidade identificada',
            'Oportunidade qualificada',
            'Proposta em elaboração',
            'Proposta apresentada',
            'Negociação',
            'Ganha',
            'Perdida',
          ],
          maxSelect: 1,
        },
        { name: 'valor_estimado', type: 'number' },
        { name: 'prazo', type: 'date' },
        { name: 'proximo_passo', type: 'text' },
        { name: 'motivo_perda', type: 'text' },
        { name: 'historico', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_opps_account ON opportunities (account)',
        'CREATE INDEX idx_opps_company ON opportunities (company)',
      ],
    })
    app.save(opportunities)

    // 9. activities
    const activities = new Collection({
      name: 'activities',
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
        { name: 'account', type: 'relation', collectionId: commercialAccounts.id, maxSelect: 1 },
        { name: 'contact', type: 'relation', collectionId: contacts.id, maxSelect: 1 },
        { name: 'user', type: 'relation', collectionId: companyUsers.id, maxSelect: 1 },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: [
            'conta_criada',
            'contato_adicionado',
            'analise_produzida',
            'mensagem_preparada',
            'mensagem_copiada',
            'canal_aberto',
            'envio_confirmado',
            'ligacao_registrada',
            'resposta_recebida',
            'reuniao_registrada',
            'proximo_passo_criado',
            'oportunidade_atualizada',
            'outro',
          ],
          maxSelect: 1,
        },
        {
          name: 'origin',
          type: 'select',
          values: ['usuario', 'ia', 'integracao'],
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        { name: 'metadata', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      ],
      indexes: [
        'CREATE INDEX idx_activities_company ON activities (company)',
        'CREATE INDEX idx_activities_account ON activities (account)',
      ],
    })
    app.save(activities)

    // 10. meetings
    const meetings = new Collection({
      name: 'meetings',
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
        { name: 'account', type: 'relation', collectionId: commercialAccounts.id, maxSelect: 1 },
        { name: 'title', type: 'text', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'text' },
        { name: 'participants', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'ai_summary', type: 'text' },
        { name: 'next_steps', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['agendada', 'realizada', 'cancelada'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_meetings_company ON meetings (company)'],
    })
    app.save(meetings)

    // 11. products
    const products = new Collection({
      name: 'products',
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
        { name: 'category', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'problems_solved', type: 'text' },
        { name: 'benefits', type: 'text' },
        { name: 'differentiators', type: 'text' },
        { name: 'target_segments', type: 'json' },
        { name: 'ideal_company_size', type: 'text' },
        { name: 'target_region', type: 'text' },
        { name: 'decision_maker_profile', type: 'text' },
        { name: 'need_signals', type: 'text' },
        { name: 'exclusion_criteria', type: 'text' },
        { name: 'commercial_notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_products_company ON products (company)'],
    })
    app.save(products)

    // 12. onboarding_config
    const onboardingConfig = new Collection({
      name: 'onboarding_config',
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
        { name: 'differentiators', type: 'json' },
        { name: 'priority_segments', type: 'json' },
        { name: 'products_services', type: 'json' },
        { name: 'icp', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_onboarding_company ON onboarding_config (company)'],
    })
    app.save(onboardingConfig)

    // 13. notifications
    const notifications = new Collection({
      name: 'notifications',
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
          collectionId: companyUsers.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'read', type: 'bool' },
        { name: 'type', type: 'text' },
        { name: 'link', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      ],
      indexes: ['CREATE INDEX idx_notif_user ON notifications (user)'],
    })
    app.save(notifications)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('notifications'))
      app.delete(app.findCollectionByNameOrId('onboarding_config'))
      app.delete(app.findCollectionByNameOrId('products'))
      app.delete(app.findCollectionByNameOrId('meetings'))
      app.delete(app.findCollectionByNameOrId('activities'))
      app.delete(app.findCollectionByNameOrId('opportunities'))
      app.delete(app.findCollectionByNameOrId('contacts'))
      app.delete(app.findCollectionByNameOrId('commercial_accounts'))
    } catch (_) {}
  },
)
