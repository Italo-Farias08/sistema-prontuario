// Camada de acesso a dados. Fala com o backend real (Express + PostgreSQL)
// via fetch. Mantém as mesmas funções e formatos de retorno que as telas
// já usavam quando os dados vinham do mock — nenhuma tela precisou mudar
// a forma como chama este arquivo.

import { URL_BASE_API } from "../configuracao/api";

// Token da sessão atual, guardado em memória (perdido ao reiniciar o app).
let tokenAtual = null;

async function requisicao(caminho, opcoes = {}) {
  const resposta = await fetch(`${URL_BASE_API}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(tokenAtual ? { Authorization: `Bearer ${tokenAtual}` } : {}),
      ...opcoes.headers,
    },
  });

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const erro = new Error(corpo.erro || "Não foi possível completar a operação.");
    erro.codigo = corpo.codigo;
    erro.email = corpo.email;
    throw erro;
  }

  return corpo;
}

export async function autenticar({ perfil, identificador, senha }) {
  const sessao = await requisicao("/autenticacao/entrar", {
    method: "POST",
    body: JSON.stringify({ perfil, identificador, senha }),
  });

  tokenAtual = sessao.token;
  return { perfil: sessao.perfil, idCliente: sessao.idCliente };
}

// ───── Cadastro do próprio paciente + verificação por e-mail ─────

export async function cadastrarCliente(dados) {
  return requisicao("/autenticacao/cadastrar", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function verificarCadastro({ email, codigo }) {
  const sessao = await requisicao("/autenticacao/verificar-cadastro", {
    method: "POST",
    body: JSON.stringify({ email, codigo }),
  });

  tokenAtual = sessao.token;
  return { perfil: sessao.perfil, idCliente: sessao.idCliente };
}

export async function reenviarCodigo({ email, tipo }) {
  return requisicao("/autenticacao/reenviar-codigo", {
    method: "POST",
    body: JSON.stringify({ email, tipo }),
  });
}

// ───── Esqueci minha senha ─────

export async function solicitarRedefinicaoSenha({ identificador }) {
  return requisicao("/autenticacao/esqueci-senha", {
    method: "POST",
    body: JSON.stringify({ identificador }),
  });
}

export async function redefinirSenha({ email, codigo, novaSenha }) {
  return requisicao("/autenticacao/redefinir-senha", {
    method: "POST",
    body: JSON.stringify({ email, codigo, novaSenha }),
  });
}

export async function listarClientes() {
  return requisicao("/pacientes");
}

export async function buscarClientePorId(id) {
  return requisicao(`/pacientes/${id}`);
}

export async function criarCliente(dados) {
  return requisicao("/pacientes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function atualizarCliente(id, alteracoes) {
  return requisicao(`/pacientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(alteracoes),
  });
}

export async function registrarCheckin(id, { humor, sono, energia, apetite }) {
  return requisicao(`/pacientes/${id}/checkins`, {
    method: "POST",
    body: JSON.stringify({ humor, sono, energia, apetite }),
  });
}

export function encerrarSessao() {
  tokenAtual = null;
}
