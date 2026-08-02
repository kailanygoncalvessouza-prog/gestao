routerAdd('POST', '/backend/v1/colaborador/atividades/{id}/status', (e) => {
  const id = e.request.pathValue('id')
  const body = e.requestInfo().body || {}
  const token = (body.token || '').trim()
  const status = body.status
  const observacao = body.observacao || ''

  if (!token) return e.json(401, { error: 'Token não fornecido.' })
  if (!status) return e.json(400, { error: 'Status não fornecido.' })

  try {
    const colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
    if (!colab.getBool('token_ativo')) return e.json(401, { error: 'Token inativo.' })

    const ativ = $app.findRecordById('atividades', id)

    if (ativ.getString('empresa_id') !== colab.getString('empresa_id')) {
      return e.json(403, { error: 'Acesso negado a esta atividade.' })
    }

    const currentStatus = ativ.getString('status')
    if (currentStatus === 'concluida' || currentStatus === 'concluida_com_atraso') {
      return e.json(400, { error: 'Esta atividade já foi concluída.' })
    }

    const now = new Date()
    let finalStatus = status

    if (status === 'concluida') {
      const prazoDateStr = ativ.getString('prazo')
      if (prazoDateStr) {
        const prazoDate = new Date(prazoDateStr)
        if (now > prazoDate) {
          finalStatus = 'concluida_com_atraso'
        }
      }
      ativ.set('concluida_em', now.toISOString())
      ativ.set('concluida_por_id', colab.id)
    }

    ativ.set('status', finalStatus)
    if (observacao) ativ.set('observacao', observacao)
    $app.save(ativ)

    try {
      const notifCol = $app.findCollectionByNameOrId('notificacoes')
      const notif = new Record(notifCol)
      notif.set('usuario_id', ativ.getString('gestor_id'))
      notif.set(
        'mensagem',
        colab.getString('nome') +
          " atualizou a atividade '" +
          ativ.getString('titulo') +
          "' para " +
          finalStatus +
          '.',
      )
      notif.set('tipo', 'INAPP')
      notif.set('lida', false)
      notif.set('enviada_em', now.toISOString())
      $app.save(notif)
    } catch (_) {}

    return e.json(200, { atividade: ativ })
  } catch (err) {
    return e.json(400, { error: err.message || 'Erro ao atualizar status.' })
  }
})
