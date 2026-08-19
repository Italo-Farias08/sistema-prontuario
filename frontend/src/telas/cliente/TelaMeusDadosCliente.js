import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { cores, fontes, espacamento } from "../../tema/tema";
import Cartao from "../../componentes/Cartao";
import TituloSecao from "../../componentes/TituloSecao";
import { buscarClientePorId } from "../../servicos/dadosServico";
import { useAutenticacao } from "../../contexto/ContextoAutenticacao";

export default function TelaMeusDadosCliente() {
  const { sessao } = useAutenticacao();
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    buscarClientePorId(sessao.idCliente).then(setCliente);
  }, [sessao.idCliente]);

  if (!cliente) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={cores.destaque} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cores.fundo }} contentContainerStyle={styles.container}>
      <TituloSecao title="Contato" icon="call-outline" />
      <Cartao>
        <InfoRow label="Telefone" value={cliente.telefone} />
        <InfoRow label="Contato de emergência" value={cliente.contatoEmergencia} />
        <InfoRow label="E-mail" value={cliente.email} last />
      </Cartao>

      <TituloSecao title="Endereço" icon="location-outline" />
      <Cartao>
        <InfoRow label="Endereço" value={cliente.endereco} last />
      </Cartao>

      <TituloSecao title="Dados de cadastro" icon="id-card-outline" />
      <Cartao>
        <InfoRow label="Nome completo" value={cliente.nome} />
        <InfoRow label="Data de nascimento" value={cliente.dataNascimento} />
        <InfoRow label="Sexo" value={cliente.sexo} last />
      </Cartao>
    </ScrollView>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: cores.fundo },
  container: { paddingHorizontal: espacamento.grande, paddingTop: espacamento.medio, paddingBottom: espacamento.gigante },
  row: { paddingVertical: 10 },
  divider: { borderBottomWidth: 1, borderBottomColor: cores.borda },
  label: { fontFamily: fontes.texto, fontSize: 11.5, color: cores.textoClaro, marginBottom: 2 },
  value: { fontFamily: fontes.textoMedio, fontSize: 14, color: cores.textoEscuro },
});
