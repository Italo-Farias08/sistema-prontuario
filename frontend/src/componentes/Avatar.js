import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { cores, fontes } from "../tema/tema";

export default function Avatar({ iniciais = "??", size = 48 }) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{iniciais}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: cores.destaqueSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: fontes.tituloNegrito,
    color: cores.destaqueEscuro,
  },
});
