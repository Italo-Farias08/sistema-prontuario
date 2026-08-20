import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento } from "../tema/tema";

/**
 * Campo de data com máscara automática (DD/MM/AAAA).
 * Recebe e devolve a data já formatada em `value`/`onChangeText`.
 * Valida dia/mês/ano reais (não só o formato) e avisa se a data
 * ficar incompleta ou inválida quando o campo perde o foco.
 */
export default function CampoData({
  label = "Data de nascimento",
  value,
  onChangeText,
  placeholder = "DD/MM/AAAA",
  style,
  required = false,
}) {
  const [focused, setFocused] = useState(false);
  const [tocado, setTocado] = useState(false);

  function aplicarMascara(texto) {
    const numeros = texto.replace(/\D/g, "").slice(0, 8);
    let formatado = numeros;
    if (numeros.length > 4) {
      formatado = `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
    } else if (numeros.length > 2) {
      formatado = `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }
    onChangeText(formatado);
  }

  const invalida = tocado && value?.length > 0 && !dataValida(value);

  return (
    <View style={[{ marginBottom: espacamento.medio }, style]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={{ color: cores.destaque }}> *</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputWrapFocused,
          invalida && styles.inputWrapErro,
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={invalida ? cores.perigo : focused ? cores.destaque : cores.textoClaro}
          style={styles.icone}
        />
        <TextInput
          value={value}
          onChangeText={aplicarMascara}
          placeholder={placeholder}
          placeholderTextColor={cores.textoClaro}
          keyboardType="number-pad"
          maxLength={10}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTocado(true);
          }}
          style={styles.input}
        />
      </View>
      {invalida ? <Text style={styles.erroTexto}>Data inválida.</Text> : null}
    </View>
  );
}

function dataValida(texto) {
  const m = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  if (mes < 1 || mes > 12) return false;
  const diasNoMes = new Date(ano, mes, 0).getDate();
  if (dia < 1 || dia > diasNoMes) return false;
  const hoje = new Date();
  const dataDigitada = new Date(ano, mes - 1, dia);
  if (dataDigitada > hoje) return false;
  if (ano < 1900) return false;
  return true;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontes.textoMedio,
    fontSize: 13,
    color: cores.texto,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.pequeno,
    paddingHorizontal: 14,
  },
  inputWrapFocused: {
    borderColor: cores.destaque,
  },
  inputWrapErro: {
    borderColor: cores.perigo,
  },
  icone: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: fontes.texto,
    fontSize: 15,
    color: cores.textoEscuro,
  },
  erroTexto: {
    fontFamily: fontes.texto,
    fontSize: 12,
    color: cores.perigo,
    marginTop: 4,
  },
});