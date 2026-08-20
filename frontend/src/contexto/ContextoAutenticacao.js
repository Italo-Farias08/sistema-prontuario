import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { encerrarSessao, definirToken, registrarAoSessaoExpirar } from "../servicos/dadosServico";
import { salvarSessao, obterSessaoSalva, limparSessaoSalva } from "../servicos/armazenamentoSeguro";
import { tokenExpirado } from "../utilitarios/token";

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [sessao, setSession] = useState(null);
  const [restaurandoSessao, setRestaurandoSessao] = useState(true);

  useEffect(() => {
    (async () => {
      const salva = await obterSessaoSalva();

      if (salva?.token && !tokenExpirado(salva.token)) {
        definirToken(salva.token);
        setSession({ perfil: salva.perfil, idCliente: salva.idCliente });
      } else if (salva) {
        await limparSessaoSalva();
      }

      setRestaurandoSessao(false);
    })();
  }, []);

  useEffect(() => {
    registrarAoSessaoExpirar(() => {
      limparSessaoSalva();
      setSession(null);
    });
  }, []);

  const value = useMemo(
    () => ({
      sessao,
      restaurandoSessao,
      entrar: (sessionData) => {
        definirToken(sessionData.token);
        salvarSessao(sessionData);
        setSession({ perfil: sessionData.perfil, idCliente: sessionData.idCliente });
      },
      sair: () => {
        encerrarSessao();
        limparSessaoSalva();
        setSession(null);
      },
    }),
    [sessao, restaurandoSessao]
  );

  return <ContextoAutenticacao.Provider value={value}>{children}</ContextoAutenticacao.Provider>;
}

export function useAutenticacao() {
  const ctx = useContext(ContextoAutenticacao);
  if (!ctx) throw new Error("useAutenticacao deve ser usado dentro de ProvedorAutenticacao");
  return ctx;
}