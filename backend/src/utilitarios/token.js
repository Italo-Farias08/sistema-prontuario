const jwt = require("jsonwebtoken");
const variaveisAmbiente = require("../configuracao/variaveisAmbiente");

function gerarToken(dadosSessao) {
  // dadosSessao: { idUsuario, perfil, idPaciente? }
  return jwt.sign(dadosSessao, variaveisAmbiente.segredoToken, { expiresIn: "30d" });
}

function verificarToken(token) {
  return jwt.verify(token, variaveisAmbiente.segredoToken);
}

module.exports = { gerarToken, verificarToken };
