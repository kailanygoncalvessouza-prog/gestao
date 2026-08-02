onRecordAfterUpdateSuccess((e) => {
  const rec = e.record
  const status = rec.getString('status')
  const origStatus = rec.original().getString('status')

  if (status !== origStatus && (status === 'APROVADA' || status === 'REPROVADA')) {
    try {
      const ativ = $app.findRecordById('atividades', rec.getString('atividade_id'))
      const now = new Date()

      if (status === 'APROVADA') {
        const prazoDateStr = ativ.getString('prazo')
        let finalStatus = 'concluida'
        if (prazoDateStr && new Date() > new Date(prazoDateStr)) {
          finalStatus = 'concluida_com_atraso'
        }
        ativ.set('status', finalStatus)
        ativ.set('concluida_em', now.toISOString())
        ativ.set('concluida_por_id', rec.getString('colaborador_id'))
      } else {
        ativ.set('status', 'pendente')
      }
      $app.save(ativ)

      // Create notification for colaborador
      const notifCol = $app.findCollectionByNameOrId('notificacoes')
      const notif = new Record(notifCol)
      notif.set('colaborador_id', rec.getString('colaborador_id'))
      const msg =
        status === 'APROVADA'
          ? `Sua foto para '${ativ.getString('titulo')}' foi APROVADA!`
          : `Sua foto para '${ativ.getString('titulo')}' foi REPROVADA. Refaça a atividade.`
      notif.set('mensagem', msg)
      notif.set('tipo', 'INAPP')
      notif.set('lida', false)
      notif.set('enviada_em', now.toISOString())
      $app.save(notif)
    } catch (err) {
      console.log('Erro no hook evidencia_aprovacao:', err.message)
    }
  }
  return e.next()
}, 'evidencias')
