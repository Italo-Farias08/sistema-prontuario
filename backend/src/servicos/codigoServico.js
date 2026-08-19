const bancoDados = require("../configuracao/bancoDados");

const MINUTOS_EXPIRACAO = 15;
const LIMITE_TENTATIVAS = 5;

function gerarCodigoNumerico() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
}

/**
 * Cria um novo código para (email, tipo), invalidando quaisquer códigos
 * anteriores ainda não usados do mesmo tipo para o mesmo e-mail.
 */
async function criarCodigo(email, tipo) {
  const emailNormalizado = email.trim().toLowerCase();

  await bancoDados.query(
    `UPDATE codigos_verificacao SET usado = true
      WHERE email = $1 AND tipo = $2 AND usado = false`,
    [emailNormalizado, tipo]
  );

  const codigo = gerarCodigoNumerico();

  await bancoDados.query(
    `INSERT INTO codigos_verificacao (email, codigo, tipo, expira_em)
     VALUES ($1, $2, $3, now() + interval '${MINUTOS_EXPIRACAO} minutes')`,
    [emailNormalizado, codigo, tipo]
  );

  return codigo;
}

/**
 * Confere um código informado pelo usuário. Lança erro (com .status)
 * quando o código não existe, expirou, já foi usado ou não confere.
 * Marca o código como usado somente quando a conferência é bem-sucedida.
 */
async function conferirCodigo(email, tipo, codigoInformado) {
  const emailNormalizado = email.trim().toLowerCase();

  const resultado = await bancoDados.query(
    `SELECT * FROM codigos_verificacao
      WHERE email = $1 AND tipo = $2 AND usado = false
      ORDER BY criado_em DESC
      LIMIT 1`,
    [emailNormalizado, tipo]
  );

  const registro = resultado.rows[0];

  if (!registro) {
    const erro = new Error("Código não encontrado. Solicite um novo.");
    erro.status = 400;
    throw erro;
  }

  if (new Date(registro.expira_em).getTime() < Date.now()) {
    const erro = new Error("Código expirado. Solicite um novo.");
    erro.status = 400;
    throw erro;
  }

  if (registro.tentativas >= LIMITE_TENTATIVAS) {
    const erro = new Error("Número de tentativas excedido. Solicite um novo código.");
    erro.status = 429;
    throw erro;
  }

  if (registro.codigo !== String(codigoInformado).trim()) {
    await bancoDados.query(
      "UPDATE codigos_verificacao SET tentativas = tentativas + 1 WHERE id = $1",
      [registro.id]
    );
    const erro = new Error("Código incorreto.");
    erro.status = 400;
    throw erro;
  }

  await bancoDados.query(
    "UPDATE codigos_verificacao SET usado = true WHERE id = $1",
    [registro.id]
  );

  return true;
}

module.exports = { criarCodigo, conferirCodigo };
