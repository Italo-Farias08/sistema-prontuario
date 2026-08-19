import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento } from "../../tema/tema";
import Cartao from "../../componentes/Cartao";
import TituloSecao from "../../componentes/TituloSecao";
import EscalaEmoji from "../../componentes/EscalaEmoji";
import BarraPorcentagem from "../../componentes/BarraPorcentagem";
import CabecalhoCliente from "../../componentes/CabecalhoCliente";
import MenuLateral from "../../componentes/MenuLateral";
import { buscarClientePorId, registrarCheckin as registrarCheckinApi } from "../../servicos/dadosServico";
import { useAutenticacao } from "../../contexto/ContextoAutenticacao";
import { WHATSAPP_DOUTOR } from "../../dados/dadosMock";

export default function TelaInicioCliente({ navigation }) {
  const { sessao, sair } = useAutenticacao();
  const [cliente, setCliente] = useState(null);
  const [humor, setHumor] = useState(null);
  const [sono, setSono] = useState(null);
  const [energia, setEnergia] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    buscarClientePorId(sessao.idCliente).then(setCliente);
  }, [sessao.idCliente]);

  async function registrarCheckin() {
    try {
      const clienteAtualizado = await registrarCheckinApi(sessao.idCliente, {
        humor,
        sono,
        energia,
      });
      setCliente(clienteAtualizado);
      setEnviado(true);
      setTimeout(() => setEnviado(false), 2500);
    } catch (e) {
      Alert.alert("Ops", e.message || "Não foi possível registrar o check-in.");
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
      </View>
    );
  }

  const mediaSemana = Math.round(
    cliente.checkins.reduce((acc, c) => acc + c.humor, 0) / (cliente.checkins.length || 1)
  );

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <CabecalhoCliente
          cliente={cliente}
          saudacao="Olá,"
          titulo={cliente.nome.split(" ")[0]}
          aoAbrirMenu={() => setMenuAberto(true)}
        />

        {/* Check-in do dia — a interação dinâmica da tela principal */}
        <Cartao style={{ marginTop: espacamento.medio }}>
          <TituloSecao
            title="Como você está hoje?"
            icon="happy-outline"
            subtitle="Toque em um emoji para registrar"
          />
          <EscalaEmoji label="Humor" selected={humor} onSelect={setHumor} />
          <EscalaEmoji label="Sono" selected={sono} onSelect={setSono} />
          <EscalaEmoji label="Energia" selected={energia} onSelect={setEnergia} />

          <Pressable style={styles.checkinBtn} onPress={registrarCheckin}>
            <Ionicons
              name={enviado ? "checkmark-circle" : "paper-plane-outline"}
              size={16}
              color={cores.branco}
            />
            <Text style={styles.checkinBtnText}>
              {enviado ? "Registrado!" : "Registrar check-in"}
            </Text>
          </Pressable>

          <View style={{ marginTop: espacamento.grande }}>
            <BarraPorcentagem label="Humor médio da semana" value={mediaSemana} />
          </View>
        </Cartao>

        {/* Atalhos para as informações, agora organizadas em telas próprias */}
        <TituloSecao title="Suas informações" icon="folder-open-outline" />
        <CartaoAtalho
          icon="medical-outline"
          titulo="Informações médicas"
          descricao="Resumo da história, exames, plano terapêutico e medicação"
          onPress={() => navigation.navigate("InfoMedicaCliente")}
        />
        <CartaoAtalho
          icon="person-outline"
          titulo="Meus dados"
          descricao="Contato, endereço e informações de cadastro"
          onPress={() => navigation.navigate("MeusDadosCliente")}
        />

        <Pressable style={styles.whatsappBtn} onPress={agendarConsulta}>
          <Ionicons name="logo-whatsapp" size={20} color={cores.branco} />
          <Text style={styles.whatsappText}>Agendar consulta com o Doutor</Text>
        </Pressable>
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

function CartaoAtalho({ icon, titulo, descricao, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      <Cartao style={styles.atalho}>
        <View style={styles.atalhoIcone}>
          <Ionicons name={icon} size={20} color={cores.destaqueEscuro} />
        </View>
        <View style={{ flex: 1, marginLeft: espacamento.medio }}>
          <Text style={styles.atalhoTitulo}>{titulo}</Text>
          <Text style={styles.atalhoDescricao}>{descricao}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={cores.textoClaro} />
      </Cartao>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: cores.fundo },
  container: { paddingHorizontal: espacamento.grande, paddingTop: espacamento.enorme, paddingBottom: espacamento.gigante },
  checkinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.destaque,
    borderRadius: raio.medio,
    paddingVertical: 12,
  },
  checkinBtnText: {
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
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3F9B54",
    borderRadius: raio.medio,
    paddingVertical: 14,
    marginTop: espacamento.grande,
  },
  whatsappText: {
    fontFamily: fontes.textoMedio,
    color: cores.branco,
    fontSize: 14,
    marginLeft: 10,
  },
});
