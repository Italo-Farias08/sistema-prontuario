import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento } from "../tema/tema";
import Avatar from "./Avatar";

const LARGURA_TELA = Dimensions.get("window").width;
const LARGURA_MENU = Math.min(LARGURA_TELA * 0.78, 300);

/**
 * Menu lateral (drawer) da área do cliente. Não depende de
 * @react-navigation/drawer — é um Modal + Animated próprio, para não
 * exigir novas dependências nativas no projeto.
 */
export default function MenuLateral({
  visivel,
  aoFechar,
  cliente,
  rotaAtual,
  aoNavegar,
  aoAgendar,
  aoSair,
}) {
  const posicaoX = useRef(new Animated.Value(-LARGURA_MENU)).current;
  const opacidadeFundo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visivel) {
      Animated.parallel([
        Animated.timing(posicaoX, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacidadeFundo, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      posicaoX.setValue(-LARGURA_MENU);
      opacidadeFundo.setValue(0);
    }
  }, [visivel]);

  function fecharComAnimacao(callback) {
    Animated.parallel([
      Animated.timing(posicaoX, {
        toValue: -LARGURA_MENU,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacidadeFundo, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      aoFechar();
      if (callback) callback();
    });
  }

  const itens = [
    { rota: "ResumoCliente", label: "Início", icon: "home-outline" },
    {
      rota: "InfoMedicaCliente",
      label: "Informações médicas",
      icon: "medical-outline",
    },
    { rota: "MeusDadosCliente", label: "Meus dados", icon: "person-outline" },
  ];

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="none"
      onRequestClose={() => fecharComAnimacao()}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[styles.fundo, { opacity: opacidadeFundo }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => fecharComAnimacao()} />
        </Animated.View>

        <Animated.View
          style={[
            styles.painel,
            { width: LARGURA_MENU, transform: [{ translateX: posicaoX }] },
          ]}
        >
          <View style={styles.header}>
            <Avatar iniciais={cliente?.fotoIniciais} size={48} />
            <View style={{ marginLeft: espacamento.medio, flex: 1 }}>
              <Text style={styles.nome} numberOfLines={1}>
                {cliente?.nome?.split(" ")[0] || ""}
              </Text>
              <Text style={styles.subNome} numberOfLines={1}>
                {cliente?.email || ""}
              </Text>
            </View>
          </View>

          <View style={styles.linha} />

          <View style={{ marginTop: espacamento.pequeno }}>
            {itens.map((item) => {
              const ativo = rotaAtual === item.rota;
              return (
                <Pressable
                  key={item.rota}
                  onPress={() => fecharComAnimacao(() => aoNavegar(item.rota))}
                  style={[styles.item, ativo && styles.itemAtivo]}
                >
                  <Ionicons
                    name={item.icon}
                    size={19}
                    color={ativo ? cores.destaqueEscuro : cores.texto}
                  />
                  <Text style={[styles.itemLabel, ativo && styles.itemLabelAtivo]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flex: 1 }} />

          <Pressable
            style={styles.itemAgendar}
            onPress={() => fecharComAnimacao(() => aoAgendar())}
          >
            <Ionicons name="logo-whatsapp" size={19} color={cores.branco} />
            <Text style={styles.itemAgendarLabel}>Agendar consulta</Text>
          </Pressable>

          <Pressable
            style={styles.itemSair}
            onPress={() => fecharComAnimacao(() => aoSair())}
          >
            <Ionicons name="log-out-outline" size={19} color={cores.perigo} />
            <Text style={styles.itemSairLabel}>Sair</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  painel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: cores.superficie,
    paddingTop: 64,
    paddingHorizontal: espacamento.medio,
    paddingBottom: espacamento.grande,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: espacamento.medio },
  nome: { fontFamily: fontes.titulo, fontSize: 17, color: cores.textoEscuro },
  subNome: { fontFamily: fontes.texto, fontSize: 11.5, color: cores.textoClaro, marginTop: 2 },
  linha: { height: 1, backgroundColor: cores.borda },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: raio.medio,
    marginBottom: 4,
  },
  itemAtivo: { backgroundColor: cores.destaqueSuave },
  itemLabel: {
    fontFamily: fontes.texto,
    fontSize: 14.5,
    color: cores.texto,
    marginLeft: 12,
  },
  itemLabelAtivo: { fontFamily: fontes.textoMedio, color: cores.destaqueEscuro },
  itemAgendar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3F9B54",
    borderRadius: raio.medio,
    paddingVertical: 12,
    marginBottom: 10,
  },
  itemAgendarLabel: {
    fontFamily: fontes.textoMedio,
    color: cores.branco,
    fontSize: 13.5,
    marginLeft: 8,
  },
  itemSair: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: raio.medio,
    borderWidth: 1,
    borderColor: cores.perigoSuave,
  },
  itemSairLabel: {
    fontFamily: fontes.textoMedio,
    color: cores.perigo,
    fontSize: 13.5,
    marginLeft: 8,
  },
});
