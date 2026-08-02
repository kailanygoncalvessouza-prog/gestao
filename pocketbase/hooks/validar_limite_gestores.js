onRecordValidate((e) => {
  const rec = e.record
  const perfil = rec.getString('perfil')
  const empresaId = rec.getString('empresa_id')

  if (perfil === 'GESTOR' && empresaId) {
    try {
      const filter = `empresa_id = '${empresaId}' && perfil = 'GESTOR' && id != '${rec.id}'`
      const existentes = $app.findRecordsByFilter('users', filter, '', 10, 0)
      if (existentes.length >= 2) {
        throw new BadRequestError('Limite de 2 gestores por empresa atingido.')
      }
    } catch (err) {
      if (err instanceof BadRequestError) throw err
    }
  }
  return e.next()
}, 'users')
