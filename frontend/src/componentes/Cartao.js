import React from "react";
import { View, StyleSheet } from "react-native";
import { cores, raio, espacamento, sombra } from "../tema/tema";

export default function Cartao({ children, style }) {
  return <View style={[styles.cartao, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.grande,
    padding: espacamento.medio,
    ...sombra.cartao,
  },
});
