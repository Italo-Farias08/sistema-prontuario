import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { cores, fontes, raio, espacamento } from "../tema/tema";

/**
 * Interação ilustrativa por emojis, oferecida como OPÇÃO ao paciente
 * para registrar como está se sentindo (vira % internamente).
 */
const DEFAULT_SCALE = [
  { emoji: "😞", label: "Ruim", value: 20 },
  { emoji: "😕", label: "Fraco", value: 40 },
  { emoji: "😐", label: "Ok", value: 60 },
  { emoji: "🙂", label: "Bem", value: 80 },
  { emoji: "😄", label: "Ótimo", value: 100 },
];

export default function EscalaEmoji({ label, selected, onSelect, scale = DEFAULT_SCALE }) {
  return (
    <View style={{ marginBottom: espacamento.grande }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {scale.map((item) => {
          const isSelected = selected === item.value;
          return (
            <Pressable
              key={item.label}
              onPress={() => onSelect(item.value)}
              style={[styles.item, isSelected && styles.itemSelected]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontes.textoMedio,
    fontSize: 13.5,
    color: cores.textoEscuro,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: raio.medio,
    borderWidth: 1,
    borderColor: "transparent",
  },
  itemSelected: {
    backgroundColor: cores.destaqueSuave,
    borderColor: cores.destaque,
  },
  emoji: { fontSize: 26 },
  itemLabel: {
    fontFamily: fontes.texto,
    fontSize: 10.5,
    color: cores.textoClaro,
    marginTop: 4,
  },
  itemLabelSelected: {
    color: cores.destaqueEscuro,
    fontFamily: fontes.textoMedio,
  },
});
