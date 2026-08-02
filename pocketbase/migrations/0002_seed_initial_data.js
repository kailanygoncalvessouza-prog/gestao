migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const empresasCol = app.findCollectionByNameOrId('empresas')
    const colabCol = app.findCollectionByNameOrId('colaboradores')
    const ativCol = app.findCollectionByNameOrId('atividades')
    const recCol = app.findCollectionByNameOrId('recorrencias')
    const evidCol = app.findCollectionByNameOrId('evidencias')
    const notifCol = app.findCollectionByNameOrId('notificacoes')

    // 1. Create or get Empresa Demo
    let empresaRec
    try {
      empresaRec = app.findFirstRecordByData('empresas', 'nome', 'Empresa Demo')
    } catch (_) {
      empresaRec = new Record(empresasCol)
      empresaRec.set('nome', 'Empresa Demo')
      app.save(empresaRec)
    }

    // 2. Create or get Gestor user
    let gestorRec
    try {
      gestorRec = app.findAuthRecordByEmail('_pb_users_auth_', 'kailany.goncalvessouza@gmail.com')
      gestorRec.set('perfil', 'GESTOR')
      gestorRec.set('empresa_id', empresaRec.id)
      gestorRec.set('nome', 'Kailany Souza')
      app.save(gestorRec)
    } catch (_) {
      gestorRec = new Record(usersCol)
      gestorRec.setEmail('kailany.goncalvessouza@gmail.com')
      gestorRec.setPassword('Skip@Pass')
      gestorRec.setVerified(true)
      gestorRec.set('perfil', 'GESTOR')
      gestorRec.set('empresa_id', empresaRec.id)
      gestorRec.set('nome', 'Kailany Souza')
      app.save(gestorRec)
    }

    // 3. Seed Colaboradores
    const seedColabs = [
      {
        nome: 'Ana Silva',
        funcao: 'Auxiliar de Limpeza',
        telefone: '(11) 98765-4321',
        token_acesso: 'ABC12345',
      },
      {
        nome: 'Carlos Oliveira',
        funcao: 'Recepcionista',
        telefone: '(11) 97654-3210',
        token_acesso: 'DEF67890',
      },
      {
        nome: 'Mariana Santos',
        funcao: 'Operador de Caixa',
        telefone: '(11) 96543-2109',
        token_acesso: 'GHI11223',
      },
    ]

    const createdColabIds = []
    for (const c of seedColabs) {
      let rec
      try {
        rec = app.findFirstRecordByData('colaboradores', 'token_acesso', c.token_acesso)
      } catch (_) {
        rec = new Record(colabCol)
        rec.set('empresa_id', empresaRec.id)
        rec.set('nome', c.nome)
        rec.set('funcao', c.funcao)
        rec.set('telefone', c.telefone)
        rec.set('token_acesso', c.token_acesso)
        rec.set('token_ativo', true)
        app.save(rec)
      }
      createdColabIds.push(rec.id)
    }

    // 4. Seed Atividades
    const todayStr = new Date().toISOString().split('T')[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const seedAtivs = [
      {
        titulo: 'Limpeza do hall principal',
        descricao: 'Higienizar pisos e superfícies do saguão',
        categoria: 'Limpeza',
        prioridade: 'alta',
        prazo: todayStr,
        horario: '08:00',
        exige_foto: true,
        status: 'concluida',
        colaborador_id: createdColabIds[0],
        observacao: 'Tudo limpo e higienizado.',
      },
      {
        titulo: 'Verificação do estoque de insumos',
        descricao: 'Conferir produtos de limpeza no almoxarifado',
        categoria: 'Estoque',
        prioridade: 'media',
        prazo: todayStr,
        horario: '10:30',
        exige_foto: false,
        status: 'concluida',
        colaborador_id: createdColabIds[0],
      },
      {
        titulo: 'Atendimento de visitantes',
        descricao: 'Registrar entrada e saída de clientes',
        categoria: 'Atendimento',
        prioridade: 'critica',
        prazo: todayStr,
        horario: '09:00',
        exige_foto: false,
        status: 'em_andamento',
        colaborador_id: createdColabIds[1],
      },
      {
        titulo: 'Envio do relatório de recepção',
        descricao: 'Relatório com fluxo de visitantes do dia',
        categoria: 'Relatórios',
        prioridade: 'media',
        prazo: todayStr,
        horario: '17:00',
        exige_foto: true,
        status: 'pendente',
        colaborador_id: createdColabIds[1],
      },
      {
        titulo: 'Abertura de caixa',
        descricao: 'Contagem de troco inicial e conferência do sistema',
        categoria: 'Financeiro',
        prioridade: 'alta',
        prazo: todayStr,
        horario: '08:30',
        exige_foto: false,
        status: 'concluida',
        colaborador_id: createdColabIds[2],
      },
      {
        titulo: 'Fechamento de caixa',
        descricao: 'Conferir sangrias e emitir relatório de vendas',
        categoria: 'Financeiro',
        prioridade: 'critica',
        prazo: tomorrowStr,
        horario: '18:00',
        exige_foto: true,
        status: 'pendente',
        colaborador_id: createdColabIds[2],
      },
    ]

    const createdAtivIds = []
    for (const a of seedAtivs) {
      let rec
      try {
        rec = app.findFirstRecordByData('atividades', 'titulo', a.titulo)
      } catch (_) {
        rec = new Record(ativCol)
        rec.set('empresa_id', empresaRec.id)
        rec.set('gestor_id', gestorRec.id)
        rec.set('colaborador_id', a.colaborador_id)
        rec.set('titulo', a.titulo)
        rec.set('descricao', a.descricao)
        rec.set('categoria', a.categoria)
        rec.set('prioridade', a.prioridade)
        rec.set('prazo', a.prazo)
        rec.set('horario', a.horario)
        rec.set('exige_foto', a.exige_foto)
        rec.set('status', a.status)
        if (a.status === 'concluida') rec.set('concluida_em', new Date().toISOString())
        if (a.observacao) rec.set('observacao', a.observacao)
        app.save(rec)
      }
      createdAtivIds.push(rec.id)
    }

    // 5. Seed Recorrencia
    try {
      app.findFirstRecordByData('recorrencias', 'frequencia', 'DIARIA')
    } catch (_) {
      const rec = new Record(recCol)
      rec.set('atividade_id', createdAtivIds[0])
      rec.set('frequencia', 'DIARIA')
      rec.set('ativa', true)
      app.save(rec)
    }

    // 6. Seed Notificacoes
    const seedNotifs = [
      {
        usuario_id: gestorRec.id,
        mensagem: 'Nova atividade concluída por Ana Silva: Limpeza do hall principal',
        tipo: 'INAPP',
      },
      {
        colaborador_id: createdColabIds[0],
        mensagem: "Sua evidência para 'Limpeza do hall principal' foi aprovada!",
        tipo: 'INAPP',
      },
      {
        colaborador_id: createdColabIds[1],
        mensagem: 'Você possui 1 atividade pendente com prazo para hoje.',
        tipo: 'INAPP',
      },
    ]

    for (const n of seedNotifs) {
      try {
        app.findFirstRecordByData('notificacoes', 'mensagem', n.mensagem)
      } catch (_) {
        const rec = new Record(notifCol)
        if (n.usuario_id) rec.set('usuario_id', n.usuario_id)
        if (n.colaborador_id) rec.set('colaborador_id', n.colaborador_id)
        rec.set('mensagem', n.mensagem)
        rec.set('tipo', n.tipo)
        rec.set('lida', false)
        rec.set('enviada_em', new Date().toISOString())
        app.save(rec)
      }
    }
  },
  (app) => {},
)
