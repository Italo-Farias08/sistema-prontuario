import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento, sombra } from "../../tema/tema";
import Avatar from "../../componentes/Avatar";
import CampoTexto from "../../componentes/CampoTexto";
import { listarClientes } from "../../servicos/dadosServico";
import { useAutenticacao } from "../../contexto/ContextoAutenticacao";
import { useFocusEffect } from "@react-navigation/native";

export default function TelaInicioAdmin({ navigation }) {
  const { sair } = useAutenticacao();
  const [clientes, setClients] = useState([]);
  const [busca, setBusca] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    const data = await listarClientes();
    setClients(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function onRefresh() {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }

  const filtrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pacientes</Text>
          <Text style={styles.subtitle}>{clientes.length} cadastrados</Text>
        </View>
        <Pressable onPress={sair} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={cores.texto} />
        </Pressable>
      </View>

      <CampoTexto
        placeholder="Buscar paciente..."
        value={busca}
        onChangeText={setBusca}
        style={{ marginHorizontal: espacamento.grande }}
      />

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: espacamento.grande,
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={cores.destaque} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum paciente encontrado.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.cartao}
            onPress={() => navigation.navigate("Prontuario", { idCliente: item.id })}
          >
            <Avatar iniciais={item.fotoIniciais} />
            <View style={{ flex: 1, marginLeft: espacamento.medio }}>
              <Text style={styles.name}>{item.nome}</Text>
              <Text style={styles.meta}>
                {item.idade} anos · atualizado em {item.atualizadoEm}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={cores.textoClaro} />
          </Pressable>
        )}
      />

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("CadastroCliente")}
      >
        <Ionicons name="add" size={26} color={cores.branco} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: espacamento.grande,
    paddingTop: espacamento.enorme,
    paddingBottom: espacamento.medio,
  },
  title: {
    fontFamily: fontes.titulo,
    fontSize: 24,
    color: cores.textoEscuro,
  },
  subtitle: {
    fontFamily: fontes.texto,
    fontSize: 12.5,
    color: cores.textoClaro,
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: cores.superficie,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  cartao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: cores.superficie,
    borderRadius: raio.grande,
    padding: espacamento.medio,
    marginBottom: espacamento.pequeno,
    ...sombra.cartao,
  },
  name: {
    fontFamily: fontes.textoMedio,
    fontSize: 15,
    color: cores.textoEscuro,
  },
  meta: {
    fontFamily: fontes.texto,
    fontSize: 12,
    color: cores.textoClaro,
    marginTop: 2,
  },
  empty: {
    textAlign: "center",
    marginTop: espacamento.enorme,
    color: cores.textoClaro,
    fontFamily: fontes.texto,
  },
  fab: {
    position: "absolute",
    right: espacamento.grande,
    bottom: espacamento.enorme,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.destaque,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: cores.sombra,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
});
