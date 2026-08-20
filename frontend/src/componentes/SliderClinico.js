import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { cores, fontes, raio, espacamento } from "../tema/tema";

/**
 * Slider de 0 a 10 (passo inteiro). Antes era feito na mão com
 * PanResponder — mas dentro do ScrollView da tela ele ficava travado
 * (o ScrollView tomava o gesto de volta no meio do arrasto, e nenhum
 * ajuste de PanResponder resolvia de forma confiável). Trocado pelo
 * componente nativo @react-native-community/slider, que trata o toque
 * no nível do sistema operacional e não sofre esse tipo de disputa.
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
  sufixoValor,
}) {
  return (
    <View style={{ marginBottom: espacamento.grande }}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valor}>{value}{sufixoValor || ""}</Text>
      </View>

      <View style={styles.linha}>
        <Text style={styles.extremo}>{emojiEsquerda ?? min}</Text>

        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={1}
          value={value}
          onValueChange={onChange}
          onSlidingComplete={onSlidingComplete}
          minimumTrackTintColor={cores.destaque}
          maximumTrackTintColor={cores.borda}
          thumbTintColor={cores.destaque}
        />

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
  slider: {
    flex: 1,
    height: 32,
    marginHorizontal: 8,
  },
});