routerAdd('GET', '/backend/v1/colaborador/agenda', (e) => {
  const query = e.requestInfo().query || {}
  const token = (query.token || '').trim()
  const data = query.data || new Date().toISOString().split('T')[0]

  if (!token) {
    return e.json(401, { error: 'Token não fornecido.' })
  }

  try {
    const colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
    if (!colab.getBool('token_ativo')) {
      return e.json(401, { error: 'Token inativo.' })
    }

    const filter = `colaborador_id = '${colab.id}' && prazo ~ '${data}'`
    const atividades = $app.findRecordsByFilter('atividades', filter, 'horario', 100, 0)

    return e.json(200, { atividades: atividades })
  } catch (err) {
    return e.json(400, { error: err.message || 'Erro ao carregar agenda.' })
  }
})
