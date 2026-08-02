routerAdd('POST', '/backend/v1/gestor/signup', (e) => {
  const body = e.requestInfo().body || {}
  const email = (body.email || '').trim()
  const password = body.password || ''
  const nome = (body.nome || '').trim()
  const empresaNome = (body.empresa_nome || '').trim()

  const fieldErrors = {}

  if (!nome) {
    fieldErrors.nome = { message: 'Nome é obrigatório.' }
  }
  if (!empresaNome) {
    fieldErrors.empresa_nome = { message: 'Nome da empresa é obrigatório.' }
  }
  if (!email) {
    fieldErrors.email = { message: 'E-mail é obrigatório.' }
  }
  if (!password) {
    fieldErrors.password = { message: 'Senha é obrigatória.' }
  } else if (password.length < 8) {
    fieldErrors.password = { message: 'A senha deve ter no mínimo 8 caracteres.' }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return e.json(400, { data: fieldErrors })
  }

  try {
    try {
      $app.findAuthRecordByEmail('_pb_users_auth_', email)
      return e.json(400, {
        data: {
          email: { message: 'Este e-mail já está cadastrado. Faça login ou utilize outro e-mail.' },
        },
      })
    } catch (_) {}

    let empresaRec
    try {
      empresaRec = $app.findFirstRecordByData('empresas', 'nome', empresaNome)
    } catch (_) {
      const empCol = $app.findCollectionByNameOrId('empresas')
      empresaRec = new Record(empCol)
      empresaRec.set('nome', empresaNome)
      $app.save(empresaRec)
    }

    const filter = `empresa_id = '${empresaRec.id}' && perfil = 'GESTOR'`
    const gestores = $app.findRecordsByFilter('users', filter, '', 10, 0)
    if (gestores.length >= 2) {
      return e.json(400, {
        data: { empresa_nome: { message: 'Limite de 2 gestores por empresa atingido.' } },
      })
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
    const errStr = String((err && err.message) || err || '')
    if (
      errStr.toLowerCase().includes('unique') ||
      errStr.toLowerCase().includes('already') ||
      errStr.toLowerCase().includes('duplicate')
    ) {
      return e.json(400, {
        data: {
          email: { message: 'Este e-mail já está cadastrado. Faça login ou utilize outro e-mail.' },
        },
      })
    }
    return e.json(400, { message: 'Erro ao criar conta. Tente novamente.' })
  }
})
