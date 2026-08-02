migrate(
  (app) => {
    const recCol = app.findCollectionByNameOrId('recorrencias')
    const freqField = recCol.fields.getByName('frequencia')
    if (freqField) {
      freqField.values = ['DIARIA', 'SEMANAL', 'MENSAL', 'NENHUMA']
    }
    if (!recCol.fields.getByName('horario')) {
      recCol.fields.add(new TextField({ name: 'horario' }))
    }
    app.save(recCol)

    const ativColId = app.findCollectionByNameOrId('atividades').id
    const colabColId = app.findCollectionByNameOrId('colaboradores').id
    const empresaColId = app.findCollectionByNameOrId('empresas').id

    const checklistCol = new Collection({
      name: 'itens_checklist',
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
          name: 'atividade_id',
          type: 'relation',
          required: true,
          collectionId: ativColId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'descricao', type: 'text', required: true },
        { name: 'ordem', type: 'number', required: true },
        { name: 'feito', type: 'bool' },
        { name: 'marcado_por_id', type: 'relation', collectionId: colabColId, maxSelect: 1 },
        { name: 'marcado_em', type: 'date' },
        {
          name: 'empresa_id',
          type: 'relation',
          required: true,
          collectionId: empresaColId,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_checklist_atividade ON itens_checklist (atividade_id)',
        'CREATE INDEX idx_checklist_empresa ON itens_checklist (empresa_id)',
      ],
    })
    app.save(checklistCol)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('itens_checklist')
      app.delete(col)
    } catch (_) {}

    try {
      const recCol = app.findCollectionByNameOrId('recorrencias')
      const freqField = recCol.fields.getByName('frequencia')
      if (freqField) {
        freqField.values = ['DIARIA', 'SEMANAL', 'MENSAL']
      }
      const horarioField = recCol.fields.getByName('horario')
      if (horarioField) {
        recCol.fields.remove(horarioField)
      }
      app.save(recCol)
    } catch (_) {}
  },
)
