import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProvedorAutenticacao } from "./src/contexto/ContextoAutenticacao";
import NavegadorPrincipal from "./src/navegacao/NavegadorPrincipal";

// TODO fontes: quando adicionar Argue e Caviar Dreams (ver assets/fontes/LEIAME.md),
// carregue-as aqui com o hook `useFonts` do pacote `expo-font` e só renderize
// o app depois que `fontsLoaded` for true.

export default function App() {
  return (
    <SafeAreaProvider>
      <ProvedorAutenticacao>
        <NavegadorPrincipal />
      </ProvedorAutenticacao>
    </SafeAreaProvider>
  );
}
