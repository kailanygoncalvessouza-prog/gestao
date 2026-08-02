routerAdd('POST', '/backend/v1/colaborador/login', (e) => {
  const body = e.requestInfo().body || {}
  const token = (body.token || '').trim()
  if (!token) {
    return e.json(400, { error: 'Informe o código de acesso.' })
  }

  try {
    const colab = $app.findFirstRecordByData('colaboradores', 'token_acesso', token)
    const isAtivo = colab.getBool('token_ativo')
    if (!isAtivo) {
      return e.json(401, { error: 'Código inválido ou desativado. Fale com seu gestor.' })
    }

    const empresa = $app.findRecordById('empresas', colab.getString('empresa_id'))

    return e.json(200, {
      colaborador_id: colab.id,
      nome: colab.getString('nome'),
      funcao: colab.getString('funcao'),
      empresa_id: colab.getString('empresa_id'),
      empresa_nome: empresa ? empresa.getString('nome') : '',
      token: token,
    })
  } catch (_) {
    return e.json(401, { error: 'Código inválido ou desativado. Fale com seu gestor.' })
  }
})
