const { WebSocketServer } = require("ws");
const { verificarToken } = require("../utilitarios/token");
const mensagensServico = require("../servicos/mensagensServico");

// idPaciente (string) -> Set<ws>
// Tanto o admin (quando está com a conversa daquele paciente aberta)
// quanto o próprio paciente entram nesse mesmo "quarto".
const conexoesPorPaciente = new Map();

function registrarConexao(idPaciente, ws) {
  if (!conexoesPorPaciente.has(idPaciente)) {
    conexoesPorPaciente.set(idPaciente, new Set());
  }
  conexoesPorPaciente.get(idPaciente).add(ws);
}

function removerConexao(idPaciente, ws) {
  const conjunto = conexoesPorPaciente.get(idPaciente);
  if (!conjunto) return;
  conjunto.delete(ws);
  if (conjunto.size === 0) conexoesPorPaciente.delete(idPaciente);
}

/**
 * Envia um payload (chat novo, convite de chamada, etc.) pra todo mundo
 * conectado na conversa daquele paciente. Usado tanto pelo próprio
 * WebSocket (broadcast de mensagem de chat) quanto pelo controlador de
 * chamada de vídeo (avisar o outro lado que uma sala foi criada).
 */
function enviarParaPaciente(idPaciente, payload) {
  const conjunto = conexoesPorPaciente.get(String(idPaciente));
  if (!conjunto) return;
  const texto = JSON.stringify(payload);
  for (const ws of conjunto) {
    if (ws.readyState === ws.OPEN) ws.send(texto);
  }
}

function configurarWebSocket(servidorHttp) {
  const wss = new WebSocketServer({ server: servidorHttp, path: "/ws" });

  wss.on("connection", (ws, req) => {
    let sessao;
    let idPaciente;

    try {
      const url = new URL(req.url, "http://localhost");
      const token = url.searchParams.get("token");
      sessao = verificarToken(token);

      if (sessao.perfil === "cliente") {
        // Paciente só pode entrar na própria conversa, nunca em outra.
        idPaciente = sessao.idPaciente;
      } else if (sessao.perfil === "admin") {
        // Admin escolhe qual conversa está acompanhando no momento.
        idPaciente = url.searchParams.get("pacienteId");
      }

      if (!idPaciente) throw new Error("Paciente não especificado.");
    } catch (erro) {
      ws.close(4001, "Não autorizado");
      return;
    }

    registrarConexao(idPaciente, ws);

    ws.on("message", async (dadosBrutos) => {
      let dados;
      try {
        dados = JSON.parse(dadosBrutos.toString());
      } catch {
        return;
      }

      if (dados.tipo === "mensagem" && typeof dados.texto === "string" && dados.texto.trim()) {
        try {
          const remetente = sessao.perfil === "admin" ? "admin" : "cliente";
          const mensagem = await mensagensServico.criarMensagem(idPaciente, remetente, dados.texto.trim());
          enviarParaPaciente(idPaciente, { tipo: "mensagem", mensagem });
        } catch (erro) {
          ws.send(JSON.stringify({ tipo: "erro", mensagem: "Não foi possível enviar a mensagem." }));
        }
      }
    });

    ws.on("close", () => removerConexao(idPaciente, ws));
    ws.on("error", () => removerConexao(idPaciente, ws));
  });

  return wss;
}

module.exports = { configurarWebSocket, enviarParaPaciente };
