import { Platform } from "react-native";

// Paleta: fundo neutro claro (#F0F0F0), destaque verde (#3DB843) e
// texto em cinza médio (#666666) — discreta e sofisticada.
// Tipografia pedida: "Argue" (títulos) e "Caviar Dreams" (corpo). Como
// não são fontes públicas, uso famílias nativas elegantes como
// substitutas por enquanto — ver assets/fontes/LEIAME.md.

export const cores = {
  fundo: "#F0F0F0",
  superficie: "#FFFFFF",
  destaque: "#3DB843",
  destaqueEscuro: "#2E9636",
  destaqueSuave: "#DFF3E1",
  texto: "#666666",
  textoEscuro: "#333333",
  textoClaro: "#9A9A9A",
  borda: "#E2E2E2",
  branco: "#FFFFFF",
  perigo: "#C24B3F",
  perigoSuave: "#F6DEDC",
  sucesso: "#3DB843",
  sucessoSuave: "#DFF3E1",
  sombra: "#000000",
};

export const fontes = {
  titulo: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "Georgia",
  }),
  tituloNegrito: Platform.select({
    ios: "Georgia-Bold",
    android: "serif",
    default: "Georgia",
  }),
  texto: Platform.select({
    ios: "Avenir",
    android: "sans-serif",
    default: "System",
  }),
  textoMedio: Platform.select({
    ios: "Avenir-Medium",
    android: "sans-serif-medium",
    default: "System",
  }),
};

export const espacamento = {
  minimo: 4,
  pequeno: 8,
  medio: 16,
  grande: 24,
  enorme: 32,
  gigante: 48,
};

export const raio = {
  pequeno: 8,
  medio: 14,
  grande: 22,
  pilula: 999,
};

export const sombra = {
  cartao: {
    shadowColor: cores.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
};
