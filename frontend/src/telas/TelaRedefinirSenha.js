import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert, Text, Image } from "react-native";
import { cores, fontes, espacamento } from "../tema/tema";
import CampoTexto from "../componentes/CampoTexto";
import Botao from "../componentes/Botao";
import Cartao from "../componentes/Cartao";
import CampoCodigo from "../componentes/CampoCodigo";
import { redefinirSenha, reenviarCodigo } from "../servicos/dadosServico";

export default function TelaRedefinirSenha({ route, navigation }) {
  const { emailSugerido } = route.params || {};

  const [email, setEmail] = useState(emailSugerido && !emailSugerido.includes("*") ? emailSugerido : "");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  async function confirmar() {
    if (!email.trim()) {
      Alert.alert("Campo obrigatório", "Informe o e-mail que recebeu o código.");
      return;
    }
    if (codigo.length !== 6) {
      Alert.alert("Código incompleto", "Digite os 6 dígitos enviados por e-mail.");
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert("Senha muito curta", "Use pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert("Senhas diferentes", "A confirmação de senha não confere.");
      return;
    }

    setSalvando(true);
    try {
      await redefinirSenha({ email: email.trim(), codigo, novaSenha });
      Alert.alert("Senha redefinida", "Agora é só entrar com sua nova senha.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (e) {
      Alert.alert("Não foi possível redefinir", e.message || "Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function reenviar() {
    if (!email.trim()) {
      Alert.alert("Informe o e-mail", "Digite o e-mail que recebeu o código antes de reenviar.");
      return;
    }
    setReenviando(true);
    try {
      await reenviarCodigo({ email: email.trim(), tipo: "redefinir_senha" });
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

      <Text style={styles.titulo}>Redefinir senha</Text>
      <Text style={styles.subtitulo}>
        Digite o código que enviamos por e-mail e escolha uma nova senha.
      </Text>

      <Cartao style={{ marginTop: espacamento.grande, marginBottom: espacamento.medio }}>
        <CampoTexto
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          keyboardType="email-address"
          style={{ marginBottom: espacamento.medio }}
        />
        <CampoCodigo value={codigo} onChange={setCodigo} />
      </Cartao>

      <Cartao style={{ marginBottom: espacamento.grande }}>
        <CampoTexto label="Nova senha" value={novaSenha} onChangeText={setNovaSenha} placeholder="Pelo menos 6 caracteres" secureTextEntry />
        <CampoTexto label="Confirmar nova senha" value={confirmarSenha} onChangeText={setConfirmarSenha} placeholder="Repita a nova senha" secureTextEntry style={{ marginBottom: 0 }} />
      </Cartao>

      <Botao
        label={salvando ? "Salvando..." : "Redefinir senha"}
        onPress={confirmar}
        loading={salvando}
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
    paddingTop: espacamento.grande,
    paddingBottom: espacamento.enorme,
  },
  marca: { alignItems: "center", marginBottom: espacamento.medio },
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
});
