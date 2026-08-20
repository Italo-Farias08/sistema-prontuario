const bancoDados = require("../configuracao/bancoDados");
const formatarPaciente = require("../utilitarios/formatarPaciente");

function gerarIniciais(nome = "") {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "??";
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

async function buscarMedicacoes(idPaciente) {
  const resultado = await bancoDados.query(
    "SELECT * FROM medicacoes WHERE paciente_id = $1 ORDER BY criado_em ASC",
    [idPaciente]
  );
  return resultado.rows;
}

async function buscarCheckins(idPaciente) {
  const resultado = await bancoDados.query(
    "SELECT * FROM checkins WHERE paciente_id = $1 ORDER BY data ASC",
    [idPaciente]
  );
  return resultado.rows;
}

async function listarPacientes() {
  const resultado = await bancoDados.query(
    "SELECT * FROM pacientes ORDER BY atualizado_em DESC"
  );

  const pacientes = await Promise.all(
    resultado.rows.map(async (linha) => {
      const [medicacoes, checkins] = await Promise.all([
        buscarMedicacoes(linha.id),
        buscarCheckins(linha.id),
      ]);
      return formatarPaciente(linha, medicacoes, checkins);
    })
  );

  return pacientes;
}

async function buscarPacientePorId(id) {
  const resultado = await bancoDados.query("SELECT * FROM pacientes WHERE id = $1", [id]);
  const linha = resultado.rows[0];

  if (!linha) {
    const erro = new Error("Paciente não encontrado.");
    erro.status = 404;
    throw erro;
  }

  const [medicacoes, checkins] = await Promise.all([
    buscarMedicacoes(id),
    buscarCheckins(id),
  ]);

  return formatarPaciente(linha, medicacoes, checkins);
}

async function criarPaciente(dados) {
  const cliente = await bancoDados.connect();
  try {
    await cliente.query("BEGIN");

    const resultado = await cliente.query(
      `INSERT INTO pacientes (
         nome, sexo, data_nascimento, telefone, contato_emergencia, cpf, email, endereco, foto_iniciais,
         comorbidades, alergias, habitos,
         resumo_historia, resultado_exames, plano_terapeutico,
         historia_doenca, sono, apetite, libido, humor, energia, concentracao, funcionalidade,
         uso_substancias, outras_substancias_descricao,
         ideacao_suicida_resposta, ideacao_suicida_observacao,
         heteroagressao_resposta, heteroagressao_funcao,
         sintomas_psicoticos_resposta, sintomas_psicoticos_funcao
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31)
       RETURNING *`,
      [
        dados.nome,
        dados.sexo || null,
        dados.dataNascimento ? converterDataBr(dados.dataNascimento) : null,
        dados.telefone || null,
        dados.contatoEmergencia || null,
        dados.cpf || null,
        dados.email || null,
        dados.endereco || null,
        gerarIniciais(dados.nome),
        dados.admin?.comorbidades || null,
        dados.admin?.alergias || null,
        dados.admin?.habitos || null,
        dados.resumoHistoria || null,
        dados.resultadoExames || null,
        dados.planoTerapeutico || null,
        dados.historiaDoenca || null,
        dados.revisaoSintomas?.sono || null,
        dados.revisaoSintomas?.apetite || null,
        dados.revisaoSintomas?.libido || null,
        dados.revisaoSintomas?.humor || null,
        dados.revisaoSintomas?.energia || null,
        dados.revisaoSintomas?.concentracao || null,
        dados.revisaoSintomas?.funcionalidade || null,
        dados.revisaoSintomas?.substancias?.uso || null,
        dados.revisaoSintomas?.substancias?.outrasDescricao || null,
        dados.riscos?.ideacaoSuicida?.resposta || null,
        dados.riscos?.ideacaoSuicida?.obs || null,
        dados.riscos?.heteroagressao?.resposta || null,
        dados.riscos?.heteroagressao?.funcao || null,
        dados.riscos?.sintomasPsicoticos?.resposta || null,
        dados.riscos?.sintomasPsicoticos?.funcao || null,
      ]
    );

    const paciente = resultado.rows[0];

    for (const medicacao of dados.medicacoes || []) {
      await cliente.query(
        "INSERT INTO medicacoes (paciente_id, nome, dosagem, horario) VALUES ($1, $2, $3, $4)",
        [paciente.id, medicacao.nome, medicacao.dosagem, medicacao.horario]
      );
    }

    await cliente.query("COMMIT");
    return buscarPacientePorId(paciente.id);
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
}

async function atualizarPaciente(id, alteracoes) {
  const cliente = await bancoDados.connect();
  try {
    await cliente.query("BEGIN");

    await cliente.query(
      `UPDATE pacientes SET
         nome = COALESCE($2, nome),
         sexo = COALESCE($3, sexo),
         data_nascimento = COALESCE($4, data_nascimento),
         telefone = COALESCE($5, telefone),
         contato_emergencia = COALESCE($6, contato_emergencia),
         cpf = COALESCE($7, cpf),
         email = COALESCE($8, email),
         endereco = COALESCE($9, endereco),
         comorbidades = COALESCE($10, comorbidades),
         alergias = COALESCE($11, alergias),
         habitos = COALESCE($12, habitos),
         resumo_historia = COALESCE($13, resumo_historia),
         resultado_exames = COALESCE($14, resultado_exames),
         plano_terapeutico = COALESCE($15, plano_terapeutico),
         historia_doenca = COALESCE($16, historia_doenca),
         sono = COALESCE($17, sono),
         apetite = COALESCE($18, apetite),
         libido = COALESCE($19, libido),
         humor = COALESCE($20, humor),
         energia = COALESCE($21, energia),
         concentracao = COALESCE($22, concentracao),
         funcionalidade = COALESCE($23, funcionalidade),
         uso_substancias = COALESCE($24, uso_substancias),
         outras_substancias_descricao = COALESCE($25, outras_substancias_descricao),
         ideacao_suicida_resposta = COALESCE($26, ideacao_suicida_resposta),
         ideacao_suicida_observacao = COALESCE($27, ideacao_suicida_observacao),
         heteroagressao_resposta = COALESCE($28, heteroagressao_resposta),
         heteroagressao_funcao = COALESCE($29, heteroagressao_funcao),
         sintomas_psicoticos_resposta = COALESCE($30, sintomas_psicoticos_resposta),
         sintomas_psicoticos_funcao = COALESCE($31, sintomas_psicoticos_funcao)
       WHERE id = $1`,
      [
        id,
        alteracoes.nome ?? null,
        alteracoes.sexo ?? null,
        alteracoes.dataNascimento ? converterDataBr(alteracoes.dataNascimento) : null,
        alteracoes.telefone ?? null,
        alteracoes.contatoEmergencia ?? null,
        alteracoes.cpf ?? null,
        alteracoes.email ?? null,
        alteracoes.endereco ?? null,
        alteracoes.admin?.comorbidades ?? null,
        alteracoes.admin?.alergias ?? null,
        alteracoes.admin?.habitos ?? null,
        alteracoes.resumoHistoria ?? null,
        alteracoes.resultadoExames ?? null,
        alteracoes.planoTerapeutico ?? null,
        alteracoes.historiaDoenca ?? null,
        alteracoes.revisaoSintomas?.sono ?? null,
        alteracoes.revisaoSintomas?.apetite ?? null,
        alteracoes.revisaoSintomas?.libido ?? null,
        alteracoes.revisaoSintomas?.humor ?? null,
        alteracoes.revisaoSintomas?.energia ?? null,
        alteracoes.revisaoSintomas?.concentracao ?? null,
        alteracoes.revisaoSintomas?.funcionalidade ?? null,
        alteracoes.revisaoSintomas?.substancias?.uso ?? null,
        alteracoes.revisaoSintomas?.substancias?.outrasDescricao ?? null,
        alteracoes.riscos?.ideacaoSuicida?.resposta ?? null,
        alteracoes.riscos?.ideacaoSuicida?.obs ?? null,
        alteracoes.riscos?.heteroagressao?.resposta ?? null,
        alteracoes.riscos?.heteroagressao?.funcao ?? null,
        alteracoes.riscos?.sintomasPsicoticos?.resposta ?? null,
        alteracoes.riscos?.sintomasPsicoticos?.funcao ?? null,
      ]
    );

    if (Array.isArray(alteracoes.medicacoes)) {
      await cliente.query("DELETE FROM medicacoes WHERE paciente_id = $1", [id]);
      for (const medicacao of alteracoes.medicacoes) {
        await cliente.query(
          "INSERT INTO medicacoes (paciente_id, nome, dosagem, horario) VALUES ($1, $2, $3, $4)",
          [id, medicacao.nome, medicacao.dosagem, medicacao.horario]
        );
      }
    }

    await cliente.query("COMMIT");
    return buscarPacientePorId(id);
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
}

/**
 * Registra (ou completa) o check-in do paciente NO DIA DE HOJE.
 * Como o app agora manda o check-in em duas etapas — o toque rápido
 * de humor e, depois, os sliders de ansiedade/humor/energia — usamos
 * UPSERT por (paciente_id, data): a segunda chamada do dia atualiza
 * a mesma linha em vez de criar outra, e cada campo só é sobrescrito
 * quando vem um valor novo (COALESCE mantém o que já estava salvo).
 */
async function registrarCheckin(idPaciente, { humor, sono, energia, apetite, ansiedade }) {
  await bancoDados.query(
    `INSERT INTO checkins (paciente_id, data, humor, sono, energia, apetite, ansiedade)
     VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6)
     ON CONFLICT (paciente_id, data) DO UPDATE SET
       humor = COALESCE(EXCLUDED.humor, checkins.humor),
       sono = COALESCE(EXCLUDED.sono, checkins.sono),
       energia = COALESCE(EXCLUDED.energia, checkins.energia),
       apetite = COALESCE(EXCLUDED.apetite, checkins.apetite),
       ansiedade = COALESCE(EXCLUDED.ansiedade, checkins.ansiedade)`,
    [idPaciente, humor ?? null, sono ?? null, energia ?? null, apetite ?? null, ansiedade ?? null]
  );
  return buscarPacientePorId(idPaciente);
}

function converterDataBr(dataBr) {
  // "dd/mm/aaaa" -> "aaaa-mm-dd" (formato aceito pelo Postgres)
  const [dia, mes, ano] = dataBr.split("/");
  if (!dia || !mes || !ano) return null;
  return `${ano}-${mes}-${dia}`;
}

module.exports = {
  listarPacientes,
  buscarPacientePorId,
  criarPaciente,
  atualizarPaciente,
  registrarCheckin,
};