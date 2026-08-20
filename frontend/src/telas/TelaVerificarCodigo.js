import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert, Text, Image } from "react-native";
import { cores, fontes, espacamento } from "../tema/tema";
import Botao from "../componentes/Botao";
import Cartao from "../componentes/Cartao";
import { verificarCadastro, reenviarCodigo } from "../servicos/dadosServico";
import { useAutenticacao } from "../contexto/ContextoAutenticacao";
import CampoCodigo from "../componentes/CampoCodigo";

export default function TelaVerificarCodigo({ route }) {
  const { email } = route.params || {};
  const { entrar } = useAutenticacao();

  const [codigo, setCodigo] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  async function confirmar() {
    if (codigo.length !== 6) {
      Alert.alert("Código incompleto", "Digite os 6 dígitos enviados por e-mail.");
      return;
    }
    setConfirmando(true);
    try {
      const sessao = await verificarCadastro({ email, codigo });
      entrar(sessao);
    } catch (e) {
      Alert.alert("Não foi possível confirmar", e.message || "Tente novamente.");
    } finally {
      setConfirmando(false);
    }
  }

  async function reenviar() {
    setReenviando(true);
    try {
      await reenviarCodigo({ email, tipo: "cadastro" });
      Alert.alert("Código reenviado", "Confira sua caixa de entrada (e o spam).");
    } catch (e) {
      Alert.alert("Não foi possível reenviar", e.message || "Tente novamente.");
    } finally {
      setReenviando(false);
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

      <Text style={styles.titulo}>Confirme seu e-mail</Text>
      <Text style={styles.subtitulo}>
        Enviamos um código de 6 dígitos para{"\n"}
        <Text style={{ fontFamily: fontes.textoMedio, color: cores.textoEscuro }}>{email}</Text>
      </Text>

      <Cartao style={{ marginTop: espacamento.grande, marginBottom: espacamento.grande }}>
        <CampoCodigo value={codigo} onChange={setCodigo} />
      </Cartao>

      <Botao
        label={confirmando ? "Confirmando..." : "Confirmar"}
        onPress={confirmar}
        loading={confirmando}
        style={{ marginBottom: espacamento.medio }}
      />

      <Botao
        label={reenviando ? "Reenviando..." : "Reenviar código"}
        onPress={reenviar}
        variant="ghost"
        loading={reenviando}
      />
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
  },
});
