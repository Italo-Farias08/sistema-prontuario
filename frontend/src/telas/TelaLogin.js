import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fontes, espacamento } from "../tema/tema";
import { useAutenticacao } from "../contexto/ContextoAutenticacao";
import { autenticar } from "../servicos/dadosServico";

// ─────────────────────────────────────────────────────────────
// Paleta exclusiva desta tela (não altera src/tema/tema.js).
// Fundo off-white, verde da marca (#3DB843) e grafite pro texto —
// baseada na referência visual passada pelo cliente.
// ─────────────────────────────────────────────────────────────
const cores = {
  fundo: "#F2F1EC",
  superficie: "#FFFFFF",
  campoFundo: "#F6F5F1",
  borda: "#E4E2DC",
  bordaFoco: "#3DB843",
  destaque: "#3DB843",
  destaqueEscuro: "#2E6B34",
  destaqueSuave: "#E7F3E8",
  texto: "#2B2B2B",
  textoSecundario: "#6E6E6E",
  textoTerciario: "#A3A19A",
  perigo: "#C24B3F",
  perigoSuave: "#F6DEDC",
};

const PERFIL_PADRAO = "cliente";

// Posições dos pontinhos decorativos (canto inferior direito).
// Gerado uma vez fora do componente pra não recalcular a cada render.
const PONTOS_DECORATIVOS = [
  { top: 0, left: 26, size: 7, opacity: 0.75 },
  { top: 18, left: 4, size: 5, opacity: 0.55 },
  { top: 22, left: 46, size: 9, opacity: 0.8 },
  { top: 40, left: 20, size: 6, opacity: 0.5 },
  { top: 44, left: 58, size: 5, opacity: 0.6 },
  { top: 58, left: 2, size: 8, opacity: 0.7 },
  { top: 62, left: 38, size: 6, opacity: 0.55 },
];

export default function TelaLogin() {
  const { entrar } = useAutenticacao();
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const fade = useRef(new Animated.Value(0)).current;
  const subida = useRef(new Animated.Value(18)).current;
  const logoEscala = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.stagger(90, [
      Animated.spring(logoEscala, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 440,
          useNativeDriver: true,
        }),
        Animated.timing(subida, {
          toValue: 0,
          duration: 440,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  async function handleLogin() {
    setErro("");
    setLoading(true);
    try {
      const result = await autenticar({
        perfil: PERFIL_PADRAO,
        identificador,
        senha,
      });
      entrar(result);
    } catch (e) {
      setErro(e.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  function handleCadastro() {
    Alert.alert("Criar conta", "Esse fluxo ainda será implementado.");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />

      {/* ───── Camada decorativa de fundo ─────
          Tudo com pointerEvents="none" pra não atrapalhar o toque. */}
      <View pointerEvents="none" style={styles.blobTopoEsquerda} />
      <View pointerEvents="none" style={styles.blobTopoDireita} />
      <View pointerEvents="none" style={styles.blobBase} />

      {/* Traço diagonal fino cruzando o canto superior direito */}
      <View pointerEvents="none" style={styles.tracoDiagonal} />

      {/* Colchetes decorativos nos cantos, ecoando as linhas da logo */}
      <View
        pointerEvents="none"
        style={[styles.colchete, styles.colcheteTopoEsquerda]}
      />
      <View
        pointerEvents="none"
        style={[styles.colchete, styles.colcheteBaseDireita]}
      />

      {/* Pontilhado orgânico no canto inferior direito */}
      <View pointerEvents="none" style={styles.pontosWrap}>
        {PONTOS_DECORATIVOS.map((p, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: p.size,
              backgroundColor: cores.destaque,
              opacity: p.opacity,
            }}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.logoWrap, { transform: [{ scale: logoEscala }] }]}
        >
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={{ opacity: fade, transform: [{ translateY: subida }] }}
        >
          <Text style={styles.boasVindas}>Bem-vindo(a)</Text>
          <Text style={styles.boasVindasSub}>
            Que bom ter você aqui novamente!
          </Text>

          {/* Divisor decorativo "— • —", igual à referência */}
          <View style={styles.divisorWrap}>
            <View style={styles.divisorLinha} />
            <View style={styles.divisorPonto} />
            <View style={styles.divisorLinha} />
          </View>

          <CampoEstilizado
            icone="mail-outline"
            value={identificador}
            onChangeText={setIdentificador}
            placeholder="E-mail"
            keyboardType="email-address"
          />
          <CampoEstilizado
            icone="lock-closed-outline"
            value={senha}
            onChangeText={setSenha}
            placeholder="Senha"
            secureTextEntry
          />

          <View style={styles.linhaOpcoes}>
            <Pressable
              onPress={() => setLembrar((v) => !v)}
              hitSlop={8}
              style={styles.lembrarWrap}
            >
              <View
                style={[styles.checkbox, lembrar && styles.checkboxAtivo]}
              >
                {lembrar ? (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                ) : null}
              </View>
              <Text style={styles.lembrarTexto}>Lembrar-me</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Recuperar senha",
                  "Esse fluxo ainda será implementado."
                )
              }
              hitSlop={8}
            >
              <Text style={styles.esqueci}>Esqueci minha senha</Text>
            </Pressable>
          </View>

          {erro ? (
            <View style={styles.erroBox}>
              <Ionicons
                name="alert-circle-outline"
                size={15}
                color={cores.perigo}
              />
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          <BotaoEstilizado
            label={loading ? "Entrando..." : "Entrar"}
            onPress={handleLogin}
            loading={loading}
          />

          <View style={styles.cadastroWrap}>
            <Text style={styles.cadastroTexto}>Não tem uma conta? </Text>
            <Pressable onPress={handleCadastro} hitSlop={8}>
              <Text style={styles.cadastroLink}>Cadastre-se</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────
// Input local (não altera src/componentes/CampoTexto.js)
// Visual mais próximo da referência: caixa preenchida (sem borda
// visível), ícone dentro de um "selo" arredondado à esquerda.
// ─────────────────────────────────────────────────────────────
function CampoEstilizado({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  icone,
}) {
  const [focused, setFocused] = useState(false);
  const [oculto, setOculto] = useState(secureTextEntry);

  return (
    <View
      style={[
        styles.campoWrap,
        focused && styles.campoWrapFoco,
        { marginBottom: espacamento.medio },
      ]}
    >
      {icone ? (
        <View style={styles.campoIconeSelo}>
          <Ionicons
            name={icone}
            size={18}
            color={focused ? cores.destaqueEscuro : cores.textoSecundario}
          />
        </View>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={cores.textoTerciario}
        secureTextEntry={secureTextEntry && oculto}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.campoInput}
        autoCapitalize="none"
      />
      {secureTextEntry ? (
        <Pressable
          onPress={() => setOculto((v) => !v)}
          hitSlop={10}
          style={{ paddingHorizontal: 14, paddingVertical: 4 }}
        >
          <Ionicons
            name={oculto ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={cores.textoSecundario}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Botão local (não altera src/componentes/Botao.js)
// Pílula com gradiente verde escuro → verde claro e seta à direita,
// igual à referência.
// ─────────────────────────────────────────────────────────────
function BotaoEstilizado({ label, onPress, loading }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.botaoSombra,
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
        loading && { opacity: 0.75 },
      ]}
    >
      <LinearGradient
        colors={[cores.destaqueEscuro, cores.destaque]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.botao}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <View style={{ width: 22 }} />
            <Text style={styles.botaoLabel}>{label}</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  blobTopoEsquerda: {
    position: "absolute",
    top: -70,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: cores.destaque,
    opacity: 0.22,
  },
  blobTopoDireita: {
    position: "absolute",
    top: 40,
    right: -90,
    width: 180,
    height: 180,
    borderRadius: 180,
    borderWidth: 34,
    borderColor: cores.destaque,
    opacity: 0.2,
  },
  blobBase: {
    position: "absolute",
    bottom: -120,
    left: -60,
    right: -60,
    height: 200,
    backgroundColor: cores.destaque,
    opacity: 0.2,
    borderTopLeftRadius: 400,
    borderTopRightRadius: 400,
  },

  tracoDiagonal: {
    position: "absolute",
    top: 26,
    right: -40,
    width: 160,
    height: 2,
    backgroundColor: cores.destaqueEscuro,
    opacity: 0.35,
    transform: [{ rotate: "-38deg" }],
  },

  colchete: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: cores.destaqueEscuro,
    opacity: 0.5,
  },
  colcheteTopoEsquerda: {
    top: 18,
    left: 18,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 8,
  },
  colcheteBaseDireita: {
    bottom: 22,
    right: 18,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 8,
  },

  pontosWrap: {
    position: "absolute",
    bottom: 90,
    right: 24,
    width: 70,
    height: 70,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: espacamento.grande,
    paddingTop: espacamento.gigante,
    paddingBottom: espacamento.enorme,
    justifyContent: "center",
  },

  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espacamento.grande,
  },
  logo: {
    width: 280,
    height: 122,
  },

  boasVindas: {
    fontFamily: fontes.tituloNegrito,
    fontSize: 26,
    color: cores.texto,
    textAlign: "center",
  },
  boasVindasSub: {
    fontFamily: fontes.texto,
    fontSize: 13.5,
    color: cores.textoSecundario,
    textAlign: "center",
    marginTop: 5,
  },

  divisorWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    marginBottom: espacamento.grande,
  },
  divisorLinha: {
    width: 26,
    height: 1.5,
    backgroundColor: cores.destaque,
    opacity: 0.6,
  },
  divisorPonto: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: cores.destaqueEscuro,
    marginHorizontal: 8,
  },

  campoWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: cores.campoFundo,
    borderWidth: 1,
    borderColor: cores.campoFundo,
    borderRadius: 16,
    paddingRight: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  campoWrapFoco: {
    borderColor: cores.bordaFoco,
    backgroundColor: cores.superficie,
    shadowColor: cores.destaque,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
  },
  campoIconeSelo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.superficie,
    marginLeft: 6,
    marginRight: 10,
  },
  campoInput: {
    flex: 1,
    paddingVertical: 15,
    fontFamily: fontes.texto,
    fontSize: 15,
    color: cores.texto,
  },

  linhaOpcoes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: espacamento.grande,
  },
  lembrarWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: cores.borda,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxAtivo: {
    backgroundColor: cores.destaqueEscuro,
    borderColor: cores.destaqueEscuro,
  },
  lembrarTexto: {
    fontFamily: fontes.texto,
    fontSize: 13,
    color: cores.texto,
  },
  esqueci: {
    fontFamily: fontes.textoMedio,
    fontSize: 13,
    color: cores.destaqueEscuro,
  },

  erroBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: cores.perigoSuave,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: espacamento.medio,
  },
  errorText: {
    color: cores.perigo,
    fontFamily: fontes.texto,
    fontSize: 12.5,
    marginLeft: 6,
    flex: 1,
  },

  botaoSombra: {
    borderRadius: 30,
    shadowColor: cores.destaqueEscuro,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 17,
    paddingHorizontal: 26,
    borderRadius: 30,
  },
  botaoLabel: {
    fontFamily: fontes.tituloNegrito,
    fontSize: 16,
    letterSpacing: 0.3,
    color: "#FFFFFF",
  },

  cadastroWrap: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: espacamento.grande,
  },
  cadastroTexto: {
    fontFamily: fontes.texto,
    fontSize: 13,
    color: cores.textoSecundario,
  },
  cadastroLink: {
    fontFamily: fontes.textoMedio,
    fontSize: 13,
    color: cores.destaqueEscuro,
  },
});