const app = require("./app");
const variaveisAmbiente = require("./configuracao/variaveisAmbiente");

app.listen(variaveisAmbiente.porta, () => {
  console.log(
    `Servidor do prontuário rodando na porta ${variaveisAmbiente.porta} (${variaveisAmbiente.ambiente})`
  );
});
