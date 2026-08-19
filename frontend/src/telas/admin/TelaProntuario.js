import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores, fontes, raio, espacamento, sombra } from "../../tema/tema";
import Avatar from "../../componentes/Avatar";
import Cartao from "../../componentes/Cartao";
import CampoTexto from "../../componentes/CampoTexto";
import Botao from "../../componentes/Botao";
import TituloSecao from "../../componentes/TituloSecao";
import SeletorPills from "../../componentes/SeletorPills";
import { buscarClientePorId, atualizarCliente } from "../../servicos/dadosServico";

const TABS = [
  { key: "cadastro", label: "Cadastro" },
  { key: "prontuario", label: "Prontuário" },
  { key: "sintomas", label: "Sintomas" },
  { key: "risco", label: "Avaliação de Risco" },
];

function media(arr, key) {
  if (!arr || arr.length === 0) return null;
  const soma = arr.reduce((acc, item) => acc + (item[key] || 0), 0);
  return Math.round(soma / arr.length);
}

export default function TelaProntuario({ route, navigation }) {
  const { idCliente } = route.params;
  const [cliente, setCliente] = useState(null);
  const [tab, setTab] = useState("prontuario");
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const data = await buscarClientePorId(idCliente);
    setCliente(data);
  }, [idCliente]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const medias = useMemo(() => {
    if (!cliente) return {};
    return {
      sono: media(cliente.checkins, "sono"),
      apetite: media(cliente.checkins, "apetite"),
      humor: media(cliente.checkins, "humor"),
      energia: media(cliente.checkins, "energia"),
    };
  }, [cliente]);

  function set(field, value) {
    setCliente((prev) => ({ ...prev, [field]: value }));
  }
  function setRevisao(field, value) {
    setCliente((prev) => ({
      ...prev,
      revisaoSintomas: { ...prev.revisaoSintomas, [field]: value },
    }));
  }
  function setSubstancias(field, value) {
    setCliente((prev) => ({
      ...prev,
      revisaoSintomas: {
        ...prev.revisaoSintomas,
        substancias: { ...prev.revisaoSintomas.substancias, [field]: value },
      },
    }));
  }
  function setRisco(campo, field, value) {
    setCliente((prev) => ({
      ...prev,
      riscos: {
        ...prev.riscos,
        [campo]: { ...prev.riscos[campo], [field]: value },
      },
    }));
  }
  function setMedicacao(id, field, value) {
    setCliente((prev) => ({
      ...prev,
      medicacoes: prev.medicacoes.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }));
  }
  function addMedicacao() {
    setCliente((prev) => ({
      ...prev,
      medicacoes: [
        ...prev.medicacoes,
        { id: String(Date.now()), nome: "", dosagem: "", horario: "" },
      ],
    }));
  }
  function removerMedicacao(id) {
    setCliente((prev) => ({
      ...prev,
      medicacoes: prev.medicacoes.filter((m) => m.id !== id),
    }));
  }

  async function salvar() {
    setSalvando(true);
    try {
      await atualizarCliente(cliente.id, cliente);
      Alert.alert("Prontuário atualizado", "As informações foram salvas.");
    } catch (e) {
      Alert.alert("Erro", e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  if (!cliente) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={cores.destaque} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <View style={styles.header}>
        <Avatar iniciais={cliente.fotoIniciais} size={52} />
        <View style={{ marginLeft: espacamento.medio, flex: 1 }}>
          <Text style={styles.name}>{cliente.nome}</Text>
          <Text style={styles.meta}>
            {cliente.idade} anos · {cliente.sexo}
          </Text>
        </View>
      </View>

      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: espacamento.grande }}>
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, tab === t.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {tab === "cadastro" && (
          <>
            <TituloSecao title="Dados do paciente" icon="person-outline" />
            <Cartao>
              <InfoRow label="Telefone" value={cliente.telefone} />
              <InfoRow label="Contato de emergência" value={cliente.contatoEmergencia} />
              <InfoRow label="CPF" value={cliente.cpf} />
              <InfoRow label="E-mail" value={cliente.email} />
              <InfoRow label="Endereço" value={cliente.endereco} last />
            </Cartao>

            <TituloSecao title="Dados clínicos" icon="medkit-outline" subtitle="Uso exclusivo do consultório" />
            <CampoTexto label="Comorbidades" value={cliente.admin.comorbidades} onChangeText={(v) => set("admin", { ...cliente.admin, comorbidades: v })} multiline />
            <CampoTexto label="Alergias" value={cliente.admin.alergias} onChangeText={(v) => set("admin", { ...cliente.admin, alergias: v })} multiline />
            <CampoTexto label="Hábitos" value={cliente.admin.habitos} onChangeText={(v) => set("admin", { ...cliente.admin, habitos: v })} multiline />
          </>
        )}

        {tab === "prontuario" && (
          <>
            <TituloSecao title="Medicações em uso" icon="medical-outline" />
            {cliente.medicacoes.map((m) => (
              <Cartao key={m.id} style={{ marginBottom: espacamento.pequeno }}>
                <View style={styles.medRow}>
                  <CampoTexto style={{ flex: 1, marginBottom: 0 }} placeholder="Medicamento" value={m.nome} onChangeText={(v) => setMedicacao(m.id, "nome", v)} />
                  <Pressable onPress={() => removerMedicacao(m.id)} style={{ marginLeft: 8, padding: 4 }}>
                    <Ionicons name="close-circle" size={20} color={cores.perigo} />
                  </Pressable>
                </View>
                <View style={styles.medRow}>
                  <CampoTexto style={{ flex: 1, marginRight: 8, marginBottom: 0 }} placeholder="Dosagem" value={m.dosagem} onChangeText={(v) => setMedicacao(m.id, "dosagem", v)} />
                  <CampoTexto style={{ flex: 1, marginBottom: 0 }} placeholder="Horário" value={m.horario} onChangeText={(v) => setMedicacao(m.id, "horario", v)} />
                </View>
              </Cartao>
            ))}
            <Botao variant="outline" label="+ Adicionar medicação" onPress={addMedicacao} style={{ marginBottom: espacamento.grande }} />

            <TituloSecao title="História da doença atual" icon="document-text-outline" />
            <CampoTexto value={cliente.historiaDoenca} onChangeText={(v) => set("historiaDoenca", v)} multiline placeholder="Descreva a evolução do quadro..." />

            <TituloSecao title="Resumo (visível ao paciente)" icon="eye-outline" subtitle="Aparece na ficha de resumo do paciente" />
            <CampoTexto label="Resumo da história" value={cliente.resumoHistoria} onChangeText={(v) => set("resumoHistoria", v)} multiline />
            <CampoTexto label="Resultado dos exames" value={cliente.resultadoExames} onChangeText={(v) => set("resultadoExames", v)} multiline />
            <CampoTexto label="Plano terapêutico / conduta" value={cliente.planoTerapeutico} onChangeText={(v) => set("planoTerapeutico", v)} multiline />
          </>
        )}

        {tab === "sintomas" && (
          <>
            <TituloSecao
              title="Revisão de sintomas psiquiátricos"
              icon="pulse-outline"
              subtitle="Percentual calculado a partir dos check-ins diários do paciente"
            />
            <SeletorPills
              label="Sono"
              options={["Normal", "Insônia", "Hipersonia", "Fragmentado"]}
              value={cliente.revisaoSintomas.sono}
              onChange={(v) => setRevisao("sono", v)}
              percent={medias.sono}
            />
            <SeletorPills
              label="Apetite"
              options={["Normal", "Aumentado", "Reduzido"]}
              value={cliente.revisaoSintomas.apetite}
              onChange={(v) => setRevisao("apetite", v)}
              percent={medias.apetite}
            />
            <SeletorPills
              label="Libido"
              options={["Normal", "Aumentado", "Reduzido", "Ausente"]}
              value={cliente.revisaoSintomas.libido}
              onChange={(v) => setRevisao("libido", v)}
            />
            <SeletorPills
              label="Humor"
              options={["Estável", "Triste", "Irritado", "Eufórico"]}
              value={cliente.revisaoSintomas.humor}
              onChange={(v) => setRevisao("humor", v)}
              percent={medias.humor}
            />
            <SeletorPills
              label="Energia / Disposição"
              options={["Normal", "Reduzida", "Aumentada"]}
              value={cliente.revisaoSintomas.energia}
              onChange={(v) => setRevisao("energia", v)}
              percent={medias.energia}
            />
            <SeletorPills
              label="Concentração"
              options={["Boa", "Regular", "Prejudicada"]}
              value={cliente.revisaoSintomas.concentracao}
              onChange={(v) => setRevisao("concentracao", v)}
            />
            <SeletorPills
              label="Funcionalidade"
              options={["Mantida", "Prejudicada", "Parcialmente"]}
              value={cliente.revisaoSintomas.funcionalidade}
              onChange={(v) => setRevisao("funcionalidade", v)}
            />
            <SeletorPills
              label="Uso de substâncias"
              options={["Não", "Álcool", "Tabaco", "Outras"]}
              value={cliente.revisaoSintomas.substancias.uso}
              onChange={(v) => setSubstancias("uso", v)}
            />
            {cliente.revisaoSintomas.substancias.uso === "Outras" && (
              <CampoTexto
                placeholder="Qual substância?"
                value={cliente.revisaoSintomas.substancias.outrasDescricao}
                onChangeText={(v) => setSubstancias("outrasDescricao", v)}
              />
            )}
          </>
        )}

        {tab === "risco" && (
          <>
            <TituloSecao title="Avaliação de risco" icon="alert-circle-outline" subtitle="Preenchimento exclusivo do médico" />

            <SeletorPills
              label="Ideação suicida"
              options={["Não", "Sim", "Plano"]}
              value={cliente.riscos.ideacaoSuicida.resposta}
              onChange={(v) => setRisco("ideacaoSuicida", "resposta", v)}
            />
            {cliente.riscos.ideacaoSuicida.resposta !== "Não" && cliente.riscos.ideacaoSuicida.resposta !== "" && (
              <CampoTexto
                placeholder="Observações"
                value={cliente.riscos.ideacaoSuicida.obs}
                onChangeText={(v) => setRisco("ideacaoSuicida", "obs", v)}
                multiline
              />
            )}

            <SeletorPills
              label="Heteroagressão"
              options={["Não", "Sim"]}
              value={cliente.riscos.heteroagressao.resposta}
              onChange={(v) => setRisco("heteroagressao", "resposta", v)}
            />
            {cliente.riscos.heteroagressao.resposta === "Sim" && (
              <CampoTexto
                placeholder="Qual? (função/contexto)"
                value={cliente.riscos.heteroagressao.funcao}
                onChangeText={(v) => setRisco("heteroagressao", "funcao", v)}
                multiline
              />
            )}

            <SeletorPills
              label="Sintomas psicóticos"
              options={["Não", "Sim"]}
              value={cliente.riscos.sintomasPsicoticos.resposta}
              onChange={(v) => setRisco("sintomasPsicoticos", "resposta", v)}
            />
            {cliente.riscos.sintomasPsicoticos.resposta === "Sim" && (
              <CampoTexto
                placeholder="Qual? (função/contexto)"
                value={cliente.riscos.sintomasPsicoticos.funcao}
                onChangeText={(v) => setRisco("sintomasPsicoticos", "funcao", v)}
                multiline
              />
            )}
          </>
        )}

        <Botao
          label={salvando ? "Salvando..." : "Salvar alterações"}
          onPress={salvar}
          loading={salvando}
          style={{ marginTop: espacamento.medio, marginBottom: espacamento.gigante }}
        />
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <View style={[infoStyles.row, !last && infoStyles.divider]}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value || "—"}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { paddingVertical: 10 },
  divider: { borderBottomWidth: 1, borderBottomColor: cores.borda },
  label: {
    fontFamily: fontes.texto,
    fontSize: 11.5,
    color: cores.textoClaro,
    marginBottom: 2,
  },
  value: {
    fontFamily: fontes.textoMedio,
    fontSize: 14,
    color: cores.textoEscuro,
  },
});

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: cores.fundo },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: espacamento.grande,
    paddingTop: espacamento.grande,
    paddingBottom: espacamento.medio,
    backgroundColor: cores.fundo,
  },
  name: {
    fontFamily: fontes.titulo,
    fontSize: 18,
    color: cores.textoEscuro,
  },
  meta: {
    fontFamily: fontes.texto,
    fontSize: 12.5,
    color: cores.textoClaro,
    marginTop: 2,
  },
  tabsWrap: {
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    paddingBottom: espacamento.pequeno,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: raio.pilula,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: cores.destaque,
    borderColor: cores.destaque,
  },
  tabText: {
    fontFamily: fontes.textoMedio,
    fontSize: 12.5,
    color: cores.texto,
  },
  tabTextActive: {
    color: cores.branco,
  },
  content: {
    paddingHorizontal: espacamento.grande,
    paddingTop: espacamento.medio,
    paddingBottom: espacamento.enorme,
  },
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: espacamento.pequeno,
  },
});
