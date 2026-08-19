const autenticacaoServico = require("../servicos/autenticacaoServico");

async function entrar(req, res, next) {
  try {
    const { perfil, identificador, senha } = req.body;
    const sessao = await autenticacaoServico.autenticar({ perfil, identificador, senha });
    res.json(sessao);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { entrar };
