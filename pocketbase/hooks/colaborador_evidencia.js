routerAdd('POST', '/backend/v1/colaborador/atividades/{id}/evidencia', (e) => {
  const id = e.request.pathValue('id')
  const body = e.requestInfo().body || {}
  const token = (body.token || '').trim()
  const consentimento = body.consentimento === true || body.consentimento === 'true'
  const localizacao = body.localizacao || ''
  const observacao = body.observacao || ''

  if (!consentimento) {
    return e.json(400, {
      error: 'Você precisa aceitar os termos da LGPD para enviar a comprovação.',
    })
  }
  if (!token) return e.json(401, { error: 'Token não fornecido.' })

  try {
    const colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
    if (!colab.getBool('token_ativo')) return e.json(401, { error: 'Token inativo.' })

    const ativ = $app.findRecordById('atividades', id)
    if (ativ.getString('colaborador_id') !== colab.id) {
      return e.json(403, { error: 'Acesso negado a esta atividade.' })
    }

    const uploadedFiles = e.findUploadedFiles('foto')
    const evidCol = $app.findCollectionByNameOrId('evidencias')
    const evid = new Record(evidCol)
    evid.set('atividade_id', ativ.id)
    evid.set('colaborador_id', colab.id)
    evid.set('status', 'PENDENTE')
    evid.set('enviada_em', new Date().toISOString())
    if (localizacao) evid.set('localizacao_gps', localizacao)
    if (uploadedFiles && uploadedFiles.length > 0) {
      evid.set('url_foto', uploadedFiles[0])
    }

    $app.save(evid)

    ativ.set('status', 'em_andamento')
    if (observacao) ativ.set('observacao', observacao)
    $app.save(ativ)

    // Notify Gestor
    try {
      const notifCol = $app.findCollectionByNameOrId('notificacoes')
      const notif = new Record(notifCol)
      notif.set('usuario_id', ativ.getString('gestor_id'))
      notif.set(
        'mensagem',
        `Nova foto de comprovação enviada por ${colab.getString('nome')} para '${ativ.getString('titulo')}'.`,
      )
      notif.set('tipo', 'INAPP')
      notif.set('lida', false)
      notif.set('enviada_em', new Date().toISOString())
      $app.save(notif)
    } catch (_) {}

    return e.json(201, { success: true, evidencia: evid })
  } catch (err) {
    return e.json(400, { error: err.message || 'Erro ao enviar evidência.' })
  }
})
