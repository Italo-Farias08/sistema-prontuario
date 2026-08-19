const express = require("express");
const pacientesControlador = require("../controladores/pacientesControlador");
const { exigirAutenticacao, exigirPerfilAdmin } = require("../middlewares/autenticacao");

const rotas = express.Router();

rotas.use(exigirAutenticacao);

// GET /api/pacientes — apenas o consultório vê a lista completa
rotas.get("/", exigirPerfilAdmin, pacientesControlador.listar);

// POST /api/pacientes — cadastro de novo paciente pelo consultório
rotas.post("/", exigirPerfilAdmin, pacientesControlador.criar);

// GET /api/pacientes/:id — admin vê qualquer um; cliente só o próprio
rotas.get("/:id", pacientesControlador.buscarPorId);

// PUT /api/pacientes/:id — apenas o consultório edita o prontuário
rotas.put("/:id", exigirPerfilAdmin, pacientesControlador.atualizar);

// POST /api/pacientes/:id/checkins — o próprio paciente registra o check-in
rotas.post("/:id/checkins", pacientesControlador.registrarCheckin);

module.exports = rotas;
