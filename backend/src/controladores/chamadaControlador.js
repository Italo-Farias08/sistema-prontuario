const chamadaServico = require("../servicos/chamadaServico");
const { enviarParaPaciente } = require("../websocket");

// POST /api/pacientes/:id/chamada — cria uma sala de vídeo (Daily.co)
// e avisa, em tempo real, quem estiver com a conversa aberta do outro
// lado. Tanto o admin quanto o próprio paciente podem iniciar.
async function iniciar(req, res, next) {
  try {
    const { id } = req.params;

    if (req.sessao.perfil === "cliente" && req.sessao.idPaciente !== id) {
      return res.status(403).json({ erro: "Acesso negado." });
    }

    const sala = await chamadaServico.criarSalaChamada();

    enviarParaPaciente(id, {
      tipo: "chamada",
      url: sala.url,
      expiraEm: sala.expiraEm,
      iniciadaPor: req.sessao.perfil,
    });

    res.json(sala);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { iniciar };
