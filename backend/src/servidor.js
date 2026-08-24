const http = require("http");
const app = require("./app");
const variaveisAmbiente = require("./configuracao/variaveisAmbiente");
const { configurarWebSocket } = require("./websocket");

const servidorHttp = http.createServer(app);
configurarWebSocket(servidorHttp);

servidorHttp.listen(variaveisAmbiente.porta, () => {
  console.log(
    `Servidor do prontuário rodando na porta ${variaveisAmbiente.porta} (${variaveisAmbiente.ambiente}) — WebSocket em /ws`
  );
});
