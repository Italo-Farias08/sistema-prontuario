import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, PanResponder } from "react-native";
import { cores, fontes, raio, espacamento } from "../tema/tema";

/**
 * Slider de 0 a 10 (passo inteiro), feito com PanResponder puro —
 * o projeto não tem @react-native-community/slider instalado e,
 * neste ambiente, não dá pra rodar `npm install`. Isso evita
 * depender de uma lib nativa que precisaria de rebuild.
 *
 * Extremos podem ser um emoji (ex.: 😞 / 😄) ou um número simples
 * (quando `emojiEsquerda`/`emojiDireita` não são passados, mostra
 * min/max como texto).
 */
export default function SliderClinico({
  label,
  value,
  onChange,
  onSlidingComplete,
  min = 0,
  max = 10,
  emojiEsquerda,
  emojiDireita,
}) {
  const [largura, setLargura] = useState(0);
  const intervalo = max - min;

  function posicaoParaValor(x) {
    if (!largura) return value;
    const proporcao = Math.min(Math.max(x / largura, 0), 1);
    return Math.round(min + proporcao * intervalo);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        onChange(posicaoParaValor(evt.nativeEvent.locationX));
      },
      onPanResponderRelease: (evt) => {
        const novoValor = posicaoParaValor(evt.nativeEvent.locationX);
        onChange(novoValor);
        onSlidingComplete && onSlidingComplete(novoValor);
      },
    })
  ).current;

  const proporcaoAtual = largura ? ((value - min) / intervalo) * largura : 0;

  return (
    <View style={{ marginBottom: espacamento.grande }}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valor}>{value}</Text>
      </View>

      <View style={styles.linha}>
        <Text style={styles.extremo}>{emojiEsquerda ?? min}</Text>

        <View
          style={styles.trilha}
          onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          <View style={styles.trilhaBase} />
          <View style={[styles.trilhaPreenchida, { width: proporcaoAtual }]} />
          <View
            style={[
              styles.thumb,
              { left: Math.max(Math.min(proporcaoAtual - 11, largura - 22), 0) },
            ]}
          />
        </View>

        <Text style={styles.extremo}>{emojiDireita ?? max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontFamily: fontes.textoMedio,
    fontSize: 13.5,
    color: cores.textoEscuro,
  },
  valor: {
    fontFamily: fontes.tituloNegrito,
    fontSize: 14,
    color: cores.destaqueEscuro,
    minWidth: 20,
    textAlign: "right",
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
  },
  extremo: {
    fontSize: 15,
    width: 24,
    textAlign: "center",
    color: cores.textoClaro,
    fontFamily: fontes.texto,
  },
  trilha: {
    flex: 1,
    height: 32,
    justifyContent: "center",
    marginHorizontal: 8,
  },
  trilhaBase: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    borderRadius: raio.pilula,
    backgroundColor: cores.borda,
  },
  trilhaPreenchida: {
    position: "absolute",
    left: 0,
    height: 4,
    borderRadius: raio.pilula,
    backgroundColor: cores.destaque,
  },
  thumb: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: cores.branco,
    borderWidth: 2,
    borderColor: cores.destaque,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});