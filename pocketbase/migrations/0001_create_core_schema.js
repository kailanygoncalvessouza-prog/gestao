migrate(
  (app) => {
    // 1. Create empresas collection
    const empresas = new Collection({
      name: 'empresas',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.empresa_id = id",
      viewRule: "@request.auth.id != '' && @request.auth.empresa_id = id",
      createRule: '',
      updateRule: "@request.auth.id != '' && @request.auth.empresa_id = id",
      deleteRule: null,
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(empresas)
    const empresaColId = app.findCollectionByNameOrId('empresas').id

    // 2. Extend users collection
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('perfil')) {
      users.fields.add(new SelectField({ name: 'perfil', values: ['GESTOR'], maxSelect: 1 }))
    }
    if (!users.fields.getByName('empresa_id')) {
      users.fields.add(
        new RelationField({ name: 'empresa_id', collectionId: empresaColId, maxSelect: 1 }),
      )
    }
    if (!users.fields.getByName('nome')) {
      users.fields.add(new TextField({ name: 'nome' }))
    }
    users.listRule =
      "@request.auth.id != '' && (id = @request.auth.id || (@request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id))"
    users.viewRule =
      "@request.auth.id != '' && (id = @request.auth.id || (@request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id))"
    users.createRule = ''
    users.updateRule = "@request.auth.id != '' && id = @request.auth.id"
    app.save(users)

    // 3. Create colaboradores collection
    const colaboradores = new Collection({
      name: 'colaboradores',
      type: 'base',
      listRule:
        "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id",
      viewRule:
        "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id",
      createRule:
        "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id",
      updateRule:
        "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id",
      deleteRule:
        "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id",
      fields: [
        {
          name: 'empresa_id',
          type: 'relation',
          required: true,
          collectionId: empresaColId,
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'funcao', type: 'text' },
        { name: 'telefone', type: 'text' },
        { name: 'token_acesso', type: 'text', required: true },
        { name: 'token_ativo', type: 'bool' },
        { name: 'desativado_em', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_colab_token ON colaboradores (token_acesso)',
        'CREATE INDEX idx_colab_empresa ON colaboradores (empresa_id)',
      ],
    })
    app.save(colaboradores)
    const colabColId = app.findCollectionByNameOrId('colaboradores').id

    // 4. Create recorrencias collection first (for relation in atividades)
    const recorrencias = new Collection({
      name: 'recorrencias',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.perfil = 'GESTOR'",
      viewRule: "@request.auth.id != '' && @request.auth.perfil = 'GESTOR'",
      createRule: "@request.auth.id != '' && @request.auth.perfil = 'GESTOR'",
      updateRule: "@request.auth.id != '' && @request.auth.perfil = 'GESTOR'",
      deleteRule: "@request.auth.id != '' && @request.auth.perfil = 'GESTOR'",
      fields: [
        {
          name: 'frequencia',
          type: 'select',
          required: true,
          values: ['DIARIA', 'SEMANAL', 'MENSAL'],
          maxSelect: 1,
        },
        {
          name: 'dia_semana',
          type: 'select',
          values: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
          maxSelect: 7,
        },
        { name: 'dia_mes', type: 'number' },
        { name: 'ativa', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(recorrencias)
    const recColId = app.findCollectionByNameOrId('recorrencias').id

    // 5. Create atividades collection
    const atividades = new Collection({
      name: 'atividades',
      type: 'base',
      listRule:
        "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id",
      viewRule:
        "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id",
      createRule:
        "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id",
      updateRule:
        "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id",
      deleteRule:
        "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id",
      fields: [
        {
          name: 'empresa_id',
          type: 'relation',
          required: true,
          collectionId: empresaColId,
          maxSelect: 1,
        },
        {
          name: 'gestor_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'colaborador_id',
          type: 'relation',
          required: true,
          collectionId: colabColId,
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'categoria', type: 'text' },
        {
          name: 'prioridade',
          type: 'select',
          values: ['baixa', 'media', 'alta', 'critica'],
          maxSelect: 1,
        },
        { name: 'prazo', type: 'date', required: true },
        { name: 'horario', type: 'text' },
        { name: 'exige_foto', type: 'bool' },
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'em_andamento', 'concluida', 'concluida_com_atraso', 'nao_feita'],
          maxSelect: 1,
        },
        { name: 'concluida_em', type: 'date' },
        { name: 'observacao', type: 'text' },
        { name: 'recorrencia_origem', type: 'relation', collectionId: recColId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_ativ_empresa_status ON atividades (empresa_id, status)',
        'CREATE INDEX idx_ativ_colab_prazo ON atividades (colaborador_id, prazo)',
      ],
    })
    app.save(atividades)
    const ativColId = app.findCollectionByNameOrId('atividades').id

    // Add atividade_id relation to recorrencias
    const recCol = app.findCollectionByNameOrId('recorrencias')
    recCol.fields.add(
      new RelationField({ name: 'atividade_id', collectionId: ativColId, maxSelect: 1 }),
    )
    app.save(recCol)

    // 6. Create evidencias collection
    const evidencias = new Collection({
      name: 'evidencias',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.perfil = 'GESTOR'",
      viewRule: "@request.auth.id != '' && @request.auth.perfil = 'GESTOR'",
      createRule: "@request.auth.id != '' && @request.auth.perfil = 'GESTOR'",
      updateRule: "@request.auth.id != '' && @request.auth.perfil = 'GESTOR'",
      deleteRule: "@request.auth.id != '' && @request.auth.perfil = 'GESTOR'",
      fields: [
        {
          name: 'atividade_id',
          type: 'relation',
          required: true,
          collectionId: ativColId,
          maxSelect: 1,
        },
        {
          name: 'colaborador_id',
          type: 'relation',
          required: true,
          collectionId: colabColId,
          maxSelect: 1,
        },
        {
          name: 'url_foto',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'localizacao_gps', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['PENDENTE', 'APROVADA', 'REPROVADA'],
          maxSelect: 1,
        },
        { name: 'enviada_em', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(evidencias)

    // 7. Create notificacoes collection
    const notificacoes = new Collection({
      name: 'notificacoes',
      type: 'base',
      listRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      fields: [
        { name: 'usuario_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'colaborador_id', type: 'relation', collectionId: colabColId, maxSelect: 1 },
        { name: 'tipo', type: 'select', values: ['PUSH', 'WHATSAPP', 'INAPP'], maxSelect: 1 },
        { name: 'mensagem', type: 'text', required: true },
        { name: 'lida', type: 'bool' },
        { name: 'enviada_em', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(notificacoes)
  },
  (app) => {
    const collections = [
      'notificacoes',
      'evidencias',
      'atividades',
      'recorrencias',
      'colaboradores',
      'empresas',
    ]
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
