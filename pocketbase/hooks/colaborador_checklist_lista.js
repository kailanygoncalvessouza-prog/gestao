routerAdd('GET', '/backend/v1/colaborador/atividades/{id}/checklist', (e) => {
  const id = e.request.pathValue('id')
  const query = e.requestInfo().query || {}
  const token = (query.token || '').trim()

  if (!token) return e.json(401, { error: 'Token não fornecido.' })

  try {
    const colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
    if (!colab.getBool('token_ativo')) return e.json(401, { error: 'Token inativo.' })

    const ativ = $app.findRecordById('atividades', id)
    if (ativ.getString('empresa_id') !== colab.getString('empresa_id')) {
      return e.json(403, { error: 'Acesso negado a esta atividade.' })
    }

    const items = $app.findRecordsByFilter(
      'itens_checklist',
      "atividade_id = '" + id + "'",
      'ordem',
      1000,
      0,
    )

    return e.json(200, { items: items })
  } catch (err) {
    return e.json(400, { error: err.message || 'Erro ao carregar checklist.' })
  }
})
