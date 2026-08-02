routerAdd('POST', '/backend/v1/gestor/signup', (e) => {
  const body = e.requestInfo().body || {}
  const email = (body.email || '').trim()
  const password = body.password || ''
  const nome = (body.nome || '').trim()
  const empresaNome = (body.empresa_nome || '').trim()

  if (!email || !password || !nome || !empresaNome) {
    return e.json(400, { error: 'Todos os campos são obrigatórios.' })
  }

  try {
    let empresaRec
    try {
      empresaRec = $app.findFirstRecordByData('empresas', 'nome', empresaNome)
    } catch (_) {
      const empCol = $app.findCollectionByNameOrId('empresas')
      empresaRec = new Record(empCol)
      empresaRec.set('nome', empresaNome)
      $app.save(empresaRec)
    }

    // Check gestores limit (max 2 gestores per empresa)
    const filter = `empresa_id = '${empresaRec.id}' && perfil = 'GESTOR'`
    const gestores = $app.findRecordsByFilter('users', filter, '', 10, 0)
    if (gestores.length >= 2) {
      return e.json(400, { error: 'Limite de 2 gestores por empresa atingido.' })
    }

    const usersCol = $app.findCollectionByNameOrId('_pb_users_auth_')
    const userRec = new Record(usersCol)
    userRec.setEmail(email)
    userRec.setPassword(password)
    userRec.setVerified(true)
    userRec.set('nome', nome)
    userRec.set('perfil', 'GESTOR')
    userRec.set('empresa_id', empresaRec.id)
    $app.save(userRec)

    return e.json(201, { success: true, message: 'Conta criada com sucesso!' })
  } catch (err) {
    return e.json(400, { error: err.message || 'Erro ao criar conta de gestor.' })
  }
})
