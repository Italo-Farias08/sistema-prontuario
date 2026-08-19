const { verificarToken } = require("../utilitarios/token");

/**
 * Exige um token válido no cabeçalho Authorization: Bearer <token>.
 * Preenche req.sessao com { idUsuario, perfil, idPaciente }.
 */
function exigirAutenticacao(req, res, next) {
  const cabecalho = req.headers.authorization || "";
  const [, token] = cabecalho.split(" ");

  if (!token) {
    return res.status(401).json({ erro: "Token não informado." });
  }

  try {
    req.sessao = verificarToken(token);
    return next();
  } catch (erro) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

/**
 * Exige que a sessão autenticada tenha o perfil "admin".
 */
function exigirPerfilAdmin(req, res, next) {
  if (req.sessao?.perfil !== "admin") {
    return res.status(403).json({ erro: "Acesso restrito ao consultório." });
  }
  return next();
}

module.exports = { exigirAutenticacao, exigirPerfilAdmin };
