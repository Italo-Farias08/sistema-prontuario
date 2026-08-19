function tratadorErros(erro, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(erro);

  const codigoStatus = erro.status || 500;
  const mensagem = erro.status ? erro.message : "Erro interno do servidor.";

  res.status(codigoStatus).json({
    erro: mensagem,
    ...(erro.codigo ? { codigo: erro.codigo } : {}),
    ...(erro.email ? { email: erro.email } : {}),
  });
}

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: "Rota não encontrada." });
}

module.exports = { tratadorErros, rotaNaoEncontrada };
