import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { cores, raio } from "../tema/tema";

const TAMANHO = 6;

// Campo de código de verificação: mostra 6 caixinhas, mas por baixo é
// um único TextInput invisível — assim funciona bem com teclado numérico,
// autofill de SMS/e-mail e colar código copiado, sem gambiarra de foco
// entre inputs separados.
export default function CampoCodigo({ value, onChange }) {
  const inputRef = useRef(null);
  const [focado, setFocado] = useState(false);

  function tratarMudanca(texto) {
    const somenteNumeros = texto.replace(/\D/g, "").slice(0, TAMANHO);
    onChange(somenteNumeros);
  }

  const digitos = value.padEnd(TAMANHO, " ").split("");

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View style={styles.wrap}>
        {digitos.map((digito, indice) => {
          const ativo = focado && indice === value.length;
          return (
            <View
              key={indice}
              style={[
                styles.caixa,
                ativo && styles.caixaAtiva,
                indice < value.length && styles.caixaPreenchida,
              ]}
            >
              <TextInput
                editable={false}
                value={digito.trim()}
                style={styles.digito}
              />
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={tratarMudanca}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        keyboardType="number-pad"
        maxLength={TAMANHO}
        style={styles.inputOculto}
        textContentType="oneTimeCode"
        autoFocus
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  caixa: {
    width: 44,
    height: 52,
    borderRadius: raio.pequeno,
    borderWidth: 1.5,
    borderColor: cores.borda,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.fundo,
  },
  caixaPreenchida: {
    borderColor: cores.destaque,
    backgroundColor: cores.destaqueSuave,
  },
  caixaAtiva: {
    borderColor: cores.destaque,
  },
  digito: {
    fontSize: 22,
    fontWeight: "600",
    color: cores.textoEscuro,
    textAlign: "center",
    padding: 0,
  },
  inputOculto: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
});
