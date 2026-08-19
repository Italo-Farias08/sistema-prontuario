import React, { createContext, useContext, useState, useMemo } from "react";
import { encerrarSessao } from "../servicos/dadosServico";

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [sessao, setSession] = useState(null); // { perfil: 'admin' | 'cliente', idCliente? }

  const value = useMemo(
    () => ({
      sessao,
      entrar: (sessionData) => setSession(sessionData),
      sair: () => {
        encerrarSessao();
        setSession(null);
      },
    }),
    [sessao]
  );

  return <ContextoAutenticacao.Provider value={value}>{children}</ContextoAutenticacao.Provider>;
}

export function useAutenticacao() {
  const ctx = useContext(ContextoAutenticacao);
  if (!ctx) throw new Error("useAutenticacao deve ser usado dentro de ProvedorAutenticacao");
  return ctx;
}
