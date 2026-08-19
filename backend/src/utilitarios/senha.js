const bcrypt = require("bcryptjs");

const RODADAS_SAL = 10;

async function gerarHash(senhaTextoPuro) {
  return bcrypt.hash(senhaTextoPuro, RODADAS_SAL);
}

async function conferirSenha(senhaTextoPuro, senhaHash) {
  return bcrypt.compare(senhaTextoPuro, senhaHash);
}

module.exports = { gerarHash, conferirSenha };
