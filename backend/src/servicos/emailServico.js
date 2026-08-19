const variaveisAmbiente = require("../configuracao/variaveisAmbiente");

const URL_BREVO_ENVIAR_EMAIL = "https://api.brevo.com/v3/smtp/email";

const ASSUNTOS = {
  cadastro: "Confirme seu cadastro",
  redefinir_senha: "Código para redefinir sua senha",
};

function montarHtml({ nome, codigo, tipo }) {
  const saudacao = nome ? `Olá, ${nome}!` : "Olá!";
  const instrucao =
    tipo === "cadastro"
      ? "Use o código abaixo para confirmar seu cadastro no app:"
      : "Use o código abaixo para redefinir sua senha:";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: 0 auto; color: #333;">
      <h2 style="color: #2E9636;">${saudacao}</h2>
      <p>${instrucao}</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; background: #F0F0F0; padding: 16px; border-radius: 8px;">
        ${codigo}
      </p>
      <p style="font-size: 13px; color: #666;">
        Esse código expira em 15 minutos. Se você não pediu isso, pode ignorar este e-mail.
      </p>
    </div>
  `;
}

/**
 * Envia um e-mail transacional via Brevo (API HTTP, sem SMTP).
 * tipo: "cadastro" | "redefinir_senha"
 */
async function enviarCodigoPorEmail({ paraEmail, paraNome, codigo, tipo }) {
  const { apiKey, emailRemetente, nomeRemetente } = variaveisAmbiente.brevo;

  if (!apiKey) {
    const erro = new Error(
      "Envio de e-mail não configurado (BREVO_API_KEY ausente)."
    );
    erro.status = 500;
    throw erro;
  }

  const resposta = await fetch(URL_BREVO_ENVIAR_EMAIL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { email: emailRemetente, name: nomeRemetente },
      to: [{ email: paraEmail, name: paraNome || undefined }],
      subject: ASSUNTOS[tipo] || "Seu código de verificação",
      htmlContent: montarHtml({ nome: paraNome, codigo, tipo }),
    }),
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.text().catch(() => "");
    console.error("Falha ao enviar e-mail pela Brevo:", resposta.status, corpoErro);
    const erro = new Error("Não foi possível enviar o e-mail de verificação. Tente novamente em instantes.");
    erro.status = 502;
    throw erro;
  }
}

module.exports = { enviarCodigoPorEmail };
