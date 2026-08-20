import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento, sombra } from "../tema/tema";
import SliderClinico from "./SliderClinico";

const OPCOES_HUMOR = [
  { emoji: "😄", label: "Muito bem", valor: 100 },
  { emoji: "🙂", label: "Bem", valor: 75 },
  { emoji: "😐", label: "Mais ou menos", valor: 50 },
  { emoji: "😔", label: "Mal", valor: 25 },
  { emoji: "😣", label: "Muito mal", valor: 0 },
];

const PARTICULAS = ["✨", "🎉", "💫", "⭐"];

function hojeCurto() {
  const hoje = new Date();
  return `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

function formatoCurto(data) {
  return `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`;
}

// Estimativa de dias seguidos com check-in (o backend só guarda "dd/mm",
// sem ano — serve pro efeito motivacional, não é um dado clínico).
function calcularSequencia(checkins) {
  if (!checkins?.length) return 0;
  const feitoHoje = checkins.some((c) => c.data === hojeCurto());
  const cursor = new Date();
  if (!feitoHoje) cursor.setDate(cursor.getDate() - 1);

  const porData = new Set(checkins.map((c) => c.data));
  let sequencia = 0;
  while (porData.has(formatoCurto(cursor)) && sequencia < 365) {
    sequencia += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return sequencia;
}

/**
 * Card do check-in diário. A visibilidade é sempre recalculada a partir
 * de `checkins` (dado que vem do backend) — nunca de um estado local —
 * então ele SÓ aparece quando realmente não existe check-in completo de
 * hoje, tanto ao abrir o app quanto durante o uso.
 */
export default function CheckinDiario({ checkins, aoRegistrarRapido, aoRegistrarIndicadores }) {
  const checkinHoje = useMemo(() => checkins?.find((c) => c.data === hojeCurto()) || null, [checkins]);
  const sequencia = useMemo(() => calcularSequencia(checkins), [checkins]);
  const completoHoje =
    !!checkinHoje && checkinHoje.humor != null && checkinHoje.ansiedade != null && checkinHoje.energia != null;

  // Único estado local: a celebração de ~2,5s exibida logo depois que o
  // cliente termina — depois disso, quem decide mostrar ou não o card
  // volta a ser só `completoHoje`, vindo dos dados reais.
  const [celebrando, setCelebrando] = useState(false);

  const [ansiedade, setAnsiedade] = useState(5);
  const [humorSlider, setHumorSlider] = useState(checkinHoje?.humor != null ? Math.round(checkinHoje.humor / 10) : 5);
  const [energia, setEnergia] = useState(5);
  const [salvando, setSalvando] = useState(false);
  const [enviandoRapido, setEnviandoRapido] = useState(false);

  const opacidadeCard = useRef(new Animated.Value(1)).current;
  const escalaCelebracao = useRef(new Animated.Value(0)).current;
  const particulas = useRef(PARTICULAS.map(() => ({ y: new Animated.Value(0), opacidade: new Animated.Value(0) }))).current;

  function dispararParticulas() {
    particulas.forEach((p, i) => {
      p.y.setValue(0);
      p.opacidade.setValue(1);
      Animated.parallel([
        Animated.timing(p.y, {
          toValue: -46 - i * 6,
          duration: 900 + i * 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(p.opacidade, { toValue: 0, duration: 900 + i * 120, delay: 200, useNativeDriver: true }),
      ]).start();
    });
  }

  async function tocarEmoji(opcao) {
    if (enviandoRapido) return;
    setHumorSlider(Math.round(opcao.valor / 10));
    setEnviandoRapido(true);
    try {
      await aoRegistrarRapido(opcao.valor);
    } catch (e) {
      Alert.alert("Ops", e.message || "Não foi possível registrar agora. Tente de novo.");
    } finally {
      setEnviandoRapido(false);
    }
  }

  async function concluir() {
    setSalvando(true);
    try {
      await aoRegistrarIndicadores({ ansiedade, humor: humorSlider, energia });
      setCelebrando(true);
      escalaCelebracao.setValue(0);
      Animated.spring(escalaCelebracao, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      dispararParticulas();
      setTimeout(() => {
        Animated.timing(opacidadeCard, { toValue: 0, duration: 320, useNativeDriver: true }).start(() => {
          setCelebrando(false);
          opacidadeCard.setValue(1);
        });
      }, 2200);
    } catch (e) {
      Alert.alert("Ops", e.message || "Não foi possível salvar seu check-in.");
    } finally {
      setSalvando(false);
    }
  }

  // Já terminou hoje e a celebração já passou: não mostra nada.
  if (completoHoje && !celebrando) return null;

  const mostrarSliders = celebrando ? false : checkinHoje?.humor != null;

  return (
    <Animated.View style={{ opacity: opacidadeCard }}>
      <LinearGradient
        colors={[cores.destaque, cores.destaqueEscuro]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cartao}
      >
        <View style={styles.cabecalho}>
          <View style={styles.cabecalhoTextos}>
            <Text style={styles.rotulo}>CHECK-IN DE HOJE</Text>
            <Text style={styles.titulo}>
              {celebrando ? "Feito por hoje! 🎉" : mostrarSliders ? "Só mais três toques" : "Como você está agora?"}
            </Text>
          </View>
          {sequencia > 0 && !celebrando ? (
            <View style={styles.selo}>
              <Text style={styles.seloEmoji}>🔥</Text>
              <Text style={styles.seloTexto}>{sequencia}</Text>
            </View>
          ) : null}
        </View>

        {celebrando ? (
          <View style={styles.celebracao}>
            <View style={styles.particulasWrap}>
              {particulas.map((p, i) => (
                <Animated.Text
                  key={i}
                  style={[
                    styles.particula,
                    { left: 30 + i * 40, opacity: p.opacidade, transform: [{ translateY: p.y }] },
                  ]}
                >
                  {PARTICULAS[i]}
                </Animated.Text>
              ))}
            </View>
            <Animated.View style={[styles.checkCirculo, { transform: [{ scale: escalaCelebracao }] }]}>
              <Ionicons name="checkmark" size={30} color={cores.destaqueEscuro} />
            </Animated.View>
            <Text style={styles.celebracaoTexto}>
              {sequencia > 1 ? `${sequencia} dias seguidos! Até amanhã 👋` : "Registrado! Até amanhã 👋"}
            </Text>
          </View>
        ) : mostrarSliders ? (
          <View style={styles.painelBranco}>
            <SliderClinico label="Ansiedade" value={ansiedade} onChange={setAnsiedade} />
            <SliderClinico
              label="Humor"
              value={humorSlider}
              onChange={setHumorSlider}
              emojiEsquerda="😞"
              emojiDireita="😄"
            />
            <SliderClinico label="Energia/disposição" value={energia} onChange={setEnergia} emojiEsquerda="🪫" emojiDireita="🔋" />

            <Pressable
              onPress={concluir}
              disabled={salvando}
              style={({ pressed }) => [styles.botaoConcluir, pressed && { opacity: 0.85 }]}
            >
              {salvando ? (
                <ActivityIndicator size="small" color={cores.branco} />
              ) : (
                <>
                  <Text style={styles.botaoConcluirTexto}>Concluir check-in</Text>
                  <Ionicons name="arrow-forward" size={16} color={cores.branco} style={{ marginLeft: 6 }} />
                </>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.listaEmojis}>
            {OPCOES_HUMOR.map((opcao) => (
              <Pressable
                key={opcao.label}
                onPress={() => tocarEmoji(opcao)}
                disabled={enviandoRapido}
                style={({ pressed }) => [styles.linhaEmoji, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.emoji}>{opcao.emoji}</Text>
                <Text style={styles.emojiLabel}>{opcao.label}</Text>
                {enviandoRapido ? null : (
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
                )}
              </Pressable>
            ))}
            {enviandoRapido ? (
              <ActivityIndicator size="small" color={cores.branco} style={{ marginTop: 6 }} />
            ) : null}
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: raio.grande,
    padding: espacamento.medio,
    marginTop: espacamento.grande,
    ...sombra.cartao,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cabecalhoTextos: { flex: 1, paddingRight: espacamento.medio },
  rotulo: {
    fontFamily: fontes.textoMedio,
    fontSize: 10.5,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.85)",
  },
  titulo: {
    fontFamily: fontes.titulo,
    fontSize: 19,
    color: cores.branco,
    marginTop: 3,
  },
  selo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: raio.pilula,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  seloEmoji: { fontSize: 13, marginRight: 4 },
  seloTexto: { fontFamily: fontes.tituloNegrito, fontSize: 13, color: cores.branco },

  listaEmojis: { marginTop: espacamento.grande },
  linhaEmoji: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: raio.medio,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  emoji: { fontSize: 24, marginRight: 12 },
  emojiLabel: {
    flex: 1,
    fontFamily: fontes.textoMedio,
    fontSize: 14.5,
    color: cores.branco,
  },

  painelBranco: {
    backgroundColor: cores.branco,
    borderRadius: raio.medio,
    padding: espacamento.medio,
    marginTop: espacamento.grande,
  },
  botaoConcluir: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.destaque,
    borderRadius: raio.medio,
    paddingVertical: 13,
    marginTop: 4,
  },
  botaoConcluirTexto: {
    fontFamily: fontes.textoMedio,
    color: cores.branco,
    fontSize: 14,
  },

  celebracao: {
    alignItems: "center",
    paddingTop: espacamento.grande,
    paddingBottom: espacamento.pequeno,
  },
  particulasWrap: { position: "absolute", top: 0, width: "100%", height: 60 },
  particula: { position: "absolute", fontSize: 20 },
  checkCirculo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.branco,
    alignItems: "center",
    justifyContent: "center",
    ...sombra.cartao,
  },
  celebracaoTexto: {
    fontFamily: fontes.textoMedio,
    color: cores.branco,
    fontSize: 14,
    marginTop: espacamento.medio,
  },
});
