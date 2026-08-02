routerAdd('GET', '/backend/v1/colaborador/metricas', (e) => {
  const query = e.requestInfo().query || {}
  const token = (query.token || '').trim()

  if (!token) return e.json(401, { error: 'Token não fornecido.' })

  try {
    const colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
    if (!colab.getBool('token_ativo')) return e.json(401, { error: 'Token inativo.' })

    const filter = `colaborador_id = '${colab.id}'`
    const todas = $app.findRecordsByFilter('atividades', filter, '-prazo', 500, 0)

    const todayStr = new Date().toISOString().split('T')[0]
    let hojeTotal = 0
    let hojeConcluidas = 0
    let totalPendentes = 0
    let totalAtrasadas = 0
    let totalConcluidas = 0
    let totalConcluidasAtraso = 0

    const dailyCounts = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dailyCounts[key] = 0
    }

    for (const a of todas) {
      const st = a.getString('status')
      const prazo = a.getString('prazo').split('T')[0]

      if (st === 'concluida' || st === 'concluida_com_atraso') {
        totalConcluidas++
        if (st === 'concluida_com_atraso') totalConcluidasAtraso++
        if (dailyCounts[prazo] !== undefined) dailyCounts[prazo]++
      } else if (st === 'pendente' || st === 'em_andamento') {
        totalPendentes++
        if (prazo < todayStr) totalAtrasadas++
      }

      if (prazo === todayStr) {
        hojeTotal++
        if (st === 'concluida' || st === 'concluida_com_atraso') hojeConcluidas++
      }
    }

    const cumprimentoHoje = hojeTotal > 0 ? Math.round((hojeConcluidas / hojeTotal) * 100) : 100
    const pontualidadeTotal =
      totalConcluidas > 0
        ? Math.round(((totalConcluidas - totalConcluidasAtraso) / totalConcluidas) * 100)
        : 100

    return e.json(200, {
      cumprimentoHoje,
      pontualidadeTotal,
      totalPendentes,
      totalAtrasadas,
      totalConcluidas,
      dailyCounts,
    })
  } catch (err) {
    return e.json(400, { error: err.message || 'Erro ao obter métricas.' })
  }
})
