const bancoDados = require("../configuracao/bancoDados");

function formatarMensagem(linha) {
  return {
    id: linha.id,
    pacienteId: linha.paciente_id,
    remetente: linha.remetente, // "admin" | "cliente"
    texto: linha.texto,
    criadoEm: linha.criado_em, // ISO — o front formata no fuso local
  };
}

async function listarMensagens(idPaciente) {
  const resultado = await bancoDados.query(
    "SELECT * FROM mensagens WHERE paciente_id = $1 ORDER BY criado_em ASC",
    [idPaciente]
  );
  return resultado.rows.map(formatarMensagem);
}

async function criarMensagem(idPaciente, remetente, texto) {
  const resultado = await bancoDados.query(
    "INSERT INTO mensagens (paciente_id, remetente, texto) VALUES ($1, $2, $3) RETURNING *",
    [idPaciente, remetente, texto]
  );
  return formatarMensagem(resultado.rows[0]);
}

module.exports = { listarMensagens, criarMensagem };
