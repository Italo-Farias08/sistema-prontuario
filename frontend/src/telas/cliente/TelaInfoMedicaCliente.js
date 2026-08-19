import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { cores, fontes, espacamento } from "../../tema/tema";
import Cartao from "../../componentes/Cartao";
import TituloSecao from "../../componentes/TituloSecao";
import { buscarClientePorId } from "../../servicos/dadosServico";
import { useAutenticacao } from "../../contexto/ContextoAutenticacao";

export default function TelaInfoMedicaCliente() {
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
      <Text style={styles.intro}>
        Informações registradas pelo seu médico. Em caso de dúvidas, converse com ele na consulta.
      </Text>

      <TituloSecao title="Resumo da história" icon="document-text-outline" />
      <Cartao>
        <Text style={styles.bodyText}>{cliente.resumoHistoria}</Text>
      </Cartao>

      <TituloSecao title="Resultado dos exames" icon="flask-outline" />
      <Cartao>
        <Text style={styles.bodyText}>{cliente.resultadoExames}</Text>
      </Cartao>

      <TituloSecao title="Plano terapêutico" icon="clipboard-outline" />
      <Cartao>
        <Text style={styles.bodyText}>{cliente.planoTerapeutico}</Text>
      </Cartao>

      <TituloSecao title="Medicação em uso" icon="medical-outline" />
      <Cartao>
        {cliente.medicacoes.length === 0 ? (
          <Text style={styles.bodyText}>Nenhuma medicação registrada.</Text>
        ) : (
          cliente.medicacoes.map((m, idx) => (
            <View
              key={m.id}
              style={[
                styles.medRow,
                idx !== cliente.medicacoes.length - 1 && styles.medDivider,
              ]}
            >
              <Text style={styles.medName}>{m.nome}</Text>
              <Text style={styles.medDetail}>
                {m.dosagem} · {m.horario}
              </Text>
            </View>
          ))
        )}
      </Cartao>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: cores.fundo },
  container: { paddingHorizontal: espacamento.grande, paddingTop: espacamento.medio, paddingBottom: espacamento.gigante },
  intro: {
    fontFamily: fontes.texto,
    fontSize: 12.5,
    color: cores.textoClaro,
    lineHeight: 18,
  },
  bodyText: { fontFamily: fontes.texto, fontSize: 14, color: cores.texto, lineHeight: 21 },
  medRow: { paddingVertical: 10 },
  medDivider: { borderBottomWidth: 1, borderBottomColor: cores.borda },
  medName: { fontFamily: fontes.textoMedio, fontSize: 14.5, color: cores.textoEscuro },
  medDetail: { fontFamily: fontes.texto, fontSize: 12.5, color: cores.textoClaro, marginTop: 2 },
});
