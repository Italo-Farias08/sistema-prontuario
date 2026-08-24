const variaveisAmbiente = require("../configuracao/variaveisAmbiente");

/**
 * Cria uma sala de vídeo temporária no Daily.co (expira em 1h, sozinha)
 * pra uma consulta pontual entre o médico e o paciente. Não reutiliza
 * salas — cada chamada ganha um link novo.
 */
async function criarSalaChamada() {
  if (!variaveisAmbiente.daily.apiKey) {
    const erro = new Error(
      "Chamada de vídeo não configurada. Peça para o administrador do sistema definir DAILY_API_KEY."
    );
    erro.status = 500;
    throw erro;
  }

  const resposta = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${variaveisAmbiente.daily.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // expira em 1h
        eject_at_room_exp: true,
        enable_chat: false,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const erro = new Error(dados.error || dados.info || "Não foi possível criar a sala de vídeo.");
    erro.status = 502;
    throw erro;
  }

  return {
    url: dados.url,
    expiraEm: dados.config?.exp ? new Date(dados.config.exp * 1000).toISOString() : null,
  };
}

module.exports = { criarSalaChamada };
