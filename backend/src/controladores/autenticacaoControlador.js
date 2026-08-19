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

async function cadastrar(req, res, next) {
  try {
    const resultado = await autenticacaoServico.cadastrar(req.body);
    res.status(201).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function verificarCadastro(req, res, next) {
  try {
    const { email, codigo } = req.body;
    const sessao = await autenticacaoServico.verificarCadastro({ email, codigo });
    res.json(sessao);
  } catch (erro) {
    next(erro);
  }
}

async function reenviarCodigo(req, res, next) {
  try {
    const { email, tipo } = req.body;
    const resultado = await autenticacaoServico.reenviarCodigo({ email, tipo });
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function esqueciSenha(req, res, next) {
  try {
    const { identificador } = req.body;
    const resultado = await autenticacaoServico.solicitarRedefinicaoSenha({ identificador });
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function redefinirSenha(req, res, next) {
  try {
    const { email, codigo, novaSenha } = req.body;
    const resultado = await autenticacaoServico.redefinirSenha({ email, codigo, novaSenha });
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { entrar, cadastrar, verificarCadastro, reenviarCodigo, esqueciSenha, redefinirSenha };
