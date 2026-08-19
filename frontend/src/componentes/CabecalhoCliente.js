import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento } from "../tema/tema";
import Avatar from "./Avatar";

/**
 * Cabeçalho comum às telas da área do cliente: avatar + saudação/título
 * à esquerda e botão hambúrguer à direita, que abre o MenuLateral.
 */
export default function CabecalhoCliente({
  cliente,
  saudacao,
  titulo,
  aoAbrirMenu,
}) {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Avatar iniciais={cliente?.fotoIniciais} size={48} />
        <View style={{ marginLeft: espacamento.medio, flex: 1 }}>
          {saudacao ? <Text style={styles.greeting}>{saudacao}</Text> : null}
          <Text style={styles.name} numberOfLines={1}>
            {titulo}
          </Text>
        </View>
      </View>
      <Pressable onPress={aoAbrirMenu} style={styles.menuBtn} hitSlop={8}>
        <Ionicons name="menu-outline" size={22} color={cores.texto} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center" },
  greeting: { fontFamily: fontes.texto, fontSize: 13, color: cores.textoClaro },
  name: { fontFamily: fontes.titulo, fontSize: 20, color: cores.textoEscuro },
  menuBtn: {
    padding: 8,
    backgroundColor: cores.superficie,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: cores.borda,
  },
});
