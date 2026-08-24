import React from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cores, fontes, espacamento, raio } from "../../tema/tema";

export default function TelaChamadaVideoCliente({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { url } = route.params || {};

  if (!url) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.textoVazio}>Nenhuma chamada em andamento.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        // iOS: libera câmera/microfone automaticamente pro getUserMedia funcionar dentro da WebView
        mediaCapturePermissionGrantedAutomatically
        // Android: concede a permissão de câmera/microfone que o site pediu
        onPermissionRequest={(evento) => evento.grant(evento.resources)}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.carregando}>
            <ActivityIndicator size="large" color={cores.branco} />
          </View>
        )}
      />

      <Pressable
        onPress={() => navigation.goBack()}
        style={[styles.botaoFechar, { top: insets.top + espacamento.pequeno }]}
        hitSlop={10}
      >
        <Ionicons name="close" size={22} color={cores.branco} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  vazio: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: cores.fundo },
  textoVazio: { fontFamily: fontes.texto, color: cores.texto },
  carregando: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoFechar: {
    position: "absolute",
    right: espacamento.medio,
    width: 38,
    height: 38,
    borderRadius: raio.pilula,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});
