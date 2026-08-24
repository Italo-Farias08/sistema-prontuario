const express = require("express");
const pacientesControlador = require("../controladores/pacientesControlador");
const mensagensControlador = require("../controladores/mensagensControlador");
const chamadaControlador = require("../controladores/chamadaControlador");
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

// GET /api/pacientes/:id/mensagens — histórico do chat (admin ou o próprio cliente)
rotas.get("/:id/mensagens", mensagensControlador.listar);

// POST /api/pacientes/:id/chamada — cria uma sala de vídeo (admin ou o próprio cliente)
rotas.post("/:id/chamada", chamadaControlador.iniciar);

module.exports = rotas;
