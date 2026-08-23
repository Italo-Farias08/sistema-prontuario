import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento, sombra } from "../../tema/tema";
import Avatar from "../../componentes/Avatar";
import { useAutenticacao } from "../../contexto/ContextoAutenticacao";

// TODO: trocar pelas chamadas reais quando o backend de mensagens existir
// (ex: servicos/dadosServico -> buscarMensagens(idConversa), enviarMensagem(...)).
// Por enquanto a tela funciona com um mock local só pra já deixar o fluxo
// (navegação + UI + botão de chamada) pronto e testável.
const MENSAGENS_MOCK = [
  { id: "1", autor: "medico", texto: "Olá! Como você está se sentindo hoje?", hora: "09:12" },
  { id: "2", autor: "cliente", texto: "Bom dia, doutor! Estou bem melhor essa semana.", hora: "09:14" },
  { id: "3", autor: "medico", texto: "Que ótimo saber disso. Conseguiu manter o sono regular?", hora: "09:15" },
];

const NOME_MEDICO = "Dr. Domingos Ribeiro";

export default function TelaChatCliente({ navigation }) {
  const { sessao } = useAutenticacao();
  const insets = useSafeAreaInsets();
  const listaRef = useRef(null);

  const [mensagens, setMensagens] = useState(MENSAGENS_MOCK);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    // TODO: buscarMensagens(sessao.idCliente) aqui quando o endpoint existir
  }, []);

  function enviarMensagem() {
    const conteudo = texto.trim();
    if (!conteudo) return;

    const nova = {
      id: String(Date.now()),
      autor: "cliente",
      texto: conteudo,
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMensagens((atual) => [...atual, nova]);
    setTexto("");
    // TODO: enviarMensagem(sessao.idCliente, conteudo) aqui quando o endpoint existir

    requestAnimationFrame(() => listaRef.current?.scrollToEnd({ animated: true }));
  }

  function iniciarChamadaVideo() {
    // TODO: navegar pra tela real de chamada (ex: TelaChamadaVideo) passando
    // a sala/room do provedor de vídeo (Daily.co) assim que a integração
    // estiver pronta (requer Dev Client / EAS Build, ver conversa anterior).
    navigation.navigate("ChamadaVideoCliente", { idConversa: sessao.idCliente });
  }

  function renderMensagem({ item }) {
    const ehCliente = item.autor === "cliente";
    return (
      <View
        style={[
          styles.bolha,
          ehCliente ? styles.bolhaCliente : styles.bolhaMedico,
        ]}
      >
        <Text style={[styles.textoMensagem, ehCliente && styles.textoMensagemCliente]}>
          {item.texto}
        </Text>
        <Text style={[styles.horaMensagem, ehCliente && styles.horaMensagemCliente]}>
          {item.hora}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top}
    >
      {/* Cabeçalho */}
      <View style={[styles.cabecalho, { paddingTop: insets.top + espacamento.pequeno }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.botaoVoltar}>
          <Ionicons name="chevron-back" size={24} color={cores.textoEscuro} />
        </Pressable>

        <View style={styles.cabecalhoInfo}>
          <Avatar iniciais="DR" size={38} />
          <View style={{ marginLeft: espacamento.pequeno }}>
            <Text style={styles.nomeMedico} numberOfLines={1}>{NOME_MEDICO}</Text>
            <Text style={styles.statusMedico}>Online</Text>
          </View>
        </View>

        <Pressable onPress={iniciarChamadaVideo} hitSlop={10} style={styles.botaoVideo}>
          <Ionicons name="videocam" size={20} color={cores.branco} />
        </Pressable>
      </View>

      {/* Lista de mensagens */}
      <FlatList
        ref={listaRef}
        data={mensagens}
        keyExtractor={(item) => item.id}
        renderItem={renderMensagem}
        contentContainerStyle={styles.listaConteudo}
        onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Campo de envio */}
      <View style={[styles.campoEnvio, { paddingBottom: insets.bottom + espacamento.pequeno }]}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escreva uma mensagem..."
          placeholderTextColor={cores.textoClaro}
          style={styles.input}
          multiline
        />
        <Pressable onPress={enviarMensagem} style={styles.botaoEnviar} hitSlop={8}>
          <Ionicons name="send" size={18} color={cores.branco} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: espacamento.medio,
    paddingBottom: espacamento.medio,
    backgroundColor: cores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    ...sombra.cartao,
  },
  botaoVoltar: { paddingRight: espacamento.pequeno },
  cabecalhoInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
  nomeMedico: { fontFamily: fontes.textoMedio, fontSize: 15, color: cores.textoEscuro },
  statusMedico: { fontFamily: fontes.texto, fontSize: 11.5, color: cores.destaque, marginTop: 1 },
  botaoVideo: {
    width: 38,
    height: 38,
    borderRadius: raio.pilula,
    backgroundColor: cores.destaque,
    alignItems: "center",
    justifyContent: "center",
  },

  listaConteudo: {
    paddingHorizontal: espacamento.medio,
    paddingVertical: espacamento.medio,
    gap: espacamento.pequeno,
  },
  bolha: {
    maxWidth: "78%",
    borderRadius: raio.grande,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: espacamento.pequeno,
  },
  bolhaMedico: {
    backgroundColor: cores.superficie,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    ...sombra.cartao,
  },
  bolhaCliente: {
    backgroundColor: cores.destaque,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  textoMensagem: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoEscuro },
  textoMensagemCliente: { color: cores.branco },
  horaMensagem: {
    fontFamily: fontes.texto,
    fontSize: 10,
    color: cores.textoClaro,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  horaMensagemCliente: { color: "rgba(255,255,255,0.75)" },

  campoEnvio: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: espacamento.medio,
    paddingTop: espacamento.pequeno,
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  input: {
    flex: 1,
    fontFamily: fontes.texto,
    fontSize: 14,
    color: cores.textoEscuro,
    backgroundColor: cores.fundo,
    borderRadius: raio.grande,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: espacamento.pequeno,
  },
  botaoEnviar: {
    width: 40,
    height: 40,
    borderRadius: raio.pilula,
    backgroundColor: cores.destaque,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
});