routerAdd('POST', '/backend/v1/colaborador/checklist/{itemId}/toggle', (e) => {
  const itemId = e.request.pathValue('itemId')
  const body = e.requestInfo().body || {}
  const token = (body.token || '').trim()
  const feito = !!body.feito

  if (!token) return e.json(401, { error: 'Token não fornecido.' })

  try {
    const colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
    if (!colab.getBool('token_ativo')) return e.json(401, { error: 'Token inativo.' })

    const item = $app.findRecordById('itens_checklist', itemId)

    if (item.getString('empresa_id') !== colab.getString('empresa_id')) {
      return e.json(403, { error: 'Acesso negado.' })
    }

    if (feito) {
      item.set('feito', true)
      item.set('marcado_por_id', colab.id)
      item.set('marcado_em', new Date().toISOString())
    } else {
      item.set('feito', false)
      item.set('marcado_por_id', null)
      item.set('marcado_em', null)
    }

    $app.save(item)
    return e.json(200, { item: item })
  } catch (err) {
    return e.json(400, { error: err.message || 'Erro ao atualizar item.' })
  }
})
