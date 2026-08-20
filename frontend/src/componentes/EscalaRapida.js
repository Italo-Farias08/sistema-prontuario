import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento } from "../tema/tema";

/**
 * Pergunta única e rápida ("Como você está se sentindo hoje?").
 * Ao tocar numa opção, já é considerado "respondido" — sem precisar
 * de um botão de confirmar. O componente só mostra a seleção; quem
 * chama (onSelecionar) decide o que fazer com o valor (ex.: já
 * mandar pro backend).
 */
const OPCOES = [
  { emoji: "😄", label: "Muito bem", valor: 100 },
  { emoji: "🙂", label: "Bem", valor: 75 },
  { emoji: "😐", label: "Mais ou menos", valor: 50 },
  { emoji: "😔", label: "Mal", valor: 25 },
  { emoji: "😣", label: "Muito mal", valor: 0 },
];

export default function EscalaRapida({ selecionado, onSelecionar, registrado }) {
  return (
    <View>
      {OPCOES.map((opcao) => {
        const ativo = selecionado === opcao.valor;
        return (
          <Pressable
            key={opcao.label}
            onPress={() => onSelecionar(opcao.valor)}
            style={({ pressed }) => [
              styles.linha,
              ativo && styles.linhaAtiva,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.emoji}>{opcao.emoji}</Text>
            <Text style={[styles.label, ativo && styles.labelAtiva]}>{opcao.label}</Text>
            {ativo ? (
              <Ionicons name="checkmark-circle" size={18} color={cores.destaque} />
            ) : null}
          </Pressable>
        );
      })}

      {registrado ? (
        <View style={styles.confirmacao}>
          <Ionicons name="checkmark-circle" size={14} color={cores.destaqueEscuro} />
          <Text style={styles.confirmacaoTexto}>
            Pronto, o registro já está feito. Isso já ajuda no seu acompanhamento.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: raio.medio,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 6,
  },
  linhaAtiva: {
    backgroundColor: cores.destaqueSuave,
    borderColor: cores.destaque,
  },
  emoji: { fontSize: 22, marginRight: 12 },
  label: {
    flex: 1,
    fontFamily: fontes.texto,
    fontSize: 14.5,
    color: cores.texto,
  },
  labelAtiva: {
    fontFamily: fontes.textoMedio,
    color: cores.destaqueEscuro,
  },
  confirmacao: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  confirmacaoTexto: {
    flex: 1,
    fontFamily: fontes.texto,
    fontSize: 12,
    color: cores.destaqueEscuro,
    marginLeft: 6,
  },
});