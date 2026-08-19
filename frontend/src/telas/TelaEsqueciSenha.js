import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, espacamento } from "../tema/tema";
import CampoTexto from "../componentes/CampoTexto";
import Botao from "../componentes/Botao";
import Cartao from "../componentes/Cartao";
import { solicitarRedefinicaoSenha } from "../servicos/dadosServico";

export default function TelaEsqueciSenha({ navigation }) {
  const [identificador, setIdentificador] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!identificador.trim()) {
      Alert.alert("Campo obrigatório", "Informe seu e-mail ou CPF.");
      return;
    }
    setEnviando(true);
    try {
      const resultado = await solicitarRedefinicaoSenha({ identificador: identificador.trim() });
      // O backend não confirma se o identificador existe (proteção contra
      // enumeração de contas) — por isso seguimos para a próxima tela mesmo
      // sem saber, e lá a pessoa confirma o e-mail que recebeu o código.
      navigation.navigate("RedefinirSenha", { emailSugerido: resultado.email });
    } catch (e) {
      Alert.alert("Não foi possível continuar", e.message || "Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.marca}>
        <Image source={require("../../assets/logo.png")} style={styles.marcaLogo} resizeMode="contain" />
      </View>

      <Text style={styles.titulo}>Esqueceu sua senha?</Text>
      <Text style={styles.subtitulo}>
        Informe o e-mail ou CPF usado no cadastro. Vamos enviar um código de 6 dígitos por e-mail.
      </Text>

      <Cartao style={{ marginTop: espacamento.grande, marginBottom: espacamento.grande }}>
        <CampoTexto
          label="E-mail ou CPF"
          value={identificador}
          onChangeText={setIdentificador}
          placeholder="voce@email.com ou 000.000.000-00"
          style={{ marginBottom: 0 }}
        />
      </Cartao>

      <Botao
        label={enviando ? "Enviando..." : "Enviar código"}
        onPress={enviar}
        loading={enviando}
        style={{ marginBottom: espacamento.medio }}
      />

      <Pressable onPress={() => navigation.goBack()} style={styles.voltarWrap} hitSlop={8}>
        <Ionicons name="arrow-back" size={16} color={cores.textoClaro} />
        <Text style={styles.voltarTexto}>Voltar para o login</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: espacamento.grande,
    paddingTop: espacamento.gigante,
    paddingBottom: espacamento.enorme,
    flexGrow: 1,
    justifyContent: "center",
  },
  marca: { alignItems: "center", marginBottom: espacamento.grande },
  marcaLogo: { width: 140, height: 60 },
  titulo: {
    fontFamily: fontes.tituloNegrito,
    fontSize: 22,
    color: cores.textoEscuro,
    textAlign: "center",
  },
  subtitulo: {
    fontFamily: fontes.texto,
    fontSize: 13.5,
    color: cores.texto,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: espacamento.pequeno,
  },
  voltarWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  voltarTexto: {
    fontFamily: fontes.textoMedio,
    fontSize: 13,
    color: cores.textoClaro,
    marginLeft: 6,
  },
});
