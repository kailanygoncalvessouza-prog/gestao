routerAdd('POST', '/backend/v1/colaborador/atividades/{id}/evidencia', (e) => {
  const id = e.request.pathValue('id')
  const body = e.requestInfo().body || {}
  const token = (body.token || '').trim()
  const consentimento = body.consentimento === true || body.consentimento === 'true'
  const localizacao = body.localizacao || ''
  const observacao = body.observacao || ''

  if (!consentimento) {
    throw new BadRequestError('Você precisa aceitar os termos da LGPD para enviar a comprovação.', {
      consentimento: new ValidationError('required', 'É necessário aceitar os termos da LGPD.'),
    })
  }
  if (!token) {
    throw new UnauthorizedError('Token não fornecido.')
  }

  let colab
  try {
    colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
  } catch (_) {
    throw new UnauthorizedError('Token inválido ou não encontrado.')
  }

  if (!colab.getBool('token_ativo')) {
    throw new UnauthorizedError('Token inativo. Contate seu gestor.')
  }

  let ativ
  try {
    ativ = $app.findRecordById('atividades', id)
  } catch (_) {
    throw new NotFoundError('Atividade não encontrada.')
  }

  if (ativ.getString('empresa_id') !== colab.getString('empresa_id')) {
    throw new ForbiddenError('Acesso negado a esta atividade.')
  }

  const currentStatus = ativ.getString('status')
  if (currentStatus === 'concluida' || currentStatus === 'concluida_com_atraso') {
    throw new BadRequestError('Esta atividade já foi concluída.')
  }
  if (currentStatus === 'em_andamento') {
    throw new BadRequestError('Esta atividade já está em andamento por outro colaborador.')
  }

  let uploadedFiles = []
  try {
    uploadedFiles = e.findUploadedFiles('foto')
  } catch (_) {
    uploadedFiles = []
  }

  if (!uploadedFiles || uploadedFiles.length === 0) {
    throw new BadRequestError('Nenhuma foto foi enviada.', {
      foto: new ValidationError('required', 'A foto é obrigatória para esta atividade.'),
    })
  }

  try {
    const evidCol = $app.findCollectionByNameOrId('evidencias')
    const evid = new Record(evidCol)
    evid.set('atividade_id', ativ.id)
    evid.set('colaborador_id', colab.id)
    evid.set('empresa_id', colab.getString('empresa_id'))
    evid.set('status', 'PENDENTE')
    evid.set('enviada_em', new Date().toISOString())
    if (localizacao) evid.set('localizacao_gps', localizacao)
    evid.set('url_foto', uploadedFiles[0])
    $app.save(evid)

    ativ.set('status', 'em_andamento')
    if (observacao) ativ.set('observacao', observacao)
    $app.save(ativ)

    try {
      const notifCol = $app.findCollectionByNameOrId('notificacoes')
      const notif = new Record(notifCol)
      notif.set('usuario_id', ativ.getString('gestor_id'))
      notif.set(
        'mensagem',
        'Nova foto de comprovação enviada por ' +
          colab.getString('nome') +
          " para '" +
          ativ.getString('titulo') +
          "'.",
      )
      notif.set('tipo', 'INAPP')
      notif.set('lida', false)
      notif.set('enviada_em', new Date().toISOString())
      $app.save(notif)
    } catch (_) {}

    return e.json(201, { success: true, evidencia: evid })
  } catch (err) {
    if (
      err instanceof BadRequestError ||
      err instanceof UnauthorizedError ||
      err instanceof ForbiddenError ||
      err instanceof NotFoundError
    ) {
      throw err
    }
    throw new BadRequestError(err.message || 'Erro ao enviar evidência.')
  }
})
