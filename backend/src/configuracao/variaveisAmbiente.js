require("dotenv").config();

const variaveisAmbiente = {
  porta: process.env.PORT || 3000,
  ambiente: process.env.NODE_ENV === "production" ? "producao" : "desenvolvimento",
  urlBancoDados: process.env.DATABASE_URL,
  segredoToken: process.env.JWT_SECRET || "troque-este-segredo-em-producao",
  origemPermitida: process.env.CORS_ORIGIN || "*",
};

if (!variaveisAmbiente.urlBancoDados) {
  console.warn(
    "Aviso: DATABASE_URL não foi definida. Configure o arquivo .env (veja .env.exemplo)."
  );
}

module.exports = variaveisAmbiente;
