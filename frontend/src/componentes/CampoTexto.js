import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento } from "../tema/tema";

export default function CampoTexto({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
  secureTextEntry = false,
  style,
  required = false,
  icone, // opcional: nome do Ionicons exibido à esquerda (ex.: "person-outline")
}) {
  const [focused, setFocused] = useState(false);
  const [oculto, setOculto] = useState(secureTextEntry);

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
          multiline && styles.inputWrapMultiline,
          focused && styles.inputWrapFocused,
        ]}
      >
        {icone ? (
          <Ionicons
            name={icone}
            size={18}
            color={focused ? cores.destaque : cores.textoClaro}
            style={styles.icone}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={cores.textoClaro}
          multiline={multiline}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && oculto}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
          ]}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setOculto((v) => !v)}
            hitSlop={10}
            style={styles.olho}
          >
            <Ionicons
              name={oculto ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={cores.textoClaro}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
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
  inputWrapMultiline: {
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  inputWrapFocused: {
    borderColor: cores.destaque,
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
  inputMultiline: {
    height: 96,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  olho: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
});
