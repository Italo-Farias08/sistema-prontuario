const pacientesServico = require("../servicos/pacientesServico");

async function listar(req, res, next) {
  try {
    const pacientes = await pacientesServico.listarPacientes();
    res.json(pacientes);
  } catch (erro) {
    next(erro);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;

    // Um usuário com perfil "cliente" só pode ver o próprio prontuário.
    if (req.sessao.perfil === "cliente" && req.sessao.idPaciente !== id) {
      return res.status(403).json({ erro: "Acesso não permitido." });
    }

    const paciente = await pacientesServico.buscarPacientePorId(id);
    res.json(paciente);
  } catch (erro) {
    next(erro);
  }
}

async function criar(req, res, next) {
  try {
    const paciente = await pacientesServico.criarPaciente(req.body);
    res.status(201).json(paciente);
  } catch (erro) {
    next(erro);
  }
}

async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const paciente = await pacientesServico.atualizarPaciente(id, req.body);
    res.json(paciente);
  } catch (erro) {
    next(erro);
  }
}

async function registrarCheckin(req, res, next) {
  try {
    const { id } = req.params;

    if (req.sessao.perfil === "cliente" && req.sessao.idPaciente !== id) {
      return res.status(403).json({ erro: "Acesso não permitido." });
    }

    const paciente = await pacientesServico.registrarCheckin(id, req.body);
    res.status(201).json(paciente);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, registrarCheckin };
