import * as SecureStore from "expo-secure-store";

const CHAVE_SESSAO = "prontuario.sessao";

export async function salvarSessao(dadosSessao) {
  await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(dadosSessao));
}

export async function obterSessaoSalva() {
  const bruto = await SecureStore.getItemAsync(CHAVE_SESSAO);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto);
  } catch {
    return null;
  }
}

export async function limparSessaoSalva() {
  await SecureStore.deleteItemAsync(CHAVE_SESSAO);
}