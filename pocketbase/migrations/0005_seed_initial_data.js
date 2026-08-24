migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const companies = app.findCollectionByNameOrId('companies')
    const companyUsers = app.findCollectionByNameOrId('company_users')
    const onboardingConfig = app.findCollectionByNameOrId('onboarding_config')

    // 1. Check or create initial admin user
    let adminUser
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'rcongestao@gmail.com')
    } catch (_) {
      adminUser = new Record(users)
      adminUser.setEmail('rcongestao@gmail.com')
      adminUser.setPassword('Skip@Pass')
      adminUser.setVerified(true)
      adminUser.set('name', 'Carlos Mendes')
      app.save(adminUser)
    }

    // 2. Check or create demo user for instant login
    let demoUser
    try {
      demoUser = app.findAuthRecordByEmail('_pb_users_auth_', 'demo@aurorasolucoes.com')
    } catch (_) {
      demoUser = new Record(users)
      demoUser.setEmail('demo@aurorasolucoes.com')
      demoUser.setPassword('Skip@Pass123')
      demoUser.setVerified(true)
      demoUser.set('name', 'Executivo Demonstração')
      app.save(demoUser)
    }

    // 3. Check or create demo company (Aurora Soluções Digitais)
    let comp
    try {
      comp = app.findFirstRecordByData('companies', 'slug', 'aurora-solucoes')
    } catch (_) {
      comp = new Record(companies)
      comp.set('name', 'Aurora Soluções Digitais')
      comp.set('slug', 'aurora-solucoes')
      comp.set('segment', 'Tecnologia & B2B')
      comp.set('region', 'Brasil (Nacional — foco Sul e Sudeste)')
      comp.set('brand_color', '#2563EB')
      app.save(comp)
    }

    // 4. Link admin user as proprietario in company_users
    try {
      app.findFirstRecordByData('company_users', 'user', adminUser.id)
    } catch (_) {
      const compUser = new Record(companyUsers)
      compUser.set('company', comp.id)
      compUser.set('user', adminUser.id)
      compUser.set('profile', 'proprietario')
      compUser.set('status', 'ativo')
      app.save(compUser)
    }

    // 5. Link demo user as administrador in company_users
    try {
      app.findFirstRecordByData('company_users', 'user', demoUser.id)
    } catch (_) {
      const compUser = new Record(companyUsers)
      compUser.set('company', comp.id)
      compUser.set('user', demoUser.id)
      compUser.set('profile', 'administrador')
      compUser.set('status', 'ativo')
      app.save(compUser)
    }

    // 6. Create onboarding config for company
    try {
      app.findFirstRecordByData('onboarding_config', 'company', comp.id)
    } catch (_) {
      const config = new Record(onboardingConfig)
      config.set('company', comp.id)
      config.set('diferenciais', [
        'Implementação ágil em até 14 dias',
        'IA contextualizada para o modelo de negócios',
        'Suporte executivo dedicado',
      ])
      config.set('priority_segments', [
        'Tecnologia',
        'Saúde & Healthtech',
        'Serviços Financeiros',
        'Varejo / E-commerce',
      ])
      config.set('products_services', [
        'Plataforma de Automação Comercial',
        'Consultoria em Eficiência de Vendas B2B',
        'Integração de Sistemas & Dashboards',
      ])
      config.set('icp', {
        description:
          'Empresas B2B de médio e grande porte (50 a 500 colaboradores), faturamento acima de R$ 10M/ano.',
        target_size: '50-500',
        region: 'Brasil',
      })
      app.save(config)
    }
  },
  (app) => {
    // down logic
  },
)
