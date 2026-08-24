const bancoDados = require("../configuracao/bancoDados");
const { conferirSenha, gerarHash } = require("../utilitarios/senha");
const { gerarToken } = require("../utilitarios/token");
const codigoServico = require("./codigoServico");
const emailServico = require("./emailServico");

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

  // Mesma normalização usada em cadastrar(): sem isso, um e-mail com
  // espaço ou maiúscula (comum em autocapitalize de teclado mobile)
  // não bate com o que está salvo no banco e o login falha mesmo com
  // a senha correta. O CPF também é comparado sem máscara.
  const identificadorNormalizado = identificador.trim().toLowerCase();
  const somenteDigitos = identificadorNormalizado.replace(/\D/g, "");

  const resultado = await bancoDados.query(
    `SELECT u.id AS id_usuario, u.perfil, u.senha_hash, u.paciente_id, u.email, u.email_verificado
       FROM usuarios u
       LEFT JOIN pacientes p ON p.id = u.paciente_id
      WHERE u.perfil = $1
        AND (u.email = $2 OR (p.cpf IS NOT NULL AND regexp_replace(p.cpf, '\\D', '', 'g') = $3))
      LIMIT 1`,
    [perfil, identificadorNormalizado, somenteDigitos]
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

  if (!usuario.email_verificado) {
    const erro = new Error("Confirme seu e-mail para entrar. Enviamos um código de verificação.");
    erro.status = 403;
    erro.codigo = "EMAIL_NAO_VERIFICADO";
    erro.email = usuario.email;
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

/**
 * Cadastro de um novo paciente (perfil "cliente") feito pelo próprio
 * paciente. Cria o registro em `pacientes` e o login em `usuarios`
 * (ainda com email_verificado = false) e dispara o código de
 * confirmação por e-mail. O login só é liberado após verificarCadastro.
 */
async function cadastrar(dados) {
  const { nome, sexo, dataNascimento, telefone, contatoEmergencia, cpf, email, endereco, senha } = dados;

  if (!nome || !email || !senha) {
    const erro = new Error("Nome, e-mail e senha são obrigatórios.");
    erro.status = 400;
    throw erro;
  }

  if (senha.length < 6) {
    const erro = new Error("A senha deve ter pelo menos 6 caracteres.");
    erro.status = 400;
    throw erro;
  }

  const emailNormalizado = email.trim().toLowerCase();

  const jaExiste = await bancoDados.query(
    `SELECT 1 FROM usuarios WHERE email = $1
     UNION ALL
     SELECT 1 FROM pacientes WHERE email = $1 OR (cpf IS NOT NULL AND cpf = $2)
     LIMIT 1`,
    [emailNormalizado, cpf || null]
  );

  if (jaExiste.rows.length > 0) {
    const erro = new Error("Já existe um cadastro com esse e-mail ou CPF.");
    erro.status = 409;
    throw erro;
  }

  const cliente = await bancoDados.connect();
  try {
    await cliente.query("BEGIN");

    const resultadoPaciente = await cliente.query(
      `INSERT INTO pacientes (nome, sexo, data_nascimento, telefone, contato_emergencia, cpf, email, endereco, foto_iniciais)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        nome,
        sexo || null,
        dataNascimento ? converterDataBr(dataNascimento) : null,
        telefone || null,
        contatoEmergencia || null,
        cpf || null,
        emailNormalizado,
        endereco || null,
        gerarIniciais(nome),
      ]
    );

    const idPaciente = resultadoPaciente.rows[0].id;
    const senhaHash = await gerarHash(senha);

    await cliente.query(
      `INSERT INTO usuarios (perfil, email, senha_hash, paciente_id, email_verificado)
       VALUES ('cliente', $1, $2, $3, false)`,
      [emailNormalizado, senhaHash, idPaciente]
    );

    await cliente.query("COMMIT");
  } catch (erro) {
    await cliente.query("ROLLBACK");
    if (erro.code === "23505") {
      const erroAmigavel = new Error("Já existe um cadastro com esse e-mail ou CPF.");
      erroAmigavel.status = 409;
      throw erroAmigavel;
    }
    throw erro;
  } finally {
    cliente.release();
  }

  const codigo = await codigoServico.criarCodigo(emailNormalizado, "cadastro");
  await emailServico.enviarCodigoPorEmail({
    paraEmail: emailNormalizado,
    paraNome: nome,
    codigo,
    tipo: "cadastro",
  });

  return { email: emailNormalizado };
}

/**
 * Confirma o código de cadastro enviado por e-mail. Se válido, marca
 * o usuário como verificado e já devolve uma sessão (token) para que
 * o app entre direto, sem precisar de um segundo login.
 */
async function verificarCadastro({ email, codigo }) {
  if (!email || !codigo) {
    const erro = new Error("Informe o e-mail e o código.");
    erro.status = 400;
    throw erro;
  }

  const emailNormalizado = email.trim().toLowerCase();
  await codigoServico.conferirCodigo(emailNormalizado, "cadastro", codigo);

  const resultado = await bancoDados.query(
    `UPDATE usuarios SET email_verificado = true
      WHERE email = $1 AND perfil = 'cliente'
      RETURNING id AS id_usuario, perfil, paciente_id`,
    [emailNormalizado]
  );

  const usuario = resultado.rows[0];
  if (!usuario) {
    const erro = new Error("Usuário não encontrado.");
    erro.status = 404;
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

/**
 * Reenvia o código de verificação (cadastro ou redefinição de senha)
 * para um e-mail que já tem um usuário associado.
 */
async function reenviarCodigo({ email, tipo }) {
  if (!email || !["cadastro", "redefinir_senha"].includes(tipo)) {
    const erro = new Error("Dados inválidos para reenvio de código.");
    erro.status = 400;
    throw erro;
  }

  const emailNormalizado = email.trim().toLowerCase();

  const resultado = await bancoDados.query(
    "SELECT paciente_id, perfil FROM usuarios WHERE email = $1",
    [emailNormalizado]
  );

  // Não revela se o e-mail existe ou não — sempre responde "ok".
  if (resultado.rows[0]) {
    const nome = await buscarNomeParaEmail(emailNormalizado, resultado.rows[0]);
    const codigo = await codigoServico.criarCodigo(emailNormalizado, tipo);
    await emailServico.enviarCodigoPorEmail({ paraEmail: emailNormalizado, paraNome: nome, codigo, tipo });
  }

  return { mensagem: "Se o e-mail existir, um novo código foi enviado." };
}

/**
 * Início do fluxo de "esqueci minha senha": aceita e-mail ou CPF,
 * localiza o e-mail de contato do usuário e envia o código. Resposta
 * genérica para não revelar se o identificador existe na base.
 */
async function solicitarRedefinicaoSenha({ identificador }) {
  if (!identificador) {
    const erro = new Error("Informe seu e-mail ou CPF.");
    erro.status = 400;
    throw erro;
  }

  const identificadorNormalizado = identificador.trim().toLowerCase();
  const somenteDigitos = identificadorNormalizado.replace(/\D/g, "");

  const resultado = await bancoDados.query(
    `SELECT u.email, u.paciente_id, u.perfil
       FROM usuarios u
       LEFT JOIN pacientes p ON p.id = u.paciente_id
      WHERE u.email = $1 OR (p.cpf IS NOT NULL AND regexp_replace(p.cpf, '\\D', '', 'g') = $2)
      LIMIT 1`,
    [identificadorNormalizado, somenteDigitos]
  );

  const usuario = resultado.rows[0];

  if (usuario) {
    const nome = await buscarNomeParaEmail(usuario.email, usuario);
    const codigo = await codigoServico.criarCodigo(usuario.email, "redefinir_senha");
    await emailServico.enviarCodigoPorEmail({
      paraEmail: usuario.email,
      paraNome: nome,
      codigo,
      tipo: "redefinir_senha",
    });
  }

  return {
    mensagem: "Se o e-mail/CPF existir na nossa base, enviamos um código para o e-mail cadastrado.",
    email: usuario ? mascararEmail(usuario.email) : undefined,
  };
}

/**
 * Conclui a redefinição de senha: confere o código e grava a nova senha.
 */
async function redefinirSenha({ email, codigo, novaSenha }) {
  if (!email || !codigo || !novaSenha) {
    const erro = new Error("Informe o e-mail, o código e a nova senha.");
    erro.status = 400;
    throw erro;
  }

  if (novaSenha.length < 6) {
    const erro = new Error("A nova senha deve ter pelo menos 6 caracteres.");
    erro.status = 400;
    throw erro;
  }

  const emailNormalizado = email.trim().toLowerCase();
  await codigoServico.conferirCodigo(emailNormalizado, "redefinir_senha", codigo);

  const novaSenhaHash = await gerarHash(novaSenha);
  const resultado = await bancoDados.query(
    "UPDATE usuarios SET senha_hash = $2 WHERE email = $1 RETURNING id",
    [emailNormalizado, novaSenhaHash]
  );

  if (resultado.rows.length === 0) {
    const erro = new Error("Usuário não encontrado.");
    erro.status = 404;
    throw erro;
  }

  return { mensagem: "Senha redefinida com sucesso." };
}

async function buscarNomeParaEmail(email, usuarioLinha) {
  if (usuarioLinha.perfil !== "cliente" || !usuarioLinha.paciente_id) return undefined;
  const resultado = await bancoDados.query("SELECT nome FROM pacientes WHERE id = $1", [
    usuarioLinha.paciente_id,
  ]);
  return resultado.rows[0]?.nome;
}

function mascararEmail(email) {
  const [usuario, dominio] = email.split("@");
  if (!dominio) return email;
  const visivel = usuario.slice(0, 2);
  return `${visivel}${"*".repeat(Math.max(usuario.length - 2, 1))}@${dominio}`;
}

function gerarIniciais(nome = "") {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "??";
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function converterDataBr(dataBr) {
  const [dia, mes, ano] = dataBr.split("/");
  if (!dia || !mes || !ano) return null;
  return `${ano}-${mes}-${dia}`;
}

module.exports = {
  autenticar,
  cadastrar,
  verificarCadastro,
  reenviarCodigo,
  solicitarRedefinicaoSenha,
  redefinirSenha,
};