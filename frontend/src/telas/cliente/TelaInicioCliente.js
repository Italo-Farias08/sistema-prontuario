import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento, sombra } from "../../tema/tema";
import Cartao from "../../componentes/Cartao";
import Avatar from "../../componentes/Avatar";
import MenuLateral from "../../componentes/MenuLateral";
import CheckinDiario from "../../componentes/CheckinDiario";
import TendenciaSemana from "../../componentes/TendenciaSemana";
import TituloSecao from "../../componentes/TituloSecao";
import { buscarClientePorId, registrarCheckin as registrarCheckinApi } from "../../servicos/dadosServico";
import { useAutenticacao } from "../../contexto/ContextoAutenticacao";
import { WHATSAPP_DOUTOR } from "../../dados/dadosMock";

function saudacaoPorHorario() {
  const hora = new Date().getHours();
  if (hora < 5) return "Boa madrugada";
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default function TelaInicioCliente({ navigation }) {
  const { sessao, sair } = useAutenticacao();
  const insets = useSafeAreaInsets();
  const [cliente, setCliente] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState(false);

  const opacidade = useRef(new Animated.Value(0)).current;
  const deslocamento = useRef(new Animated.Value(14)).current;

  async function carregarCliente() {
    try {
      setErroCarregar(false);
      const dados = await buscarClientePorId(sessao.idCliente);
      setCliente(dados);
    } catch (e) {
      setErroCarregar(true);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCliente();
  }, [sessao.idCliente]);

  useEffect(() => {
    if (cliente) {
      Animated.parallel([
        Animated.timing(opacidade, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(deslocamento, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]).start();
    }
  }, [cliente]);

  // O CheckinDiario manda humor já em 0-100 (toque rápido) ou os três
  // sliders em escala 0-10 (indicadores). O backend espera tudo em 0-100.
  async function aoRegistrarRapido(valorHumor) {
    const clienteAtualizado = await registrarCheckinApi(sessao.idCliente, { humor: valorHumor });
    setCliente(clienteAtualizado);
  }

  async function aoRegistrarIndicadores({ ansiedade, humor, energia }) {
    const clienteAtualizado = await registrarCheckinApi(sessao.idCliente, {
      ansiedade: ansiedade * 10,
      humor: humor * 10,
      energia: energia * 10,
    });
    setCliente(clienteAtualizado);
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

  if (carregando) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator color={cores.destaque} />
        <Text style={styles.loadingTexto}>Carregando suas informações...</Text>
      </View>
    );
  }

  if (erroCarregar || !cliente) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <Ionicons name="cloud-offline-outline" size={32} color={cores.textoClaro} />
        <Text style={styles.loadingTexto}>Não foi possível carregar seus dados agora.</Text>
        <Pressable onPress={carregarCliente} style={styles.tentarNovamenteBtn}>
          <Text style={styles.tentarNovamenteTexto}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const primeiroNome = cliente.nome.split(" ")[0];

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + espacamento.gigante }}
        showsVerticalScrollIndicator={false}
      >
        {/* Faixa de marca — logo + avatar/saudação, com curva na base */}
        <LinearGradient
          colors={cores.gradientePrincipal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroBand, { paddingTop: insets.top + espacamento.medio }]}
        >
          <View style={styles.heroTopo}>
            <Image
              source={require("../../../assets/logo-preta.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Pressable
              onPress={() => Alert.alert("Notificações", "Nenhuma notificação nova por enquanto.")}
              style={styles.sinoBtn}
              hitSlop={8}
            >
              <Ionicons name="notifications-outline" size={19} color={cores.branco} />
            </Pressable>
          </View>

          <View style={styles.heroPerfil}>
            <View style={styles.avatarAnel}>
              <Avatar iniciais={cliente?.fotoIniciais} size={46} />
            </View>
            <View style={{ marginLeft: espacamento.medio, flex: 1 }}>
              <Text style={styles.saudacao}>{saudacaoPorHorario()},</Text>
              <Text style={styles.nomeCliente} numberOfLines={1}>{primeiroNome}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.conteudo}>
          <Animated.View
            style={{
              opacity: opacidade,
              transform: [{ translateY: deslocamento }],
            }}
          >
            {/* Cartão de resumo — sobrepõe a faixa gradiente acima */}
            <Cartao style={styles.cartaoResumo}>
              <View style={styles.resumoTopo}>
                <View style={styles.resumoIconeCirculo}>
                  <Ionicons name="heart" size={24} color={cores.destaqueEscuro} />
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
                style={({ pressed }) => [pressed && { opacity: 0.9 }]}
              >
                <LinearGradient
                  colors={cores.gradientePrincipal}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.agendarBtn}
                >
                  <Text style={styles.agendarBtnTexto}>Agendar agora</Text>
                  <Ionicons name="arrow-forward" size={16} color={cores.branco} style={{ marginLeft: 6 }} />
                </LinearGradient>
              </Pressable>
            </Cartao>

            {/* Card de check-in diário — só aparece se ainda não foi feito hoje */}
            <CheckinDiario
              checkins={cliente.checkins}
              aoRegistrarRapido={aoRegistrarRapido}
              aoRegistrarIndicadores={aoRegistrarIndicadores}
            />

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

            {/* Evolução da semana */}
            <TituloSecao title="Sua evolução" icon="trending-up-outline" subtitle="Últimos check-ins registrados" />
            <Cartao>
              <TendenciaSemana checkins={cliente.checkins} />
            </Cartao>
          </Animated.View>
        </View>
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
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: cores.fundo, paddingHorizontal: espacamento.grande },
  loadingTexto: {
    fontFamily: fontes.texto,
    fontSize: 13,
    color: cores.textoClaro,
    marginTop: espacamento.pequeno,
    textAlign: "center",
  },
  tentarNovamenteBtn: {
    marginTop: espacamento.medio,
    borderWidth: 1.5,
    borderColor: cores.destaque,
    borderRadius: raio.medio,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tentarNovamenteTexto: { fontFamily: fontes.textoMedio, color: cores.destaque, fontSize: 13.5 },

  // Faixa gradiente do topo — elemento de assinatura da tela. Curva na
  // base pra criar a sensação de camada, e o cartão de resumo logo
  // abaixo sobrepõe essa curva (ver cartaoResumo.marginTop negativo).
  heroBand: {
    paddingHorizontal: espacamento.grande,
    paddingBottom: espacamento.gigante + espacamento.pequeno,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTopo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { width: 190, height: 50 },
  sinoBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: raio.pilula,
  },
  heroPerfil: { flexDirection: "row", alignItems: "center", marginTop: espacamento.grande },
  avatarAnel: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: raio.pilula,
    padding: 2,
  },
  saudacao: { fontFamily: fontes.texto, fontSize: 13, color: "rgba(255,255,255,0.85)" },
  nomeCliente: { fontFamily: fontes.titulo, fontSize: 22, color: cores.branco, marginTop: 1 },

  conteudo: { paddingHorizontal: espacamento.grande },

  cartaoResumo: {
    marginTop: -40,
    ...sombra.flutuante,
  },
  resumoTopo: { flexDirection: "row", alignItems: "center" },
  resumoIconeCirculo: {
    width: 48,
    height: 48,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
});