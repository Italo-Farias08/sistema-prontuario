const express = require("express");
const autenticacaoControlador = require("../controladores/autenticacaoControlador");

const rotas = express.Router();

// POST /api/autenticacao/entrar
rotas.post("/entrar", autenticacaoControlador.entrar);

// POST /api/autenticacao/cadastrar — paciente cria a própria conta
rotas.post("/cadastrar", autenticacaoControlador.cadastrar);

// POST /api/autenticacao/verificar-cadastro — confirma o código enviado por e-mail
rotas.post("/verificar-cadastro", autenticacaoControlador.verificarCadastro);

// POST /api/autenticacao/reenviar-codigo — reenvia código de cadastro ou redefinição
rotas.post("/reenviar-codigo", autenticacaoControlador.reenviarCodigo);

// POST /api/autenticacao/esqueci-senha — inicia a redefinição de senha
rotas.post("/esqueci-senha", autenticacaoControlador.esqueciSenha);

// POST /api/autenticacao/redefinir-senha — confirma código + define nova senha
rotas.post("/redefinir-senha", autenticacaoControlador.redefinirSenha);

module.exports = rotas;
