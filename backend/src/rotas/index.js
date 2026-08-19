const express = require("express");
const autenticacaoRotas = require("./autenticacaoRotas");
const pacientesRotas = require("./pacientesRotas");

const rotas = express.Router();

rotas.get("/saude", (req, res) => res.json({ status: "ok" }));

rotas.use("/autenticacao", autenticacaoRotas);
rotas.use("/pacientes", pacientesRotas);

module.exports = rotas;
