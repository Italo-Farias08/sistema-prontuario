import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, espacamento, raio, sombra } from "../../tema/tema";
import CampoTexto from "../../componentes/CampoTexto";
import Botao from "../../componentes/Botao";
import TituloSecao from "../../componentes/TituloSecao";
import Cartao from "../../componentes/Cartao";
import Avatar from "../../componentes/Avatar";
import { clienteVazio } from "../../dados/dadosMock";
import { criarCliente } from "../../servicos/dadosServico";

function iniciaisDoNome(nome = "") {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "??";
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function TelaCadastroCliente({ navigation }) {
  const [form, setForm] = useState(clienteVazio);
  const [salvando, setSalvando] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setAdmin(field, value) {
    setForm((prev) => ({ ...prev, admin: { ...prev.admin, [field]: value } }));
  }

  async function salvar() {
    if (!form.nome.trim()) {
      Alert.alert("Campo obrigatório", "Informe o nome do paciente.");
      return;
    }
    setSalvando(true);
    try {
      const novoCliente = await criarCliente(form);
      navigation.replace("Prontuario", { idCliente: novoCliente.id });
    } catch (e) {
      Alert.alert("Erro", e.message || "Não foi possível salvar.");
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
          source={require("../../../assets/logo.png")}
          style={styles.marcaLogo}
          resizeMode="contain"
        />
        <Text style={styles.marcaTexto}>Consultório</Text>
      </View>

      <View style={styles.fotoWrap}>
        <Pressable
          onPress={() =>
            Alert.alert("Foto do paciente", "Seleção de imagem em breve.")
          }
        >
          <View style={styles.avatarSombra}>
            <Avatar iniciais={iniciaisDoNome(form.nome)} size={88} />
          </View>
          <View style={styles.cameraBadge}>
            <Ionicons name="camera-outline" size={15} color={cores.branco} />
          </View>
        </Pressable>
        <Text style={styles.fotoLegenda}>Toque para adicionar uma foto</Text>
      </View>

      <Cartao style={{ marginBottom: espacamento.grande }}>
        <TituloSecao
          title="Dados do Paciente"
          icon="person-outline"
          subtitle="Preenchido no cadastro do cliente"
        />
        <CampoTexto label="Nome completo" required value={form.nome} onChangeText={(v) => set("nome", v)} placeholder="Nome do paciente" />
        <CampoTexto label="Sexo" value={form.sexo} onChangeText={(v) => set("sexo", v)} placeholder="Feminino / Masculino / Outro" />
        <CampoTexto label="Idade" value={String(form.idade)} onChangeText={(v) => set("idade", v)} placeholder="Ex: 34" keyboardType="number-pad" />
        <CampoTexto label="Data de nascimento" value={form.dataNascimento} onChangeText={(v) => set("dataNascimento", v)} placeholder="DD/MM/AAAA" />
        <CampoTexto label="Telefone" value={form.telefone} onChangeText={(v) => set("telefone", v)} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
        <CampoTexto label="Contato de emergência" value={form.contatoEmergencia} onChangeText={(v) => set("contatoEmergencia", v)} placeholder="Nome - Telefone" />
        <CampoTexto label="CPF" value={form.cpf} onChangeText={(v) => set("cpf", v)} placeholder="000.000.000-00" keyboardType="number-pad" />
        <CampoTexto label="E-mail" value={form.email} onChangeText={(v) => set("email", v)} placeholder="paciente@email.com" keyboardType="email-address" />
        <CampoTexto label="Endereço" value={form.endereco} onChangeText={(v) => set("endereco", v)} placeholder="Rua, número, bairro, cidade" multiline style={{ marginBottom: 0 }} />
      </Cartao>

      <Cartao style={{ marginBottom: espacamento.grande }}>
        <TituloSecao
          title="Dados Clínicos"
          icon="medkit-outline"
          subtitle="Uso exclusivo do consultório"
        />
        <CampoTexto label="Comorbidades" value={form.admin.comorbidades} onChangeText={(v) => setAdmin("comorbidades", v)} placeholder="Ex: Hipotireoidismo" multiline />
        <CampoTexto label="Alergias" value={form.admin.alergias} onChangeText={(v) => setAdmin("alergias", v)} placeholder="Ex: Dipirona" multiline />
        <CampoTexto label="Hábitos" value={form.admin.habitos} onChangeText={(v) => setAdmin("habitos", v)} placeholder="Ex: Tabagismo, etilismo" multiline style={{ marginBottom: 0 }} />
      </Cartao>

      <Text style={styles.note}>
        Após salvar, o prontuário (histórico, medicações e revisão de
        sintomas) pode ser preenchido na ficha do paciente.
      </Text>

      <Botao
        label={salvando ? "Salvando..." : "Salvar cadastro"}
        onPress={salvar}
        loading={salvando}
        style={{ marginTop: espacamento.medio, marginBottom: espacamento.gigante }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: espacamento.grande,
    paddingTop: espacamento.medio,
    paddingBottom: espacamento.enorme,
  },
  marca: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espacamento.grande,
  },
  marcaLogo: {
    width: 22,
    height: 22,
    marginRight: 6,
  },
  marcaTexto: {
    fontFamily: fontes.textoMedio,
    fontSize: 12.5,
    color: cores.textoClaro,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  fotoWrap: {
    alignItems: "center",
    marginBottom: espacamento.grande,
  },
  avatarSombra: {
    borderRadius: raio.pilula,
    ...sombra.cartao,
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: cores.destaque,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: cores.fundo,
  },
  fotoLegenda: {
    fontFamily: fontes.texto,
    fontSize: 11.5,
    color: cores.textoClaro,
    marginTop: espacamento.pequeno,
  },
  note: {
    fontFamily: fontes.texto,
    fontSize: 11.5,
    color: cores.textoClaro,
    marginTop: espacamento.pequeno,
    lineHeight: 16,
  },
});
