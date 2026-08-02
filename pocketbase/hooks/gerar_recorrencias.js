cronAdd('gerar_recorrencias', '0 6 * * *', () => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const dayOfWeekMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
  const todayDow = dayOfWeekMap[today.getDay()]
  const todayDom = today.getDate()

  const recorrencias = $app.findRecordsByFilter(
    'recorrencias',
    "ativa = true && frequencia != 'NENHUMA'",
    '',
    1000,
    0,
  )

  for (let r = 0; r < recorrencias.length; r++) {
    const rec = recorrencias[r]
    const freq = rec.getString('frequencia')
    let shouldGenerate = false

    if (freq === 'DIARIA') {
      shouldGenerate = true
    } else if (freq === 'SEMANAL') {
      const diaSemanaStr = rec.getString('dia_semana')
      if (diaSemanaStr) {
        let parsed
        try {
          parsed = JSON.parse(diaSemanaStr)
        } catch (_) {
          parsed = [diaSemanaStr]
        }
        if (Array.isArray(parsed)) {
          for (let d = 0; d < parsed.length; d++) {
            if (parsed[d] === todayDow) {
              shouldGenerate = true
              break
            }
          }
        } else if (typeof parsed === 'string' && parsed === todayDow) {
          shouldGenerate = true
        }
      }
    } else if (freq === 'MENSAL') {
      shouldGenerate = rec.getInt('dia_mes') === todayDom
    }

    if (!shouldGenerate) continue

    const templateAtivId = rec.getString('atividade_id')
    if (!templateAtivId) continue

    const existing = $app.findRecordsByFilter(
      'atividades',
      "recorrencia_origem = '" + rec.id + "' && prazo ~ '" + todayStr + "'",
      '',
      1,
      0,
    )
    if (existing.length > 0) continue

    const template = $app.findRecordById('atividades', templateAtivId)
    const ativCol = $app.findCollectionByNameOrId('atividades')
    const occurrence = new Record(ativCol)
    occurrence.set('empresa_id', template.getString('empresa_id'))
    occurrence.set('gestor_id', template.getString('gestor_id'))
    occurrence.set('colaborador_id', template.getString('colaborador_id'))
    occurrence.set('titulo', template.getString('titulo'))
    occurrence.set('descricao', template.getString('descricao'))
    occurrence.set('categoria', template.getString('categoria'))
    occurrence.set('prioridade', template.getString('prioridade'))
    occurrence.set('prazo', todayStr)
    occurrence.set('horario', rec.getString('horario') || template.getString('horario'))
    occurrence.set('exige_foto', template.getBool('exige_foto'))
    occurrence.set('status', 'pendente')
    occurrence.set('atribuicao', template.getString('atribuicao'))
    if (template.getString('setor_alvo_id'))
      occurrence.set('setor_alvo_id', template.getString('setor_alvo_id'))
    if (template.getString('colaborador_alvo_id'))
      occurrence.set('colaborador_alvo_id', template.getString('colaborador_alvo_id'))
    occurrence.set('recorrencia_origem', rec.id)
    $app.save(occurrence)

    const templateChecklist = $app.findRecordsByFilter(
      'itens_checklist',
      "atividade_id = '" + templateAtivId + "'",
      'ordem',
      1000,
      0,
    )
    if (templateChecklist.length > 0) {
      const checklistCol = $app.findCollectionByNameOrId('itens_checklist')
      for (let c = 0; c < templateChecklist.length; c++) {
        const item = templateChecklist[c]
        const newItem = new Record(checklistCol)
        newItem.set('atividade_id', occurrence.id)
        newItem.set('descricao', item.getString('descricao'))
        newItem.set('ordem', item.getInt('ordem'))
        newItem.set('feito', false)
        newItem.set('empresa_id', item.getString('empresa_id'))
        $app.save(newItem)
      }
    }
  }
})
