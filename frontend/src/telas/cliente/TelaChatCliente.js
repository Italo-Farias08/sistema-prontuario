import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento, sombra } from "../../tema/tema";
import Avatar from "../../componentes/Avatar";
import { useAutenticacao } from "../../contexto/ContextoAutenticacao";
import { listarMensagens, iniciarChamada, obterToken } from "../../servicos/dadosServico";
import { URL_BASE_WS } from "../../configuracao/api";

const NOME_MEDICO = "Dr. Domingos Ribeiro";

function formatarHora(iso) {
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      timeZone: "America/Recife",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function TelaChatCliente({ navigation }) {
  const { sessao } = useAutenticacao();
  const insets = useSafeAreaInsets();
  const listaRef = useRef(null);
  const wsRef = useRef(null);
  const timerReconexao = useRef(null);
  const montado = useRef(true);

  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [conectado, setConectado] = useState(false);
  const [chamadaRecebida, setChamadaRecebida] = useState(null);
  const [enviandoChamada, setEnviandoChamada] = useState(false);

  const conectarWebSocket = useCallback(() => {
    const token = obterToken();
    if (!token) return;

    const ws = new WebSocket(
      `${URL_BASE_WS}?token=${encodeURIComponent(token)}&pacienteId=${sessao.idCliente}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      if (montado.current) setConectado(true);
    };

    ws.onclose = () => {
      if (!montado.current) return;
      setConectado(false);
      // Tenta reconectar sozinho depois de alguns segundos (rede caiu, app voltou do background etc.)
      timerReconexao.current = setTimeout(conectarWebSocket, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (evento) => {
      if (!montado.current) return;
      let dados;
      try {
        dados = JSON.parse(evento.data);
      } catch {
        return;
      }

      if (dados.tipo === "mensagem") {
        setMensagens((atual) => [...atual, dados.mensagem]);
        requestAnimationFrame(() => listaRef.current?.scrollToEnd({ animated: true }));
      }

      if (dados.tipo === "chamada") {
        setChamadaRecebida(dados.url);
      }
    };
  }, [sessao.idCliente]);

  useEffect(() => {
    montado.current = true;

    (async () => {
      try {
        const historico = await listarMensagens(sessao.idCliente);
        if (montado.current) setMensagens(historico);
      } catch {
        // Se falhar, a conversa só começa vazia — não trava a tela por isso.
      } finally {
        if (montado.current) setCarregando(false);
      }
    })();

    conectarWebSocket();

    return () => {
      montado.current = false;
      clearTimeout(timerReconexao.current);
      wsRef.current?.close();
    };
  }, [conectarWebSocket, sessao.idCliente]);

  function enviarMensagem() {
    const conteudo = texto.trim();
    if (!conteudo) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return; // sem conexão — o texto fica no campo, a pessoa tenta de novo em instantes
    }

    wsRef.current.send(JSON.stringify({ tipo: "mensagem", texto: conteudo }));
    setTexto("");
  }

  async function iniciarChamadaVideo() {
    if (enviandoChamada) return;
    setEnviandoChamada(true);
    try {
      const sala = await iniciarChamada(sessao.idCliente);
      navigation.navigate("ChamadaVideoCliente", { url: sala.url });
    } catch {
      // TODO: mostrar um toast/alerta de erro, se quiser algo mais visível
    } finally {
      setEnviandoChamada(false);
    }
  }

  function entrarNaChamadaRecebida() {
    const url = chamadaRecebida;
    setChamadaRecebida(null);
    navigation.navigate("ChamadaVideoCliente", { url });
  }

  function renderMensagem({ item }) {
    const ehCliente = item.remetente === "cliente";
    return (
      <View style={[styles.bolha, ehCliente ? styles.bolhaCliente : styles.bolhaMedico]}>
        <Text style={[styles.textoMensagem, ehCliente && styles.textoMensagemCliente]}>
          {item.texto}
        </Text>
        <Text style={[styles.horaMensagem, ehCliente && styles.horaMensagemCliente]}>
          {formatarHora(item.criadoEm)}
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
            <Text style={styles.statusMedico}>{conectado ? "Online" : "Conectando..."}</Text>
          </View>
        </View>

        <Pressable onPress={iniciarChamadaVideo} hitSlop={10} style={styles.botaoVideo} disabled={enviandoChamada}>
          {enviandoChamada ? (
            <ActivityIndicator size="small" color={cores.branco} />
          ) : (
            <Ionicons name="videocam" size={20} color={cores.branco} />
          )}
        </Pressable>
      </View>

      {/* Aviso de chamada recebida */}
      {chamadaRecebida && (
        <Pressable onPress={entrarNaChamadaRecebida} style={styles.faixaChamada}>
          <Ionicons name="videocam" size={16} color={cores.branco} />
          <Text style={styles.faixaChamadaTexto}>O médico iniciou uma chamada — toque para entrar</Text>
        </Pressable>
      )}

      {/* Lista de mensagens */}
      {carregando ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={cores.destaque} />
        </View>
      ) : (
        <FlatList
          ref={listaRef}
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={renderMensagem}
          contentContainerStyle={styles.listaConteudo}
          onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhuma mensagem ainda. Diga um oi 👋</Text>
          }
        />
      )}

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

  faixaChamada: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: cores.destaque,
    paddingVertical: 10,
  },
  faixaChamadaTexto: { color: cores.branco, fontFamily: fontes.textoMedio, fontSize: 12.5 },

  listaConteudo: {
    paddingHorizontal: espacamento.medio,
    paddingVertical: espacamento.medio,
    gap: espacamento.pequeno,
    flexGrow: 1,
  },
  vazio: {
    textAlign: "center",
    marginTop: espacamento.grande,
    fontFamily: fontes.texto,
    fontSize: 13.5,
    color: cores.textoClaro,
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
