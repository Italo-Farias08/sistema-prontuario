import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { cores, fontes } from "../tema/tema";
import { useAutenticacao } from "../contexto/ContextoAutenticacao";

import TelaLogin from "../telas/TelaLogin";
import TelaCadastro from "../telas/TelaCadastro";
import TelaVerificarCodigo from "../telas/TelaVerificarCodigo";
import TelaEsqueciSenha from "../telas/TelaEsqueciSenha";
import TelaRedefinirSenha from "../telas/TelaRedefinirSenha";

import TelaInicioAdmin from "../telas/admin/TelaInicioAdmin";
import TelaCadastroCliente from "../telas/admin/TelaCadastroCliente";
import TelaProntuario from "../telas/admin/TelaProntuario";

import TelaInicioCliente from "../telas/cliente/TelaInicioCliente";
import TelaInfoMedicaCliente from "../telas/cliente/TelaInfoMedicaCliente";
import TelaMeusDadosCliente from "../telas/cliente/TelaMeusDadosCliente";
import TelaChatCliente from "../telas/cliente/TelaChatCliente";
import TelaChamadaVideoCliente from "../telas/cliente/TelaChamadaVideoCliente";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: cores.fundo },
  headerShadowVisible: false,
  headerTintColor: cores.textoEscuro,
  headerTitleStyle: {
    fontFamily: fontes.textoMedio,
    fontSize: 16,
  },
  headerBackTitleVisible: false,
  contentStyle: {
    backgroundColor: cores.fundo,
  },
};

export default function NavegadorPrincipal() {
  const { sessao, restaurandoSessao } = useAutenticacao();

  if (restaurandoSessao) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: cores.fundo,
        }}
      >
        <ActivityIndicator
          size="large"
          color={cores.destaque}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>

        {!sessao ? (
          <>
            <Stack.Screen
              name="Login"
              component={TelaLogin}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Cadastro"
              component={TelaCadastro}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="VerificarCadastro"
              component={TelaVerificarCodigo}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="EsqueciSenha"
              component={TelaEsqueciSenha}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="RedefinirSenha"
              component={TelaRedefinirSenha}
              options={{ headerShown: false }}
            />
          </>

        ) : sessao.perfil === "admin" ? (
          <>
            <Stack.Screen
              name="InicioAdmin"
              component={TelaInicioAdmin}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="CadastroCliente"
              component={TelaCadastroCliente}
              options={{ title: "Novo paciente" }}
            />

            <Stack.Screen
              name="Prontuario"
              component={TelaProntuario}
              options={{ title: "Prontuário" }}
            />
          </>

        ) : (
          <>
            <Stack.Screen
              name="ResumoCliente"
              component={TelaInicioCliente}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="InfoMedicaCliente"
              component={TelaInfoMedicaCliente}
              options={{ title: "Informações médicas" }}
            />

            <Stack.Screen
              name="MeusDadosCliente"
              component={TelaMeusDadosCliente}
              options={{ title: "Meus dados" }}
            />

            <Stack.Screen
              name="ChatCliente"
              component={TelaChatCliente}
              options={{ title: "Chat" }}
            />

            <Stack.Screen
              name="ChamadaVideoCliente"
              component={TelaChamadaVideoCliente}
              options={{ headerShown: false, presentation: "fullScreenModal" }}
            />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}