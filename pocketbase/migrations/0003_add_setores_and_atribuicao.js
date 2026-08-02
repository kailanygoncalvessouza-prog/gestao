migrate(
  (app) => {
    const setoresCol = new Collection({
      name: 'setores',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'ordem', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_setores_nome ON setores (nome)'],
    })
    app.save(setoresCol)
    const setoresColId = app.findCollectionByNameOrId('setores').id

    const setorNomes = [
      'Administrativo',
      'Vendas',
      'Atendimento',
      'Operação',
      'Logística',
      'Estoque',
      'Financeiro',
      'Marketing',
      'Limpeza',
      'Manutenção',
      'Cozinha',
      'Bar',
      'Garçom',
      'Recepção',
      'Segurança',
    ]
    for (let i = 0; i < setorNomes.length; i++) {
      try {
        app.findFirstRecordByData('setores', 'nome', setorNomes[i])
      } catch (_) {
        const rec = new Record(app.findCollectionByNameOrId('setores'))
        rec.set('nome', setorNomes[i])
        rec.set('ordem', i + 1)
        app.save(rec)
      }
    }

    const defaultSetor = app.findFirstRecordByData('setores', 'nome', 'Administrativo')

    const colabCol = app.findCollectionByNameOrId('colaboradores')
    if (!colabCol.fields.getByName('setor_id')) {
      colabCol.fields.add(
        new RelationField({ name: 'setor_id', collectionId: setoresColId, maxSelect: 1 }),
      )
    }
    colabCol.addIndex('idx_colab_setor', false, 'setor_id', '')
    app.save(colabCol)

    const allColabs = app.findRecordsByFilter('colaboradores', "id != ''", 'created', 1000, 0)
    for (const c of allColabs) {
      if (!c.getString('setor_id')) {
        c.set('setor_id', defaultSetor.id)
        app.save(c)
      }
    }

    const ativCol = app.findCollectionByNameOrId('atividades')
    const colabColId = app.findCollectionByNameOrId('colaboradores').id
    const colabIdField = ativCol.fields.getByName('colaborador_id')
    if (colabIdField) {
      colabIdField.required = false
    }

    if (!ativCol.fields.getByName('atribuicao')) {
      ativCol.fields.add(
        new SelectField({
          name: 'atribuicao',
          values: ['QUALQUER_UM', 'SETOR', 'COLABORADOR'],
          maxSelect: 1,
        }),
      )
    }
    if (!ativCol.fields.getByName('setor_alvo_id')) {
      ativCol.fields.add(
        new RelationField({ name: 'setor_alvo_id', collectionId: setoresColId, maxSelect: 1 }),
      )
    }
    if (!ativCol.fields.getByName('colaborador_alvo_id')) {
      ativCol.fields.add(
        new RelationField({ name: 'colaborador_alvo_id', collectionId: colabColId, maxSelect: 1 }),
      )
    }
    if (!ativCol.fields.getByName('concluida_por_id')) {
      ativCol.fields.add(
        new RelationField({ name: 'concluida_por_id', collectionId: colabColId, maxSelect: 1 }),
      )
    }
    ativCol.addIndex('idx_ativ_atribuicao', false, 'atribuicao', '')
    ativCol.addIndex('idx_ativ_setor_alvo', false, 'setor_alvo_id', '')
    ativCol.addIndex('idx_ativ_colab_alvo', false, 'colaborador_alvo_id', '')
    ativCol.addIndex('idx_ativ_concluida_por', false, 'concluida_por_id', '')
    app.save(ativCol)

    const allAtivs = app.findRecordsByFilter('atividades', "id != ''", 'created', 1000, 0)
    for (const a of allAtivs) {
      if (!a.getString('atribuicao')) {
        a.set('atribuicao', 'QUALQUER_UM')
        app.save(a)
      }
    }

    const empresaColId = app.findCollectionByNameOrId('empresas').id
    const evidCol = app.findCollectionByNameOrId('evidencias')
    if (!evidCol.fields.getByName('empresa_id')) {
      evidCol.fields.add(
        new RelationField({ name: 'empresa_id', collectionId: empresaColId, maxSelect: 1 }),
      )
    }
    evidCol.listRule =
      "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id"
    evidCol.viewRule =
      "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id"
    evidCol.createRule =
      "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id"
    evidCol.updateRule =
      "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id"
    evidCol.deleteRule =
      "@request.auth.id != '' && @request.auth.perfil = 'GESTOR' && empresa_id = @request.auth.empresa_id"
    evidCol.addIndex('idx_evid_empresa', false, 'empresa_id', '')
    app.save(evidCol)

    const allEvids = app.findRecordsByFilter('evidencias', "id != ''", 'created', 1000, 0)
    for (const ev of allEvids) {
      if (!ev.getString('empresa_id')) {
        try {
          const ativ = app.findRecordById('atividades', ev.getString('atividade_id'))
          ev.set('empresa_id', ativ.getString('empresa_id'))
          app.save(ev)
        } catch (_) {}
      }
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('setores')
      app.delete(col)
    } catch (_) {}
  },
)
