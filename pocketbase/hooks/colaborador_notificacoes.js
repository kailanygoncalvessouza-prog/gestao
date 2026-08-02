routerAdd('GET', '/backend/v1/colaborador/notificacoes', (e) => {
  const query = e.requestInfo().query || {}
  const token = (query.token || '').trim()

  if (!token) return e.json(401, { error: 'Token não fornecido.' })

  try {
    const colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
    if (!colab.getBool('token_ativo')) return e.json(401, { error: 'Token inativo.' })

    const filter = `colaborador_id = '${colab.id}'`
    const notifs = $app.findRecordsByFilter('notificacoes', filter, '-enviada_em', 50, 0)

    return e.json(200, { notificacoes: notifs })
  } catch (err) {
    return e.json(400, { error: err.message || 'Erro ao buscar notificações.' })
  }
})
