import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { cores, fontes, raio, espacamento } from "../tema/tema";

/**
 * Seletor único em formato de "pills" — usado na revisão de sintomas
 * (Sono, Apetite, Libido, Humor, Energia, Concentração, Funcionalidade...)
 */
export default function SeletorPills({ label, options, value, onChange, percent }) {
  return (
    <View style={{ marginBottom: espacamento.grande }}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {typeof percent === "number" ? (
          <Text style={styles.percent}>{percent}% na semana</Text>
        ) : null}
      </View>
      <View style={styles.pillsRow}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={[styles.pill, selected && styles.pillSelected]}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontFamily: fontes.textoMedio,
    fontSize: 13.5,
    color: cores.textoEscuro,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  percent: {
    fontFamily: fontes.texto,
    fontSize: 11.5,
    color: cores.destaque,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    marginRight: 8,
    marginBottom: 8,
  },
  pillSelected: {
    backgroundColor: cores.destaque,
    borderColor: cores.destaque,
  },
  pillText: {
    fontFamily: fontes.texto,
    fontSize: 13,
    color: cores.texto,
  },
  pillTextSelected: {
    color: cores.branco,
    fontFamily: fontes.textoMedio,
  },
});
