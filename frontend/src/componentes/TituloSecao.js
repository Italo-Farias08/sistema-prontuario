import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, espacamento } from "../tema/tema";

export default function TituloSecao({ title, icon, subtitle }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {icon ? (
          <Ionicons
            name={icon}
            size={16}
            color={cores.destaque}
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: espacamento.pequeno, marginTop: espacamento.grande },
  row: { flexDirection: "row", alignItems: "center" },
  title: {
    fontFamily: fontes.titulo,
    fontSize: 16,
    color: cores.textoEscuro,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: fontes.texto,
    fontSize: 12.5,
    color: cores.textoClaro,
    marginTop: 2,
  },
});
