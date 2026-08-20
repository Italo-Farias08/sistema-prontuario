import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento, sombra } from "../../tema/tema";
import Cartao from "../../componentes/Cartao";
import Avatar from "../../componentes/Avatar";
import MenuLateral from "../../componentes/MenuLateral";
import SliderClinico from "../../componentes/SliderClinico";
import { buscarClientePorId, registrarCheckin as registrarCheckinApi } from "../../servicos/dadosServico";
import { useAutenticacao } from "../../contexto/ContextoAutenticacao";
import { WHATSAPP_DOUTOR } from "../../dados/dadosMock";

const OPCOES_HUMOR = [
  { emoji: "😥", label: "Muito mal", valor: 0 },
  { emoji: "🙁", label: "Mal", valor: 25 },
  { emoji: "😐", label: "Neutro", valor: 50 },
  { emoji: "🙂", label: "Feliz", valor: 75 },
  { emoji: "😄", label: "Muito feliz", valor: 100 },
];

function saudacaoPorHorario() {
  const hora = new Date().getHours();
  if (hora < 5) return "Boa madrugada,";
  if (hora < 12) return "Bom dia,";
  if (hora < 18) return "Boa tarde,";
  return "Boa noite,";
}

function hojeCurto() {
  const hoje = new Date();
  return `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

export default function TelaInicioCliente({ navigation }) {
  const { sessao, sair } = useAutenticacao();
  const [cliente, setCliente] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [enviandoHumor, setEnviandoHumor] = useState(false);
  const [disposicao, setDisposicao] = useState(5);
  const [disposicaoInicializada, setDisposicaoInicializada] = useState(false);
  const [salvandoDisposicao, setSalvandoDisposicao] = useState(false);

  const opacidade = useRef(new Animated.Value(0)).current;
  const deslocamento = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    buscarClientePorId(sessao.idCliente).then(setCliente);
  }, [sessao.idCliente]);

  useEffect(() => {
    if (cliente) {
      Animated.parallel([
        Animated.timing(opacidade, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(deslocamento, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]).start();
    }
  }, [cliente]);

  const checkinHoje = useMemo(
    () => cliente?.checkins?.find((c) => c.data === hojeCurto()) || null,
    [cliente]
  );

  useEffect(() => {
    if (checkinHoje?.energia != null && !disposicaoInicializada) {
      setDisposicao(Math.round(checkinHoje.energia / 10));
      setDisposicaoInicializada(true);
    }
  }, [checkinHoje, disposicaoInicializada]);

  async function registrarHumor(opcao) {
    if (enviandoHumor) return;
    setEnviandoHumor(true);
    try {
      const clienteAtualizado = await registrarCheckinApi(sessao.idCliente, { humor: opcao.valor });
      setCliente(clienteAtualizado);
    } catch (e) {
      Alert.alert("Ops", e.message || "Não foi possível registrar seu humor agora.");
    } finally {
      setEnviandoHumor(false);
    }
  }

  async function registrarDisposicao() {
    if (salvandoDisposicao) return;
    setSalvandoDisposicao(true);
    try {
      const clienteAtualizado = await registrarCheckinApi(sessao.idCliente, { energia: disposicao * 10 });
      setCliente(clienteAtualizado);
    } catch (e) {
      Alert.alert("Ops", e.message || "Não foi possível registrar sua disposição agora.");
    } finally {
      setSalvandoDisposicao(false);
    }
  }

  function agendarConsulta() {
    const texto = encodeURIComponent(
      `Olá, Doutor(a)! Gostaria de agendar uma consulta. Meu nome é ${cliente?.nome || ""}.`
    );
    const url = `https://wa.me/${WHATSAPP_DOUTOR}?text=${texto}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Ops", "Não foi possível abrir o WhatsApp.")
    );
  }

  if (!cliente) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={cores.destaque} />
        <Text style={styles.loadingTexto}>Carregando suas informações...</Text>
      </View>
    );
  }

  const primeiroNome = cliente.nome.split(" ")[0];

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho: avatar + saudação/nome à esquerda, sino à direita */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Avatar iniciais={cliente?.fotoIniciais} size={48} />
            <View style={{ marginLeft: espacamento.medio, flex: 1 }}>
              <Text style={styles.saudacaoNome} numberOfLines={1}>
                {saudacaoPorHorario()} {primeiroNome}
              </Text>
              <Text style={styles.subtitulo}>Como você está hoje?</Text>
            </View>
          </View>
          <Pressable
            onPress={() => Alert.alert("Notificações", "Nenhuma notificação nova por enquanto.")}
            style={styles.sinoBtn}
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" size={20} color={cores.destaqueEscuro} />
          </Pressable>
        </View>

        <Animated.View
          style={{
            opacity: opacidade,
            transform: [{ translateY: deslocamento }],
          }}
        >
          {/* Cartão de resumo com CTA de agendar consulta */}
          <Cartao style={styles.cartaoResumo}>
            <View style={styles.resumoTopo}>
              <View style={styles.resumoIconeCirculo}>
                <Ionicons name="heart" size={26} color={cores.destaque} />
              </View>
              <Text style={styles.resumoTitulo}>Resumo de saúde</Text>
            </View>

            <View style={styles.resumoLinha}>
              <View style={styles.resumoIconePequeno}>
                <Ionicons name="calendar-outline" size={18} color={cores.destaqueEscuro} />
              </View>
              <View style={{ marginLeft: espacamento.pequeno }}>
                <Text style={styles.resumoLinhaTitulo}>Marcar consulta</Text>
                <Text style={styles.resumoLinhaDescricao}>Encontre um horário disponível</Text>
              </View>
            </View>

            <Pressable
              onPress={agendarConsulta}
              style={({ pressed }) => [styles.agendarBtn, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.agendarBtnTexto}>Agendar agora</Text>
            </Pressable>
          </Cartao>

          {/* Grade 2x2 de atalhos */}
          <View style={styles.grade}>
            <CartaoAtalho
              icon="medical-outline"
              titulo="Informações médicas"
              onPress={() => navigation.navigate("InfoMedicaCliente")}
            />
            <CartaoAtalho
              icon="person-outline"
              titulo="Meus dados"
              onPress={() => navigation.navigate("MeusDadosCliente")}
            />
            <CartaoAtalho
              icon="calendar-outline"
              titulo="Consultas"
              onPress={agendarConsulta}
            />
            <CartaoAtalho
              icon="settings-outline"
              titulo="Configurações"
              onPress={() => setMenuAberto(true)}
            />
          </View>

          {/* Seletor de humor em linha */}
          <Cartao style={styles.humorCartao}>
            <Text style={styles.humorTitulo}>Como está seu humor hoje?</Text>
            <View style={styles.humorLinha}>
              {OPCOES_HUMOR.map((opcao) => {
                const selecionado = checkinHoje?.humor === opcao.valor;
                return (
                  <View key={opcao.label} style={styles.humorItem}>
                    <Pressable
                      onPress={() => registrarHumor(opcao)}
                      disabled={enviandoHumor}
                      style={[styles.humorEmojiWrap, selecionado && styles.humorEmojiSelecionado]}
                    >
                      <Text style={styles.humorEmoji}>{opcao.emoji}</Text>
                    </Pressable>
                    {selecionado ? <Text style={styles.humorLabel}>{opcao.label}</Text> : null}
                  </View>
                );
              })}
            </View>
            {enviandoHumor ? (
              <ActivityIndicator size="small" color={cores.destaque} style={{ marginTop: espacamento.pequeno }} />
            ) : null}

            <View style={styles.divisor} />

            <View style={{ width: "100%" }}>
              <Text style={styles.disposicaoTitulo}>Qual sua disposição hoje?</Text>
              <SliderClinico
                label=""
                value={disposicao}
                onChange={setDisposicao}
                sufixoValor={`/10`}
                emojiEsquerda=""
                emojiDireita=""
              />
              <View style={styles.disposicaoRodape}>
                <Text style={styles.disposicaoExtremo}>Baixa</Text>
                <Text style={styles.disposicaoExtremo}>Alta</Text>
              </View>

              <Pressable
                onPress={registrarDisposicao}
                disabled={salvandoDisposicao}
                style={({ pressed }) => [styles.registrarBtn, pressed && { opacity: 0.85 }]}
              >
                {salvandoDisposicao ? (
                  <ActivityIndicator size="small" color={cores.destaque} />
                ) : (
                  <Text style={styles.registrarBtnTexto}>Registrar</Text>
                )}
              </Pressable>
            </View>
          </Cartao>
        </Animated.View>
      </ScrollView>

      <MenuLateral
        visivel={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        cliente={cliente}
        rotaAtual="ResumoCliente"
        aoNavegar={(rota) => navigation.navigate(rota)}
        aoAgendar={agendarConsulta}
        aoSair={sair}
      />
    </View>
  );
}

function CartaoAtalho({ icon, titulo, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.atalho, pressed && { opacity: 0.85 }]}>
      <View style={styles.atalhoTopo}>
        <View style={styles.atalhoIcone}>
          <Ionicons name={icon} size={20} color={cores.destaqueEscuro} />
        </View>
        <Ionicons name="chevron-forward" size={16} color={cores.textoClaro} />
      </View>
      <Text style={styles.atalhoTitulo}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: cores.fundo },
  loadingTexto: {
    fontFamily: fontes.texto,
    fontSize: 13,
    color: cores.textoClaro,
    marginTop: espacamento.pequeno,
  },
  container: { paddingHorizontal: espacamento.grande, paddingTop: espacamento.enorme, paddingBottom: espacamento.gigante },

  header: { flexDirection: "row", alignItems: "center" },
  saudacaoNome: { fontFamily: fontes.titulo, fontSize: 20, color: cores.textoEscuro },
  subtitulo: { fontFamily: fontes.texto, fontSize: 13, color: cores.textoClaro, marginTop: 2 },
  sinoBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.destaqueSuave,
    borderRadius: raio.pilula,
  },

  cartaoResumo: { marginTop: espacamento.grande },
  resumoTopo: { flexDirection: "row", alignItems: "center" },
  resumoIconeCirculo: {
    width: 52,
    height: 52,
    borderRadius: raio.pilula,
    backgroundColor: cores.destaqueSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  resumoTitulo: {
    fontFamily: fontes.titulo,
    fontSize: 18,
    color: cores.textoEscuro,
    marginLeft: espacamento.medio,
  },
  resumoLinha: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: espacamento.medio,
  },
  resumoIconePequeno: {
    width: 34,
    height: 34,
    borderRadius: raio.medio,
    backgroundColor: cores.destaqueSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  resumoLinhaTitulo: { fontFamily: fontes.textoMedio, fontSize: 14.5, color: cores.textoEscuro },
  resumoLinhaDescricao: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoClaro, marginTop: 1 },
  agendarBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.destaque,
    borderRadius: raio.medio,
    paddingVertical: 13,
    marginTop: espacamento.medio,
  },
  agendarBtnTexto: { fontFamily: fontes.textoMedio, color: cores.branco, fontSize: 14.5 },

  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: espacamento.grande,
  },
  atalho: {
    width: "48%",
    backgroundColor: cores.superficie,
    borderRadius: raio.grande,
    padding: espacamento.medio,
    marginBottom: espacamento.medio,
    ...sombra.cartao,
  },
  atalhoTopo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  atalhoIcone: {
    width: 40,
    height: 40,
    borderRadius: raio.medio,
    backgroundColor: cores.destaqueSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  atalhoTitulo: {
    fontFamily: fontes.textoMedio,
    fontSize: 14,
    color: cores.textoEscuro,
    marginTop: espacamento.medio,
  },

  humorCartao: { marginTop: espacamento.pequeno, alignItems: "center" },
  humorTitulo: { fontFamily: fontes.titulo, fontSize: 16, color: cores.textoEscuro, marginBottom: espacamento.medio },
  humorLinha: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  humorItem: { alignItems: "center", width: 52 },
  humorEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: raio.pilula,
    alignItems: "center",
    justifyContent: "center",
  },
  humorEmojiSelecionado: {
    borderWidth: 2,
    borderColor: cores.destaque,
  },
  humorEmoji: { fontSize: 26 },
  humorLabel: {
    fontFamily: fontes.textoMedio,
    fontSize: 10,
    color: cores.branco,
    backgroundColor: cores.destaque,
    borderRadius: raio.pilula,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
    overflow: "hidden",
  },

  divisor: {
    height: 1,
    backgroundColor: cores.borda,
    width: "100%",
    marginTop: espacamento.grande,
    marginBottom: espacamento.grande,
  },
  disposicaoTitulo: {
    fontFamily: fontes.titulo,
    fontSize: 16,
    color: cores.textoEscuro,
    marginBottom: espacamento.medio,
    alignSelf: "flex-start",
  },
  disposicaoRodape: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  disposicaoExtremo: {
    fontFamily: fontes.texto,
    fontSize: 12.5,
    color: cores.textoClaro,
  },
  registrarBtn: {
    alignSelf: "flex-end",
    borderWidth: 1.5,
    borderColor: cores.destaque,
    borderRadius: raio.medio,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: espacamento.medio,
    minWidth: 96,
    alignItems: "center",
  },
  registrarBtnTexto: {
    fontFamily: fontes.textoMedio,
    fontSize: 13.5,
    color: cores.destaque,
  },
});