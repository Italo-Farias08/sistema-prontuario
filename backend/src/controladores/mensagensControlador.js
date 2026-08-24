const mensagensServico = require("../servicos/mensagensServico");

// GET /api/pacientes/:id/mensagens — histórico da conversa.
// Admin vê a conversa de qualquer paciente; o cliente só a própria.
async function listar(req, res, next) {
  try {
    const { id } = req.params;

    if (req.sessao.perfil === "cliente" && req.sessao.idPaciente !== id) {
      return res.status(403).json({ erro: "Acesso negado." });
    }

    const mensagens = await mensagensServico.listarMensagens(id);
    res.json(mensagens);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar };
