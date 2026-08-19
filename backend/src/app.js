const express = require("express");
const cors = require("cors");
const variaveisAmbiente = require("./configuracao/variaveisAmbiente");
const rotas = require("./rotas");
const { tratadorErros, rotaNaoEncontrada } = require("./middlewares/tratadorErros");

const app = express();

app.use(cors({ origin: variaveisAmbiente.origemPermitida }));
app.use(express.json());

app.use("/api", rotas);

app.use(rotaNaoEncontrada);
app.use(tratadorErros);

module.exports = app;
