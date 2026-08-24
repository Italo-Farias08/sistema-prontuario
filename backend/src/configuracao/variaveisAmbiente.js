require("dotenv").config();

const variaveisAmbiente = {
  porta: process.env.PORT || 3000,
  ambiente: process.env.NODE_ENV === "production" ? "producao" : "desenvolvimento",
  urlBancoDados: process.env.DATABASE_URL,
  segredoToken: process.env.JWT_SECRET || "troque-este-segredo-em-producao",
  origemPermitida: process.env.CORS_ORIGIN || "*",

  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    emailRemetente: process.env.BREVO_EMAIL_REMETENTE || "nao-responda@clinica.com",
    nomeRemetente: process.env.BREVO_NOME_REMETENTE || "Sistema de Prontuário",
  },

  daily: {
    apiKey: process.env.DAILY_API_KEY,
  },
};

if (!variaveisAmbiente.daily.apiKey) {
  console.warn(
    "Aviso: DAILY_API_KEY não foi definida. A chamada de vídeo vai falhar até você configurar uma conta gratuita em https://dashboard.daily.co e colar a chave de API no .env."
  );
}

if (!variaveisAmbiente.urlBancoDados) {
  console.warn(
    "Aviso: DATABASE_URL não foi definida. Configure o arquivo .env (veja .env.exemplo)."
  );
}

if (!variaveisAmbiente.brevo.apiKey) {
  console.warn(
    "Aviso: BREVO_API_KEY não foi definida. O envio de e-mails (cadastro e recuperação de senha) vai falhar."
  );
}

module.exports = variaveisAmbiente;
