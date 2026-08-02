routerAdd('GET', '/backend/v1/colaborador/agenda', (e) => {
  const query = e.requestInfo().query || {}
  const token = (query.token || '').trim()
  const data = query.data || new Date().toISOString().split('T')[0]
  const tipo = (query.tipo || 'GERAL').toUpperCase()

  if (!token) {
    return e.json(401, { error: 'Token não fornecido.' })
  }

  try {
    const colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
    if (!colab.getBool('token_ativo')) {
      return e.json(401, { error: 'Token inativo.' })
    }

    const empresaId = colab.getString('empresa_id')
    let filter = ''

    if (tipo === 'GERAL') {
      filter =
        "empresa_id = '" + empresaId + "' && atribuicao = 'QUALQUER_UM' && prazo ~ '" + data + "'"
    } else if (tipo === 'SETOR') {
      const setorId = colab.getString('setor_id')
      if (!setorId) return e.json(200, { atividades: [] })
      filter =
        "empresa_id = '" +
        empresaId +
        "' && atribuicao = 'SETOR' && setor_alvo_id = '" +
        setorId +
        "' && prazo ~ '" +
        data +
        "'"
    } else if (tipo === 'INDIVIDUAL') {
      filter =
        "empresa_id = '" +
        empresaId +
        "' && atribuicao = 'COLABORADOR' && colaborador_alvo_id = '" +
        colab.id +
        "' && prazo ~ '" +
        data +
        "'"
    } else {
      return e.json(400, { error: 'Tipo inválido.' })
    }

    const atividades = $app.findRecordsByFilter('atividades', filter, 'horario', 100, 0)
    return e.json(200, { atividades: atividades })
  } catch (err) {
    return e.json(400, { error: err.message || 'Erro ao carregar agenda.' })
  }
})
