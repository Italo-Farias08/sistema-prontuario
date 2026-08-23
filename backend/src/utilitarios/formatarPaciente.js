function formatarData(data) {
  if (!data) return "";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/**
 * Recebe a linha da tabela `pacientes`, mais os arrays de medicações e
 * check-ins já carregados, e devolve o objeto no mesmo formato que o
 * front-end já consome (mesmo "shape" de src/dados/dadosMock.js).
 */
function formatarPaciente(linhaPaciente, medicacoes = [], checkins = [], consultas = []) {
  return {
    id: linhaPaciente.id,

    nome: linhaPaciente.nome,
    sexo: linhaPaciente.sexo,
    dataNascimento: formatarData(linhaPaciente.data_nascimento),
    telefone: linhaPaciente.telefone,
    contatoEmergencia: linhaPaciente.contato_emergencia,
    cpf: linhaPaciente.cpf,
    email: linhaPaciente.email,
    endereco: linhaPaciente.endereco,
    fotoIniciais: linhaPaciente.foto_iniciais,

    admin: {
      comorbidades: linhaPaciente.comorbidades,
      alergias: linhaPaciente.alergias,
      habitos: linhaPaciente.habitos,
    },

    resumoHistoria: linhaPaciente.resumo_historia,
    resultadoExames: linhaPaciente.resultado_exames,
    planoTerapeutico: linhaPaciente.plano_terapeutico,

    medicacoes: medicacoes.map((m) => ({
      id: m.id,
      nome: m.nome,
      dosagem: m.dosagem,
      horario: m.horario,
    })),

    historiaDoenca: linhaPaciente.historia_doenca,
    revisaoSintomas: {
      sono: linhaPaciente.sono,
      apetite: linhaPaciente.apetite,
      libido: linhaPaciente.libido,
      humor: linhaPaciente.humor,
      energia: linhaPaciente.energia,
      concentracao: linhaPaciente.concentracao,
      funcionalidade: linhaPaciente.funcionalidade,
      substancias: {
        uso: linhaPaciente.uso_substancias,
        outrasDescricao: linhaPaciente.outras_substancias_descricao,
      },
    },
    riscos: {
      ideacaoSuicida: {
        resposta: linhaPaciente.ideacao_suicida_resposta,
        obs: linhaPaciente.ideacao_suicida_observacao,
      },
      heteroagressao: {
        resposta: linhaPaciente.heteroagressao_resposta,
        funcao: linhaPaciente.heteroagressao_funcao,
      },
      sintomasPsicoticos: {
        resposta: linhaPaciente.sintomas_psicoticos_resposta,
        funcao: linhaPaciente.sintomas_psicoticos_funcao,
      },
    },

    exameMental: {
      aparencia: linhaPaciente.exame_aparencia,
      atitude: linhaPaciente.exame_atitude,
      consciencia: linhaPaciente.exame_consciencia,
      orientacao: linhaPaciente.exame_orientacao || [],
      atencao: linhaPaciente.exame_atencao,
      memoria: linhaPaciente.exame_memoria,
      fala: linhaPaciente.exame_fala,
      psicomotricidade: linhaPaciente.exame_psicomotricidade,
      humor: linhaPaciente.exame_humor,
      afeto: linhaPaciente.exame_afeto,
      pensamentoCurso: linhaPaciente.exame_pensamento_curso,
      pensamentoConteudo: linhaPaciente.exame_pensamento_conteudo,
      percepcao: linhaPaciente.exame_percepcao,
      percepcaoQuais: linhaPaciente.exame_percepcao_quais,
      critica: linhaPaciente.exame_critica,
    },

    checkins: checkins.map((c) => ({
      data: formatarData(c.data).slice(0, 5), // "dd/mm"
      sono: c.sono,
      apetite: c.apetite,
      humor: c.humor,
      energia: c.energia,
      ansiedade: c.ansiedade,
    })),

    // Histórico de consultas (uma "fotografia" clínica por visita, mais
    // recente primeiro) — usado para comparar a evolução do paciente.
    consultas: consultas.map((c) => ({
      id: c.id,
      data: formatarData(c.data),
      historiaDoenca: c.historia_doenca,
      planoTerapeutico: c.plano_terapeutico,
      revisaoSintomas: {
        sono: c.sono,
        apetite: c.apetite,
        libido: c.libido,
        humor: c.humor,
        energia: c.energia,
        concentracao: c.concentracao,
        funcionalidade: c.funcionalidade,
        substancias: {
          uso: c.uso_substancias,
          outrasDescricao: c.outras_substancias_descricao,
        },
      },
      riscos: {
        ideacaoSuicida: { resposta: c.ideacao_suicida_resposta, obs: c.ideacao_suicida_observacao },
        heteroagressao: { resposta: c.heteroagressao_resposta, funcao: c.heteroagressao_funcao },
        sintomasPsicoticos: { resposta: c.sintomas_psicoticos_resposta, funcao: c.sintomas_psicoticos_funcao },
      },
      exameMental: {
        aparencia: c.exame_aparencia,
        atitude: c.exame_atitude,
        consciencia: c.exame_consciencia,
        orientacao: c.exame_orientacao || [],
        atencao: c.exame_atencao,
        memoria: c.exame_memoria,
        fala: c.exame_fala,
        psicomotricidade: c.exame_psicomotricidade,
        humor: c.exame_humor,
        afeto: c.exame_afeto,
        pensamentoCurso: c.exame_pensamento_curso,
        pensamentoConteudo: c.exame_pensamento_conteudo,
        percepcao: c.exame_percepcao,
        percepcaoQuais: c.exame_percepcao_quais,
        critica: c.exame_critica,
      },
    })),

    atualizadoEm: formatarData(linhaPaciente.atualizado_em),
  };
}

module.exports = formatarPaciente;