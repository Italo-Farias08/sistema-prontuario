import React, { useEffect, useRef, useState } from "react";
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
import { cores, fontes, raio, espacamento } from "../../tema/tema";
import Cartao from "../../componentes/Cartao";
import TituloSecao from "../../componentes/TituloSecao";
import EscalaRapida from "../../componentes/EscalaRapida";
import SliderClinico from "../../componentes/SliderClinico";
import TendenciaSemana from "../../componentes/TendenciaSemana";
import CabecalhoCliente from "../../componentes/CabecalhoCliente";
import MenuLateral from "../../componentes/MenuLateral";
import { buscarClientePorId, registrarCheckin as registrarCheckinApi } from "../../servicos/dadosServico";
import { useAutenticacao } from "../../contexto/ContextoAutenticacao";
import { WHATSAPP_DOUTOR } from "../../dados/dadosMock";

function saudacaoPorHorario() {
  const hora = new Date().getHours();
  if (hora < 5) return "Boa madrugada,";
  if (hora < 12) return "Bom dia,";
  if (hora < 18) return "Boa tarde,";
  return "Boa noite,";
}

export default function TelaInicioCliente({ navigation }) {
  const { sessao, sair } = useAutenticacao();
  const [cliente, setCliente] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);

  // Etapa 1 — toque rápido, registra na hora
  const [humorRapido, setHumorRapido] = useState(null);
  const [rapidoRegistrado, setRapidoRegistrado] = useState(false);

  // Etapa 2 — os três indicadores de 0 a 10
  const [ansiedade, setAnsiedade] = useState(5);
  const [humorSlider, setHumorSlider] = useState(5);
  const [energiaSlider, setEnergiaSlider] = useState(5);
  const [salvandoIndicadores, setSalvandoIndicadores] = useState(false);
  const [indicadoresSalvos, setIndicadoresSalvos] = useState(false);

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

  // Toque num emoji já registra o check-in do dia — sem botão, sem fricção.
  async function selecionarHumorRapido(valor) {
    setHumorRapido(valor);
    try {
      const clienteAtualizado = await registrarCheckinApi(sessao.idCliente, { humor: valor });
      setCliente(clienteAtualizado);
      setRapidoRegistrado(true);
      setHumorSlider(Math.round(valor / 10));
    } catch (e) {
      Alert.alert("Ops", e.message || "Não foi possível registrar agora. Tente de novo.");
    }
  }

  async function salvarIndicadores() {
    setSalvandoIndicadores(true);
    try {
      const clienteAtualizado = await registrarCheckinApi(sessao.idCliente, {
        ansiedade: ansiedade * 10,
        humor: humorSlider * 10,
        energia: energiaSlider * 10,
      });
      setCliente(clienteAtualizado);
      setIndicadoresSalvos(true);
      setTimeout(() => setIndicadoresSalvos(false), 2500);
    } catch (e) {
      Alert.alert("Ops", e.message || "Não foi possível salvar os indicadores.");
    } finally {
      setSalvandoIndicadores(false);
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
        <CabecalhoCliente
          cliente={cliente}
          saudacao={saudacaoPorHorario()}
          titulo={primeiroNome}
          aoAbrirMenu={() => setMenuAberto(true)}
        />

        <Animated.View
          style={{
            opacity: opacidade,
            transform: [{ translateY: deslocamento }],
          }}
        >
          {/* Check-in do dia — a interação dinâmica da tela principal */}
          <Cartao style={{ marginTop: espacamento.grande }}>
            <TituloSecao
              title="Como você está se sentindo hoje?"
              icon="happy-outline"
              subtitle="Toque numa opção — o registro já é feito na hora"
            />
            <EscalaRapida
              selecionado={humorRapido}
              onSelecionar={selecionarHumorRapido}
              registrado={rapidoRegistrado}
            />

            <View style={styles.divisor} />

            <TituloSecao
              title="Três indicadores rápidos"
              icon="pulse-outline"
              subtitle="Isso dá uma informação clínica mais precisa pro seu médico"
            />

            <SliderClinico label="Ansiedade" value={ansiedade} onChange={setAnsiedade} />
            <SliderClinico
              label="Humor"
              value={humorSlider}
              onChange={setHumorSlider}
              emojiEsquerda="😞"
              emojiDireita="😄"
            />
            <SliderClinico
              label="Energia/disposição"
              value={energiaSlider}
              onChange={setEnergiaSlider}
              emojiEsquerda="🪫"
              emojiDireita="🔋"
            />

            <Pressable
              onPress={salvarIndicadores}
              disabled={salvandoIndicadores}
              style={({ pressed }) => [styles.salvarBtn, pressed && { opacity: 0.85 }]}
            >
              {salvandoIndicadores ? (
                <ActivityIndicator size="small" color={cores.branco} />
              ) : (
                <Ionicons
                  name={indicadoresSalvos ? "checkmark-circle" : "save-outline"}
                  size={16}
                  color={cores.branco}
                />
              )}
              <Text style={styles.salvarBtnText}>
                {indicadoresSalvos ? "Salvo!" : salvandoIndicadores ? "Salvando..." : "Salvar indicadores"}
              </Text>
            </Pressable>

            <View style={styles.divisor} />

            <TituloSecao title="Sua semana" icon="trending-up-outline" />
            <TendenciaSemana checkins={cliente.checkins} />
          </Cartao>

          {/* Atalhos para as informações, organizadas em telas próprias */}
          <TituloSecao title="Suas informações" icon="folder-open-outline" />
          <CartaoAtalho
            icon="medical-outline"
            titulo="Informações médicas"
            descricao="Resumo da história, exames, plano terapêutico e medicação"
            nota={cliente.atualizadoEm ? `Atualizado em ${cliente.atualizadoEm}` : null}
            onPress={() => navigation.navigate("InfoMedicaCliente")}
          />
          <CartaoAtalho
            icon="person-outline"
            titulo="Meus dados"
            descricao="Contato, endereço e informações de cadastro"
            onPress={() => navigation.navigate("MeusDadosCliente")}
          />

          <Pressable
            style={({ pressed }) => [styles.whatsappBtn, pressed && { opacity: 0.9 }]}
            onPress={agendarConsulta}
          >
            <Ionicons name="logo-whatsapp" size={20} color={cores.branco} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.whatsappText}>Agendar consulta</Text>
              <Text style={styles.whatsappSubtexto}>Fale direto com o consultório</Text>
            </View>
          </Pressable>
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

function CartaoAtalho({ icon, titulo, descricao, nota, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      <Cartao style={styles.atalho}>
        <View style={styles.atalhoIcone}>
          <Ionicons name={icon} size={20} color={cores.destaqueEscuro} />
        </View>
        <View style={{ flex: 1, marginLeft: espacamento.medio }}>
          <Text style={styles.atalhoTitulo}>{titulo}</Text>
          <Text style={styles.atalhoDescricao}>{descricao}</Text>
          {nota ? <Text style={styles.atalhoNota}>{nota}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={cores.textoClaro} />
      </Cartao>
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
  divisor: {
    height: 1,
    backgroundColor: cores.borda,
    marginTop: espacamento.grande,
    marginBottom: espacamento.pequeno,
  },
  salvarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.destaque,
    borderRadius: raio.medio,
    paddingVertical: 12,
    marginTop: 4,
  },
  salvarBtnText: {
    fontFamily: fontes.textoMedio,
    color: cores.branco,
    fontSize: 13.5,
    marginLeft: 8,
  },
  atalho: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: espacamento.pequeno,
  },
  atalhoIcone: {
    width: 40,
    height: 40,
    borderRadius: raio.medio,
    backgroundColor: cores.destaqueSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  atalhoTitulo: { fontFamily: fontes.textoMedio, fontSize: 14.5, color: cores.textoEscuro },
  atalhoDescricao: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoClaro, marginTop: 2 },
  atalhoNota: { fontFamily: fontes.texto, fontSize: 10.5, color: cores.destaqueEscuro, marginTop: 4 },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3F9B54",
    borderRadius: raio.medio,
    paddingVertical: 12,
    marginTop: espacamento.grande,
  },
  whatsappText: {
    fontFamily: fontes.textoMedio,
    color: cores.branco,
    fontSize: 14,
  },
  whatsappSubtexto: {
    fontFamily: fontes.texto,
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    marginTop: 1,
  },
});