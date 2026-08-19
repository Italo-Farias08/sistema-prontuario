const bancoDados = require("../configuracao/bancoDados");
const { conferirSenha } = require("../utilitarios/senha");
const { gerarToken } = require("../utilitarios/token");

/**
 * Autentica um usuário (admin ou cliente) por e-mail/CPF + senha.
 * Retorna { perfil, idCliente?, token } — mesmo formato que o
 * front-end (dadosServico.js) já espera de `autenticar`.
 */
async function autenticar({ perfil, identificador, senha }) {
  if (!identificador || !senha) {
    const erro = new Error("Informe suas credenciais.");
    erro.status = 400;
    throw erro;
  }

  const resultado = await bancoDados.query(
    `SELECT u.id AS id_usuario, u.perfil, u.senha_hash, u.paciente_id
       FROM usuarios u
       LEFT JOIN pacientes p ON p.id = u.paciente_id
      WHERE u.perfil = $1
        AND (u.email = $2 OR p.cpf = $2)
      LIMIT 1`,
    [perfil, identificador]
  );

  const usuario = resultado.rows[0];
  if (!usuario) {
    const erro = new Error("Credenciais inválidas.");
    erro.status = 401;
    throw erro;
  }

  const senhaConfere = await conferirSenha(senha, usuario.senha_hash);
  if (!senhaConfere) {
    const erro = new Error("Credenciais inválidas.");
    erro.status = 401;
    throw erro;
  }

  const dadosSessao = {
    idUsuario: usuario.id_usuario,
    perfil: usuario.perfil,
    idPaciente: usuario.paciente_id || undefined,
  };

  const token = gerarToken(dadosSessao);

  return {
    perfil: usuario.perfil,
    idCliente: usuario.paciente_id || undefined,
    token,
  };
}

module.exports = { autenticar };
