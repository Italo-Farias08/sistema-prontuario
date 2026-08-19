import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, espacamento, raio, sombra } from "../tema/tema";
import CampoTexto from "../componentes/CampoTexto";
import Botao from "../componentes/Botao";
import TituloSecao from "../componentes/TituloSecao";
import Cartao from "../componentes/Cartao";
import { cadastrarCliente } from "../servicos/dadosServico";

const FORM_VAZIO = {
  nome: "",
  sexo: "",
  idade: "",
  dataNascimento: "",
  telefone: "",
  contatoEmergencia: "",
  cpf: "",
  email: "",
  endereco: "",
  senha: "",
  confirmarSenha: "",
};

export default function TelaCadastro({ navigation }) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  function set(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function enviar() {
    if (!form.nome.trim()) {
      Alert.alert("Campo obrigatório", "Informe seu nome completo.");
      return;
    }
    if (!form.email.trim()) {
      Alert.alert("Campo obrigatório", "Informe seu e-mail.");
      return;
    }
    if (form.senha.length < 6) {
      Alert.alert("Senha muito curta", "Use pelo menos 6 caracteres.");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      Alert.alert("Senhas diferentes", "A confirmação de senha não confere.");
      return;
    }

    setSalvando(true);
    try {
      const { email } = await cadastrarCliente({
        nome: form.nome,
        sexo: form.sexo,
        dataNascimento: form.dataNascimento,
        telefone: form.telefone,
        contatoEmergencia: form.contatoEmergencia,
        cpf: form.cpf,
        email: form.email,
        endereco: form.endereco,
        senha: form.senha,
      });

      navigation.replace("VerificarCadastro", { email });
    } catch (e) {
      Alert.alert("Não foi possível cadastrar", e.message || "Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.marca}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.marcaLogo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.titulo}>Criar minha conta</Text>
      <Text style={styles.subtitulo}>
        Preencha seus dados. Depois de confirmar o e-mail, você já pode entrar no app.
      </Text>

      <Cartao style={{ marginTop: espacamento.grande, marginBottom: espacamento.grande }}>
        <TituloSecao title="Seus dados" icon="person-outline" />
        <CampoTexto label="Nome completo" required value={form.nome} onChangeText={(v) => set("nome", v)} placeholder="Seu nome completo" />
        <CampoTexto label="Sexo" value={form.sexo} onChangeText={(v) => set("sexo", v)} placeholder="Feminino / Masculino / Outro" />
        <CampoTexto label="Idade" value={form.idade} onChangeText={(v) => set("idade", v)} placeholder="Ex: 34" keyboardType="number-pad" />
        <CampoTexto label="Data de nascimento" value={form.dataNascimento} onChangeText={(v) => set("dataNascimento", v)} placeholder="DD/MM/AAAA" />
        <CampoTexto label="Telefone" value={form.telefone} onChangeText={(v) => set("telefone", v)} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
        <CampoTexto label="Contato de emergência" value={form.contatoEmergencia} onChangeText={(v) => set("contatoEmergencia", v)} placeholder="Nome - Telefone" />
        <CampoTexto label="CPF" value={form.cpf} onChangeText={(v) => set("cpf", v)} placeholder="000.000.000-00" keyboardType="number-pad" />
        <CampoTexto label="E-mail" required value={form.email} onChangeText={(v) => set("email", v)} placeholder="voce@email.com" keyboardType="email-address" />
        <CampoTexto label="Endereço" value={form.endereco} onChangeText={(v) => set("endereco", v)} placeholder="Rua, número, bairro, cidade" multiline style={{ marginBottom: 0 }} />
      </Cartao>

      <Cartao style={{ marginBottom: espacamento.grande }}>
        <TituloSecao title="Acesso" icon="lock-closed-outline" subtitle="Você vai usar isso pra entrar no app" />
        <CampoTexto label="Senha" required value={form.senha} onChangeText={(v) => set("senha", v)} placeholder="Pelo menos 6 caracteres" secureTextEntry />
        <CampoTexto label="Confirmar senha" required value={form.confirmarSenha} onChangeText={(v) => set("confirmarSenha", v)} placeholder="Repita a senha" secureTextEntry style={{ marginBottom: 0 }} />
      </Cartao>

      <Botao
        label={salvando ? "Enviando..." : "Criar conta"}
        onPress={enviar}
        loading={salvando}
        style={{ marginBottom: espacamento.medio }}
      />

      <Pressable onPress={() => navigation.goBack()} style={styles.voltarWrap} hitSlop={8}>
        <Ionicons name="arrow-back" size={16} color={cores.textoClaro} />
        <Text style={styles.voltarTexto}>Já tenho conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: espacamento.grande,
    paddingTop: espacamento.grande,
    paddingBottom: espacamento.enorme,
  },
  marca: {
    alignItems: "center",
    marginBottom: espacamento.medio,
  },
  marcaLogo: {
    width: 140,
    height: 60,
  },
  titulo: {
    fontFamily: fontes.tituloNegrito,
    fontSize: 22,
    color: cores.textoEscuro,
    textAlign: "center",
  },
  subtitulo: {
    fontFamily: fontes.texto,
    fontSize: 13,
    color: cores.texto,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: espacamento.medio,
  },
  voltarWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espacamento.gigante,
  },
  voltarTexto: {
    fontFamily: fontes.textoMedio,
    fontSize: 13,
    color: cores.textoClaro,
    marginLeft: 6,
  },
});
