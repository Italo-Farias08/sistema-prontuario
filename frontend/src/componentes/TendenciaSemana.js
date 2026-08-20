import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { cores, fontes, raio, espacamento } from "../tema/tema";

/**
 * Mini gráfico dos últimos check-ins do cliente — troca entre
 * Humor / Sono / Energia e mostra a evolução dia a dia, com o
 * dia de hoje destacado. Serve pro próprio paciente enxergar
 * o padrão da semana, não só um número solto.
 */
const METRICAS = [
  { chave: "humor", label: "Humor" },
  { chave: "sono", label: "Sono" },
  { chave: "energia", label: "Energia" },
];

const ALTURA_MAX = 64;

export default function TendenciaSemana({ checkins = [] }) {
  const [metrica, setMetrica] = useState("humor");

  const dados = checkins.slice(-7);
  const media = dados.length
    ? Math.round(dados.reduce((acc, c) => acc + (c[metrica] || 0), 0) / dados.length)
    : 0;

  if (!dados.length) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.vazioTexto}>
          Faça seu primeiro check-in pra começar a ver sua evolução aqui.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.topo}>
        <View style={styles.pillsRow}>
          {METRICAS.map((m) => {
            const selecionada = metrica === m.chave;
            return (
              <Pressable
                key={m.chave}
                onPress={() => setMetrica(m.chave)}
                style={[styles.pill, selecionada && styles.pillSelecionada]}
                hitSlop={4}
              >
                <Text style={[styles.pillTexto, selecionada && styles.pillTextoSelecionada]}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.media}>{media}% média</Text>
      </View>

      <View style={styles.grafico}>
        {dados.map((item, i) => {
          const isHoje = i === dados.length - 1;
          const valor = item[metrica] || 0;
          const altura = Math.max((valor / 100) * ALTURA_MAX, 4);
          return (
            <View key={item.data} style={styles.coluna}>
              <View style={styles.barraTrilha}>
                <View
                  style={[
                    styles.barraPreenchida,
                    {
                      height: altura,
                      backgroundColor: isHoje ? cores.destaque : cores.destaqueSuave,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.diaLabel, isHoje && styles.diaLabelHoje]}>
                {isHoje ? "Hoje" : item.data.split("/")[0]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: espacamento.medio,
  },
  pillsRow: { flexDirection: "row" },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    marginRight: 6,
  },
  pillSelecionada: {
    backgroundColor: cores.destaque,
    borderColor: cores.destaque,
  },
  pillTexto: {
    fontFamily: fontes.texto,
    fontSize: 11.5,
    color: cores.texto,
  },
  pillTextoSelecionada: {
    color: cores.branco,
    fontFamily: fontes.textoMedio,
  },
  media: {
    fontFamily: fontes.textoMedio,
    fontSize: 12.5,
    color: cores.destaqueEscuro,
  },
  grafico: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: ALTURA_MAX + 26,
  },
  coluna: { alignItems: "center", flex: 1 },
  barraTrilha: {
    width: 18,
    height: ALTURA_MAX,
    justifyContent: "flex-end",
    backgroundColor: cores.fundo,
    borderRadius: raio.pilula,
    overflow: "hidden",
  },
  barraPreenchida: {
    width: "100%",
    borderRadius: raio.pilula,
  },
  diaLabel: {
    fontFamily: fontes.texto,
    fontSize: 10.5,
    color: cores.textoClaro,
    marginTop: 6,
  },
  diaLabelHoje: {
    color: cores.destaqueEscuro,
    fontFamily: fontes.textoMedio,
  },
  vazio: {
    paddingVertical: espacamento.medio,
    alignItems: "center",
  },
  vazioTexto: {
    fontFamily: fontes.texto,
    fontSize: 12.5,
    color: cores.textoClaro,
    textAlign: "center",
  },
});