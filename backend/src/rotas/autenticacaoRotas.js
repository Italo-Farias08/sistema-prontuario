const express = require("express");
const autenticacaoControlador = require("../controladores/autenticacaoControlador");

const rotas = express.Router();

// POST /api/autenticacao/entrar
rotas.post("/entrar", autenticacaoControlador.entrar);

module.exports = rotas;
