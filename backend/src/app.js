const express = require("express");
const path = require("path");
const cors = require("cors");
const variaveisAmbiente = require("./configuracao/variaveisAmbiente");
const rotas = require("./rotas");
const { tratadorErros, rotaNaoEncontrada } = require("./middlewares/tratadorErros");

const app = express();

app.use(cors({ origin: variaveisAmbiente.origemPermitida }));
app.use(express.json());

// Serve arquivos estáticos (o painel do médico, medico.html, entra aqui) —
// precisa vir ANTES do app.use("/api", rotas) e do rotaNaoEncontrada, senão
// qualquer GET pra /medico.html cai direto no "rota não encontrada" antes
// de o Express sequer checar se existe um arquivo com esse nome na pasta.
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api", rotas);

app.use(rotaNaoEncontrada);
app.use(tratadorErros);

module.exports = app;