routerAdd('POST', '/backend/v1/colaborador/notificacoes/{id}/lida', (e) => {
  const id = e.request.pathValue('id')
  const body = e.requestInfo().body || {}
  const token = (body.token || '').trim()

  if (!token) return e.json(401, { error: 'Token não fornecido.' })

  try {
    const colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
    if (!colab.getBool('token_ativo')) return e.json(401, { error: 'Token inativo.' })

    const notif = $app.findRecordById('notificacoes', id)
    if (notif.getString('colaborador_id') !== colab.id) {
      return e.json(403, { error: 'Acesso negado.' })
    }

    notif.set('lida', true)
    $app.save(notif)

    return e.json(200, { success: true })
  } catch (err) {
    return e.json(400, { error: err.message || 'Erro ao marcar notificação.' })
  }
})
