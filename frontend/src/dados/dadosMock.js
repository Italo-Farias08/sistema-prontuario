// Dados de demonstração. Quando o backend estiver pronto,
// isso deixa de ser usado — ver src/servicos/dadosServico.js

export const clientesIniciais = [
  {
    id: "1",
    // ------- Cadastro do Cliente -------
    nome: "Marina Alves Ferreira",
    sexo: "Feminino",
    idade: 34,
    dataNascimento: "12/04/1991",
    telefone: "(81) 99123-4567",
    contatoEmergencia: "Carlos Ferreira - (81) 99876-1234",
    cpf: "123.456.789-00",
    email: "marina.alves@email.com",
    endereco: "Rua das Acácias, 245 - Vitória de Santo Antão, PE",
    fotoIniciais: "MA",

    // ------- Dados clínicos (uso exclusivo do consultório) -------
    admin: {
      comorbidades: "Hipotireoidismo",
      alergias: "Dipirona",
      habitos: "Não fumante, etilismo social",
    },

    // ------- Ficha de resumo (visível ao cliente) -------
    resumoHistoria:
      "Acompanhamento iniciado em 2023 para manejo de sintomas ansiosos e alterações do sono. Evolução progressiva com boa resposta terapêutica.",
    resultadoExames:
      "Hemograma, função tireoidiana e vitamina D dentro da normalidade (última coleta: 03/2026).",
    planoTerapeutico:
      "Manter medicação atual, psicoterapia quinzenal e reavaliação em 30 dias. Orientada sobre higiene do sono.",
    medicacoes: [
      { id: "m1", nome: "Escitalopram", dosagem: "10mg", horario: "1x ao dia - manhã" },
      { id: "m2", nome: "Trazodona", dosagem: "50mg", horario: "1x ao dia - noite" },
    ],

    // ------- Prontuário (uso exclusivo do médico) -------
    historiaDoenca:
      "Paciente relata quadro ansioso há aproximadamente 2 anos, com piora nos últimos 3 meses associada a fatores ocupacionais. Nega episódios depressivos maiores prévios.",
    revisaoSintomas: {
      sono: "Fragmentado",
      apetite: "Reduzido",
      libido: "Normal",
      humor: "Estável",
      energia: "Reduzida",
      concentracao: "Regular",
      funcionalidade: "Parcialmente",
      substancias: { uso: "Álcool", outrasDescricao: "" },
    },
    riscos: {
      ideacaoSuicida: { resposta: "Não", obs: "" },
      heteroagressao: { resposta: "Não", funcao: "" },
      sintomasPsicoticos: { resposta: "Não", funcao: "" },
    },

    // Check-ins diários do paciente (últimos 7 dias) — alimentam os
    // indicadores de % que o admin vê na revisão de sintomas
    checkins: [
      { data: "12/08", sono: 60, apetite: 70, humor: 80, energia: 55 },
      { data: "13/08", sono: 55, apetite: 65, humor: 75, energia: 60 },
      { data: "14/08", sono: 70, apetite: 72, humor: 78, energia: 65 },
      { data: "15/08", sono: 50, apetite: 68, humor: 82, energia: 58 },
      { data: "16/08", sono: 65, apetite: 74, humor: 85, energia: 70 },
      { data: "17/08", sono: 72, apetite: 76, humor: 88, energia: 74 },
      { data: "18/08", sono: 68, apetite: 80, humor: 90, energia: 78 },
    ],

    atualizadoEm: "18/08/2026",
  },
  {
    id: "2",
    nome: "João Pedro Souza",
    sexo: "Masculino",
    idade: 41,
    dataNascimento: "05/09/1984",
    telefone: "(81) 99222-3344",
    contatoEmergencia: "Ana Souza - (81) 99654-3322",
    cpf: "987.654.321-00",
    email: "joaopedro.souza@email.com",
    endereco: "Av. Central, 980 - Vitória de Santo Antão, PE",
    fotoIniciais: "JS",
    admin: {
      comorbidades: "Nenhuma",
      alergias: "Nenhuma conhecida",
      habitos: "Ex-tabagista (parou há 3 anos)",
    },
    resumoHistoria:
      "Acompanhamento iniciado em 2024 para manejo de sintomas do humor. Quadro atualmente estável.",
    resultadoExames: "Exames laboratoriais de rotina sem alterações relevantes (02/2026).",
    planoTerapeutico: "Manutenção da medicação, retorno em 45 dias.",
    medicacoes: [{ id: "m1", nome: "Lítio", dosagem: "300mg", horario: "2x ao dia" }],
    historiaDoenca:
      "Histórico de episódios de humor elevado intercalados com períodos eutímicos prolongados. Boa adesão ao tratamento.",
    revisaoSintomas: {
      sono: "Normal",
      apetite: "Normal",
      libido: "Normal",
      humor: "Estável",
      energia: "Normal",
      concentracao: "Boa",
      funcionalidade: "Mantida",
      substancias: { uso: "Não", outrasDescricao: "" },
    },
    riscos: {
      ideacaoSuicida: { resposta: "Não", obs: "" },
      heteroagressao: { resposta: "Não", funcao: "" },
      sintomasPsicoticos: { resposta: "Não", funcao: "" },
    },
    checkins: [
      { data: "12/08", sono: 80, apetite: 82, humor: 85, energia: 80 },
      { data: "13/08", sono: 78, apetite: 80, humor: 84, energia: 79 },
      { data: "14/08", sono: 82, apetite: 83, humor: 88, energia: 81 },
      { data: "15/08", sono: 79, apetite: 81, humor: 86, energia: 78 },
      { data: "16/08", sono: 85, apetite: 84, humor: 90, energia: 83 },
      { data: "17/08", sono: 83, apetite: 85, humor: 89, energia: 85 },
      { data: "18/08", sono: 86, apetite: 87, humor: 91, energia: 86 },
    ],
    atualizadoEm: "17/08/2026",
  },
];

export const clienteVazio = {
  nome: "",
  sexo: "",
  idade: "",
  dataNascimento: "",
  telefone: "",
  contatoEmergencia: "",
  cpf: "",
  email: "",
  endereco: "",
  admin: { comorbidades: "", alergias: "", habitos: "" },
  resumoHistoria: "",
  resultadoExames: "",
  planoTerapeutico: "",
  medicacoes: [],
  historiaDoenca: "",
  revisaoSintomas: {
    sono: "",
    apetite: "",
    libido: "",
    humor: "",
    energia: "",
    concentracao: "",
    funcionalidade: "",
    substancias: { uso: "", outrasDescricao: "" },
  },
  riscos: {
    ideacaoSuicida: { resposta: "", obs: "" },
    heteroagressao: { resposta: "", funcao: "" },
    sintomasPsicoticos: { resposta: "", funcao: "" },
  },
  checkins: [],
};

// Número do doutor para agendamento via WhatsApp (placeholder)
export const WHATSAPP_DOUTOR = "5581990000000";
