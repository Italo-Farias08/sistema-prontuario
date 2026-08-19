import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { cores, fontes, raio, espacamento } from "../tema/tema";

export default function BarraPorcentagem({ label, value = 0, color }) {
  const barColor = color || cores.destaque;
  return (
    <View style={{ marginBottom: espacamento.pequeno }}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(value, 100)}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontFamily: fontes.texto,
    fontSize: 12.5,
    color: cores.texto,
  },
  value: {
    fontFamily: fontes.textoMedio,
    fontSize: 12.5,
    color: cores.textoEscuro,
  },
  track: {
    height: 8,
    borderRadius: raio.pilula,
    backgroundColor: cores.borda,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: raio.pilula,
  },
});
