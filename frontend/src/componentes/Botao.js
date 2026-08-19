import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { cores, fontes, raio, espacamento } from "../tema/tema";

export default function Botao({
  label,
  onPress,
  variant = "primary", // primary | outline | ghost
  loading = false,
  disabled = false,
  style,
  icon,
}) {
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        !isOutline && !isGhost && styles.primary,
        pressed && !disabled && { opacity: 0.85 },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isGhost ? cores.destaque : cores.branco} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              isOutline && styles.labelOutline,
              isGhost && styles.labelGhost,
              !isOutline && !isGhost && styles.labelPrimary,
              icon && { marginLeft: espacamento.pequeno },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: espacamento.grande,
    borderRadius: raio.medio,
  },
  primary: {
    backgroundColor: cores.destaque,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: cores.destaque,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  label: {
    fontFamily: fontes.textoMedio,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  labelPrimary: { color: cores.branco },
  labelOutline: { color: cores.destaque },
  labelGhost: { color: cores.texto },
});
